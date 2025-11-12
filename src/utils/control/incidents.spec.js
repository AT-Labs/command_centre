import { getEntityCounts,
    generateSelectedText,
    mergeExistingAndDrawnEntities,
    buildPublishPayload,
    isDateFieldValid,
    isTimeFieldValid,
    startDateTimeWillBeAutomaticallyUpdated,
    endDateTimeWillBeAutomaticallyUpdated,
} from './incidents';
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

describe('isDateFieldValid', () => {
    it('Should return true if date is valid', () => {
        const result = isDateFieldValid('24/11/2025');
        expect(result).toBe(true);
    });

    it('Should return false if date is empty', () => {
        const result = isDateFieldValid('');
        expect(result).toBe(false);
    });

    it('Should return false if date is undefined', () => {
        const result = isDateFieldValid(undefined);
        expect(result).toBe(false);
    });

    it('Should return false if date is null', () => {
        const result = isDateFieldValid(null);
        expect(result).toBe(false);
    });

    it('Should return false if date is incorrect value', () => {
        const result = isDateFieldValid('test');
        expect(result).toBe(false);
    });

    it('Should return false if date with incorrect format', () => {
        const result = isDateFieldValid('2025/11/24');
        expect(result).toBe(false);
    });
});

describe('isTimeFieldValid', () => {
    it('Should return true if time is valid', () => {
        const result = isTimeFieldValid('12:24');
        expect(result).toBe(true);
    });

    it('Should return false if time is empty', () => {
        const result = isTimeFieldValid('');
        expect(result).toBe(false);
    });

    it('Should return false if time is undefined', () => {
        const result = isTimeFieldValid(undefined);
        expect(result).toBe(false);
    });

    it('Should return false if time is null', () => {
        const result = isTimeFieldValid(null);
        expect(result).toBe(false);
    });

    it('Should return false if time is incorrect value', () => {
        const result = isTimeFieldValid('test');
        expect(result).toBe(false);
    });

    it('Should return false if time with incorrect format', () => {
        const result = isTimeFieldValid('24/11/2025/ 11:24');
        expect(result).toBe(false);
    });
});

