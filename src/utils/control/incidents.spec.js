import { getEntityCounts, generateSelectedText, mergeExistingAndDrawnEntities, buildPublishPayload, filterDisruptionsBySearchTerm } from './incidents';
import { STATUSES } from '../../types/disruptions-types';

describe('getEntityCounts', () => {
    it('should return zero counts for null disruption', () => {
        const result = getEntityCounts(null);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0,
        });
    });

    it('should return zero counts for undefined disruption', () => {
        const result = getEntityCounts(undefined);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0,
        });
    });

    it('should return zero counts for disruption without affectedEntities', () => {
        const disruption = { id: 'test' };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0,
        });
    });

    it('should return zero counts for disruption with null affectedEntities', () => {
        const disruption = { affectedEntities: null };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0,
        });
    });

    it('should count routes and stops correctly', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [
                    { id: 'route1', shortName: '1' },
                    { id: 'route2', shortName: '2' },
                ],
                affectedStops: [
                    { id: 'stop1', stopCode: '1001' },
                    { id: 'stop2', stopCode: '1002' },
                    { id: 'stop3', stopCode: '1003' },
                ],
            },
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 2,
            stopsCount: 3,
            entitiesCount: 5,
        });
    });

    it('should handle empty arrays', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [],
            },
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0,
        });
    });

    it('should handle undefined routes and stops arrays', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: undefined,
                affectedStops: undefined,
            },
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 0,
            entitiesCount: 0,
        });
    });

    it('should handle only routes', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [
                    { id: 'route1', shortName: '1' },
                    { id: 'route2', shortName: '2' },
                ],
                affectedStops: [],
            },
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 2,
            stopsCount: 0,
            entitiesCount: 2,
        });
    });

    it('should handle only stops', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [
                    { id: 'stop1', stopCode: '1001' },
                    { id: 'stop2', stopCode: '1002' },
                ],
            },
        };
        const result = getEntityCounts(disruption);
        expect(result).toEqual({
            routesCount: 0,
            stopsCount: 2,
            entitiesCount: 2,
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

describe('mergeExistingAndDrawnEntities', () => {
    const existingRoutes = [
        {
            routeId: '101-202',
            routeType: 3,
            routeShortName: '101',
            agencyName: 'New Zealand Bus',
            agencyId: 'NZB',
            text: '101',
            category: {
                type: 'route',
                icon: '',
                label: 'Routes',
            },
            icon: 'Bus',
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: 'route',
            stopSequence: 1,
            stopId: '8000-7386a836',
            stopCode: '8000',
            stopName: 'Coyle Park',
            parentStationStopId: null,
            parentStationStopCode: null,
            parentStationStopName: null,
            parentStationStopLon: null,
            parentStationStopLat: null,
            stopLat: -36.85267,
            stopLon: 174.70428,
            directionId: 0,
        },
        {
            routeId: '101-202',
            routeType: 3,
            routeShortName: '101',
            agencyName: 'New Zealand Bus',
            agencyId: 'NZB',
            text: '101',
            category: {
                type: 'route',
                icon: '',
                label: 'Routes',
            },
            icon: 'Bus',
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: 'route',
            stopSequence: 2,
            stopId: '8002-ce800e63',
            stopCode: '8002',
            stopName: 'Johnstone Street',
            parentStationStopId: null,
            parentStationStopCode: null,
            parentStationStopName: null,
            parentStationStopLon: null,
            parentStationStopLat: null,
            stopLat: -36.85467,
            stopLon: 174.70415,
            directionId: 0,
        },
        {
            routeId: '101-202',
            routeType: 3,
            routeShortName: '101',
            agencyName: 'New Zealand Bus',
            agencyId: 'NZB',
            text: '101',
            category: {
                type: 'route',
                icon: '',
                label: 'Routes',
            },
            icon: 'Bus',
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: 'route',
            stopSequence: 3,
            stopId: '8004-66851f82',
            stopCode: '8004',
            stopName: 'Oliver Street',
            parentStationStopId: null,
            parentStationStopCode: null,
            parentStationStopName: null,
            parentStationStopLon: null,
            parentStationStopLat: null,
            stopLat: -36.85682,
            stopLon: 174.70343,
            directionId: 0,
        },
    ];

    const drawnRoutes = [
        {
            routeId: '101-202',
            routeType: 3,
            routeShortName: '101',
            agencyName: 'New Zealand Bus',
            agencyId: 'NZB',
            text: '101',
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: 'route',
        },
        {
            routeId: 'OUT-202',
            routeType: 3,
            routeShortName: 'OUT',
            agencyName: 'New Zealand Bus',
            agencyId: 'NZB',
            text: 'OUT',
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: 'route',
        },
        {
            routeId: 'S500-202',
            routeType: 3,
            routeShortName: '500',
            agencyName: 'New Zealand Bus',
            agencyId: 'NZB',
            text: '500',
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: 'route',
        },
    ];

    const existingStops = [
        {
            stopId: '8000-7386a836',
            stopName: 'Coyle Park',
            stopCode: '8000',
            locationType: 0,
            stopLat: -36.85267,
            stopLon: 174.70428,
            parentStation: null,
            platformCode: null,
            routeType: 3,
            text: '8000 - Coyle Park',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
            routeId: '101-202',
            routeShortName: '101',
            routeLongName: '101',
        },
        {
            stopId: '8000-7386a836',
            stopName: 'Coyle Park',
            stopCode: '8000',
            locationType: 0,
            stopLat: -36.85267,
            stopLon: 174.70428,
            parentStation: null,
            platformCode: null,
            routeType: 3,
            text: '8000 - Coyle Park',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
            routeId: '65-202',
            routeShortName: '65',
            routeLongName: '65',
        },
        {
            stopId: '8001-8ded30b5',
            stopName: 'Coyle Park',
            stopCode: '8001',
            locationType: 0,
            stopLat: -36.85277,
            stopLon: 174.70416,
            parentStation: null,
            platformCode: null,
            routeType: 3,
            text: '8001 - Coyle Park',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        },
    ];

    const drawnStops = [
        {
            stopId: '8000-7386a836',
            stopName: 'Coyle Park',
            stopCode: '8000',
            locationType: 0,
            stopLat: -36.85267,
            stopLon: 174.70428,
            parentStation: null,
            platformCode: null,
            routeType: 3,
            text: '8000 - Coyle Park',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        },
        {
            stopId: '8001-8ded30b5',
            stopName: 'Coyle Park',
            stopCode: '8001',
            locationType: 0,
            stopLat: -36.85277,
            stopLon: 174.70416,
            parentStation: null,
            platformCode: null,
            routeType: 3,
            text: '8001 - Coyle Park',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        },
        {
            stopId: '8002-ce800e63',
            stopName: 'Johnstone Street',
            stopCode: '8002',
            locationType: 0,
            stopLat: -36.85467,
            stopLon: 174.70415,
            parentStation: null,
            platformCode: null,
            routeType: 3,
            text: '8002 - Johnstone Street',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        },
        {
            stopId: '8003-2ea7e096',
            stopName: 'Johnstone Street',
            stopCode: '8003',
            locationType: 0,
            stopLat: -36.85444,
            stopLon: 174.70408,
            parentStation: null,
            platformCode: null,
            routeType: 3,
            text: '8003 - Johnstone Street',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        },
    ];

    it('Should return correct affected entities for routes type', () => {
        const currentAffectedEntities = {
            affectedRoutes: [...existingRoutes],
            affectedStops: [],
        };
        const result = mergeExistingAndDrawnEntities(currentAffectedEntities, drawnRoutes);
        expect(result.affectedRoutes.length).toBe(5);
        expect(result.affectedStops.length).toBe(0);
        expect(result.affectedRoutes.filter(e => e.routeId === '101-202').length).toBe(3);
    });

    it('Should return correct affected entities for stops type', () => {
        const currentAffectedEntities = {
            affectedRoutes: [],
            affectedStops: [...existingStops],
        };
        const result = mergeExistingAndDrawnEntities(currentAffectedEntities, drawnStops);
        expect(result.affectedStops.length).toBe(5);
        expect(result.affectedRoutes.length).toBe(0);
        expect(result.affectedStops.filter(e => e.stopId === '8000-7386a836').length).toBe(2);
    });
});

describe('buildPublishPayload', () => {
    it('should set incident status to NOT_STARTED and map disruptions to NOT_STARTED', () => {
        const input = {
            incidentId: 1,
            status: STATUSES.DRAFT,
            disruptions: [
                { key: 'd1', status: STATUSES.DRAFT, foo: 1 },
                { key: 'd2', status: STATUSES.ACTIVE, bar: 2 },
            ],
            someOtherField: 'keep-me',
        };

        const output = buildPublishPayload(input);

        expect(output.status).toBe(STATUSES.NOT_STARTED);
        expect(output.someOtherField).toBe('keep-me');
        expect(output.disruptions).toHaveLength(2);
        expect(output.disruptions[0]).toEqual(expect.objectContaining({ key: 'd1', status: STATUSES.NOT_STARTED }));
        expect(output.disruptions[1]).toEqual(expect.objectContaining({ key: 'd2', status: STATUSES.NOT_STARTED }));
    });

    it('should handle missing disruptions by treating it as empty array', () => {
        const input = {
            incidentId: 2,
            status: STATUSES.DRAFT,
        };

        const output = buildPublishPayload(input);

        expect(output.status).toBe(STATUSES.NOT_STARTED);
        expect(output.disruptions).toEqual([]);
    });

    it('should handle empty disruptions array', () => {
        const input = {
            incidentId: 3,
            status: STATUSES.DRAFT,
            disruptions: [],
        };

        const output = buildPublishPayload(input);

        expect(output.status).toBe(STATUSES.NOT_STARTED);
        expect(output.disruptions).toEqual([]);
    });
});

describe('filterDisruptionsBySearchTerm', () => {
    const mockDisruptions = [
        {
            key: 'd1',
            impact: 'Road Closure',
            affectedEntities: {
                affectedRoutes: [
                    { routeShortName: '101', routeId: '101-202' },
                    { routeShortName: '202', routeId: '202-303' },
                ],
                affectedStops: [
                    { text: 'Main Street Stop', stopId: 'stop1' },
                ],
            },
        },
        {
            key: 'd2',
            impact: 'Detour',
            affectedEntities: {
                affectedRoutes: [
                    { routeShortName: '303', routeId: '303-404' },
                ],
                affectedStops: [
                    { text: 'Park Avenue', stopId: 'stop2' },
                    { text: 'Central Station', stopId: 'stop3' },
                ],
            },
        },
        {
            key: 'd3',
            impact: 'Delay',
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [],
            },
        },
    ];

    it('should return empty array when disruptions is null', () => {
        const result = filterDisruptionsBySearchTerm(null, 'test');
        expect(result).toEqual([]);
    });

    it('should return empty array when disruptions is undefined', () => {
        const result = filterDisruptionsBySearchTerm(undefined, 'test');
        expect(result).toEqual([]);
    });

    it('should return disruptions when searchTerm is null', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, null);
        expect(result).toEqual(mockDisruptions);
    });

    it('should return disruptions when searchTerm is undefined', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, undefined);
        expect(result).toEqual(mockDisruptions);
    });

    it('should return disruptions when searchTerm is empty string', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, '');
        expect(result).toEqual(mockDisruptions);
    });

    it('should return empty array when disruptions is empty array', () => {
        const result = filterDisruptionsBySearchTerm([], 'test');
        expect(result).toEqual([]);
    });

    it('should filter by impact field', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, 'Road');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d1');
    });

    it('should filter by impact field case-insensitively', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, 'road');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d1');
    });

    it('should filter by routeShortName', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, '101');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d1');
    });

    it('should filter by routeShortName case-insensitively', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, '303');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d2');
    });

    it('should filter by stop text', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, 'Main Street');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d1');
    });

    it('should filter by stop text case-insensitively', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, 'central');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d2');
    });

    it('should return multiple disruptions when search term matches multiple', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, 'Park');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d2');
    });

    it('should return disruption if any field matches', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test Impact',
                affectedEntities: {
                    affectedRoutes: [{ routeShortName: 'ABC', routeId: 'abc-1' }],
                    affectedStops: [{ text: 'XYZ Stop', stopId: 'stop1' }],
                },
            },
        ];
        const result1 = filterDisruptionsBySearchTerm(disruptions, 'Test');
        const result2 = filterDisruptionsBySearchTerm(disruptions, 'ABC');
        const result3 = filterDisruptionsBySearchTerm(disruptions, 'XYZ');
        expect(result1).toHaveLength(1);
        expect(result2).toHaveLength(1);
        expect(result3).toHaveLength(1);
    });

    it('should handle disruption without impact field', () => {
        const disruptions = [
            {
                key: 'd1',
                affectedEntities: {
                    affectedRoutes: [{ routeShortName: '101', routeId: '101-1' }],
                    affectedStops: [],
                },
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, '101');
        expect(result).toHaveLength(1);
    });

    it('should handle disruption without affectedEntities', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test Impact',
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, 'Test');
        expect(result).toHaveLength(1);
    });

    it('should handle disruption with null affectedEntities', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test Impact',
                affectedEntities: null,
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, 'Test');
        expect(result).toHaveLength(1);
    });

    it('should handle disruption with undefined affectedRoutes', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test Impact',
                affectedEntities: {
                    affectedRoutes: undefined,
                    affectedStops: [{ text: 'Test Stop', stopId: 'stop1' }],
                },
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, 'Test');
        expect(result).toHaveLength(1);
    });

    it('should handle disruption with undefined affectedStops', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test Impact',
                affectedEntities: {
                    affectedRoutes: [{ routeShortName: 'Test Route', routeId: 'test-1' }],
                    affectedStops: undefined,
                },
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, 'Test');
        expect(result).toHaveLength(1);
    });

    it('should handle disruption with empty affectedRoutes', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test Impact',
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [{ text: 'Test Stop', stopId: 'stop1' }],
                },
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, 'Test');
        expect(result).toHaveLength(1);
    });

    it('should handle disruption with empty affectedStops', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test Impact',
                affectedEntities: {
                    affectedRoutes: [{ routeShortName: 'Test Route', routeId: 'test-1' }],
                    affectedStops: [],
                },
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, 'Test');
        expect(result).toHaveLength(1);
    });

    it('should handle route without routeShortName', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test Impact',
                affectedEntities: {
                    affectedRoutes: [{ routeId: 'test-1' }],
                    affectedStops: [],
                },
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, 'Test');
        expect(result).toHaveLength(1);
    });

    it('should handle stop without text', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test Impact',
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [{ stopId: 'stop1' }],
                },
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, 'Test');
        expect(result).toHaveLength(1);
    });

    it('should return empty array when no matches found', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, 'NonExistent');
        expect(result).toHaveLength(0);
    });

    it('should handle partial matches in impact', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, 'Clos');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d1');
    });

    it('should handle partial matches in routeShortName', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, '10');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d1');
    });

    it('should handle partial matches in stop text', () => {
        const result = filterDisruptionsBySearchTerm(mockDisruptions, 'Street');
        expect(result).toHaveLength(1);
        expect(result[0].key).toBe('d1');
    });

    it('should return all disruptions when search term matches all', () => {
        const disruptions = [
            {
                key: 'd1',
                impact: 'Test',
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
            },
            {
                key: 'd2',
                impact: 'Test',
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
            },
        ];
        const result = filterDisruptionsBySearchTerm(disruptions, 'Test');
        expect(result).toHaveLength(2);
    });
});
