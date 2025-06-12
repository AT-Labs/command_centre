import { canMerge, createAffectedStop, createModifiedRouteVariant, generateUniqueColor, getMinDistanceToPolyline, getUniqueStops, isAffectedStop } from './DiversionHelper';

describe('generateUniqueColor', () => {
    it('generates a valid hex color', () => {
        const color = generateUniqueColor(600123);
        expect(color).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('generates the same color for the same number', () => {
        const color1 = generateUniqueColor(600123);
        const color2 = generateUniqueColor(600123);
        expect(color1).toBe(color2);
    });

    it('generates different colors for different numbers', () => {
        const color1 = generateUniqueColor(600123);
        const color2 = generateUniqueColor(600124);
        expect(color1).not.toBe(color2);
    });
});

describe('getMinDistanceToPolyline', () => {
    it('returns 0 when stop is on the polyline', () => {
        const wkt = 'LINESTRING (174.71309 -36.72237,174.71309 -36.72239,174.71324 -36.72239,174.71332 -36.72235,174.71334 -36.72228)';
        const stopLatLng = [-36.72239, 174.71309];
        const distance = getMinDistanceToPolyline(stopLatLng, wkt);
        expect(distance).toBeCloseTo(0, 5);
    });
});

describe('canMerge', () => {
    it('returns true when both start and end of diversion are close to original', () => {
        const originalWKT = 'LINESTRING (0 0, 0 0.001)';
        const diversionWKT = 'LINESTRING (0 0.0001, 0 0.0002)';
        expect(canMerge(originalWKT, diversionWKT)).toBe(true);
    });
});

describe('createAffectedStop', () => {
    it('creates an affected stop object with correct properties', () => {
        const stop = { stopId: '123', stopCode: 'A', stopName: 'Stop A', stopLat: 37.7749, stopLon: -122.4194 };
        const variant = { routeId: '456', routeShortName: 'Route 1', routeType: 'bus', directionId: 0 };
        const affectedStop = createAffectedStop(stop, variant);
        expect(affectedStop).toEqual({
            routeId: '456',
            routeShortName: 'Route 1',
            routeType: 'bus',
            type: 'route',
            directionId: 0,
            stopId: '123',
            stopCode: 'A',
            stopName: 'Stop A',
            stopLat: 37.7749,
            stopLon: -122.4194,
        });
    });
});

describe('createModifiedRouteVariant', () => {
    it('creates a modified route variant object with correct properties', () => {
        const routeVariant = { routeVariantId: '789', routeId: '456', routeLongName: 'Route 1 Long', directionId: 0 };
        const shapeWkt = 'LINESTRING (0 0, 1 1)';
        const modifiedVariant = createModifiedRouteVariant(routeVariant, shapeWkt);
        expect(modifiedVariant).toEqual({
            routeVariantId: '789',
            routeId: '456',
            routeVariantName: 'Route 1 Long',
            directionId: 0,
            shapeWkt: 'LINESTRING (0 0, 1 1)',
        });
    });
});

describe('isAffectedStop', () => {
    it('returns false when stop is close to the polyline', () => {
        const stop = { stopLat: -36.72237, stopLon: 174.71309 };
        const shapeWkt = 'LINESTRING (174.71309 -36.72237,174.71309 -36.72239,174.71324 -36.72239,174.71332 -36.72235,174.71334 -36.72228)';
        expect(isAffectedStop(stop, shapeWkt)).toBe(false);
    });

    it('returns true when stop is far from the polyline', () => {
        const stop = { stopLat: -38.72237, stopLon: 176.71309 };
        const shapeWkt = 'LINESTRING (174.71309 -36.72237,174.71309 -36.72239,174.71324 -36.72239,174.71332 -36.72235,174.71334 -36.72228)';
        expect(isAffectedStop(stop, shapeWkt)).toBe(true);
    });
});

describe('getUniqueStops', () => {
    it('removes duplicate stops based on routeId, directionId, and stopId', () => {
        const stops = [
            { routeId: '1', directionId: 0, stopId: 'A' },
            { routeId: '1', directionId: 0, stopId: 'B' },
            { routeId: '1', directionId: 0, stopId: 'A' },
            { routeId: '2', directionId: 0, stopId: 'A' },
            { routeId: '1', directionId: 1, stopId: 'A' },
        ];
        const uniqueStops = getUniqueStops(stops);
        expect(uniqueStops).toHaveLength(4);
        expect(uniqueStops).toEqual([
            { routeId: '1', directionId: 0, stopId: 'A' },
            { routeId: '1', directionId: 0, stopId: 'B' },
            { routeId: '2', directionId: 0, stopId: 'A' },
            { routeId: '1', directionId: 1, stopId: 'A' },
        ]);
    });
});
