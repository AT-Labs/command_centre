import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { StopsByRouteMultiSelect } from './StopsByRouteMultiSelect';

let wrapper;
let sandbox;

const defaultState = {
    affectedRoutes: [],
    setExpandedRoutes: jest.fn(),
    setExpandedRouteDirections: jest.fn(),
    findStopsByRoute: {},
    isLoadingStopsByRoute: false,
    setIsLoadingStopsByRoute: jest.fn(),
    loadedStopsByRoute: [],
    setLoadedStopsByRoute: jest.fn(),
    updateAffectedRoutesState: jest.fn(),
};

const routes = [{
    routeId: 'INN-202',
    routeShortName: 'INN',
    routeType: 3,
    type: 'route',
}, {
    routeId: 'OUT-202',
    routeShortName: 'OUT',
    routeType: 3,
    type: 'route',
}];

function setup(customProps) {
    const props = { ...defaultState };

    Object.assign(props, customProps);

    wrapper = shallow(<StopsByRouteMultiSelect { ...props } />);
}

describe('<StopsByRouteMultiSelect />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
        wrapper = null;
        jest.resetAllMocks();
    });

    describe('initial load', () => {
        it('Should not render when empty affected routes', () => {
            setup();
            expect(wrapper.exists()).toEqual(false);
        });

        it('Should render when there are affected routes', () => {
            setup({ affectedRoutes: routes });
            expect(wrapper.exists()).toEqual(true);
        });
    });

    describe('toggleExpandedRoute logic', () => {
        it('should expand route when toggled', () => {
            const route = { routeId: 'route1', routeShortName: '1' };

            setup({
                affectedRoutes: [route],
                findStopsByRoute: {},
            });

            const expandableList = wrapper.find('ExpandableList').first();
            expect(expandableList.prop('isActive')).toBe(false);

            expandableList.prop('onToggle')();

            wrapper.update();
            const updatedExpandableList = wrapper.find('ExpandableList').first();
            expect(updatedExpandableList.prop('isActive')).toBe(true);
        });

        it('should show loader when route data is not loaded', () => {
            const route = { routeId: 'route1', routeShortName: '1' };

            setup({
                affectedRoutes: [route],
                findStopsByRoute: {},
            });

            const expandableList = wrapper.find('ExpandableList').first();
            expandableList.prop('onToggle')();

            wrapper.update();
            const loader = wrapper.find('Loader');
            expect(loader.exists()).toBe(true);
        });

        it('should show stops when route data is loaded', () => {
            const route = { routeId: 'route1', routeShortName: '1' };

            setup({
                affectedRoutes: [route],
                findStopsByRoute: { [route.routeId]: [{ stopId: 'stop1', stopName: 'Stop 1' }] },
            });

            const expandableList = wrapper.find('ExpandableList').first();
            expandableList.prop('onToggle')();

            wrapper.update();
            const loader = wrapper.find('Loader');
            expect(loader.exists()).toBe(false);
        });
    });
});
