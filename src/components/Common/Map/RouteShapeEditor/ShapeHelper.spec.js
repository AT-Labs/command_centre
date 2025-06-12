import {
    calculateDistance,
    projectPointOnSegment,
    findProjectionOnPolyline,
    mergeCoordinates,
    findDifferences,
    parseWKT,
    toWKT,
    deduplicateCoordinates,
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
        expect(differences).toEqual([[1, 1], [1, 2], [0, 3]]);
    });

    it('finds differences at the start', () => {
        const original = [[0, 0], [0, 1], [0, 2]];
        const updated = [[1, 0], [1, 1], [0, 2]];
        const differences = findDifferences(original, updated);
        expect(differences).toEqual([[1, 0], [1, 1], [0, 2]]);
    });

    it('finds differences at the end', () => {
        const original = [[0, 0], [0, 1], [0, 2]];
        const updated = [[0, 0], [0, 1], [1, 2]];
        const differences = findDifferences(original, updated);
        expect(differences).toEqual([[0, 1], [1, 2]]);
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
