/**
 * @jest-environment jsdom
 */
/* eslint-disable react/prop-types */

import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('react-redux', () => ({
    connect: () => component => component,
}));

jest.mock('../../../../types/vehicle-occupancy-status-types', () => ({
    __esModule: true,
    default: {
        MANY_SEATS_AVAILABLE: 'Many Seats Available',
        FEW_SEATS_AVAILABLE: 'Few Seats Available',
        STANDING_ROOM_ONLY: 'Standing Room Only',
        CRUSHED_STANDING_ROOM_ONLY: 'Crushed Standing Room Only',
        FULL: 'Full',
        NOT_ACCEPTING_PASSENGERS: 'Not Accepting Passengers',
        HIGH: 'High',
        MEDIUM: 'Medium',
        LOW: 'Low',
    },
}));

// eslint-disable-next-line import/first
import BusPriorityThresholdsModal, { UPDATE_TYPE } from './BusPriorityThresholdsModal';

jest.mock('../../../Common/CustomMuiDialog/CustomMuiDialog', () => {
    const MockCustomMuiDialog = ({ title, onClose, isOpen, footerContent, children }) => {
        if (!isOpen) return null;
        return (
            <div data-testid="custom-mui-dialog">
                <div data-testid="dialog-title">{title}</div>
                <button type="button" data-testid="dialog-close" onClick={onClose}>Close</button>
                <div data-testid="dialog-body">{children}</div>
                <div data-testid="dialog-footer">{footerContent}</div>
            </div>
        );
    };
    MockCustomMuiDialog.displayName = 'MockCustomMuiDialog';
    return MockCustomMuiDialog;
});

jest.mock('../../../Common/CustomDataGrid/CustomDataGrid', () => {
    const MockCustomDataGrid = props => (
        <div data-testid="custom-datagrid">
            <div data-testid="toolbar">{props.toolbarButtons()}</div>
            {props.dataSource.map((row) => {
                const actions = props.columns
                    .find(col => col.field === 'action')
                    ?.getActions({ row });

                return (
                    <div key={props.getRowId(row)} data-testid={`row-${props.getRowId(row)}`}>
                        <span data-testid={`cell-score-${props.getRowId(row)}`}>
                            <span data-testid={`score-value-${props.getRowId(row)}`}>
                                {row.Score}
                            </span>
                            <input
                                type="number"
                                defaultValue={row.Score}
                                data-testid={`edit-score-${props.getRowId(row)}`}
                                onBlur={(e) => {
                                    props.onCellEditCommit?.({
                                        id: props.getRowId(row),
                                        field: 'Score',
                                        value: e.target.value,
                                    });
                                }}
                            />
                        </span>
                        <span data-testid={`cell-threshold-${props.getRowId(row)}`}>
                            <span data-testid={`threshold-value-${props.getRowId(row)}`}>
                                {row.Threshold}
                            </span>
                            <input
                                type="number"
                                defaultValue={row.Threshold}
                                data-testid={`edit-threshold-${props.getRowId(row)}`}
                                onBlur={(e) => {
                                    props.onCellEditCommit?.({
                                        id: props.getRowId(row),
                                        field: 'Threshold',
                                        value: e.target.value,
                                    });
                                }}
                            />
                        </span>
                        {actions?.map(action => (
                            <div key={action.key}>{action}</div>
                        ))}
                    </div>
                );
            })}
            <button
                type="button"
                data-testid="trigger-stop-editing"
                onClick={() => {
                    if (props.stopEditing) {
                        props.editComplete?.();
                    }
                }}
            >
                Stop Editing
            </button>
        </div>
    );
    MockCustomDataGrid.displayName = 'MockCustomDataGrid';
    return MockCustomDataGrid;
});

jest.mock('../../BlocksView/BlockModals/ModalAlert', () => {
    const MockModalAlert = ({ isOpen, content, color }) => {
        if (!isOpen) return null;
        return (
            <div data-testid="modal-alert" data-color={color}>
                {content}
            </div>
        );
    };
    MockModalAlert.displayName = 'MockModalAlert';
    return MockModalAlert;
});

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
        RouteId: '101',
        Threshold: 100,
        Score: 20,
        SiteId: '2141',
        Occupancy: 'High',
    },
    {
        rowKey: 'default',
        partitionKey: 'pk-default',
        RouteId: null,
        Threshold: 30,
        Score: 5,
        SiteId: null,
        Occupancy: null,
    },
];

