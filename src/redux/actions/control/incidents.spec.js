import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from './incidents';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import EDIT_TYPE from '../../../types/edit-types';
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
        disruptionsMgtApi.updateIncident.mockResolvedValue({});

        const incident = { incidentId: 1, header: 'INC123', status: STATUSES.ACTIVE, createNotification: true };
        await store.dispatch(actions.updateIncident(incident));
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            { type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING, payload: { isRequesting: true, resultIncidentId: 1 } },
            { type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_RESULT, payload: expect.anything() },
            { type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING, payload: { isRequesting: false, resultIncidentId: 1 } },
        ]));
    });

    it('dispatches correct actions on updateIncident success with DRAFT status', async () => {
        disruptionsMgtApi.updateIncident.mockResolvedValue({});

        const incident = {
            incidentId: 1,
            status: STATUSES.DRAFT,
            createNotification: false,
            header: 'Draft Incident',
            cause: 'Testing',
        };

        await store.dispatch(actions.updateIncident(incident));
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            {
                type: 'update-control-incident-action-requesting',
                payload: {
                    isRequesting: true,
                    resultIncidentId: 1,
                },
            },
            {
                type: 'update-control-incident-action-result',
                payload: {
                    resultIncidentId: 1,
                    resultStatus: 'success',
                    resultMessage: 'Draft disruption number #1 saved successfully.',
                    resultCreateNotification: false,
                    resultIncidentVersion: undefined,
                },
            },
        ]));
    });

    it('dispatches correct actions on updateIncident failure', async () => {
        disruptionsMgtApi.updateIncident.mockRejectedValue({ code: 'ERR_FAILED' });

        const incident = {
            incidentId: 1,
            header: 'INC456',
            status: STATUSES.PUBLISHED,
            createNotification: true,
        };

        await store.dispatch(actions.updateIncident(incident));
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            {
                payload: { isRequesting: true, resultIncidentId: 1 },
                type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING,
            },
            {
                type: 'update-control-incident-action-result',
                payload: {
                    resultIncidentId: 1,
                    resultStatus: 'danger',
                    resultMessage: 'Failed to update disruption 1.',
                    resultCreateNotification: undefined,
                    resultIncidentVersion: undefined,
                },
            },
        ]));
    });

    it('dispatches correct actions on createIncident success', async () => {
        disruptionsMgtApi.createIncident.mockResolvedValue({
            incidentId: 99,
            header: 'NEW123',
            version: 1,
            createNotification: true,
        });

        await store.dispatch(actions.createNewIncident({ status: STATUSES.ACTIVE }));
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
                    resultMessage: 'Disruption number #99 created successfully.',
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

    it('merges affectedEntities when disruptions share the same incidentId', async () => {
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [
                { disruptionId: 1, impact: 'Delay', affectedEntities: ['E1'], incidentId: 5 },
                { disruptionId: 2, impact: 'Delay', affectedEntities: ['E2'], incidentId: 5 },
            ],
            _links: { permissions: {} },
        });

        await store.dispatch(actions.getDisruptionsAndIncidents());

        const dispatched = store.getActions();
        const merged = dispatched.find(a => a.type === 'update-control-set-all-incidents').payload.allIncidents[0];

        expect(merged.incidentId).toBe(5);
        expect(merged.affectedEntities).toEqual(expect.arrayContaining(['E1', 'E2']));
    });

    it('merges impact values uniquely when disruptions share the same incidentId', async () => {
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [
                { disruptionId: 1, impact: 'Delay', affectedEntities: [], incidentId: 10 },
                { disruptionId: 2, impact: 'Detour', affectedEntities: [], incidentId: 10 },
                { disruptionId: 3, impact: 'Delay', affectedEntities: [], incidentId: 10 },
            ],
            _links: { permissions: {} },
        });

        await store.dispatch(actions.getDisruptionsAndIncidents());

        const dispatched = store.getActions();
        const merged = dispatched.find(a => a.type === 'update-control-set-all-incidents').payload.allIncidents[0];

        const impactSet = new Set(merged.impact.split(',').map(i => i.trim()));
        expect(impactSet).toEqual(new Set(['Delay', 'Detour']));
    });

    it('trims and merges impact strings correctly', async () => {
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [
                { disruptionId: 1, impact: ' Delay , Closure ', affectedEntities: [], incidentId: 20 },
                { disruptionId: 2, impact: 'Detour', affectedEntities: [], incidentId: 20 },
            ],
            _links: { permissions: {} },
        });

        await store.dispatch(actions.getDisruptionsAndIncidents());

        const dispatched = store.getActions();
        const merged = dispatched.find(a => a.type === 'update-control-set-all-incidents').payload.allIncidents[0];

        const impactSet = new Set(merged.impact.split(',').map(i => i.trim()));
        expect(impactSet).toEqual(new Set(['Delay', 'Closure', 'Detour']));
    });

    it('calls updateIncident inside publishDraftIncident and dispatches actions', async () => {
        disruptionsMgtApi.updateIncident.mockResolvedValue({});

        const incident = {
            incidentId: 3,
            header: 'INC789',
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

    it('dispatches error result when updateIncident throws inside publishDraftIncident', async () => {
        disruptionsMgtApi.updateIncident.mockRejectedValue({ code: 'ERR_CODE_XYZ' });

        const incident = {
            incidentId: 5,
            header: 'INC999',
            status: STATUSES.DRAFT,
            createNotification: true,
        };

        await store.dispatch(actions.publishDraftIncident(incident));
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            {
                payload: {
                    isRequesting: true,
                    resultIncidentId: 5,
                },
                type: 'update-control-incident-action-requesting',
            },
            {
                payload: {
                    resultCreateNotification: undefined,
                    resultIncidentId: 5,
                    resultIncidentVersion: undefined,
                    resultMessage: 'Failed to publish draft disruption',
                    resultStatus: 'danger',
                },
                type: 'update-control-incident-action-result',
            },
            {
                payload: {
                    isRequesting: false,
                    resultIncidentId: 5,
                },
                type: 'update-control-incident-action-requesting',
            },
            {
                payload: {
                    allIncidents: [
                        {
                            affectedEntities: [],
                            disruptionId: 1,
                            impact: 'Delay, Closure, Detour',
                            incidentId: 20,
                        },
                    ],
                },
                type: 'update-control-set-all-incidents',
            },
            {
                payload: {
                    permissions: {},
                },
                type: 'update-control-incidents-permissions',
            },
            {
                payload: {
                    disruptions: [
                        {
                            affectedEntities: [],
                            disruptionId: 1,
                            impact: ' Delay , Closure ',
                            incidentId: 20,
                        },
                        {
                            affectedEntities: [],
                            disruptionId: 2,
                            impact: 'Detour',
                            incidentId: 20,
                        },
                    ],
                },
                type: 'fetch-control-incidents-disruptions',
            },
            {
                payload: {
                    isLoading: false,
                },
                type: 'update-control-incidents-loading',
            },
        ]));
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

    it('dispatches COPY_SUCCESS result when in COPY mode', async () => {
        const mockIncident = { disruptionId: 1, status: 'DRAFT' };

        disruptionsMgtApi.createIncident.mockResolvedValue({
            incidentId: 1,
            header: 'INC111',
            version: 2,
            createNotification: true,
        });

        const state = {
            control: {
                incidents: {
                    editMode: EDIT_TYPE.COPY,
                    sourceIncidentId: 'INC_SOURCE',
                },
            },
        };

        store = mockStore(state);
        await store.dispatch(actions.createNewIncident(mockIncident));
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            {
                payload: {
                    isRequesting: true,
                    resultIncidentId: undefined,
                },
                type: 'update-control-incident-action-requesting',
            },
            {
                payload: {
                    resultCreateNotification: true,
                    resultIncidentId: 1,
                    resultIncidentVersion: undefined,
                    resultMessage: 'Disruption #1 copied from #INC_SOURCE',
                    resultStatus: 'success',
                },
                type: 'update-control-incident-action-result',
            },
            {
                payload: {
                    isOpen: true,
                },
                type: 'set-modal-status',
            },
            {
                payload: {
                    isRequesting: false,
                    resultIncidentId: undefined,
                },
                type: 'update-control-incident-action-requesting',
            },
            {
                payload: {
                    affectedRoutes: [],
                },
                type: 'update-incident-affected-entities',
            },
            {
                payload: {
                    allIncidents: [
                        {
                            affectedEntities: [],
                            disruptionId: 1,
                            impact: 'Delay, Closure, Detour',
                            incidentId: 20,
                        },
                    ],
                },
                type: 'update-control-set-all-incidents',
            },
            {
                payload: {
                    permissions: {},
                },
                type: 'update-control-incidents-permissions',
            },
            {
                payload: {
                    disruptions: [
                        {
                            affectedEntities: [],
                            disruptionId: 1,
                            impact: ' Delay , Closure ',
                            incidentId: 20,
                        },
                        {
                            affectedEntities: [],
                            disruptionId: 2,
                            impact: 'Detour',
                            incidentId: 20,
                        },
                    ],
                },
                type: 'fetch-control-incidents-disruptions',
            },
            {
                payload: {
                    isLoading: false,
                },
                type: 'update-control-incidents-loading',
            },
        ]));
    });

    it('dispatches CREATE_ERROR result when createDisruption throws', async () => {
        const mockIncident = { disruptionId: 3, status: 'DRAFT' };
        disruptionsMgtApi.createIncident.mockRejectedValue({ code: 'ERR_CREATE' });

        store = mockStore({
            control: {
                incidents: {
                    editMode: EDIT_TYPE.NEW,
                    sourceIncidentId: null,
                },
            },
        });

        await store.dispatch(actions.createNewIncident(mockIncident));
        const dispatched = store.getActions();

        expect(dispatched).toEqual(expect.arrayContaining([
            {
                payload: {
                    isRequesting: true,
                    resultIncidentId: undefined,
                },
                type: 'update-control-incident-action-requesting',
            },
            {
                payload: {
                    resultCreateNotification: undefined,
                    resultIncidentId: null,
                    resultIncidentVersion: undefined,
                    resultMessage: 'Failed to create disruption',
                    resultStatus: 'danger',
                },
                type: 'update-control-incident-action-result',
            },
            {
                payload: {
                    isOpen: true,
                },
                type: 'set-modal-status',
            },
            {
                payload: {
                    isRequesting: false,
                    resultIncidentId: undefined,
                },
                type: 'update-control-incident-action-requesting',
            },
            {
                payload: {
                    affectedRoutes: [],
                },
                type: 'update-incident-affected-entities',
            },
            {
                payload: {
                    allIncidents: [
                        {
                            affectedEntities: [],
                            disruptionId: 1,
                            impact: 'Delay, Closure, Detour',
                            incidentId: 20,
                        },
                    ],
                },
                type: 'update-control-set-all-incidents',
            },
            {
                payload: {
                    permissions: {},
                },
                type: 'update-control-incidents-permissions',
            },
            {
                payload: {
                    disruptions: [
                        {
                            affectedEntities: [],
                            disruptionId: 1,
                            impact: ' Delay , Closure ',
                            incidentId: 20,
                        },
                        {
                            affectedEntities: [],
                            disruptionId: 2,
                            impact: 'Detour',
                            incidentId: 20,
                        },
                    ],
                },
                type: 'fetch-control-incidents-disruptions',
            },
            {
                payload: {
                    isLoading: false,
                },
                type: 'update-control-incidents-loading',
            },
        ]));
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

    it('dispatches UPDATE_CONTROL_ACTIVE_INCIDENT_ID and clearIncidentActionResult', () => {
        const incidentId = 'incident-123';

        actions.updateActiveIncidentId(incidentId)(dispatch);

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_INCIDENT_ID,
            payload: { activeIncidentId: incidentId },
        });

        expect(dispatch).toHaveBeenCalledWith({
            payload: {
                incidentId: null,
                resultIncidentVersion: null,
                resultMessage: null,
                resultStatus: null,
            },
            type: 'update-control-incident-action-result',
        });
    });
});
