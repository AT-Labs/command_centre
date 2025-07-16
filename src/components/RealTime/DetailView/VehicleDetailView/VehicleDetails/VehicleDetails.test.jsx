import React from 'react';
import { shallow } from 'enzyme';
import { VehicleDetails } from './VehicleDetails';

jest.mock('./VehicleCapacityOccupancy', () => {
    return function MockVehicleCapacityOccupancy() {
        return <div data-testid="vehicle-capacity-occupancy" />;
    };
});

describe('VehicleDetails Component', () => {
    const defaultProps = {
        vehicleDetail: {
            id: '12345',
            trip: {
                tripId: 'trip-123',
                trip_headsign: 'Test Route',
                startTime: '10:00:00',
            },
            route: {
                route_id: 'route-123',
                route_short_name: '123',
                route_type: 3,
                agency_name: 'Test Agency',
            },
        },
        vehicleFleetInfo: {
            agency: {
                agencyId: 'AGENCY1',
                agencyName: 'Test Agency',
                depot: {
                    name: 'Test Depot',
                },
            },
            type: {
                type: 'Bus',
            },
            label: 'Test Vehicle',
            tag: 'test-tag',
        },
        vehicleAllocations: {},
        routeSelected: jest.fn(),
        routeChecked: jest.fn(),
        clearDetail: jest.fn(),
        updateRealTimeDetailView: jest.fn(),
        addSelectedSearchResult: jest.fn(),
    };

    const setup = (props = {}) => {
        return shallow(<VehicleDetails {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component', () => {
        const wrapper = setup();
        expect(wrapper.exists()).toBe(true);
    });

    it('should display vehicle type and label in header', () => {
        const wrapper = setup();
        const header = wrapper.find('h2');
        expect(header.text()).toContain('Bus Test Vehicle');
    });

    it('should display depot information when available', () => {
        const wrapper = setup();
        const depotRow = wrapper.findWhere(node => 
            node.type() === 'dt' && node.text() === 'Depot:'
        );
        expect(depotRow.exists()).toBe(true);

        const depotValue = wrapper.findWhere(node => 
            node.type() === 'dd' && node.text() === 'Test Depot'
        );
        expect(depotValue.exists()).toBe(true);
    });

    it('should not display depot information when not available', () => {
        const propsWithoutDepot = {
            ...defaultProps,
            vehicleFleetInfo: {
                ...defaultProps.vehicleFleetInfo,
                agency: {
                    ...defaultProps.vehicleFleetInfo.agency,
                    depot: null,
                },
            },
        };
        const wrapper = setup(propsWithoutDepot);
        
        const depotRow = wrapper.findWhere(node => 
            node.type() === 'dt' && node.text() === 'Depot:'
        );
        expect(depotRow.exists()).toBe(false);
    });

    it('should display operator information', () => {
        const wrapper = setup();
        const operatorRow = wrapper.findWhere(node => 
            node.type() === 'dt' && node.text() === 'Operator:'
        );
        expect(operatorRow.exists()).toBe(true);

        const operatorValue = wrapper.findWhere(node => 
            node.type() === 'dd' && node.text() === 'Test Agency'
        );
        expect(operatorValue.exists()).toBe(true);
    });

    it('should display route information when trip is available', () => {
        const wrapper = setup();
        const routeRow = wrapper.findWhere(node => 
            node.type() === 'dt' && node.text() === 'Route:'
        );
        expect(routeRow.exists()).toBe(true);
    });

    it('should display tags when available', () => {
        const wrapper = setup();
        const tagsRow = wrapper.findWhere(node => 
            node.type() === 'dt' && node.text() === 'Tags:'
        );
        expect(tagsRow.exists()).toBe(true);

        const tagsValue = wrapper.findWhere(node => 
            node.type() === 'dd' && node.text() === 'test-tag'
        );
        expect(tagsValue.exists()).toBe(true);
    });

    it('should not display tags when not available', () => {
        const propsWithoutTags = {
            ...defaultProps,
            vehicleFleetInfo: {
                ...defaultProps.vehicleFleetInfo,
                tag: null,
            },
        };
        const wrapper = setup(propsWithoutTags);
        
        const tagsRow = wrapper.findWhere(node => 
            node.type() === 'dt' && node.text() === 'Tags:'
        );
        expect(tagsRow.exists()).toBe(false);
    });

    it('should display non-trip description when no trip is available', () => {
        const propsWithoutTrip = {
            ...defaultProps,
            vehicleDetail: {
                ...defaultProps.vehicleDetail,
                trip: null,
            },
        };
        const wrapper = setup(propsWithoutTrip);
        
        const descriptionRow = wrapper.findWhere(node => 
            node.type() === 'dt' && node.text() === 'Description:'
        );
        expect(descriptionRow.exists()).toBe(true);

        const descriptionValue = wrapper.findWhere(node => 
            node.type() === 'dd' && node.text() === 'Not In Service'
        );
        expect(descriptionValue.exists()).toBe(true);
    });

    it('should display unscheduled service description when vehicle has unscheduled tag', () => {
        const propsWithUnscheduledTag = {
            ...defaultProps,
            vehicleDetail: {
                ...defaultProps.vehicleDetail,
                trip: null,
                tags: ['UNSCHEDULED'],
            },
        };
        const wrapper = setup(propsWithUnscheduledTag);
        
        const descriptionRow = wrapper.findWhere(node => 
            node.type() === 'dt' && node.text() === 'Description:'
        );
        expect(descriptionRow.exists()).toBe(true);

        const descriptionValue = wrapper.findWhere(node => 
            node.type() === 'dd' && node.text() === 'Unscheduled Service'
        );
        expect(descriptionValue.exists()).toBe(true);
    });
}); 