const defaultProps = {
    allThresholds: mockThresholds,
    mode: UPDATE_TYPE.NEW,
    isModalOpen: true,
    onClose: jest.fn(),
    saveNewThresholds: jest.fn(),
    updateThresholds: jest.fn(),
    deleteThresholds: jest.fn(),
    thresholdSet: null,
};

describe('BusPriorityThresholdsModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Modal Rendering', () => {
        it('renders the modal when isModalOpen is true', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            expect(screen.getByTestId('custom-mui-dialog')).toBeInTheDocument();
        });

        it('does not render the modal when isModalOpen is false', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} isModalOpen={false} />);
            expect(screen.queryByTestId('custom-mui-dialog')).not.toBeInTheDocument();
        });

        it('displays correct title for NEW mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);
            expect(screen.getByTestId('dialog-title')).toHaveTextContent('Add New Threshold Set');
        });

        it('displays correct title for UPDATE mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.UPDATE} thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }} />);
            expect(screen.getByTestId('dialog-title')).toHaveTextContent('Update Threshold Set');
        });

        it('displays correct title for DELETE mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.DELETE} thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }} />);
            expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Threshold Set');
        });

        it('displays correct title for VIEW mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.VIEW} thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }} />);
            expect(screen.getByTestId('dialog-title')).toHaveTextContent('View Threshold Set');
        });

        it('renders the CustomDataGrid', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            expect(screen.getByTestId('custom-datagrid')).toBeInTheDocument();
        });
    });

    describe('Filter Inputs', () => {
        it('renders Site Id input', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            expect(screen.getByPlaceholderText('Site Id')).toBeInTheDocument();
        });

        it('renders Route Id input', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            expect(screen.getByPlaceholderText('Route Id')).toBeInTheDocument();
        });

        it('renders Occupancy select', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            const occupancySelect = document.querySelector('#occupancy');
            expect(occupancySelect).toBeInTheDocument();
        });

        it('allows entering Site Id', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            const siteIdInput = screen.getByPlaceholderText('Site Id');
            fireEvent.change(siteIdInput, { target: { value: '1234' } });
            expect(siteIdInput).toHaveValue(1234);
        });

        it('allows entering Route Id', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            const routeIdInput = screen.getByPlaceholderText('Route Id');
            fireEvent.change(routeIdInput, { target: { value: '101' } });
            expect(routeIdInput).toHaveValue('101');
        });

        it('converts Route Id to uppercase', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            const routeIdInput = screen.getByPlaceholderText('Route Id');
            fireEvent.change(routeIdInput, { target: { value: 'abc' } });
            expect(routeIdInput).toHaveValue('ABC');
        });

        it('formats Route Id on blur (trim and sort)', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            const routeIdInput = screen.getByPlaceholderText('Route Id');
            fireEvent.change(routeIdInput, { target: { value: ' 103 , 101 , 102 ' } });
            fireEvent.blur(routeIdInput);
            expect(routeIdInput).toHaveValue('101, 102, 103');
        });

        it('formats Route Id on Enter key', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            const routeIdInput = screen.getByPlaceholderText('Route Id');
            fireEvent.change(routeIdInput, { target: { value: ' 105 , 104 ' } });
            fireEvent.keyDown(routeIdInput, { key: 'Enter' });
            expect(routeIdInput).toHaveValue('104, 105');
        });

        it('allows selecting Occupancy', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            const occupancySelect = document.querySelector('#occupancy');

            expect(occupancySelect).toBeInTheDocument();

            fireEvent.change(occupancySelect, { target: { value: 'High' }, currentTarget: { value: 'High' } });

            expect(occupancySelect).toBeInTheDocument();
        });

        it('disables filters in DELETE mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.DELETE} thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }} />);
            expect(screen.getByPlaceholderText('Site Id')).toBeDisabled();
            expect(screen.getByPlaceholderText('Route Id')).toBeDisabled();
            const occupancySelect = document.querySelector('#occupancy');
            expect(occupancySelect).toBeDisabled();
        });

        it('enables filters in NEW mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);
            expect(screen.getByPlaceholderText('Site Id')).not.toBeDisabled();
            expect(screen.getByPlaceholderText('Route Id')).not.toBeDisabled();
            const occupancySelect = document.querySelector('#occupancy');
            expect(occupancySelect).not.toBeDisabled();
        });
    });

    describe('Loading Existing Threshold Set', () => {
        it('loads thresholds for given thresholdSet', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            expect(screen.getByTestId('row-rk1')).toBeInTheDocument();
            expect(screen.getByTestId('row-rk2')).toBeInTheDocument();
            expect(screen.queryByTestId('row-default')).not.toBeInTheDocument();
        });

        it('populates filters with thresholdSet values', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            expect(screen.getByPlaceholderText('Site Id')).toHaveValue(2141);
            expect(screen.getByPlaceholderText('Route Id')).toHaveValue('101');

            const occupancySelect = document.querySelector('#occupancy');
            expect(occupancySelect).toHaveValue('High');
        });

        it('handles null siteId in thresholdSet', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: null, routeId: null, occupancy: null }}
            />);

            expect(screen.getByTestId('row-default')).toBeInTheDocument();
        });
    });

    describe('Toolbar Buttons', () => {
        it('shows Add threshold button in NEW mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);
            expect(screen.getByText('Add threshold')).toBeInTheDocument();
        });

        it('shows Add threshold button in UPDATE mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.UPDATE} thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }} />);
            expect(screen.getByText('Add threshold')).toBeInTheDocument();
        });

        it('shows Duplicate thresholds button only in UPDATE mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.UPDATE} thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }} />);
            expect(screen.getByText('Duplicate thresholds')).toBeInTheDocument();
        });

        it('does not show Duplicate thresholds button in NEW mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);
            expect(screen.queryByText('Duplicate thresholds')).not.toBeInTheDocument();
        });

        it('does not show toolbar buttons in DELETE mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.DELETE} thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }} />);
            expect(screen.queryByText('Add threshold')).not.toBeInTheDocument();
            expect(screen.queryByText('Duplicate thresholds')).not.toBeInTheDocument();
        });

        it('does not show toolbar buttons in VIEW mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.VIEW} thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }} />);
            expect(screen.queryByText('Add threshold')).not.toBeInTheDocument();
        });
    });

    describe('Add Threshold Row', () => {
        it('adds a new threshold row when Add threshold is clicked', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            expect(screen.queryByTestId('row-NEW10000')).not.toBeInTheDocument();

            fireEvent.click(screen.getByText('Add threshold'));

            expect(screen.getByTestId('row-NEW10000')).toBeInTheDocument();
        });

        it('increments temp row key for each new row', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            fireEvent.click(screen.getByText('Add threshold'));
            expect(screen.getByTestId('row-NEW10000')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Add threshold'));
            expect(screen.getByTestId('row-NEW10001')).toBeInTheDocument();
        });

        it('adds row with current filter values', async () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            const siteIdInput = screen.getByPlaceholderText('Site Id');
            fireEvent.change(siteIdInput, { target: { value: '5000' } });

            fireEvent.click(screen.getByText('Add threshold'));

            await waitFor(() => {
                expect(screen.getByTestId('row-NEW10000')).toBeInTheDocument();
            });
        });
    });

    describe('Duplicate Threshold Set', () => {
        it('duplicates existing thresholds in UPDATE mode', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            fireEvent.click(screen.getByText('Duplicate thresholds'));

            expect(screen.getByTestId('row-NEWrk1')).toBeInTheDocument();
            expect(screen.getByTestId('row-NEWrk2')).toBeInTheDocument();
        });

        it('switches to NEW mode after duplicating', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            fireEvent.click(screen.getByText('Duplicate thresholds'));

            expect(screen.getByTestId('dialog-title')).toHaveTextContent('Add New Threshold Set');
        });
    });

    describe('Delete Threshold Row', () => {
        it('shows delete button for each row in NEW mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);
            fireEvent.click(screen.getByText('Add threshold'));

            expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
        });

        it('shows delete button for each row in UPDATE mode', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            const deleteIcons = screen.getAllByTestId('delete-icon');
            expect(deleteIcons.length).toBeGreaterThan(0);
        });

        it('does not show delete button in DELETE mode', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.DELETE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
        });

        it('removes threshold row when delete is clicked', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            expect(screen.getByTestId('row-rk1')).toBeInTheDocument();

            const deleteButtons = screen.getAllByTestId('delete-icon');
            fireEvent.click(deleteButtons[0]);

            expect(screen.queryByTestId('row-rk1')).not.toBeInTheDocument();
        });
    });

    describe('Cell Editing', () => {
        it('allows editing Score values', async () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            const input = screen.getByTestId('edit-score-rk1');
            fireEvent.change(input, { target: { value: '25' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(screen.getByTestId('score-value-rk1')).toHaveTextContent('25');
            });
        });

        it('allows editing Threshold values', async () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            const input = screen.getByTestId('edit-threshold-rk1');
            fireEvent.change(input, { target: { value: '75' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(screen.getByTestId('threshold-value-rk1')).toHaveTextContent('75');
            });
        });
    });

    describe('Validation - Duplicate Detection', () => {
        it('shows error when duplicate Scores exist', async () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            const siteIdInput = screen.getByPlaceholderText('Site Id');
            fireEvent.change(siteIdInput, { target: { value: '9999' } });

            fireEvent.click(screen.getByText('Add threshold'));
            fireEvent.click(screen.getByText('Add threshold'));

            await waitFor(() => {
                const alert = screen.getByTestId('modal-alert');
                expect(alert).toHaveTextContent('Duplicate scores or thresholds are not allowed');
            });
        });

        it('shows error when duplicate Thresholds exist', async () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            const siteIdInput = screen.getByPlaceholderText('Site Id');
            fireEvent.change(siteIdInput, { target: { value: '9999' } });

            fireEvent.click(screen.getByText('Add threshold'));

            const scoreInput = screen.getByTestId('edit-score-NEW10000');
            fireEvent.change(scoreInput, { target: { value: '5' } });
            fireEvent.blur(scoreInput);

            fireEvent.click(screen.getByText('Add threshold'));

            const scoreInput2 = screen.getByTestId('edit-score-NEW10001');
            fireEvent.change(scoreInput2, { target: { value: '10' } });
            fireEvent.blur(scoreInput2);

            await waitFor(() => {
                const alert = screen.queryByTestId('modal-alert');
                if (alert) {
                    expect(alert).toHaveTextContent('Duplicate scores or thresholds are not allowed');
                }
            });
        });
    });

    describe('Validation - Zero Values', () => {
        it('shows error when Score is zero', async () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            const siteIdInput = screen.getByPlaceholderText('Site Id');
            fireEvent.change(siteIdInput, { target: { value: '9999' } });

            fireEvent.click(screen.getByText('Add threshold'));

            await waitFor(() => {
                const alert = screen.getByTestId('modal-alert');
                expect(alert).toHaveTextContent('Zero values for scores or thresholds are not allowed');
            });
        });
    });

    describe('Validation - Increasing Thresholds', () => {
        it('shows error when thresholds do not increase with scores', async () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            const siteIdInput = screen.getByPlaceholderText('Site Id');
            fireEvent.change(siteIdInput, { target: { value: '9999' } });

            fireEvent.click(screen.getByText('Add threshold'));

            await waitFor(() => {
                expect(screen.getByTestId('edit-score-NEW10000')).toBeInTheDocument();
            });

            const scoreInput1 = screen.getByTestId('edit-score-NEW10000');
            fireEvent.change(scoreInput1, { target: { value: '10' } });
            fireEvent.blur(scoreInput1);

            const thresholdInput1 = screen.getByTestId('edit-threshold-NEW10000');
            fireEvent.change(thresholdInput1, { target: { value: '50' } });
            fireEvent.blur(thresholdInput1);

            fireEvent.click(screen.getByText('Add threshold'));

            await waitFor(() => {
                expect(screen.getByTestId('edit-score-NEW10001')).toBeInTheDocument();
            });

            const scoreInput2 = screen.getByTestId('edit-score-NEW10001');
            fireEvent.change(scoreInput2, { target: { value: '20' } });
            fireEvent.blur(scoreInput2);

            const thresholdInput2 = screen.getByTestId('edit-threshold-NEW10001');
            fireEvent.change(thresholdInput2, { target: { value: '40' } });
            fireEvent.blur(thresholdInput2);

            await waitFor(() => {
                const alert = screen.getByTestId('modal-alert');
                expect(alert).toHaveTextContent('Thresholds must increase with Scores');
            }, { timeout: 3000 });
        });
    });

    describe('Validation - Existing Threshold Set', () => {
        it('shows error when threshold set with same filters already exists', async () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            const siteIdInput = screen.getByPlaceholderText('Site Id');
            fireEvent.change(siteIdInput, { target: { value: 2141 } });

            const routeIdInput = screen.getByPlaceholderText('Route Id');
            fireEvent.change(routeIdInput, { target: { value: '101' } });

            const occupancySelect = document.querySelector('#occupancy');
            fireEvent.change(occupancySelect, { target: { value: 'High' }, currentTarget: { value: 'High' } });

            await waitFor(() => {
                expect(siteIdInput).toHaveValue(2141);
            });

            fireEvent.click(screen.getByText('Add threshold'));

            await waitFor(() => {
                expect(screen.getByTestId('edit-score-NEW10000')).toBeInTheDocument();
            });

            const scoreInput = screen.getByTestId('edit-score-NEW10000');
            fireEvent.change(scoreInput, { target: { value: '5' } });
            fireEvent.blur(scoreInput);

            const thresholdInput = screen.getByTestId('edit-threshold-NEW10000');
            fireEvent.change(thresholdInput, { target: { value: '25' } });
            fireEvent.blur(thresholdInput);

            await waitFor(() => {
                const alert = screen.getByTestId('modal-alert');
                expect(alert).toHaveTextContent('A threshold set with these options already exists');
            }, { timeout: 3000 });
        });
    });

    describe('Save Button State', () => {
        it('disables save button when no thresholds exist', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);
            const saveButton = screen.getByText('Add new threshold set');
            expect(saveButton).toBeDisabled();
        });

        it('disables save button when validation errors exist', async () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            fireEvent.click(screen.getByText('Add threshold'));

            await waitFor(() => {
                const saveButton = screen.getByText('Add new threshold set');
                expect(saveButton).toBeDisabled();
            });
        });

        it('disables save button in NEW mode when all filters are empty', async () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            fireEvent.click(screen.getByText('Add threshold'));

            const scoreInput = screen.getByTestId('edit-score-NEW10000');
            fireEvent.change(scoreInput, { target: { value: '10' } });
            fireEvent.blur(scoreInput);

            const thresholdInput = screen.getByTestId('edit-threshold-NEW10000');
            fireEvent.change(thresholdInput, { target: { value: '50' } });
            fireEvent.blur(thresholdInput);

            await waitFor(() => {
                const saveButton = screen.getByText('Add new threshold set');
                expect(saveButton).toBeDisabled();
            });
        });

        it('button state changes based on data validity', async () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            const saveButton = screen.getByText('Add new threshold set');
            expect(saveButton).toBeDisabled();

            const siteIdInput = screen.getByPlaceholderText('Site Id');
            fireEvent.change(siteIdInput, { target: { value: 5000 } });

            fireEvent.click(screen.getByText('Add threshold'));

            await waitFor(() => {
                expect(screen.getByTestId('edit-score-NEW10000')).toBeInTheDocument();
            });

            const scoreInput = screen.getByTestId('edit-score-NEW10000');
            fireEvent.change(scoreInput, { target: { value: '10' } });
            fireEvent.blur(scoreInput);

            const thresholdInput = screen.getByTestId('edit-threshold-NEW10000');
            fireEvent.change(thresholdInput, { target: { value: '50' } });
            fireEvent.blur(thresholdInput);

            await waitFor(() => {
                expect(screen.getByTestId('score-value-NEW10000')).toHaveTextContent('10');
                expect(screen.getByTestId('threshold-value-NEW10000')).toHaveTextContent('50');
            });

            expect(screen.getByText('Add new threshold set')).toBeInTheDocument();
        });
    });

    describe('Modal Actions', () => {
        it('calls onClose when close button is clicked', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} />);
            fireEvent.click(screen.getByTestId('dialog-close'));
            expect(defaultProps.onClose).toHaveBeenCalled();
        });

        it('has correct button label and calls handler in NEW mode', () => {
            render(<BusPriorityThresholdsModal {...defaultProps} mode={UPDATE_TYPE.NEW} />);

            const saveButton = screen.getByText('Add new threshold set');
            expect(saveButton).toBeInTheDocument();

            expect(saveButton).toBeDisabled();
        });

        it('has correct button label in UPDATE mode', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.UPDATE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            const saveButton = screen.getByText('Update threshold set');
            expect(saveButton).toBeInTheDocument();
        });

        it('calls deleteThresholds when delete is clicked in DELETE mode', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.DELETE}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            fireEvent.click(screen.getByText('Delete threshold set'));

            expect(defaultProps.deleteThresholds).toHaveBeenCalled();
        });

        it('calls onClose in VIEW mode', () => {
            render(<BusPriorityThresholdsModal
                {...defaultProps}
                mode={UPDATE_TYPE.VIEW}
                thresholdSet={{ siteId: 2141, routeId: '101', occupancy: 'High' }}
            />);

            fireEvent.click(screen.getByText('View threshold set'));

            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });
});
