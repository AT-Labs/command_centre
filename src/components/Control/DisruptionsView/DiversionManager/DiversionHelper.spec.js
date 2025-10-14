import { canMerge, createAffectedStop, createModifiedRouteVariant, generateUniqueColor,
    getMinDistanceToPolyline, getUniqueAffectedStopIds, getUniqueStops, hasDiversionModified, isAffectedStop,
    mergeDiversionToRouteVariant, removeDuplicatePoints } from './DiversionHelper';

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
        const wkt = 'LINESTRING(174.71309 -36.72237,174.71309 -36.72239,174.71324 -36.72239,174.71332 -36.72235,174.71334 -36.72228)';
        const stopLatLng = [-36.72239, 174.71309];
        const distance = getMinDistanceToPolyline(stopLatLng, wkt);
        expect(distance).toBeCloseTo(0, 5);
    });
});

describe('canMerge', () => {
    it('returns true when both start and end of diversion are close to original', () => {
        const originalWKT = 'LINESTRING(0 0, 0 0.001)';
        const diversionWKT = 'LINESTRING(0 0.0001, 0 0.0002)';
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
        const shapeWkt = 'LINESTRING(0 0, 1 1)';
        const modifiedVariant = createModifiedRouteVariant(routeVariant, shapeWkt);
        expect(modifiedVariant).toEqual({
            routeVariantId: '789',
            routeId: '456',
            routeVariantName: 'Route 1 Long',
            directionId: 0,
            shapeWkt: 'LINESTRING(0 0, 1 1)',
        });
    });
});

