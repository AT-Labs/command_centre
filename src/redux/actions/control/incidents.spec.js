import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './incidents';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';
import * as ccStatic from '../../../utils/transmitters/cc-static';

import ACTION_TYPE from '../../action-types';
import ERROR_TYPE from '../../../types/error-types';
import { STATUSES } from '../../../types/disruptions-types';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../../utils/transmitters/disruption-mgt-api');
jest.mock('../../../utils/transmitters/cc-static');

describe('Incidents Actions', () => {
    let store;
    let dispatch;

    beforeEach(() => {
        store = mockStore({
            appSettings: {},
            control: {
                incidents: {
                    cachedStopsToRoutes: [
                        {
                            locationType: 0,
                            stopCode: '1599',
                            stopId: '1599-20180921103729_v70.37',
                            stopName: 'Westgate Stop B',
                        },
                    ],
                    cachedShapes: {},
                    cachedRoutesToStops: [
                        {
                            routeId: 'ROUTE123',
                            routeVariantName: 'Head Sign A',
                            shape_wkt: 'shape_wkt',
                            vehicles: [],
                        },
                        {
                            routeId: 'ROUTE123',
                            routeVariantName: 'Head Sign B',
                            shape_wkt: 'shape_wkt',
                            vehicles: [],
                        },
                    ],
                },
            },
            static: {
                routes: {},
                stops: {},
            },
        });
        dispatch = jest.fn();
        jest.clearAllMocks();
    });

    it('dispatches actions for getDisruptionsAndIncidents on success', async () => {
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [
                { disruptionId: 1, impact: 'Delay', affectedEntities: [], incidentId: 1 },
                { disruptionId: 2, impact: 'Detour', affectedEntities: [], incidentId: 2 },
            ],
            _links: { permissions: { view: true } },
        });

        await store.dispatch(actions.getDisruptionsAndIncidents());
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: 'update-control-set-all-incidents' }),
            expect.objectContaining({ type: 'update-control-incidents-permissions' }),
            expect.objectContaining({ type: 'fetch-control-incidents-disruptions' }),
            expect.objectContaining({ type: 'update-control-incidents-loading' }),
        ]));
    });

    it('dispatches setBannerError on getDisruptionsAndIncidents failure', async () => {
        disruptionsMgtApi.getDisruptions.mockRejectedValue(new Error('Fetch error'));
        ERROR_TYPE.fetchDisruptionsEnabled = true;

        await store.dispatch(actions.getDisruptionsAndIncidents());
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: 'update-control-incidents-loading' }),
        ]));
    });

    it('dispatches correct actions on updateIncident success', async () => {
        disruptionsMgtApi.updateDisruption.mockResolvedValue({});

        const incident = { disruptionId: 1, incidentNo: 'INC123', status: STATUSES.ACTIVE, createNotification: true };
        await store.dispatch(actions.updateIncident(incident));
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            { type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING, payload: { isRequesting: true, resultIncidentId: 1 } },
            { type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_RESULT, payload: expect.anything() },
            { type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING, payload: { isRequesting: false, resultIncidentId: 1 } },
        ]));
    });

    it('dispatches correct actions on createIncident success', async () => {
        disruptionsMgtApi.createDisruption.mockResolvedValue({
            disruptionId: 99,
            incidentNo: 'NEW123',
            version: 1,
            createNotification: true,
        });

        await store.dispatch(actions.createIncident({ status: STATUSES.ACTIVE }));
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            {
                type: 'update-control-incident-action-requesting',
                payload: {
                    isRequesting: true,
                    resultIncidentId: undefined,
                },
            },
            {
                type: 'update-control-incident-action-result',
                payload: {
                    resultIncidentId: 99,
                    resultStatus: 'success',
                    resultMessage: 'Disruption number #NEW123 created successfully.',
                    resultCreateNotification: true,
                    resultIncidentVersion: undefined,
                },
            },
            {
                type: 'set-modal-status',
                payload: {
                    isOpen: true,
                },
            },
            {
                type: 'update-control-incident-action-requesting',
                payload: {
                    isRequesting: false,
                    resultIncidentId: undefined,
                },
            },
            {
                type: 'update-incident-affected-entities',
                payload: {
                    affectedRoutes: [
                    ],
                },
            },
            {
                type: 'set-modal-error',
                payload: {
                    error: 'Unable to load disruptions, please try again',
                },
            },
            {
                type: 'update-control-incidents-loading',
                payload: {
                    isLoading: false,
                },
            },
        ]));
    });

    it('calls updateIncident inside publishDraftIncident and dispatches actions', async () => {
        disruptionsMgtApi.updateDisruption.mockResolvedValue({});

        const incident = {
            disruptionId: 3,
            incidentNo: 'INC789',
            status: STATUSES.DRAFT,
            createNotification: true,
        };

        const result = await store.dispatch(actions.publishDraftIncident(incident));
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING }),
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_RESULT }),
        ]));
        expect(result).toEqual({});
    });

    it('dispatches actions for getStopsByRoute when data is fetched', async () => {
        const mockStops = [
            { stopId: 'STOP1', stopName: 'Main St', routeId: 'ROUTE123' },
            { stopId: 'STOP2', stopName: 'Second Ave' },
        ];
        ccStatic.getStopsByRoute.mockResolvedValue(mockStops);

        const routes = [
            {
                routeId: 'ROUTE123',
                routeVariantName: 'Head Sign A',
                shape_wkt: 'shape_wkt',
                vehicles: [],
            },
            {
                routeId: 'ROUTE123',
                routeVariantName: 'Head Sign B',
                shape_wkt: 'shape_wkt',
                vehicles: [],
            },
        ];
        await store.dispatch(actions.getStopsByRoute(routes));

        expect(ccStatic.getStopsByRoute).toHaveBeenCalledWith(routes[0].routeId);
        const dispatched = store.getActions();
        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: 'update-control-incidents-loading-stops-by-route' }),
        ]));
    });

    it('dispatches actions for getRoutesByStop when data is fetched', async () => {
        const mockRoutes = [
            { routeId: 'ROUTE1', routeName: 'Route 1' },
            { routeId: 'ROUTE2', routeName: 'Route 2' },
        ];
        ccStatic.getRoutesByStop.mockResolvedValue(mockRoutes);

        const stops = [
            {
                locationType: 0,
                stopCode: '1599',
                stopId: '1599-20180921103729_v70.37',
                stopName: 'Westgate Stop B',
            },
        ];
        await store.dispatch(actions.getRoutesByStop(stops));

        expect(ccStatic.getRoutesByStop).toHaveBeenCalledWith(stops[0].stopCode);
        const dispatched = store.getActions();
        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: 'update-control-incidents-loading-routes-by-stop' }),
        ]));
    });

    it('should create an action with stopsByRoute and default isLoadingStopsByRoute=false', () => {
        const stopsByRoute = { route1: ['stop1', 'stop2'] };
        const expectedAction = {
            type: ACTION_TYPE.UPDATE_INCIDENT_STOPS_BY_ROUTE,
            payload: {
                stopsByRoute,
                isLoadingStopsByRoute: false,
            },
        };

        expect(actions.updateStopsByRoute(stopsByRoute)).toEqual(expectedAction);
    });

    it('should create an action with stopsByRoute and isLoadingStopsByRoute=true', () => {
        const stopsByRoute = { route2: ['stop3'] };
        const expectedAction = {
            type: ACTION_TYPE.UPDATE_INCIDENT_STOPS_BY_ROUTE,
            payload: {
                stopsByRoute,
                isLoadingStopsByRoute: true,
            },
        };

        expect(actions.updateStopsByRoute(stopsByRoute, true)).toEqual(expectedAction);
    });

    it('should create an action with routesByStop and default isLoadingRoutesByStop=false', () => {
        const routesByStop = { stop1: ['route1', 'route2'] };
        const expectedAction = {
            type: ACTION_TYPE.UPDATE_INCIDENT_ROUTES_BY_STOP,
            payload: {
                routesByStop,
                isLoadingRoutesByStop: false,
            },
        };

        expect(actions.updateRoutesByStop(routesByStop)).toEqual(expectedAction);
    });

    it('should create an action with routesByStop and isLoadingRoutesByStop=true', () => {
        const routesByStop = { stop2: ['route3'] };
        const expectedAction = {
            type: ACTION_TYPE.UPDATE_INCIDENT_ROUTES_BY_STOP,
            payload: {
                routesByStop,
                isLoadingRoutesByStop: true,
            },
        };

        expect(actions.updateRoutesByStop(routesByStop, true)).toEqual(expectedAction);
    });

    test('openCreateIncident dispatches updateOpenCreateIncident', () => {
        const isEnabled = true;
        actions.openCreateIncident(isEnabled)(dispatch);

        expect(dispatch).toHaveBeenCalledWith({
            payload: {
                isCreateEnabled: isEnabled,
            },
            type: ACTION_TYPE.OPEN_CREATE_INCIDENTS,
        });
    });

    test('openCreateDiversion dispatches correct action', () => {
        const isEnabled = true;
        actions.openCreateDiversion(isEnabled)(dispatch);

        expect(dispatch).toHaveBeenCalledWith({
            payload: {
                isCreateDiversionEnabled: isEnabled,
            },
            type: 'open-create-diversion',
        });
    });

    test('resetState returns correct action', () => {
        expect(actions.resetState()).toEqual({
            type: ACTION_TYPE.RESET_INCIDENT_STATE,
        });
    });

    test('deleteAffectedEntities dispatches correct action', () => {
        actions.deleteAffectedEntities()(dispatch);

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTION_TYPE.DELETE_INCIDENT_AFFECTED_ENTITIES,
            payload: {
                activeStep: 2,
                showSelectedRoutes: false,
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
                stopsByRoute: {},
                routesByStop: {},
            },
        });
    });

    it('dispatches updateIncidentsPermissionsAction with the correct payload', () => {
        const mockPermissions = { canEdit: true };

        const mockAction = {
            type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_PERMISSIONS,
            payload: {
                permissions: mockPermissions,
            },
        };

        actions.updateIncidentsPermissions(mockPermissions)(dispatch);

        expect(dispatch).toHaveBeenCalledWith(mockAction);
    });

    it('dispatches copyIncidentToClipboard with the correct payload', async () => {
        const isCopied = true;
        const mockAction = {
            type: ACTION_TYPE.COPY_INCIDENT,
            payload: { isCopied },
        };

        await actions.updateCopyDisruptionState(isCopied)(dispatch);

        expect(dispatch).toHaveBeenCalledWith(mockAction);
    });
});
