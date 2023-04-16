import React from 'react';
import { shallow } from 'enzyme';
import VIEW_TYPE from '../../../../types/view-types';
import { CommonView } from './CommonView';

describe('CommonView', () => {
    const fetchRoutes = jest.fn();
    const fetchTripInstances = jest.fn();
    const getStops = jest.fn();
    const props = {
        viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS,
        filters: {},
        serviceDate: '2023-04-11',
        platforms: {},
        allRoutes: [],
        selectedTrips: [],
        fetchRoutes,
        fetchTripInstances,
        getStops,
        isRoutesLoading: false,
        isRouteVariantsLoading: false,
        isTripsLoading: false,
        isTripsUpdating: false,
        routesTotal: 0,
        allRoutesTotal: 0,
        routeVariantsTotal: 0,
        allRouteVariantsTotal: 0,
        tripsTotal: 0,
    };
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<CommonView { ...props } />);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should fetch routes and stops on mount', () => {
        expect(getStops).toHaveBeenCalledTimes(1);
        expect(fetchRoutes).toHaveBeenCalledTimes(1);
    });

    it('should fetch trip instances on mount if viewType is "trips"', () => {
        const tripsProps = { ...props,
            filters: { routeShortName: 'WEST' },
            allRoutes: [{ routeShortName: 'WEST', agencyAgnostic: true, routeVariants: [{ routeVariantId: 1 }] }],
        };
        shallow(<CommonView { ...tripsProps } />);
        expect(fetchTripInstances).toHaveBeenCalledWith({
            limit: 100,
            page: 1,
            routeShortName: 'WEST',
            routeVariantIds: [1],
            serviceDate: '20230411',
        }, { isUpdate: false });
    });

    it('should clear trip polling interval on unmount', () => {
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
        wrapper.instance().componentWillUnmount();
        expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    });

    it('should call fetchTripInstances when props change', () => {
        const spy = jest.spyOn(wrapper.instance(), 'fetchTripInstances');
        wrapper.setProps({ filters: { test: 'test' } });
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
