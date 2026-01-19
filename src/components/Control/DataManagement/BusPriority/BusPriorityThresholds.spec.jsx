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
            {props.loading && <div data-testid="loading">Loading...</div>}
            {props.dataSource.map(row => (
                <div key={ `row-${props.getRowId(row)}` } data-testid={ `row-${props.getRowId(row)}` }>
                    <span data-testid={ `cell-route-${props.getRowId(row)}` }>{row.RouteId}</span>
                    <span data-testid={ `cell-threshold-${props.getRowId(row)}` }>{row.Threshold}</span>
                    <span data-testid={ `cell-score-${props.getRowId(row)}` }>{row.Score}</span>
                    <span data-testid={ `cell-siteid-${props.getRowId(row)}` }>{row.SiteId}</span>
                    <span data-testid={ `cell-occupancy-${props.getRowId(row)}` }>{row.Occupancy}</span>
                    {props.columns
                        .find(col => col.field === 'action')
                        ?.getActions({ row })
                        ?.map(action => (
                            <div key={ `${props.getRowId(row)}-action-${action.key}` }>{action}</div>
                        ))}
                </div>
            ))}
            <button
                type="button"
                data-testid="trigger-config-update"
                onClick={ () => props.updateDatagridConfig({ newConfig: 'test' }) }
            >
                Update Config
            </button>
        </div>
    );
    MockCustomDataGrid.displayName = 'MockCustomDataGrid';
    return MockCustomDataGrid;
});

