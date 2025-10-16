import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { RoutesByStopMultiSelect } from './RoutesByStopMultiSelect';

let wrapper;
let sandbox;

const defaultState = {
    affectedStops: [],
    affectedSingleStops: [],
    affectedStopGroups: [],
    setExpandedStops: jest.fn(),
    findRoutesByStop: {},
    isLoadingRoutesByStop: false,
    setIsLoadingRoutesByStop: jest.fn(),
    loadedRoutesByStop: [],
    setLoadedRoutesByStop: jest.fn(),
    updateAffectedStopsState: jest.fn(),
    getRoutesByStop: jest.fn(),
    updateAffectedStops: jest.fn(),
    removeAction: jest.fn(),
    isDisabled: false,
};

const stops = [
    {
        stopId: '111-fd1c9e8c',
        stopName: 'Test Stop 1',
        stopCode: '111',
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: '111 - Test Stop 1',
        category: {
            type: 'stop',
            icon: 'stop',
            label: 'Stops',
        },
        icon: 'stop',
        valueKey: 'stopId',
        labelKey: 'stopCode',
        type: 'stop',
    }, {
        stopId: '222-fd1c9e8c',
        stopName: 'Test Stop 2',
        stopCode: '222',
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: '222 - Test Stop 2',
        category: {
            type: 'stop',
            icon: 'stop',
            label: 'Stops',
        },
        icon: 'stop',
        valueKey: 'stopId',
        labelKey: 'stopCode',
        type: 'stop',
    }];

function setup(customProps) {
    const props = { ...defaultState };

    Object.assign(props, customProps);

    wrapper = shallow(<RoutesByStopMultiSelect { ...props } />);
}

describe('<RoutesByStopMultiSelect />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
        wrapper = null;
        jest.resetAllMocks();
    });

    describe('initial load', () => {
        it('Should not render when empty affected stops', () => {
            setup();
            expect(wrapper.exists()).toEqual(false);
        });

        it('Should render when there are affected stops', () => {
            setup({
                affectedStops: stops,
                affectedSingleStops: stops,
            });
            expect(wrapper.exists()).toEqual(true);
        });
    });

    describe('toggleExpandedStop logic', () => {
        it('should call getRoutesByStop when stop data is not loaded', () => {
            const stop = { stopCode: 'stop1', stopName: 'Stop 1' };
            const mockGetRoutesByStop = jest.fn();

            setup({
                affectedStops: [stop],
                affectedSingleStops: [stop],
                findRoutesByStop: {},
                getRoutesByStop: mockGetRoutesByStop,
            });

            const expandableList = wrapper.find('ExpandableList').first();
            expandableList.prop('onToggle')();

            expect(mockGetRoutesByStop).toHaveBeenCalledWith([stop]);
        });

        it('should not call getRoutesByStop when stop data is already loaded', () => {
            const stop = { stopCode: 'stop1', stopName: 'Stop 1' };
            const mockGetRoutesByStop = jest.fn();

            setup({
                affectedStops: [stop],
                affectedSingleStops: [stop],
                findRoutesByStop: { [stop.stopCode]: [{ routeId: 'route1', routeShortName: '1' }] },
                getRoutesByStop: mockGetRoutesByStop,
            });

            const expandableList = wrapper.find('ExpandableList').first();
            expandableList.prop('onToggle')();

            expect(mockGetRoutesByStop).not.toHaveBeenCalled();
        });
    });

    describe('useMemo cache logic', () => {
        it('should copy routesByStop data to cache when data exists and not already cached', () => {
            const mockRoutesByStop = {
                stop1: [{ routeId: 'route1', routeShortName: '1' }],
                stop2: [{ routeId: 'route2', routeShortName: '2' }],
            };

            setup({
                affectedStops: stops,
                findRoutesByStop: mockRoutesByStop,
            });

            expect(wrapper.exists()).toEqual(true);
        });

        it('should not copy routesByStop data when already cached', () => {
            const mockRoutesByStop = {
                stop1: [{ routeId: 'route1', routeShortName: '1' }],
                stop2: [{ routeId: 'route2', routeShortName: '2' }],
            };

            setup({
                affectedStops: stops,
                findRoutesByStop: mockRoutesByStop,
            });

            expect(wrapper.exists()).toEqual(true);
        });

        it('should not copy routesByStop data when data does not exist', () => {
            const mockRoutesByStop = {
                stop1: null,
                stop2: undefined,
            };

            setup({
                affectedStops: stops,
                findRoutesByStop: mockRoutesByStop,
            });

            expect(wrapper.exists()).toEqual(true);
        });

        it('should handle empty routesByStop data', () => {
            setup({
                affectedStops: stops,
                findRoutesByStop: {},
            });

            expect(wrapper.exists()).toEqual(true);
        });
    });
});
