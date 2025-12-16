import {
    calculateDistance,
    projectPointOnSegment,
    findProjectionOnPolyline,
    mergeCoordinates,
    findDifferences,
    parseWKT,
    toWKT,
    deduplicateCoordinates,
    toCoordinates,
    thinCoordinates,
} from './ShapeHelper.js';

describe('calculateDistance', () => {
    it('returns 0 for identical points', () => {
        const distance = calculateDistance([10, 20], [10, 20]);
        expect(distance).toBe(0);
    });
});

describe('projectPointOnSegment', () => {
    it('projects a point inside the segment', () => {
        const projection = projectPointOnSegment([1, 5], [0, 0], [0, 10]);
        expect(projection).toEqual([0, 5]);
    });

    it('clamps projection to start when before segment', () => {
        const projection = projectPointOnSegment([0, -1], [0, 0], [0, 10]);
        expect(projection).toEqual([0, 0]);
    });

    it('clamps projection to end when after segment', () => {
        const projection = projectPointOnSegment([0, 11], [0, 0], [0, 10]);
        expect(projection).toEqual([0, 10]);
    });

    it('projects on a horizontal segment', () => {
        const projection = projectPointOnSegment([5, 1], [0, 0], [10, 0]);
        expect(projection).toEqual([5, 0]);
    });
});

describe('findProjectionOnPolyline', () => {
    const polyline = [[0, 0], [0, 10], [10, 10]];

    it('finds projection on the first segment', () => {
        const { projection, segmentIndex } = findProjectionOnPolyline([1, 5], polyline);
        expect(projection).toEqual([0, 5]);
        expect(segmentIndex).toBe(0);
    });

    it('finds projection on the second segment', () => {
        const { projection, segmentIndex } = findProjectionOnPolyline([5, 10], polyline);
        expect(projection).toEqual([5, 10]);
        expect(segmentIndex).toBe(1);
    });

    it('clamps projection to start of polyline', () => {
        const { projection, segmentIndex } = findProjectionOnPolyline([0, -1], polyline);
        expect(projection).toEqual([0, 0]);
        expect(segmentIndex).toBe(0);
    });

    it('clamps projection to end of polyline', () => {
        const { projection, segmentIndex } = findProjectionOnPolyline([11, 10], polyline);
        expect(projection).toEqual([10, 10]);
        expect(segmentIndex).toBe(1);
    });
});

describe('mergeCoordinates', () => {
    it('merges second list into first list between projected points', () => {
        const firstList = [[0, 0], [0, 10], [10, 10], [11, 11]];
        const secondList = [[0, 10], [5, 5], [10, 10]];
        const merged = mergeCoordinates(firstList, secondList);
        expect(merged).toEqual([[0, 0], [0, 10], [5, 5], [10, 10], [11, 11]]);
    });

    it('handles merge when list length < 3', () => {
        const firstList = [[0, 0], [10, 10]];
        const secondList = [[0, 5], [5, 5]];
        const merged = mergeCoordinates(firstList, secondList);
        expect(merged).toEqual([[0, 0], [10, 10]]);
    });
});

describe('findDifferences', () => {
    it('finds differences in the middle', () => {
        const original = [[0, 0], [0, 1], [0, 2], [0, 3]];
        const updated = [[0, 0], [1, 1], [1, 2], [0, 3]];
        const differences = findDifferences(original, updated);
        expect(differences).toEqual([[0, 0], [1, 1], [1, 2], [0, 3]]);
    });

    it('finds differences at the start', () => {
        const original = [[0, 0], [1, 1], [0, 2]];
        const updated = [[1, 0], [1, 1], [0, 2]];
        const differences = findDifferences(original, updated);
        expect(differences).toEqual([[1, 0], [1, 1]]);
    });

    it('finds differences at the end', () => {
        const original = [[0, 0], [0, 1], [0, 2]];
        const updated = [[0, 0], [0, 1], [1, 2]];
        const differences = findDifferences(original, updated);
        expect(differences).toEqual([[0, 1], [1, 2]]);
    });

    it('finds differences when the updated list only removes points', () => {
        const original = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]];
        const updated = [[0, 0], [0, 1], [0, 3], [0, 4]];
        const differences = findDifferences(original, updated);
        // [0, 2] is removed, return the surrounding points
        expect(differences).toEqual([[0, 1], [0, 3]]);
    });

    it('returns empty array when lists are identical', () => {
        const original = [[0, 0], [0, 1]];
        const updated = [[0, 0], [0, 1]];
        const differences = findDifferences(original, updated);
        expect(differences).toEqual([]);
    });
});

