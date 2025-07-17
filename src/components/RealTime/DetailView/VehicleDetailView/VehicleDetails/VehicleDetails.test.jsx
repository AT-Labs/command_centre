import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { VehicleDetails } from './VehicleDetails';

jest.mock('./VehicleCapacityOccupancy', () => {
    return function VehicleCapacityOccupancy() {
        return <div>VehicleCapacityOccupancy Mock</div>;
    };
});

let wrapper;
let sandbox;
const componentPropsMock = {
    vehicleDetail: {
        id: 'vehicle1',
        trip: {
            tripId: 'trip123',
            trip_headsign: 'Test Destination',
            startTime: '08:30:00'
        },
        route: {
            route_id: 'route1',
            route_short_name: '25',
            route_type: 3,
            agency_name: 'Test Agency'
        }
    },
    vehicleFleetInfo: {
        agency: {
            agencyName: 'Fleet Agency',
            depot: {
                name: 'Main Depot'
            }
        },
        label: 'BUS001',
        tag: 'Express',
        type: {
            type: 'Bus'
        }
    },
    vehicleAllocations: {},
    routeSelected: () => {},
    routeChecked: () => {},
    clearDetail: () => {},
    updateRealTimeDetailView: () => {},
    addSelectedSearchResult: () => {}
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    wrapper = shallow(<VehicleDetails { ...props } />);
    return wrapper;
};

describe('<VehicleDetails />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should render', () => {
        expect(wrapper.exists()).to.equal(true);
    });

    it('should display route information when trip exists', () => {
        const detailsSection = wrapper.find('.vehicle-details__list');
        expect(detailsSection.html()).to.include('Route:');
        expect(detailsSection.html()).to.include('25');
    });

    it('should display depot name when available from fleet info', () => {
        wrapper = setup({
            vehicleFleetInfo: {
                agency: {
                    depot: {
                        name: 'Test Depot'
                    }
                }
            }
        });

        const detailsSection = wrapper.find('.vehicle-details__list');
        expect(detailsSection.html()).to.include('Test Depot');
    });

    it('should not display depot row when depot name is not available', () => {
        wrapper = setup({
            vehicleFleetInfo: {
                agency: {
                    agencyName: 'Test Agency'
                }
            }
        });

        const detailsSection = wrapper.find('.vehicle-details__list');
        expect(detailsSection.html()).to.not.include('Depot:');
    });

    it('should call route selection functions when route button is clicked', () => {
        const clearDetailSpy = sandbox.spy();
        const updateRealTimeDetailViewSpy = sandbox.spy();
        const addSelectedSearchResultSpy = sandbox.spy();
        const routeCheckedSpy = sandbox.spy();
        const routeSelectedSpy = sandbox.spy();

        wrapper = setup({
            vehicleDetail: {
                id: 'vehicle1',
                trip: {
                    tripId: 'trip123',
                    trip_headsign: 'Test Destination',
                    startTime: '08:30:00'
                },
                route: {
                    route_id: 'route1',
                    route_short_name: '25',
                    route_type: 3,
                    agency_name: 'Test Agency',
                    route_long_name: 'Test Route',
                    route_color: '#FF0000',
                    route_text_color: '#FFFFFF'
                }
            },
            clearDetail: clearDetailSpy,
            updateRealTimeDetailView: updateRealTimeDetailViewSpy,
            addSelectedSearchResult: addSelectedSearchResultSpy,
            routeChecked: routeCheckedSpy,
            routeSelected: routeSelectedSpy
        });

        const routeButton = wrapper.find('Button');
        routeButton.simulate('click');

        expect(clearDetailSpy.calledOnce).to.equal(true);
        expect(updateRealTimeDetailViewSpy.calledOnce).to.equal(true);
        expect(addSelectedSearchResultSpy.calledOnce).to.equal(true);
        expect(routeCheckedSpy.calledOnce).to.equal(true);
        expect(routeSelectedSpy.calledOnce).to.equal(true);
    });
});
