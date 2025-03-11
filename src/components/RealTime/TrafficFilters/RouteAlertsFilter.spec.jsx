import React from 'react';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import CustomizedSwitch from '../../Common/Switch/CustomizedSwitch';
import * as routeMonitoringApi from '../../../utils/transmitters/route-monitoring-api';
import RouteAlertsFilter, { restoreRouteAlertsStateFromUrl, updateUrlForRouteAlerts } from './RouteAlertsFilter';
import ACTION_TYPE from '../../../redux/action-types';

// Mock dependencies
jest.mock('../../Common/Switch/CustomizedSwitch', () => props => (
    <input
        type="checkbox"
        data-testid="mock-customized-switch"
        // eslint-disable-next-line react/prop-types
        checked={ props.checked }
        // eslint-disable-next-line react/prop-types
        onChange={ e => props.onChange(e.target.checked) }
    />
));

jest.mock('../../../utils/transmitters/route-monitoring-api', () => ({
    fetchRouteAlerts: jest.fn(() => Promise.resolve([
        { routeName: 'SH1', routeId: 1 },
        { routeName: 'Sh18', routeId: 2 },
    ])),
}));

const mockStore = configureStore([]);

describe('<RouteAlertsFilter />', () => {
    let store;

    // Utility for this test
    const renderRouteAlertsFilterWithStore = mockedStore => mount(
        <Provider store={ mockedStore }>
            <RouteAlertsFilter />
        </Provider>,
    );

    const createMockedStore = (overrides = {}) => {
        const initialState = {
            realtime: {
                layers: {
                    showRouteAlerts: false,
                    showAllRouteAlerts: false,
                    selectedRouteAlerts: [],
                    ...overrides,
                },
            },
        };
        return mockStore(initialState);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        store = createMockedStore();
    });

    // Unit tests
    it('should render without crashing', () => {
        const wrapper = renderRouteAlertsFilterWithStore(store);
        expect(wrapper.exists()).toBe(true);
    });

    it('should render the corridors switch with correct props', () => {
        const wrapper = renderRouteAlertsFilterWithStore(store);
        const switchComponent = wrapper.find(CustomizedSwitch).at(0); // First switch is for showRouteAlerts
        expect(switchComponent.prop('checked')).toBe(false);
    });

    it('should render search and show all switch when showRouteAlerts is true', () => {
        store = createMockedStore({ showRouteAlerts: true });
        const wrapper = renderRouteAlertsFilterWithStore(store);
        expect(wrapper.find('Search').length).toBe(1);
        expect(wrapper.find(CustomizedSwitch).at(1).length).toBe(1); // Second switch is for showAllRouteAlerts
    });

    it('should dispatch updateSelectedRouteAlerts when a route is selected', () => {
        store = createMockedStore({ showRouteAlerts: true });
        const wrapper = renderRouteAlertsFilterWithStore(store);
        const selectedRoute = { text: 'SH1', routeId: 1 };
        wrapper.find('Search').prop('onSelection')(selectedRoute);
        expect(store.getActions()).toEqual([{
            type: ACTION_TYPE.UPDATE_SELECTED_ROUTE_ALERTS,
            payload: { selectedRouteAlerts: [selectedRoute] },
        }]);
    });

    it('should dispatch updateSelectedRouteAlerts when a route is deselected', () => {
        store = createMockedStore({
            showRouteAlerts: true,
            selectedRouteAlerts: [{ text: 'SH1', routeId: 1 }],
        });
        const wrapper = renderRouteAlertsFilterWithStore(store);
        wrapper.find('Input').simulate('change');
        expect(store.getActions()).toEqual([{
            type: ACTION_TYPE.UPDATE_SELECTED_ROUTE_ALERTS,
            payload: { selectedRouteAlerts: [] },
        }]);
    });

    it('should call fetchRouteAlerts when showRouteAlerts is true', () => {
        store = createMockedStore({ showRouteAlerts: true });
        renderRouteAlertsFilterWithStore(store);
        expect(routeMonitoringApi.fetchRouteAlerts).toHaveBeenCalled();
    });
});

describe('restoreRouteAlertsStateFromUrl', () => {
    const testCases = [
        {
            description: 'should update showRouteAlerts when corridors is true',
            searchParams: new URLSearchParams('corridors=true'),
            expectedShowRouteAlertsDispatch: { showRouteAlerts: true },
            expectedShowAllRouteAlertsDispatch: null,
        },
        {
            description: 'should update showAllRouteAlerts when allCorridors is true',
            searchParams: new URLSearchParams('allCorridors=true'),
            expectedShowRouteAlertsDispatch: null,
            expectedShowAllRouteAlertsDispatch: { showAllRouteAlerts: true },
        },
        {
            description: 'should update both when both params are true',
            searchParams: new URLSearchParams('corridors=true&allCorridors=true'),
            expectedShowRouteAlertsDispatch: { showRouteAlerts: true },
            expectedShowAllRouteAlertsDispatch: { showAllRouteAlerts: true },
        },
        {
            description: 'should not update when params are missing or false',
            searchParams: new URLSearchParams('corridors=false'),
            expectedShowRouteAlertsDispatch: null,
            expectedShowAllRouteAlertsDispatch: null,
        },
    ];

    testCases.forEach(({ description, searchParams, expectedShowRouteAlertsDispatch, expectedShowAllRouteAlertsDispatch }) => {
        it(description, () => {
            const updateShowRouteAlertsDispatcher = jest.fn();
            const updateShowAllRouteAlertsDispatcher = jest.fn();

            restoreRouteAlertsStateFromUrl(searchParams, updateShowRouteAlertsDispatcher, updateShowAllRouteAlertsDispatcher);

            if (expectedShowRouteAlertsDispatch) {
                expect(updateShowRouteAlertsDispatcher).toHaveBeenCalledWith(expectedShowRouteAlertsDispatch);
            } else {
                expect(updateShowRouteAlertsDispatcher).not.toHaveBeenCalled();
            }

            if (expectedShowAllRouteAlertsDispatch) {
                expect(updateShowAllRouteAlertsDispatcher).toHaveBeenCalledWith(expectedShowAllRouteAlertsDispatch);
            } else {
                expect(updateShowAllRouteAlertsDispatcher).not.toHaveBeenCalled();
            }
        });
    });
});

describe('updateUrlForRouteAlerts', () => {
    const testCases = [
        {
            description: 'should update URL with corridors when showRouteAlerts is true',
            showRouteAlerts: true,
            showAllRouteAlerts: false,
            expectedUrl: 'corridors=true',
        },
        {
            description: 'should update URL with allCorridors when showAllRouteAlerts is true',
            showRouteAlerts: false,
            showAllRouteAlerts: true,
            expectedUrl: 'allCorridors=true',
        },
        {
            description: 'should update URL with both when both are true',
            showRouteAlerts: true,
            showAllRouteAlerts: true,
            expectedUrl: 'corridors=true&allCorridors=true',
        },
        {
            description: 'should not update URL when both are false',
            showRouteAlerts: false,
            showAllRouteAlerts: false,
            expectedUrl: '',
        },
    ];

    testCases.forEach(({ description, showRouteAlerts, showAllRouteAlerts, expectedUrl }) => {
        it(description, () => {
            const searchParams = new URLSearchParams();
            updateUrlForRouteAlerts(showRouteAlerts, showAllRouteAlerts, searchParams);
            expect(searchParams.toString()).toBe(expectedUrl);
        });
    });
});