describe('parseWKT', () => {
    it('parses WKT LINESTRING to coordinate array', () => {
        const wkt = 'LINESTRING(30 10, 10 30, 40 40)';
        const coords = parseWKT(wkt);
        expect(coords).toEqual([[10, 30], [30, 10], [40, 40]]);
    });

    it('returns empty array for null input', () => {
        expect(parseWKT(null)).toEqual([]);
    });

    it('returns empty array for undefined input', () => {
        expect(parseWKT(undefined)).toEqual([]);
    });

    it('returns empty array for empty string', () => {
        expect(parseWKT('')).toEqual([]);
    });

    it('returns empty array for non-string input', () => {
        expect(parseWKT(123)).toEqual([]);
        expect(parseWKT({})).toEqual([]);
        expect(parseWKT([])).toEqual([]);
    });

    it('returns empty array for string not starting with LINESTRING', () => {
        expect(parseWKT('POLYGON((30 10, 40 40, 20 40, 10 20, 30 10))')).toEqual([]);
        expect(parseWKT('POINT(10 20)')).toEqual([]);
    });

    it('parses LINESTRING with extra spaces', () => {
        const wkt = 'LINESTRING(  30 10 ,  10 30  ,40 40 )';
        const coords = parseWKT(wkt);
        expect(coords).toEqual([[10, 30], [30, 10], [40, 40]]);
    });
});

describe('toWKT', () => {
    it('converts coordinate array to WKT LINESTRING', () => {
        const coords = [[10, 30], [30, 10], [40, 40]];
        const wkt = toWKT(coords);
        expect(wkt).toBe('LINESTRING(30 10,10 30,40 40)');
    });
});

describe('deduplicateCoordinates', () => {
    it('should return an empty array when input is empty', () => {
        expect(deduplicateCoordinates([])).toEqual([]);
    });

    it('should return the same array when there is only one element', () => {
        expect(deduplicateCoordinates([[1, 2]])).toEqual([[1, 2]]);
    });

    it('should return the same array when there are no duplicates', () => {
        const input = [[1, 2], [3, 4], [5, 6]];
        expect(deduplicateCoordinates(input)).toEqual(input);
    });

    it('should remove consecutive duplicates', () => {
        const input = [[1, 2], [1, 2], [3, 4]];
        const expected = [[1, 2], [3, 4]];
        expect(deduplicateCoordinates(input)).toEqual(expected);
    });

    it('should remove all duplicates when all elements are the same', () => {
        const input = [[1, 2], [1, 2], [1, 2]];
        const expected = [[1, 2]];
        expect(deduplicateCoordinates(input)).toEqual(expected);
    });

    it('should remove multiple groups of duplicates', () => {
        const input = [[1, 2], [1, 2], [3, 4], [3, 4], [5, 6]];
        const expected = [[1, 2], [3, 4], [5, 6]];
        expect(deduplicateCoordinates(input)).toEqual(expected);
    });

    it('should not remove non-consecutive duplicates', () => {
        const input = [[1, 2], [3, 4], [1, 2]];
        expect(deduplicateCoordinates(input)).toEqual(input);
    });

    it('should return an empty array if input is not an array', () => {
        expect(deduplicateCoordinates('not an array')).toEqual([]);
        expect(deduplicateCoordinates(123)).toEqual([]);
        expect(deduplicateCoordinates({})).toEqual([]);
    });
});

describe('toCoordinates', () => {
    it('converts array of LatLng objects to [lat, lng] arrays', () => {
        const latlngs = [
            { lat: 10, lng: 20 },
            { lat: 30, lng: 40 },
            { lat: -5, lng: 100 },
        ];
        expect(toCoordinates(latlngs)).toEqual([
            [10, 20],
            [30, 40],
            [-5, 100],
        ]);
    });

    it('returns an empty array when input is empty', () => {
        expect(toCoordinates([])).toEqual([]);
    });
});

