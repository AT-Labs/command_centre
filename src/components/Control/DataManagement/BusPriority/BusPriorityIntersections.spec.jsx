/**
 * @jest-environment jsdom
 */
/* eslint-disable react/prop-types */

import React from 'react';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BusPriorityIntersectionsDataGrid } from './BusPriorityIntersections.jsx';

jest.mock('../../../Common/CustomDataGrid/CustomDataGrid', () => {
    const MockCustomDataGrid = props => (
        <div data-testid="custom-datagrid">
            { props.isLoading && <div data-testid="loading">Loading...</div> }
            { props.dataSource.map(row => (
                <div key={ props.getRowId(row) } data-testid={ `row-${props.getRowId(row)}` }>
                    <span data-testid={ `cell-travel-time-${props.getRowId(row)}` }>{ row.Travel_Time }</span>
                    <span data-testid={ `cell-geofence-radius-${props.getRowId(row)}` }>{ row.Geofence_Radius }</span>
                    <span data-testid={ `cell-bus-route-${props.getRowId(row)}` }>{ row.Bus_Route }</span>
                    { props.columns
                        .find(col => col.field === 'action')
                        ?.getActions({ row })
                        ?.map(action => (
                            <div>{ action }</div>
                        ))}
                </div>
            ))}
        </div>
    );

    MockCustomDataGrid.displayName = 'MockCustomDataGrid';
    return MockCustomDataGrid;
});

jest.mock('../../../Common/CustomModal/CustomModal', () => {
    const MockCustomModal = ({ title, isModalOpen, onClose, okButton, children }) => {
        if (!isModalOpen) return null;
        return (
            <div data-testid="custom-modal" role="dialog">
                <h4 data-testid="modal-title">{title}</h4>
                <div data-testid="modal-body">{children}</div>
                <button type="button" data-testid="modal-close" onClick={ onClose }>
                    Close
                </button>
                <button
                    type="button"
                    data-testid="modal-save"
                    onClick={ okButton.onClick }
                    disabled={ okButton.isDisabled }
                >
                    { okButton.label }
                </button>
            </div>
        );
    };

    MockCustomModal.displayName = 'MockCustomModal';
    return MockCustomModal;
});

jest.mock('../../BlocksView/BlockModals/ModalAlert', () => {
    const MockModalAlert = ({ isOpen, content }) => {
        if (!isOpen) return null;
        return <div data-testid="modal-alert">{content}</div>;
    };

    MockModalAlert.displayName = 'MockModalAlert';
    return MockModalAlert;
});

jest.mock('react-icons/bs', () => ({
    BsPencilSquare: () => <span data-testid="edit-icon">Edit</span>,
}));

const mockIntersections = [
    {
        partitionKey: 'pk1',
        rowKey: 'rk1',
        Bus_Route: '101',
        Direction_Id: '0',
        Site_Id: '2141',
        Travel_Time: 30,
        Geofence_Radius: 150,
        Geometry_Revision: '1',
        Latitude: '-36.844',
        Longitude: '174.768',
    },
    {
        partitionKey: 'pk2',
        rowKey: 'rk2',
        Bus_Route: '202',
        Direction_Id: '1',
        Site_Id: '2201',
        Travel_Time: 45,
        Geofence_Radius: 200,
    },
];

const defaultProps = {
    busPriorityIntersections: mockIntersections,
    datagridConfig: {},
    isLoading: false,
    isEditAllowed: true,
    getBusPriorityIntersections: jest.fn(),
    updateBusPriorityIntersectionsDatagridConfig: jest.fn(),
    updateBusPriorityIntersection: jest.fn(),
    dataSource: jest.fn().mockReturnValue(mockIntersections),
};

