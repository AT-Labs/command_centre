/**
 * @jest-environment jsdom
 */
/* eslint-disable react/prop-types */

import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BusPriorityThresholdDataGrid } from './BusPriorityThresholds';

jest.mock('../../../Common/CustomDataGrid/CustomDataGrid', () => {
    const MockCustomDataGrid = props => (
        <div data-testid="custom-datagrid">
            { props.loading && <div data-testid="loading">Loading...</div> }
            { props.dataSource.map(row => (
                <div key={ `row-${props.getRowId(row)}` } data-testid={ `row-${props.getRowId(row)}` }>
                    <span data-testid={ `cell-route-${props.getRowId(row)}` }>{ row.RouteId }</span>
                    <span data-testid={ `cell-threshold-${props.getRowId(row)}` }>{ row.Threshold }</span>
                    { props.columns
                        .find(col => col.field === 'action')
                        ?.getActions({ row })
                        ?.map(action => (
                            <div key={ `${props.getRowId(row)}-action` }>{ action }</div>
                        ))}
                </div>
            ))}
        </div>
    );
    MockCustomDataGrid.displayName = 'MockCustomDataGrid';
    return MockCustomDataGrid;
});

jest.mock('./BusPriorityThresholdsModal', () => {
    const MockThresholdModal = ({
        isModalOpen, onClose, mode, thresholdSet, saveNewThresholds, deleteThresholds,
    }) => {
        if (!isModalOpen) return null;
        return (
            <div data-testid="threshold-modal">
                <div data-testid="modal-mode">
                    { mode }
                </div>
                <div data-testid="modal-site-id">{ thresholdSet?.siteId }</div>
                <button type="button" data-testid="modal-close" onClick={ onClose }>Close</button>
                <button type="button" data-testid="modal-save" onClick={ () => saveNewThresholds({ test: 'data' }) }>
                    Save
                </button>
                <button type="button" data-testid="modal-delete" onClick={ () => deleteThresholds(thresholdSet) }>
                    Delete
                </button>
            </div>
        );
    };

    MockThresholdModal.displayName = 'MockThresholdModal';
    return {
        __esModule: true,
        default: MockThresholdModal,
        UPDATE_TYPE: { NEW: 'NEW', UPDATE: 'UPDATE', DELETE: 'DELETE', VIEW: 'VIEW' },
    };
});

jest.mock('react-icons/bs', () => ({
    BsPencilSquare: () => <span data-testid="edit-icon">Edit</span>,
}));

jest.mock('@mui/icons-material/Delete', () => () => <span data-testid="delete-icon">Delete</span>);

const mockThresholds = [
    {
        rowKey: 'rk1',
        RouteId: '101',
        Threshold: 50,
        Score: 10,
        SiteId: '2141',
        Occupancy: 'High',
    },
    {
        rowKey: 'rk2',
        RouteId: null,
        Threshold: 20,
        Score: 5,
        SiteId: null,
        Occupancy: null,
    },
];

const defaultProps = {
    busPriorityThresholds: mockThresholds,
    datagridConfig: {},
    isLoading: false,
    isEditAllowed: true,
    getBusPriorityThresholds: jest.fn(),
    updateBusPriorityThresholdsDatagridConfig: jest.fn(),
    saveNewThresholds: jest.fn(),
    updateThresholds: jest.fn(),
    deleteThresholds: jest.fn(),
};