describe('thinCoordinates', () => {
    it('returns the same array when less than 3 points', () => {
        expect(thinCoordinates([])).toEqual([]);
        expect(thinCoordinates([[1, 2]])).toEqual([[1, 2]]);
        expect(thinCoordinates([[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]]);
    });

    it('always keeps first and last points', () => {
        const points = [[0, 0], [0.00001, 0.00001], [0, 1]];
        const thinned = thinCoordinates(points, 0.00002);
        expect(thinned[0]).toEqual([0, 0]);
        expect(thinned[thinned.length - 1]).toEqual([0, 1]);
    });

    it('removes points with low perpendicular height', () => {
        // Points forming a nearly straight line - middle point should be removed
        const points = [[0, 0], [0.00001, 0.00001], [0, 1]];
        const thinned = thinCoordinates(points, 0.00002);
        // Middle point should be removed as it has very low height
        expect(thinned.length).toBeLessThan(points.length);
    });

    it('keeps points with high perpendicular height', () => {
        // Points forming a triangle with significant height
        const points = [[0, 0], [0.5, 0.5], [1, 0]];
        const thinned = thinCoordinates(points, 0.00002);
        // All points should be kept as middle point has significant height
        expect(thinned.length).toBe(3);
    });

    it('keeps points that are far apart regardless of height', () => {
        // Points where middle point is far from previous (>20 meters)
        // this is to make sure that we don't remove points on long motorway segments
        // The goal for the thin algorithm is to reduce points that are too close to each other
        const points = [
            [0, 0],
            [0.0002, 0.0001], // ~20+ meters away, enough distance for shape editor
            [0.0004, 0],
        ];
        const thinned = thinCoordinates(points, 0.00002, 20);
        // All points should be kept due to distance threshold
        expect(thinned.length).toBe(3);
    });

    it('applies custom height threshold', () => {
        const points = [[0, 0], [0.00005, 0.00005], [0, 1]];
        const thinnedLow = thinCoordinates(points, 0.0001);
        const thinnedHigh = thinCoordinates(points, 0.00001);
        // Higher threshold removes more points
        expect(thinnedLow.length).toBeLessThanOrEqual(thinnedHigh.length);
    });

    it('applies custom distance threshold', () => {
        const points = [[0, 0], [0.0001, 0.0001], [0, 1]];
        const thinned50 = thinCoordinates(points, 0.00002, 50);
        const thinned10 = thinCoordinates(points, 0.00002, 10);
        // Lower distance threshold keeps more points
        expect(thinned10.length).toBeGreaterThanOrEqual(thinned50.length);
    });

    it('handles complex polyline with multiple segments', () => {
        const points = [
            [0, 0],
            [0.00001, 0.00001], // Low height, should be removed
            [0, 0.5],
            [0.5, 0.5], // High height, should be kept
            [0, 1],
            [0.00001, 1.00001], // Low height, should be removed
            [0, 2],
        ];
        const thinned = thinCoordinates(points, 0.00002);
        expect(thinned.length).toBeLessThan(points.length);
        expect(thinned[0]).toEqual([0, 0]);
        expect(thinned[thinned.length - 1]).toEqual([0, 2]);
    });

    it('returns all points when they all have high significance', () => {
        // Points forming a zigzag pattern - all should be kept
        const points = [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 2],
            [2, 2],
        ];
        const thinned = thinCoordinates(points, 0.00002);
        expect(thinned.length).toBe(points.length);
    });

    it('does not include duplicate last point', () => {
        const points = [[0, 0], [0.5, 0.5], [1, 1]];
        const thinned = thinCoordinates(points, 0.00002);
        const lastPoint = thinned[thinned.length - 1];
        const secondLastPoint = thinned[thinned.length - 2];
        // Last point should not be a duplicate
        expect(lastPoint[0] === secondLastPoint[0] && lastPoint[1] === secondLastPoint[1]).toBe(false);
    });
});
