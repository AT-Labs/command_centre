import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../path/to/incidents-actions';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';
import ACTION_TYPE from '../../action-types';
import ERROR_TYPE from '../../../types/error-types';
import { STATUSES } from '../../../types/disruptions-types';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../../utils/transmitters/disruption-mgt-api');
jest.mock('../../../utils/transmitters/cc-static');

describe('Incidents Actions', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            appSettings: {},
            control: {
                incidents: {
                    cachedRoutesToStops: {},
                    cachedStopsToRoutes: {},
                    cachedShapes: {},
                },
            },
            static: {
                routes: {},
                stops: {},
            },
        });
        jest.clearAllMocks();
    });

    it('should dispatch actions for getDisruptionsAndIncidents on success', async () => {
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
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_SET_ALL_INCIDENTS }),
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_PERMISSIONS }),
            expect.objectContaining({ type: ACTION_TYPE.FETCH_CONTROL_INCIDENTS_DISRUPTIONS }),
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_LOADING }),
        ]));
    });

    it('should dispatch setBannerError on getDisruptionsAndIncidents failure', async () => {
        disruptionsMgtApi.getDisruptions.mockRejectedValue(new Error('Fetch error'));
        ERROR_TYPE.fetchDisruptionsEnabled = true;

        await store.dispatch(actions.getDisruptionsAndIncidents());

        const dispatched = store.getActions();
        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: ACTION_TYPE.SET_BANNER_ERROR }),
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_LOADING }),
        ]));
    });

    it('should dispatch correct actions on updateIncident success', async () => {
        disruptionsMgtApi.updateDisruption.mockResolvedValue({});

        const incident = { disruptionId: 1, incidentNo: 'INC123', status: STATUSES.ACTIVE, createNotification: true };
        await store.dispatch(actions.updateIncident(incident));

        const dispatched = store.getActions();
        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING, payload: { isRequesting: true, resultIncidentId: 1 } }),
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_RESULT }),
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING, payload: { isRequesting: false, resultIncidentId: 1 } }),
        ]));
    });

    it('should dispatch correct actions on createIncident success', async () => {
        disruptionsMgtApi.createDisruption.mockResolvedValue({
            disruptionId: 99,
            incidentNo: 'NEW123',
            version: 1,
            createNotification: true,
        });

        const incident = { status: STATUSES.ACTIVE };
        await store.dispatch(actions.createIncident(incident));

        const dispatched = store.getActions();
        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING }),
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_RESULT }),
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_MODAL_STATUS }),
        ]));
    });

    it('should call updateIncident inside publishDraftIncident and dispatch appropriate actions', async () => {
        const incident = {
            disruptionId: 3,
            incidentNo: 'INC789',
            status: STATUSES.DRAFT,
            createNotification: true,
        };
    
        disruptionsMgtApi.updateDisruption.mockResolvedValue({});
    
        const result = await store.dispatch(actions.publishDraftIncident(incident));
        const dispatched = store.getActions();
    
        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING }),
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_RESULT }),
        ]));
        expect(result).toEqual(undefined);
    });

    it('should dispatch actions for getStopsByRoute when data is fetched successfully', async () => {
        ccStatic.getStopsByRoute.mockResolvedValue([
            { stop_id: 'STOP1', stop_name: 'Main St' },
            { stop_id: 'STOP2', stop_name: 'Second Ave' },
        ]);
    
        const routeId = 'ROUTE123';
        await store.dispatch(actions.getStopsByRoute(routeId));
    
        const dispatched = store.getActions();
        expect(ccStatic.getStopsByRoute).toHaveBeenCalledWith(routeId);
        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_CACHED_ROUTE_TO_STOPS }),
        ]));
    });
    
    it('should dispatch actions for getRoutesByStop when data is fetched successfully', async () => {
        ccStatic.getRoutesByStop.mockResolvedValue([
            { route_id: 'ROUTE1', route_name: 'Route 1' },
            { route_id: 'ROUTE2', route_name: 'Route 2' },
        ]);
    
        const stopId = 'STOP123';
        await store.dispatch(actions.getRoutesByStop(stopId));
    
        const dispatched = store.getActions();
        expect(ccStatic.getRoutesByStop).toHaveBeenCalledWith(stopId);
        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_CACHED_STOP_TO_ROUTES }),
        ]));
    });
    
    it('should dispatch action to cache shape if not already cached', async () => {
        const shapeId = 'SHAPE123';
        ccStatic.getShapeById.mockResolvedValue({ id: shapeId, coordinates: [] });
    
        await store.dispatch(actions.getShape(shapeId));
    
        const dispatched = store.getActions();
        expect(ccStatic.getShapeById).toHaveBeenCalledWith(shapeId);
        expect(dispatched).toEqual(expect.arrayContaining([
            expect.objectContaining({ type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_CACHED_SHAPES }),
        ]));
    });
    
});