describe('<BusPriorityIntersectionsDataGrid />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        document.body.innerHTML = '';
    });

    const openFreshEditModal = () => {
        fireEvent.click(document.body);
        fireEvent.click(screen.getAllByTestId('edit-icon')[0]);
        return within(screen.getByTestId('custom-modal'));
    };

    it('fetches intersections on mount', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        expect(defaultProps.getBusPriorityIntersections).toHaveBeenCalledTimes(1);
    });

    it('displays Travel_Time correctly in the grid', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        expect(screen.getByTestId('cell-travel-time-rk1')).toHaveTextContent('30');
        expect(screen.getByTestId('cell-travel-time-rk2')).toHaveTextContent('45');
    });

    it('renders edit button for each intersection', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        expect(screen.getAllByTestId('edit-icon')).toHaveLength(2);
    });

    it('opens edit modal when edit button is clicked', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        const modal = screen.getByTestId('custom-modal');
        expect(modal).toBeInTheDocument();

        expect(withinModal.getByTestId('modal-title')).toHaveTextContent('Edit Intersections');
        expect(withinModal.getByText('Bus Route:')).toBeInTheDocument();
        expect(withinModal.getByText('101')).toBeInTheDocument();
    });

    it('pre-fills Travel Time and Geofence Radius in the modal', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        expect(withinModal.getByDisplayValue('30')).toBeInTheDocument();
        expect(withinModal.getByDisplayValue('150')).toBeInTheDocument();
    });

    it('shows alert when Geofence Radius is not a positive integer', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        const geofenceInput = withinModal.getByDisplayValue('150');
        fireEvent.change(geofenceInput, { target: { value: '0' } });

        expect(screen.getByTestId('modal-alert')).toBeInTheDocument();
        expect(screen.getByText('Geofence Radius should be positive integer')).toBeInTheDocument();
        expect(screen.getByTestId('modal-save')).toBeDisabled();
    });

    it('shows alert and disables Save button when Travel Time is not a positive integer', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();
        const travelTimeInput = withinModal.getByDisplayValue('30');

        fireEvent.change(travelTimeInput, { target: { value: '0' } });

        expect(withinModal.getByText('Travel Time should be positive integer')).toBeInTheDocument();
        expect(screen.getByTestId('modal-save')).toBeDisabled();
    });

    it('enables Save button only when both fields are valid positive integers', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        fireEvent.change(withinModal.getByDisplayValue('30'), { target: { value: '60' } });
        fireEvent.change(withinModal.getByDisplayValue('150'), { target: { value: '180' } });

        expect(screen.getByTestId('modal-save')).not.toBeDisabled();
    });

    it('disables Save button if either field is invalid', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        fireEvent.change(withinModal.getByDisplayValue('30'), { target: { value: '60' } });
        fireEvent.change(withinModal.getByDisplayValue('150'), { target: { value: '-5' } });

        expect(screen.getByTestId('modal-alert')).toBeInTheDocument();
        expect(screen.getByTestId('modal-save')).toBeDisabled();
    });

    it('saves changes with updated Travel Time and Geofence Radius and closes modal', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        fireEvent.change(withinModal.getByDisplayValue('30'), { target: { value: '75' } });
        fireEvent.change(withinModal.getByDisplayValue('150'), { target: { value: '200' } });

        fireEvent.click(screen.getByTestId('modal-save'));

        expect(defaultProps.updateBusPriorityIntersection).toHaveBeenCalledWith({
            ...mockIntersections[0],
            Travel_Time: 75,
            Geofence_Radius: 200,
        });
        expect(screen.queryByTestId('custom-modal')).not.toBeInTheDocument();
    });

    it('closes modal and resets state when Close is clicked', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        const travelTimeInput = withinModal.getByPlaceholderText('Travel Time');

        fireEvent.change(travelTimeInput, { target: { value: '99' } });
        fireEvent.click(screen.getByTestId('modal-close'));

        expect(screen.queryByTestId('custom-modal')).not.toBeInTheDocument();
        expect(defaultProps.updateBusPriorityIntersection).not.toHaveBeenCalled();
    });

    it('shows Geofence Radius alert when value is invalid', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        const geofenceInput = withinModal.getByDisplayValue('200');

        fireEvent.change(geofenceInput, { target: { value: '-10' } });

        expect(withinModal.getByText('Geofence Radius should be positive integer')).toBeInTheDocument();
        expect(screen.getByTestId('modal-save')).toBeDisabled();
    });

    it('shows Travel Time alert when value is invalid', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        const travelTimeInput = withinModal.getByDisplayValue('75');

        fireEvent.change(travelTimeInput, { target: { value: '-10' } });

        expect(withinModal.getByText('Travel Time should be positive integer')).toBeInTheDocument();
        expect(screen.getByTestId('modal-save')).toBeDisabled();
    });

    it('shows only the correct alert when only one field is invalid', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        fireEvent.change(withinModal.getByDisplayValue('75'), { target: { value: '-5' } });
        fireEvent.change(withinModal.getByDisplayValue('200'), { target: { value: '200' } });

        expect(withinModal.getByText('Travel Time should be positive integer')).toBeInTheDocument();
        expect(withinModal.queryByText('Geofence Radius should be positive integer')).not.toBeInTheDocument();
        expect(screen.getByTestId('modal-save')).toBeDisabled();
    });

    it('hides both alerts when both fields are valid positive integers', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        fireEvent.change(withinModal.getByDisplayValue('75'), { target: { value: '60' } });
        fireEvent.change(withinModal.getByDisplayValue('200'), { target: { value: '180' } });

        expect(withinModal.queryByText('Geofence Radius should be positive integer')).not.toBeInTheDocument();
        expect(withinModal.queryByText('Travel Time should be positive integer')).not.toBeInTheDocument();
        expect(screen.getByTestId('modal-save')).not.toBeDisabled();
    });

    it('treats decimal values as invalid', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        fireEvent.change(withinModal.getByDisplayValue('200'), { target: { value: '12.5' } });

        expect(withinModal.getByText('Geofence Radius should be positive integer')).toBeInTheDocument();
    });

    it('treats empty input as invalid and disables Save', () => {
        render(<BusPriorityIntersectionsDataGrid { ...defaultProps } />);
        const withinModal = openFreshEditModal();

        fireEvent.change(withinModal.getByDisplayValue('75'), { target: { value: '' } });

        expect(screen.getByTestId('modal-save')).toBeDisabled();
    });
});
