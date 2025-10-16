import { getEntityCounts, generateSelectedText } from './incidents';
import { MAX_NUMBER_OF_ENTITIES } from '../../constants/disruptions';

describe('getEntityCounts', () => {
    it('should return zero counts for null disruption', () => {
        const result = getEntityCounts(null);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0
        });
    });

    it('should return zero counts for undefined disruption', () => {
        const result = getEntityCounts(undefined);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0
        });
    });

    it('should return zero counts for disruption without affectedEntities', () => {
        const disruption = { id: 'test' };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0
        });
    });

    it('should return zero counts for disruption with null affectedEntities', () => {
        const disruption = { affectedEntities: null };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0
        });
    });

    it('should count routes and stops correctly', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [
                    { id: 'route1', shortName: '1' },
                    { id: 'route2', shortName: '2' }
                ],
                affectedStops: [
                    { id: 'stop1', stopCode: '1001' },
                    { id: 'stop2', stopCode: '1002' },
                    { id: 'stop3', stopCode: '1003' }
                ]
            }
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 2,
            stopsCount: 3,
            entitiesCount: 5
        });
    });

    it('should handle empty arrays', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: []
            }
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0
        });
    });

    it('should handle undefined routes and stops arrays', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: undefined,
                affectedStops: undefined
            }
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0
        });
    });

    it('should handle only routes', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [
                    { id: 'route1', shortName: '1' },
                    { id: 'route2', shortName: '2' }
                ],
                affectedStops: []
            }
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 2,
            stopsCount: 0,
            entitiesCount: 2
        });
    });

    it('should handle only stops', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [
                    { id: 'stop1', stopCode: '1001' },
                    { id: 'stop2', stopCode: '1002' }
                ]
            }
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 2,
            entitiesCount: 2
        });
    });
});

describe('generateSelectedText', () => {
    it('should generate text for routes only', () => {
        const result = generateSelectedText(5, 0);
        expect(result).toBe('routes');
    });

    it('should generate text for stops only', () => {
        const result = generateSelectedText(0, 3);
        expect(result).toBe('stops');
    });

    it('should generate text for both routes and stops', () => {
        const result = generateSelectedText(2, 3);
        expect(result).toBe('routes and stops');
    });

    it('should handle zero counts', () => {
        const result = generateSelectedText(0, 0);
        expect(result).toBe('');
    });
});