jest.mock('./BusPriorityThresholdsModal', () => {
    const MockThresholdModal = ({
        isModalOpen, onClose, mode, thresholdSet, saveNewThresholds, updateThresholds, deleteThresholds,
    }) => {
        if (!isModalOpen) return null;
        return (
            <div data-testid="threshold-modal">
                <div data-testid="modal-mode">
                    {mode}
                </div>
                <div data-testid="modal-site-id">{thresholdSet?.siteId ?? 'none'}</div>
                <div data-testid="modal-route-id">{thresholdSet?.routeId ?? 'none'}</div>
                <div data-testid="modal-occupancy">{thresholdSet?.occupancy ?? 'none'}</div>
                <button type="button" data-testid="modal-close" onClick={ onClose }>Close</button>
                <button type="button" data-testid="modal-save" onClick={ () => saveNewThresholds({ test: 'data' }) }>
                    Save
                </button>
                <button
                    type="button"
                    data-testid="modal-update"
                    onClick={ () => updateThresholds({ original: 'data' }, { updated: 'data' }) }
                >
                    Update
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
        partitionKey: 'pk1',
        RouteId: '101',
        Threshold: 50,
        Score: 10,
        SiteId: '2141',
        Occupancy: 'High',
    },
    {
        rowKey: 'rk2',
        partitionKey: 'pk2',
        RouteId: null,
        Threshold: 20,
        Score: 5,
        SiteId: null,
        Occupancy: null,
    },
];

const defaultProps = {
    busPriorityThresholds: mockThresholds,
    datagridConfig: { pageSize: 25 },
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

    describe('Component Lifecycle', () => {
        it('fetches thresholds on mount', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            expect(defaultProps.getBusPriorityThresholds).toHaveBeenCalledTimes(1);
        });
    });

    describe('UI Rendering', () => {
        it('renders the CustomDataGrid component', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            expect(screen.getByTestId('custom-datagrid')).toBeInTheDocument();
        });

        it('renders the "Add New Threshold Set" button when edit is allowed', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            expect(screen.getByText('Add New Threshold Set')).toBeInTheDocument();
        });

        it('hides "Add New Threshold Set" button when edit is not allowed', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } isEditAllowed={ false } />);
            expect(screen.queryByText('Add New Threshold Set')).not.toBeInTheDocument();
        });

        it('displays loading indicator when isLoading is true', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } isLoading />);
            expect(screen.getByTestId('loading')).toBeInTheDocument();
        });

        it('displays grid data correctly', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            expect(screen.getByTestId('cell-route-rk1')).toHaveTextContent('101');
            expect(screen.getByTestId('cell-threshold-rk2')).toHaveTextContent('20');
            expect(screen.getByTestId('cell-score-rk1')).toHaveTextContent('10');
        });
    });

    describe('Modal Interactions - Opening', () => {
        it('modal does not render initially', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            expect(screen.queryByTestId('threshold-modal')).not.toBeInTheDocument();
        });

        it('opens modal in NEW mode when Add button is clicked', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            fireEvent.click(screen.getByText('Add New Threshold Set'));

            expect(screen.getByTestId('threshold-modal')).toBeInTheDocument();
            expect(screen.getByTestId('modal-mode')).toHaveTextContent('NEW');
            expect(screen.getByTestId('modal-site-id')).toHaveTextContent('none');
        });

        it('opens modal in UPDATE mode with correct data when edit is clicked', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            const editButtons = screen.getAllByTestId('edit-icon');
            fireEvent.click(editButtons[0]);

            expect(screen.getByTestId('threshold-modal')).toBeInTheDocument();
            expect(screen.getByTestId('modal-mode')).toHaveTextContent('UPDATE');
            expect(screen.getByTestId('modal-site-id')).toHaveTextContent('2141');
            expect(screen.getByTestId('modal-route-id')).toHaveTextContent('101');
            expect(screen.getByTestId('modal-occupancy')).toHaveTextContent('High');
        });

        it('opens modal in DELETE mode when delete button is clicked', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            const deleteButtons = screen.getAllByTestId('delete-icon');
            fireEvent.click(deleteButtons[0]);

            expect(screen.getByTestId('threshold-modal')).toBeInTheDocument();
            expect(screen.getByTestId('modal-mode')).toHaveTextContent('DELETE');
            expect(screen.getByTestId('modal-site-id')).toHaveTextContent('2141');
        });

        it('opens modal in VIEW mode if isEditAllowed is false', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } isEditAllowed={ false } />);
            const editButtons = screen.getAllByTestId('edit-icon');
            fireEvent.click(editButtons[0]);

            expect(screen.getByTestId('modal-mode')).toHaveTextContent('VIEW');
            expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
        });

        it('closes modal when onClose is triggered', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            fireEvent.click(screen.getByText('Add New Threshold Set'));
            expect(screen.getByTestId('threshold-modal')).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('modal-close'));
            expect(screen.queryByTestId('threshold-modal')).not.toBeInTheDocument();
        });
    });

    describe('SiteId Parsing and Handling', () => {
        it('parses numeric string SiteId correctly', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            const editButtons = screen.getAllByTestId('edit-icon');
            fireEvent.click(editButtons[0]);

            expect(screen.getByTestId('modal-site-id')).toHaveTextContent('2141');
        });

        it('handles null SiteId correctly', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            const editButtons = screen.getAllByTestId('edit-icon');
            fireEvent.click(editButtons[1]);

            expect(screen.getByTestId('modal-site-id')).toHaveTextContent('none');
        });

        it('handles undefined SiteId correctly in UPDATE mode', () => {
            const thresholdsWithUndefined = [
                {
                    ...mockThresholds[0],
                    SiteId: undefined,
                },
            ];
            render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ thresholdsWithUndefined } />);
            const editButtons = screen.getAllByTestId('edit-icon');
            fireEvent.click(editButtons[0]);

            expect(screen.getByTestId('modal-site-id')).toHaveTextContent('none');
        });

        it('handles empty string SiteId correctly in UPDATE mode', () => {
            const thresholdsWithEmpty = [
                {
                    ...mockThresholds[0],
                    SiteId: '',
                },
            ];
            render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ thresholdsWithEmpty } />);
            const editButtons = screen.getAllByTestId('edit-icon');
            fireEvent.click(editButtons[0]);

            expect(screen.getByTestId('modal-site-id')).toHaveTextContent('none');
        });
    });

    describe('Default Threshold Set Detection', () => {
        it('hides delete button for default thresholds (no SiteId, RouteId, Occupancy)', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);

            const row2 = screen.getByTestId('row-rk2');
            expect(row2.querySelector('.hidden-icon')).toBeInTheDocument();
        });

        it('shows delete button for non-default thresholds', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);

            const row1 = screen.getByTestId('row-rk1');
            expect(row1.querySelector('.hidden-icon')).not.toBeInTheDocument();
        });

        it('identifies threshold as default when all three fields are null', () => {
            const defaultThreshold = [
                {
                    rowKey: 'default',
                    RouteId: null,
                    SiteId: null,
                    Occupancy: null,
                    Threshold: 30,
                    Score: 15,
                },
            ];
            render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ defaultThreshold } />);

            const row = screen.getByTestId('row-default');
            expect(row.querySelector('.hidden-icon')).toBeInTheDocument();
        });

        it('identifies threshold as non-default when only SiteId exists', () => {
            const siteOnlyThreshold = [
                {
                    rowKey: 'site-only',
                    RouteId: null,
                    SiteId: '100',
                    Occupancy: null,
                    Threshold: 30,
                    Score: 15,
                },
            ];
            render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ siteOnlyThreshold } />);

            const row = screen.getByTestId('row-site-only');
            expect(row.querySelector('.hidden-icon')).not.toBeInTheDocument();
        });

        it('identifies threshold as non-default when only RouteId exists', () => {
            const routeOnlyThreshold = [
                {
                    rowKey: 'route-only',
                    RouteId: '200',
                    SiteId: null,
                    Occupancy: null,
                    Threshold: 40,
                    Score: 12,
                },
            ];
            render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ routeOnlyThreshold } />);

            const row = screen.getByTestId('row-route-only');
            expect(row.querySelector('.hidden-icon')).not.toBeInTheDocument();
        });

        it('identifies threshold as non-default when only Occupancy exists', () => {
            const occupancyOnlyThreshold = [
                {
                    rowKey: 'occupancy-only',
                    RouteId: null,
                    SiteId: null,
                    Occupancy: 'Medium',
                    Threshold: 35,
                    Score: 8,
                },
            ];
            render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ occupancyOnlyThreshold } />);

            const row = screen.getByTestId('row-occupancy-only');
            expect(row.querySelector('.hidden-icon')).not.toBeInTheDocument();
        });
    });

    describe('Action Buttons', () => {
        it('displays edit button for each row when edit is allowed', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            const editButtons = screen.getAllByTestId('edit-icon');
            expect(editButtons).toHaveLength(2);
        });

        it('does not display delete button when edit is not allowed', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } isEditAllowed={ false } />);
            expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
        });

        it('displays delete buttons when edit is allowed', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            const deleteButtons = screen.getAllByTestId('delete-icon');
            expect(deleteButtons.length).toBeGreaterThan(0);
        });
    });

    describe('Redux Actions', () => {
        it('calls saveNewThresholds action when modal triggers save', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            fireEvent.click(screen.getByText('Add New Threshold Set'));
            fireEvent.click(screen.getByTestId('modal-save'));

            expect(defaultProps.saveNewThresholds).toHaveBeenCalledWith({ test: 'data' });
        });

        it('calls updateThresholds action when modal triggers update', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            fireEvent.click(screen.getByText('Add New Threshold Set'));
            fireEvent.click(screen.getByTestId('modal-update'));

            expect(defaultProps.updateThresholds).toHaveBeenCalledWith({ original: 'data' }, { updated: 'data' });
        });

        it('calls deleteThresholds action when modal delete is triggered', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            const deleteButtons = screen.getAllByTestId('delete-icon');
            fireEvent.click(deleteButtons[0]);
            fireEvent.click(screen.getByTestId('modal-delete'));

            expect(defaultProps.deleteThresholds).toHaveBeenCalled();
        });

        it('calls updateBusPriorityThresholdsDatagridConfig when datagrid config updates', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);
            fireEvent.click(screen.getByTestId('trigger-config-update'));

            expect(defaultProps.updateBusPriorityThresholdsDatagridConfig).toHaveBeenCalledWith({ newConfig: 'test' });
        });
    });

    describe('Modal State Management', () => {
        it('switches between different modal modes correctly', () => {
            render(<BusPriorityThresholdDataGrid { ...defaultProps } />);

            fireEvent.click(screen.getByText('Add New Threshold Set'));
            expect(screen.getByTestId('modal-mode')).toHaveTextContent('NEW');

            fireEvent.click(screen.getByTestId('modal-close'));

            const editButtons = screen.getAllByTestId('edit-icon');
            fireEvent.click(editButtons[0]);
            expect(screen.getByTestId('modal-mode')).toHaveTextContent('UPDATE');

            fireEvent.click(screen.getByTestId('modal-close'));

            const deleteButtons = screen.getAllByTestId('delete-icon');
            fireEvent.click(deleteButtons[0]);
            expect(screen.getByTestId('modal-mode')).toHaveTextContent('DELETE');
        });
    });

    describe('Edge Cases', () => {
        it('handles zero values correctly', () => {
            const zeroThreshold = [
                {
                    rowKey: 'zero',
                    RouteId: '0',
                    Threshold: 0,
                    Score: 0,
                    SiteId: '0',
                },
            ];
            render(<BusPriorityThresholdDataGrid { ...defaultProps } busPriorityThresholds={ zeroThreshold } />);

            expect(screen.getByTestId('cell-threshold-zero')).toHaveTextContent('0');
            expect(screen.getByTestId('cell-score-zero')).toHaveTextContent('0');
        });
    });
});