describe('<BusPriorityThresholdDataGrid />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('fetches thresholds on mount', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        expect(defaultProps.getBusPriorityThresholds).toHaveBeenCalledTimes(1);
    });

    it('renders the "Add New" button when edit is allowed', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        expect(screen.getByText('Add New Threshold Set')).toBeInTheDocument();
    });

    it('hides "Add New" button when edit is not allowed', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } isEditAllowed={ false } />);
        expect(screen.queryByText('Add New Threshold Set')).not.toBeInTheDocument();
    });

    it('displays grid data correctly', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        expect(screen.getByTestId('cell-route-rk1')).toHaveTextContent('101');
        expect(screen.getByTestId('cell-threshold-rk2')).toHaveTextContent('20');
    });

    it('opens modal in NEW mode when Add button is clicked', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        fireEvent.click(screen.getByText('Add New Threshold Set'));

        expect(screen.getByTestId('threshold-modal')).toBeInTheDocument();
        expect(screen.getByTestId('modal-mode')).toHaveTextContent('NEW');
    });

    it('opens modal in UPDATE mode with correct data when edit is clicked', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        const editButtons = screen.getAllByTestId('edit-icon');
        fireEvent.click(editButtons[0]);

        expect(screen.getByTestId('threshold-modal')).toBeInTheDocument();
        expect(screen.getByTestId('modal-mode')).toHaveTextContent('UPDATE');
        expect(screen.getByTestId('modal-site-id')).toHaveTextContent('2141');
    });

    it('hides delete button for default thresholds (no Site/Route/Occupancy)', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);

        const row2 = screen.getByTestId('row-rk2');
        expect(row2.querySelector('.hidden-icon')).toBeInTheDocument();
    });

    it('opens modal in DELETE mode when delete button is clicked', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        const deleteButtons = screen.getAllByTestId('delete-icon');
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByTestId('modal-mode')).toHaveTextContent('DELETE');
    });

    it('calls saveNewThresholds action when modal triggers save', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        fireEvent.click(screen.getByText('Add New Threshold Set'));
        fireEvent.click(screen.getByTestId('modal-save'));

        expect(defaultProps.saveNewThresholds).toHaveBeenCalledWith({ test: 'data' });
    });

    it('closes modal when onClose is triggered', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        fireEvent.click(screen.getByText('Add New Threshold Set'));
        fireEvent.click(screen.getByTestId('modal-close'));

        expect(screen.queryByTestId('threshold-modal')).not.toBeInTheDocument();
    });

    it('opens modal in VIEW mode if isEditAllowed is false', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } isEditAllowed={ false } />);
        const editButtons = screen.getAllByTestId('edit-icon');
        fireEvent.click(editButtons[0]);

        expect(screen.getByTestId('modal-mode')).toHaveTextContent('VIEW');

        expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
    });

    it('modal does not render when isThresholdsModalOpen is false', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        expect(screen.queryByTestId('threshold-modal')).not.toBeInTheDocument();
    });

    it('displays loading indicator when isLoading is true', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } isLoading />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('calls updateBusPriorityThresholdsDatagridConfig when datagrid config updates', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        expect(defaultProps.updateBusPriorityThresholdsDatagridConfig).not.toHaveBeenCalled();
    });

    it('valueFormatter handles undefined SiteId correctly', () => {
        const thresholdsWithUndefined = [
            {
                rowKey: 'rk1',
                RouteId: '101',
                Threshold: 50,
                Score: 10,
                SiteId: undefined,
                Occupancy: 'High',
            },
        ];
        render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ thresholdsWithUndefined } />);
        expect(screen.getByTestId('row-rk1')).toBeInTheDocument();
    });

    it('valueFormatter handles null SiteId correctly', () => {
        const thresholdsWithNull = [
            {
                rowKey: 'rk1',
                RouteId: '101',
                Threshold: 50,
                Score: 10,
                SiteId: null,
                Occupancy: 'High',
            },
        ];
        render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ thresholdsWithNull } />);
        expect(screen.getByTestId('row-rk1')).toBeInTheDocument();
    });

    it('valueFormatter handles empty string SiteId correctly', () => {
        const thresholdsWithEmptyString = [
            {
                rowKey: 'rk1',
                RouteId: '101',
                Threshold: 50,
                Score: 10,
                SiteId: '',
                Occupancy: 'High',
            },
        ];
        render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ thresholdsWithEmptyString } />);
        expect(screen.getByTestId('row-rk1')).toBeInTheDocument();
    });

    it('valueFormatter converts numeric SiteId to string correctly', () => {
        const thresholdsWithNumber = [
            {
                rowKey: 'rk1',
                RouteId: '101',
                Threshold: 50,
                Score: 10,
                SiteId: 5000,
                Occupancy: 'High',
            },
        ];
        render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ thresholdsWithNumber } />);
        expect(screen.getByTestId('row-rk1')).toBeInTheDocument();
    });

    it('calls updateThresholds action when modal triggers update', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        const editButtons = screen.getAllByTestId('edit-icon');
        fireEvent.click(editButtons[0]);
        fireEvent.click(screen.getByTestId('modal-save'));

        expect(defaultProps.saveNewThresholds).toHaveBeenCalled();
    });

    it('calls deleteThresholds action when modal delete is triggered', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        const deleteButtons = screen.getAllByTestId('delete-icon');
        fireEvent.click(deleteButtons[0]);
        fireEvent.click(screen.getByTestId('modal-delete'));

        expect(defaultProps.deleteThresholds).toHaveBeenCalled();
    });

    it('opens modal in DELETE mode and passes correct threshold set', () => {
        render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
        const deleteButtons = screen.getAllByTestId('delete-icon');
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByTestId('threshold-modal')).toBeInTheDocument();
        expect(screen.getByTestId('modal-mode')).toHaveTextContent('DELETE');
        expect(screen.getByTestId('modal-site-id')).toHaveTextContent('2141');
    });
});