describe('isAffectedStop', () => {
    it('returns false when stop is close to the polyline', () => {
        const stop = { stopLat: -36.72237, stopLon: 174.71309 };
        const shapeWkt = 'LINESTRING(174.71309 -36.72237,174.71309 -36.72239,174.71324 -36.72239,174.71332 -36.72235,174.71334 -36.72228)';
        expect(isAffectedStop(stop, shapeWkt)).toBe(false);
    });

    it('returns true when stop is far from the polyline', () => {
        const stop = { stopLat: -38.72237, stopLon: 176.71309 };
        const shapeWkt = 'LINESTRING(174.71309 -36.72237,174.71309 -36.72239,174.71324 -36.72239,174.71332 -36.72235,174.71334 -36.72228)';
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

describe('hasDiversionModified', () => {
    const baseArgs = {
        isEditingMode: true,
        diversionShapeWkt: 'LINESTRING(1 2,3 4)',
        originalDiversionShapeWkt: 'LINESTRING(1 2,3 4)',
        selectedOtherRouteVariants: [],
        editingDiversions: [{ routeVariantId: 'rv1', shapeWkt: 'LINESTRING(1 2,3 4)' }],
    };

    it('returns false if not in editing mode', () => {
        expect(hasDiversionModified({ ...baseArgs, isEditingMode: false })).toBe(false);
    });

    it('returns true if diversionShapeWkt is different', () => {
        expect(
            hasDiversionModified({
                ...baseArgs,
                diversionShapeWkt: 'LINESTRING(5 6,7 8)',
            }),
        ).toBe(true);
    });

    it('returns true if selectedOtherRouteVariants length is different', () => {
        expect(
            hasDiversionModified({
                ...baseArgs,
                selectedOtherRouteVariants: [{ routeVariantId: 'rv2', shapeWkt: 'LINESTRING(1 2,3 4)' }],
            }),
        ).toBe(true);
    });

    it('returns true if a variant shapeWkt is different', () => {
        expect(
            hasDiversionModified({
                ...baseArgs,
                selectedOtherRouteVariants: [{ routeVariantId: 'rv1', shapeWkt: 'LINESTRING(9 9,10 10)' }],
                editingDiversions: [{ routeVariantId: 'rv1', shapeWkt: 'LINESTRING(1 2,3 4)' }],
            }),
        ).toBe(true);
    });

    it('returns true if a new variant is added', () => {
        expect(
            hasDiversionModified({
                ...baseArgs,
                selectedOtherRouteVariants: [{ routeVariantId: 'rv2', shapeWkt: 'LINESTRING(1 2,3 4)' }],
                editingDiversions: [{ routeVariantId: 'rv1', shapeWkt: 'LINESTRING(1 2,3 4)' }],
            }),
        ).toBe(true);
    });

    it('returns false if everything matches', () => {
        expect(
            hasDiversionModified({
                ...baseArgs,
                selectedOtherRouteVariants: [],
                editingDiversions: [{ routeVariantId: 'rv1', shapeWkt: 'LINESTRING(1 2,3 4)' }],
            }),
        ).toBe(false);
    });
});

describe('getUniqueAffectedStopIds', () => {
    it('returns unique stopIds', () => {
        const affectedStops = [
            { stopId: '1' },
            { stopId: '2' },
            { stopId: '1' },
            { stopId: '3' },
        ];
        expect(getUniqueAffectedStopIds(affectedStops)).toEqual(['1', '2', '3']);
    });

    it('returns empty array for empty input', () => {
        expect(getUniqueAffectedStopIds([])).toEqual([]);
    });
});

describe('mergeDiversionToRouteVariant', () => {
    it('returns a new route variant object with merged shapeWkt, color, and visible=true', () => {
        const routeVariant = {
            routeVariantId: '123',
            routeId: '456',
            routeLongName: 'NX1 Albany to Britomart',
            directionId: 0,
        };
        // Simple shapes for test
        const originalShapeWkt = 'LINESTRING(0 0,0 10,10 10,11 11)';
        const diversionShapeWkt = 'LINESTRING(0 10,5 5,10 10)';
        const result = mergeDiversionToRouteVariant(routeVariant, originalShapeWkt, diversionShapeWkt);

        expect(result.routeVariantId).toBe('123');
        expect(result.routeId).toBe('456');
        expect(result.routeLongName).toBe('NX1 Albany to Britomart');
        expect(result.directionId).toBe(0);
        expect(result.visible).toBe(true);
        expect(result.shapeWkt).toBe('LINESTRING(0 0,0 10,5 5,10 10,11 11)');
    });
});

describe('removeDuplicatePoints', () => {
    it('removes duplicates within n steps', () => {
        const wkt = 'LINESTRING(1 1,2 2,3 3,1 1)';
        // 1 1 at 0 and 3, n=3, should remove 1,2,3
        expect(removeDuplicatePoints(wkt, 3)).toBe('LINESTRING(1 1)');
    });

    it('does not remove if duplicates are further than n', () => {
        const wkt = 'LINESTRING(1 1,2 2,3 3,4 4,1 1)';
        // 1 1 at 0 and 4, n=3, should not remove
        expect(removeDuplicatePoints(wkt, 3)).toBe('LINESTRING(1 1,2 2,3 3,4 4,1 1)');
    });

    it('returns original WKT if n is invalid', () => {
        const wkt = 'LINESTRING(1 1,2 2,1 1)';
        expect(removeDuplicatePoints(wkt, 0)).toBe(wkt);
        expect(removeDuplicatePoints(wkt, -1)).toBe(wkt);
        expect(removeDuplicatePoints(wkt, 1.5)).toBe(wkt);
    });

    it('handles WKT with no duplicates', () => {
        const wkt = 'LINESTRING(1 1,2 2,3 3)';
        expect(removeDuplicatePoints(wkt, 3)).toBe(wkt);
    });

    it('removes all the points between duplicates within step n, even if there are other duplicates in between', () => {
        const wkt = 'LINESTRING(1 1,2 2,3 3,2 2,1 1)';
        // 1 1 at 0 and 4, n=4, should remove 1-4
        // Other duplicates (2 2, 3 3) are within n=4
        expect(removeDuplicatePoints(wkt, 4)).toBe('LINESTRING(1 1)');
    });

    it('works with n=1 (only immediate duplicates)', () => {
        const wkt = 'LINESTRING(1 1,1 1,2 2,2 2,3 3)';
        expect(removeDuplicatePoints(wkt, 1)).toBe('LINESTRING(1 1,2 2,3 3)');
    });

    it('Only remove the duplications within step n even if there are duplications outside of step n)', () => {
        const wkt = 'LINESTRING(1 1,2 2,3 3,2 2,1 1)';
        // In this case, (1 1) at 0 and 4, n=3, should only remove (2 2,3 3)
        expect(removeDuplicatePoints(wkt, 3)).toBe('LINESTRING(1 1,2 2,1 1)');
    });
});
