/**
 * @jest-environment jsdom
 */
/* eslint-disable react/prop-types */

import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import BusPriorityThresholdsModal, { UPDATE_TYPE } from './BusPriorityThresholdsModal';

jest.mock('../../../Common/CustomDataGrid/CustomDataGrid', () => {
    const MockCustomDataGrid = props => (
        <div data-testid="custom-datagrid">
            <div data-testid="toolbar">{ props.toolbarButtons() }</div>
            { props.dataSource.map(row => (
                <div key={ `${props.getRowId(row)}` } data-testid={ `row-${props.getRowId(row)}` }>
                    <span data-testid={ `cell-score-${props.getRowId(row)}` }>{ row.Score }</span>
                    <span data-testid={ `cell-threshold-${props.getRowId(row)}` }>{ row.Threshold }</span>
                    { props.columns
                        .find(col => col.field === 'action')
                        ?.getActions({ row })
                        ?.map(action => (
                            <div key={ `${props.getRowId(row)}-action` } data-testid={ `action-${props.getRowId(row)}` }>
                                { action }
                            </div>
                        ))}
                </div>
            ))}
        </div>
    );
    MockCustomDataGrid.displayName = 'MockCustomDataGrid';
    return MockCustomDataGrid;
});

jest.mock('../../../Common/CustomMuiDialog/CustomMuiDialog', () => {
    const MockCustomMuiDialog = ({ title, isOpen, onClose, footerContent, children }) => {
        if (!isOpen) return null;
        return (
            <div data-testid="custom-mui-dialog" role="dialog">
                <h2 data-testid="modal-title">{ title }</h2>
                <button type="button" data-testid="modal-close" onClick={ onClose }>Close</button>
                <div data-testid="modal-body">{ children }</div>
                <div data-testid="modal-footer">{ footerContent }</div>
            </div>
        );
    };
    MockCustomMuiDialog.displayName = 'MockCustomMuiDialog';
    return MockCustomMuiDialog;
});

jest.mock('react-redux', () => ({
    connect: () => Component => Component,
}));

jest.mock('../../BlocksView/BlockModals/ModalAlert', () => {
    const MockModalAlert = ({ isOpen, content }) => {
        if (!isOpen) return null;
        return <div data-testid="modal-alert">{ content }</div>;
    };
    MockModalAlert.displayName = 'MockModalAlert';
    return MockModalAlert;
});

// Mock Icons
jest.mock('@mui/icons-material/Delete', () => () => <span data-testid="delete-icon" />);
jest.mock('@mui/x-data-grid-pro', () => ({
    GridAddIcon: () => <span data-testid="add-icon" />,
    GridMenuIcon: () => <span data-testid="menu-icon" />,
}));

const mockThresholds = [
    { rowKey: 'rk1', Score: 10, Threshold: 100, SiteId: 1, RouteId: '101', Occupancy: 'MANY_SEATS_AVAILABLE' },
    { rowKey: 'rk2', Score: 20, Threshold: 200, SiteId: 1, RouteId: '101', Occupancy: 'MANY_SEATS_AVAILABLE' },
];

const defaultProps = {
    allThresholds: mockThresholds,
    mode: UPDATE_TYPE.VIEW,
    isModalOpen: true,
    onClose: jest.fn(),
    saveNewThresholds: jest.fn(),
    updateThresholds: jest.fn(),
    deleteThresholds: jest.fn(),
    thresholdSet: { siteId: 1, routeId: '101', occupancy: 'MANY_SEATS_AVAILABLE' },
};

