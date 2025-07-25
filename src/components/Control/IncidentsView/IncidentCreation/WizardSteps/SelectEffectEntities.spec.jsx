/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { SelectEffectEntities } from './SelectEffectEntities';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';

const mockStore = configureStore([thunk]);

const mockStopDate = {
    directionId: 0,
    parentStationStopCode: '127',
    parentStationStopId: '127-2affe079',
    parentStationStopLat: -36.86618,
    parentStationStopLon: 174.5763,
    parentStationStopName: 'Swanson Train Station',
    stopCode: '9328',
    stopId: '9328-f6f84eac',
    stopLat: -36.86618,
    stopLon: 174.5763,
    stopName: 'Swanson Train Station 1',
    stopSequence: 1,
};
jest.mock('../../../../../redux/actions/control/incidents', () => ({
    getStopsByRoute: jest.fn(() => async (dispatch) => {
        dispatch(mockStopDate);
    }),
}));

const mockAffectedEntities = {
    affectedRoutes: [{
        category: { type: 'route', icon: '', label: 'Routes' },
        labelKey: 'routeShortName',
        routeId: 'WEST-201',
        routeShortName: 'WEST',
        routeType: 2,
        text: 'WEST',
        type: 'route',
        valueKey: 'routeId',
    }, {
        category: { type: 'route', icon: '', label: 'Routes' },
        labelKey: 'routeShortName',
        routeId: 'EAST-201',
        routeShortName: 'EAST',
        routeType: 2,
        text: 'EAST',
        type: 'route',
        valueKey: 'routeId',
    }],
    affectedStops: [],
};

describe('SelectEffectEntities Component', () => {
    let store;

    const defaultProps = {
        getRoutesByShortName: jest.fn(),
        isLoadingStopsByRoute: false,
        isLoadingRoutesByStop: false,
        isEditMode: false,
        search: jest.fn(),
        searchResults: {},
        stops: {},
        stopGroups: {},
        data: { disruptionType: 'Routes' },
        affectedEntities: {
            affectedRoutes: [],
            affectedStops: [],
        },
        onAffectedEntitiesUpdate: jest.fn(),
        disruptionType: 'Routes',
        disruptionKey: 'DISR123',
        resetAffectedEntities: jest.fn(),
        onDisruptionTypeUpdate: jest.fn(),
    };

    beforeEach(() => {
        store = mockStore({
            control:
                {
                    incidents: {
                        incidents: {},
                        disruptions: [],
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                        isLoading: false,
                        stopsByRoute: {},
                        routesByStop: {},
                        isCreateEnabled: false,
                        isLoadingStopsByRoute: false,
                        isLoadingRoutesByStop: false,
                        cachedRoutesToStops: {},
                        cachedStopsToRoutes: {},
                    },
                },
            appSettings: {
                useViewDisruptionDetailsPage: true,
            },
            search: {
                isLoading: false,
                isFocus: false,
                searchTerms: '',
                results: {
                    [SEARCH_RESULT_TYPE.ADDRESS.type]: [],
                    [SEARCH_RESULT_TYPE.ROUTE.type]: [],
                    [SEARCH_RESULT_TYPE.STOP.type]: [],
                    [SEARCH_RESULT_TYPE.BUS.type]: [],
                    [SEARCH_RESULT_TYPE.TRAIN.type]: [],
                    [SEARCH_RESULT_TYPE.FERRY.type]: [],
                    [SEARCH_RESULT_TYPE.BLOCK.type]: [],
                    [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: [],
                    [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: [],
                    [SEARCH_RESULT_TYPE.CONTROL_ALERTS_ROUTES.type]: [],
                    [SEARCH_RESULT_TYPE.STOP_GROUP.type]: [],
                    [SEARCH_RESULT_TYPE.STOP_GROUP_MERGED.type]: [],
                    [SEARCH_RESULT_TYPE.STOP_MESSAGE.type]: [],
                    [SEARCH_RESULT_TYPE.STOP_DISRUPTION.type]: [],
                    [SEARCH_RESULT_TYPE.STOP_IN_GROUP.type]: [],
                },
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Renders without crashing and displays empty pick-list', () => {
        render(
            <Provider store={ store }>
                <SelectEffectEntities { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Search routes or draw in the map')).toBeInTheDocument();
        expect(screen.getByText('Enter a route')).toBeInTheDocument();
    });

    it('Renders the correct number of rows based on incidents prop', async () => {
        const propsWithAffectedEntities = { ...defaultProps, affectedEntities: mockAffectedEntities };
        const { container } = render(
            <Provider store={ store }>
                <SelectEffectEntities { ...propsWithAffectedEntities } />
            </Provider>,
        );
        const rows = container.querySelectorAll('.selection-item');
        expect(rows.length).toBe(mockAffectedEntities.affectedRoutes.length + mockAffectedEntities.affectedStops.length);
    });

    it('Renders the correct default checkbox status', async () => {
        const { container } = render(
            <Provider store={ store }>
                <SelectEffectEntities { ...defaultProps } />
            </Provider>,
        );
        const radiOButtons = container.querySelectorAll('.form-check-input');
        expect(radiOButtons.length).toBe(2);
        expect(radiOButtons[0].checked).toBe(true);
        expect(radiOButtons[1].checked).toBe(false);
    });

    it('Should open modal on changing disruption type when within affecterEntities', async () => {
        const propsWithAffectedEntities = { ...defaultProps, affectedEntities: mockAffectedEntities };
        const { container } = render(
            <Provider store={ store }>
                <SelectEffectEntities { ...propsWithAffectedEntities } />
            </Provider>,
        );
        const rows = container.querySelectorAll('.selection-item');
        expect(rows.length).toBe(mockAffectedEntities.affectedRoutes.length + mockAffectedEntities.affectedStops.length);
        const radiOButtons = container.querySelectorAll('.form-check-input');
        expect(radiOButtons.length).toBe(2);
        expect(radiOButtons[0].checked).toBe(true);
        expect(radiOButtons[1].checked).toBe(false);
        fireEvent.click(radiOButtons[1]);
        expect(screen.getByText('By making this change, all routes and stops will be removed. Do you wish to continue?')).toBeInTheDocument();
        const acceptModalButton = screen.getByRole('button', { name: /change disruption type/i });
        expect(acceptModalButton).toBeInTheDocument();
        fireEvent.click(acceptModalButton);
    });
});
