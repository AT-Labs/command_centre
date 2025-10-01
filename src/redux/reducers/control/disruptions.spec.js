import { expect } from 'chai';
import disruptionsReducer from './disruptions';
import ACTION_TYPE from '../../action-types';

describe('Disruptions Reducer - State Merging', () => {
    it('should merge stopsByRoute instead of replacing', () => {
        const state = {
            stopsByRoute: { route1: [{ stopId: 'stop1' }] },
        };
        const action = {
            type: ACTION_TYPE.UPDATE_STOPS_BY_ROUTE,
            payload: { stopsByRoute: { route2: [{ stopId: 'stop2' }] }, isLoadingStopsByRoute: false },
        };
        const result = disruptionsReducer(state, action);
        expect(result.stopsByRoute).to.deep.equal({
            route1: [{ stopId: 'stop1' }],
            route2: [{ stopId: 'stop2' }],
        });
    });

    it('should merge routesByStop instead of replacing', () => {
        const state = {
            routesByStop: { stop1: [{ routeId: 'route1' }] },
        };
        const action = {
            type: ACTION_TYPE.UPDATE_ROUTES_BY_STOP,
            payload: { routesByStop: { stop2: [{ routeId: 'route2' }] }, isLoadingRoutesByStop: false },
        };
        const result = disruptionsReducer(state, action);
        expect(result.routesByStop).to.deep.equal({
            stop1: [{ routeId: 'route1' }],
            stop2: [{ routeId: 'route2' }],
        });
    });
});