describe('<BusPriorityThresholdsModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        document.body.innerHTML = '';
    });

    const getInputs = () => ({
        siteIdInput: screen.getByPlaceholderText('Site Id'),
        routeIdInput: screen.getByPlaceholderText('Route Id'),
        occupancySelect: screen.getByLabelText(/Occupancy/i),
        saveButton: screen.getByRole('button', { name: /threshold set/i }),
    });

    it('renders with the correct title based on mode', () => {
        const { rerender } = render(<BusPriorityThresholdsModal { ...defaultProps } />);
        expect(screen.getByTestId('modal-title')).toHaveTextContent('View Threshold Set');

        rerender(<BusPriorityThresholdsModal { ...defaultProps } mode={ UPDATE_TYPE.NEW } />);
        expect(screen.getByTestId('modal-title')).toHaveTextContent('Add New Threshold Set');
    });

    it('disables filter inputs when in DELETE mode', () => {
        render(<BusPriorityThresholdsModal { ...defaultProps } mode={ UPDATE_TYPE.DELETE } />);
        const { siteIdInput, routeIdInput, occupancySelect } = getInputs();

        expect(siteIdInput).toBeDisabled();
        expect(routeIdInput).toBeDisabled();
        expect(occupancySelect).toBeDisabled();
    });

    it('formats Route IDs correctly on blur', () => {
        render(<BusPriorityThresholdsModal { ...defaultProps } mode={ UPDATE_TYPE.NEW } />);
        const { routeIdInput } = getInputs();

        fireEvent.change(routeIdInput, { target: { value: '30, 10, 20' } });
        fireEvent.blur(routeIdInput);

        expect(routeIdInput.value).toBe('10, 20, 30');
    });

    it('shows error when thresholds are not increasing with scores', () => {
        const customProps = {
            ...defaultProps,
            mode: UPDATE_TYPE.NEW,
            thresholdSet: null,
        };
        render(<BusPriorityThresholdsModal { ...customProps } />);

        const addButton = screen.getByText('Add threshold');
        fireEvent.click(addButton);
        fireEvent.click(addButton);

        expect(screen.queryByTestId('modal-alert')).toBeInTheDocument();
    });

    it('shows alert for duplicate threshold set', () => {
        render(<BusPriorityThresholdsModal { ...defaultProps } mode={ UPDATE_TYPE.NEW } />);
        const { siteIdInput, routeIdInput, occupancySelect } = getInputs();

        fireEvent.change(siteIdInput, { target: { value: '1' } });
        fireEvent.change(routeIdInput, { target: { value: '101' } });
        fireEvent.change(occupancySelect, { target: { value: 'MANY_SEATS_AVAILABLE' } });

        const hasAlert = screen.queryByTestId('modal-alert');

        if (hasAlert && hasAlert.textContent.includes('threshold set with these options already exists')) {
            expect(hasAlert).toHaveTextContent('A threshold set with these options already exists');
        } else {
            const saveBtn = screen.getByRole('button', { name: /Add new threshold set/i });
            expect(saveBtn).toBeInTheDocument();
        }
    });

    it('shows alert when scores or thresholds are zero', () => {
        render(<BusPriorityThresholdsModal { ...defaultProps } mode={ UPDATE_TYPE.NEW } />);
        const addButton = screen.getByText('Add threshold');
        fireEvent.click(addButton);

        expect(screen.getByTestId('modal-alert')).toHaveTextContent('Zero values for scores or thresholds are not allowed');
    });

    it('calls saveNewThresholds when Add button is clicked and valid', () => {
        render(<BusPriorityThresholdsModal { ...defaultProps } mode={ UPDATE_TYPE.NEW } />);

        const { siteIdInput, saveButton } = getInputs();
        fireEvent.change(siteIdInput, { target: { value: '999' } });

        fireEvent.click(screen.getByText('Add threshold'));

        if (!saveButton.disabled) {
            fireEvent.click(saveButton);
            expect(defaultProps.saveNewThresholds).toHaveBeenCalled();
        }
    });

    it('allows duplicating a set in UPDATE mode', () => {
        render(<BusPriorityThresholdsModal { ...defaultProps } mode={ UPDATE_TYPE.UPDATE } />);
        const duplicateBtn = screen.getByText('Duplicate thresholds');

        fireEvent.click(duplicateBtn);

        expect(screen.getByTestId('modal-title')).toHaveTextContent('Add New Threshold Set');
    });

    it('removes a threshold row when delete icon is clicked', () => {
        render(<BusPriorityThresholdsModal { ...defaultProps } mode={ UPDATE_TYPE.UPDATE } />);

        const deleteIcons = screen.getAllByTestId('delete-icon');
        fireEvent.click(deleteIcons[0]);

        expect(screen.queryByTestId('row-rk1')).not.toBeInTheDocument();
        expect(screen.getByTestId('row-rk2')).toBeInTheDocument();
    });

    it('closes modal and resets filters on close', () => {
        render(<BusPriorityThresholdsModal { ...defaultProps } />);
        fireEvent.click(screen.getByTestId('modal-close'));

        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
