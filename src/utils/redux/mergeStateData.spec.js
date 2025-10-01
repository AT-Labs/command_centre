import { expect } from 'chai';
import {
    mergeStateData,
    updateStateWithMergedData,
    createUpdateHandler,
    createStopsAndRoutesHandlers,
    createStateUpdater,
} from './mergeStateData';

describe('mergeStateData', () => {
    it('should merge new data with existing state data', () => {
        const state = {
            stopsByRoute: { route1: ['stop1', 'stop2'] },
            isLoadingStopsByRoute: true,
        };
        const newData = { route2: ['stop3', 'stop4'] };

        const result = mergeStateData(state, 'stopsByRoute', newData, 'isLoadingStopsByRoute');

        expect(result.stopsByRoute).to.deep.equal({
            route1: ['stop1', 'stop2'],
            route2: ['stop3', 'stop4'],
        });
        expect(result.isLoadingStopsByRoute).to.equal(false);
    });

    it('should overwrite existing keys with new data', () => {
        const state = {
            routesByStop: { stop1: ['route1'], stop2: ['route2'] },
            isLoadingRoutesByStop: true,
        };
        const newData = { stop1: ['route3'], stop3: ['route4'] };

        const result = mergeStateData(state, 'routesByStop', newData, 'isLoadingRoutesByStop');

        expect(result.routesByStop).to.deep.equal({
            stop1: ['route3'],
            stop2: ['route2'],
            stop3: ['route4'],
        });
        expect(result.isLoadingRoutesByStop).to.equal(false);
    });
});

describe('updateStateWithMergedData', () => {
    it('should merge new data with existing state and dispatch action', () => {
        let dispatchedAction = null;
        const mockDispatch = (action) => {
            dispatchedAction = action;
        };
        const mockGetState = () => ({
            control: {
                disruptions: {
                    stopsByRoute: { route1: ['stop1', 'stop2'] },
                },
            },
        });
        const newData = { route2: ['stop3', 'stop4'] };
        const mockUpdateAction = (data, loading) => ({ type: 'UPDATE_STOPS_BY_ROUTE', payload: { data, loading } });

        updateStateWithMergedData(mockDispatch, mockGetState, 'control.disruptions', 'stopsByRoute', newData, mockUpdateAction);

        expect(dispatchedAction).to.deep.equal({
            type: 'UPDATE_STOPS_BY_ROUTE',
            payload: {
                data: {
                    route1: ['stop1', 'stop2'],
                    route2: ['stop3', 'stop4'],
                },
                loading: false,
            },
        });
    });
});

describe('createUpdateHandler', () => {
    it('should create a handler that merges data with existing state', () => {
        const handler = createUpdateHandler('stopsByRoute', 'isLoadingStopsByRoute');
        const state = {
            stopsByRoute: { route1: ['stop1', 'stop2'] },
            isLoadingStopsByRoute: true,
        };
        const action = {
            payload: {
                stopsByRoute: { route2: ['stop3', 'stop4'] },
            },
        };

        const result = handler(state, action);

        expect(result.stopsByRoute).to.deep.equal({
            route1: ['stop1', 'stop2'],
            route2: ['stop3', 'stop4'],
        });
        expect(result.isLoadingStopsByRoute).to.equal(false);
    });
});

describe('createStopsAndRoutesHandlers', () => {
    it('should create both stops and routes handlers', () => {
        const handlers = createStopsAndRoutesHandlers();

        expect(handlers).to.have.property('handleUpdateStopsByRoute');
        expect(handlers).to.have.property('handleUpdateRoutesByStop');
        expect(handlers.handleUpdateStopsByRoute).to.be.a('function');
        expect(handlers.handleUpdateRoutesByStop).to.be.a('function');
    });
});

describe('createStateUpdater', () => {
    it('should create state updater with correct methods', () => {
        const stateUpdater = createStateUpdater('control.disruptions');

        expect(stateUpdater).to.have.property('updateStopsByRoute');
        expect(stateUpdater).to.have.property('updateRoutesByStop');
        expect(stateUpdater.updateStopsByRoute).to.be.a('function');
        expect(stateUpdater.updateRoutesByStop).to.be.a('function');
    });

    it('should create updater that works correctly for stopsByRoute', () => {
        const stateUpdater = createStateUpdater('control.disruptions');
        let dispatchedAction = null;
        const mockDispatch = (action) => {
            dispatchedAction = action;
        };
        const mockGetState = () => ({
            control: {
                disruptions: {
                    stopsByRoute: { route1: ['stop1', 'stop2'] },
                },
            },
        });
        const newData = { route2: ['stop3', 'stop4'] };
        const mockUpdateAction = (data, loading) => ({ type: 'UPDATE_STOPS_BY_ROUTE', payload: { data, loading } });

        stateUpdater.updateStopsByRoute(mockDispatch, mockGetState, newData, mockUpdateAction);

        expect(dispatchedAction).to.deep.equal({
            type: 'UPDATE_STOPS_BY_ROUTE',
            payload: {
                data: {
                    route1: ['stop1', 'stop2'],
                    route2: ['stop3', 'stop4'],
                },
                loading: false,
            },
        });
    });

    it('should create updater that works correctly for routesByStop', () => {
        const stateUpdater = createStateUpdater('control.incidents');
        let dispatchedAction = null;
        const mockDispatch = (action) => {
            dispatchedAction = action;
        };
        const mockGetState = () => ({
            control: {
                incidents: {
                    routesByStop: { stop1: ['route1'] },
                },
            },
        });
        const newData = { stop2: ['route2'] };
        const mockUpdateAction = (data, loading) => ({ type: 'UPDATE_ROUTES_BY_STOP', payload: { data, loading } });

        stateUpdater.updateRoutesByStop(mockDispatch, mockGetState, newData, mockUpdateAction);

        expect(dispatchedAction).to.deep.equal({
            type: 'UPDATE_ROUTES_BY_STOP',
            payload: {
                data: {
                    stop1: ['route1'],
                    stop2: ['route2'],
                },
                loading: false,
            },
        });
    });
});
