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
});
