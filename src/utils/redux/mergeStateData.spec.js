import { expect } from 'chai';
import { mergeStateData } from './mergeStateData';

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