describe('startDateTimeWillBeAutomaticallyUpdated', () => {
    it('Should return false if child effects has similar start date/time with disruption', () => {
        const startDate = '15/11/2025';
        const startTime = '14:11';
        const disruptions = [
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(false);
    });

    it('Should return false if child effects has later start date/time than disruption', () => {
        const startDate = '15/11/2025';
        const startTime = '14:11';
        const disruptions = [
            {
                startDate: '16/11/2025',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: '15:11',
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(false);
    });

    it('Should return false if child effects has invalid start date/time with disruption', () => {
        const startDate = '15/11/2025';
        const startTime = '14:11';
        const disruptions = [
            {
                startDate: '',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: undefined,
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(false);
    });

    it('Should return false if child effects has later start date/time and invalid values with disruption', () => {
        const startDate = '15/11/2025';
        const startTime = '14:11';
        const disruptions = [
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
            {
                startDate: '16/11/2025',
                startTime: '14:11',
            },
            {
                startDate: '',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: undefined,
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(false);
    });

    it('Should return false if disruption startTime invalid', () => {
        const startDate = '15/11/2025';
        const startTime = '';
        const disruptions = [
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(false);
    });

    it('Should return false if disruption startDate invalid', () => {
        const startDate = '';
        const startTime = '14:11';
        const disruptions = [
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(false);
    });

    it('Should return false if all startTime and startDate are incorrect', () => {
        const startDate = undefined;
        const startTime = null;
        const disruptions = [
            {
                startDate: '',
                startTime: 'test',
            },
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(false);
    });

    it('Should return false if effects is not array', () => {
        const startDate = '15/11/2025';
        const startTime = '14:11';
        const disruptions = { title: 'test' };
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(false);
    });

    it('Should return false if effects is empty array', () => {
        const startDate = '15/11/2025';
        const startTime = '14:11';
        const disruptions = [];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(false);
    });

    it('Should return true child effects has earlier start date than disruption', () => {
        const startDate = '15/11/2025';
        const startTime = '14:11';
        const disruptions = [
            {
                startDate: '14/11/2025',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(true);
    });

    it('Should return true child effects has earlier start time than disruption', () => {
        const startDate = '15/11/2025';
        const startTime = '14:11';
        const disruptions = [
            {
                startDate: '15/11/2025',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: '12:11',
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(true);
    });

    it('Should return true child effects has earlier start time than disruption and some of effect are incorrect', () => {
        const startDate = '15/11/2025';
        const startTime = '14:11';
        const disruptions = [
            {
                startDate: '14/11/2025',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: '12:11',
            },
            {
                startDate: '',
                startTime: '14:11',
            },
            {
                startDate: '15/11/2025',
                startTime: undefined,
            },
        ];
        const result = startDateTimeWillBeAutomaticallyUpdated(startDate, startTime, disruptions);
        expect(result).toBe(true);
    });
});

describe('endDateTimeWillBeAutomaticallyUpdated', () => {
    it('Should return false if effects is not array', () => {
        const endDate = '15/11/2025';
        const endTime = '14:11';
        const disruptions = { title: 'test' };
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, false);
        expect(result).toBe(false);
    });

    it('Should return false if effects is empty array', () => {
        const endDate = '15/11/2025';
        const endTime = '14:11';
        const disruptions = [];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, false);
        expect(result).toBe(false);
    });

    it('Should return false if disruption endDate invalid', () => {
        const endDate = '';
        const endTime = '14:11';
        const disruptions = [
            {
                endDate: '15/11/2025',
                endTime: '14:11',
            },
            {
                endDate: '15/11/2025',
                endTime: '14:11',
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, false);
        expect(result).toBe(false);
    });

    it('Should return false if disruption startTime invalid and it not recurrent', () => {
        const endDate = '15/11/2025';
        const endTime = '';
        const disruptions = [
            {
                endDate: '15/11/2025',
                endTime: '14:11',
            },
            {
                endDate: '15/11/2025',
                endTime: '14:11',
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, false);
        expect(result).toBe(false);
    });

    it('Should return true if disruption startTime invalid and it recurrent and effects has later end date', () => {
        const endDate = '15/11/2025';
        const endTime = '';
        const disruptions = [
            {
                endDate: '17/11/2025',
                endTime: '14:11',
            },
            {
                endDate: '15/11/2025',
                endTime: '14:11',
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, true);
        expect(result).toBe(true);
    });

    it('Should return false if child effects has similar end date/time with disruption', () => {
        const endDate = '15/11/2025';
        const endTime = '14:11';
        const disruptions = [
            {
                endDate: '15/11/2025',
                endTime: '14:11',
            },
            {
                endDate: '15/11/2025',
                endTime: '14:11',
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, false);
        expect(result).toBe(false);
    });

    it('Should return false if child effects has earlier end date with disruption', () => {
        const endDate = '15/11/2025';
        const endTime = '14:11';
        const disruptions = [
            {
                endDate: '13/11/2025',
                endTime: '14:11',
            },
            {
                endDate: '15/11/2025',
                endTime: '14:11',
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, false);
        expect(result).toBe(false);
    });

    it('Should return false if child effects has earlier end time with disruption', () => {
        const endDate = '15/11/2025';
        const endTime = '14:11';
        const disruptions = [
            {
                endDate: '15/11/2025',
                endTime: '12:11',
            },
            {
                endDate: '15/11/2025',
                endTime: '14:11',
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, false);
        expect(result).toBe(false);
    });

    it('Should return false if child effects values are incorrect', () => {
        const endDate = '15/11/2025';
        const endTime = '14:11';
        const disruptions = [
            {
                endDate: 'test',
                endTime: '12:11',
            },
            {
                endDate: '15/11/2025',
                endTime: undefined,
            },
            {
                endDate: '2025/11/11',
                endTime: '12:11',
            },
            {
                endDate: null,
                endTime: undefined,
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, false);
        expect(result).toBe(false);
    });

    it('Should return true if child effects has later end date with and some of them are incorrect', () => {
        const endDate = '15/11/2025';
        const endTime = '14:11';
        const disruptions = [
            {
                endDate: 'test',
                endTime: '12:11',
            },
            {
                endDate: '15/11/2025',
                endTime: undefined,
            },
            {
                endDate: '2025/11/11',
                endTime: '12:11',
            },
            {
                endDate: null,
                endTime: undefined,
            },
            {
                endDate: '16/11/2025',
                endTime: '12:11',
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, false);
        expect(result).toBe(true);
    });

    it('Should return true if child effects has later end date than recurrent disruption', () => {
        const endDate = '15/11/2025';
        const endTime = '';
        const disruptions = [
            {
                endDate: '17/11/2025',
                endTime: '',
            },
            {
                endDate: '15/11/2025',
                endTime: '',
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, true);
        expect(result).toBe(true);
    });

    it('Should return true if child effects has later end date with some incorrect effects than recurrent disruption', () => {
        const endDate = '15/11/2025';
        const endTime = '';
        const disruptions = [
            {
                endDate: '17/11/2025',
                endTime: '',
            },
            {
                endDate: '15/11/2025',
                endTime: '',
            },
            {
                endDate: '15/11/2025',
                endTime: undefined,
            },
            {
                endDate: '2025/11/11',
                endTime: '12:11',
            },
            {
                endDate: null,
                endTime: undefined,
            },
        ];
        const result = endDateTimeWillBeAutomaticallyUpdated(endDate, endTime, disruptions, true);
        expect(result).toBe(true);
    });
});
