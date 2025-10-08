import * as actions from './incidents';
import * as selectors from '../../selectors/control/incidents';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import * as routeSelector from '../../selectors/static/routes';

jest.mock('../../../utils/transmitters/disruption-mgt-api');
jest.mock('../../../utils/transmitters/cc-static');
jest.mock('../../selectors/control/incidents');
jest.mock('../../selectors/static/routes');

describe('Incidents Actions addShapesToEntities', () => {
    it('adds shapeWkt and routeColor if routeId matches', () => {
        const entities = [{ id: 1, routeId: 'R1' }];
        const routesWithShapes = [{
            routeId: 'R1',
            shapeWkt: 'LINESTRING (1 1, 2 2)',
            routeColor: '#FF0000',
        }];

        const result = actions.addShapesToEntities(entities, routesWithShapes);
        expect(result).toEqual([{
            id: 1,
            routeId: 'R1',
            shapeWkt: 'LINESTRING (1 1, 2 2)',
            routeColor: '#FF0000',
        }]);
    });

    it('does not modify entity if no matching routeId', () => {
        const entities = [{ id: 1, routeId: 'R2' }];
        const routesWithShapes = [{ routeId: 'R1', shapeWkt: '...', routeColor: '#123' }];
        const result = actions.addShapesToEntities(entities, routesWithShapes);
        expect(result).toEqual([{ id: 1, routeId: 'R2' }]);
    });

    it('skips adding if entity has no routeId', () => {
        const entities = [{ id: 1 }];
        const routesWithShapes = [{ routeId: 'R1', shapeWkt: '...', routeColor: '#123' }];
        const result = actions.addShapesToEntities(entities, routesWithShapes);
        expect(result).toEqual([{ id: 1 }]);
    });
});

describe('Incidents Actions getRoutesByShortName', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('dispatches loading state and fetches missing routes', async () => {
        const currentRoutes = [
            { routeId: 'R1', routeShortName: '10' },
            { routeId: 'R2', routeShortName: '20' },
        ];

        const mockState = {
            cachedShapes: { R1: 'WKT1' },
            allRoutes: {
                R1: { route_color: '#111' },
                R2: { route_color: '#222' },
            },
        };

        getState.mockReturnValue(mockState);
        selectors.getCachedShapes.mockReturnValue({ R1: 'WKT1' });
        routeSelector.getAllRoutes.mockReturnValue(mockState.allRoutes);
        selectors.getAffectedStops.mockReturnValue([]);
        selectors.getAffectedRoutes.mockReturnValue([]);

        ccStatic.getRoutesByShortName.mockResolvedValueOnce([
            { routeId: 'R2', shapeWkt: 'WKT2', routeColor: '#222' },
        ]);

        await actions.getRoutesByShortName(currentRoutes)(dispatch, getState);

        expect(ccStatic.getRoutesByShortName).toHaveBeenCalledWith('20');
    });

    it('skips fetching if all routes are in cache', async () => {
        const currentRoutes = [
            { routeId: 'R1', routeShortName: '10' },
        ];

        getState.mockReturnValue({});
        selectors.getCachedShapes.mockReturnValue({ R1: 'WKT1' });
        routeSelector.getAllRoutes.mockReturnValue({ R1: { route_color: '#111' } });
        selectors.getAffectedStops.mockReturnValue([]);
        selectors.getAffectedRoutes.mockReturnValue([]);

        await actions.getRoutesByShortName(currentRoutes)(dispatch, getState);

        expect(ccStatic.getRoutesByShortName).not.toHaveBeenCalled();
    });

    it('deduplicates routes by routeShortName before fetching', async () => {
        const currentRoutes = [
            { routeId: 'WEST-201', routeShortName: 'WEST' },
            { routeId: 'WEST-202', routeShortName: 'WEST' },
            { routeId: 'WEST-203', routeShortName: 'WEST' },
            { routeId: 'EAST-201', routeShortName: 'EAST' },
        ];

        getState.mockReturnValue({});
        selectors.getCachedShapes.mockReturnValue({});
        routeSelector.getAllRoutes.mockReturnValue({
            'WEST-201': { route_color: '#FF0000' },
            'WEST-202': { route_color: '#FF0000' },
            'WEST-203': { route_color: '#FF0000' },
            'EAST-201': { route_color: '#00FF00' },
        });
        selectors.getAffectedStops.mockReturnValue([]);
        selectors.getAffectedRoutes.mockReturnValue([]);

        ccStatic.getRoutesByShortName.mockImplementation((routeShortName) => {
            if (routeShortName === 'WEST') {
                return Promise.resolve([
                    { route_id: 'WEST-201', trips: [{ shape_wkt: 'LINESTRING(0 0, 1 1)' }] },
                    { route_id: 'WEST-202', trips: [{ shape_wkt: 'LINESTRING(0 0, 1 1)' }] },
                    { route_id: 'WEST-203', trips: [{ shape_wkt: 'LINESTRING(0 0, 1 1)' }] },
                ]);
            }
            if (routeShortName === 'EAST') {
                return Promise.resolve([
                    { route_id: 'EAST-201', trips: [{ shape_wkt: 'LINESTRING(1 1, 2 2)' }] },
                ]);
            }
            return Promise.resolve([]);
        });

        await actions.getRoutesByShortName(currentRoutes)(dispatch, getState);

        expect(ccStatic.getRoutesByShortName).toHaveBeenCalledTimes(2);
        expect(ccStatic.getRoutesByShortName).toHaveBeenCalledWith('WEST');
        expect(ccStatic.getRoutesByShortName).toHaveBeenCalledWith('EAST');
    });
});
