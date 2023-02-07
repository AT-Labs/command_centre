import moment from 'moment';
import { transformPassengerCountToTreeData, getPassengerCountTotal, getAllChildStopCodesByStops, extendPassengerCountData } from './disruption-passenger-impact';
import { DISRUPTION_TYPE } from '../../types/disruptions-types';

const allStops = {
    9001: {
        parent_stop_code: '133',
        stop_code: '9001',
        stop_name: 'Britomart Train Station 1',
    },
    9002: {
        parent_stop_code: '133',
        stop_code: '9002',
        stop_name: 'Britomart Train Station 2',
    },
    133: {
        stop_code: '133',
        stop_name: 'Britomart Train Station',
    },
};

const allRoutes = {
    'WEST-201': {
        route_id: 'WEST-201',
        route_short_name: 'WEST',
    },
    'STH-201': {
        route_id: 'STH-201',
        route_short_name: 'STH',
    },
};

const rawPassengerCountData = [{
    routeId: 'STH-201',
    stopCode: '9100',
    parentStopCode: '115',
    monday: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0],
    tuesday: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    wednesday: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    thursday: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    friday: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    saturday: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    sunday: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0],
}, {
    routeId: 'STH-201',
    stopCode: '9101',
    parentStopCode: '115',
    monday: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    tuesday: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    wednesday: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    thursday: [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    friday: [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    saturday: [6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    sunday: [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
}];

describe('transformPassengerCountToTreeData', () => {
    test('Should summarise impact passenger count in 24 hours for each day', () => {
        const result = transformPassengerCountToTreeData(rawPassengerCountData, DISRUPTION_TYPE.ROUTES);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    monday: 3,
                    tuesday: 0,
                    wednesday: 0,
                    thursday: 8,
                    friday: 3,
                    saturday: 2,
                    sunday: 4,
                }),
            ]),
        );
    });

    test('Stop base disruption: Should aggregate the result and generate records for parent stop, route', () => {
        const result = transformPassengerCountToTreeData(rawPassengerCountData, DISRUPTION_TYPE.STOPS);
        expect(result.length).toEqual(2);
        expect(result).toEqual(
            expect.arrayContaining([{
                id: '115_STH-201',
                path: ['115', 'STH-201'],
                routeId: 'STH-201',
                monday: 4,
                tuesday: 2,
                wednesday: 3,
                thursday: 12,
                friday: 8,
                saturday: 8,
                sunday: 11,
            }]),
        );
        expect(result).toEqual(
            expect.arrayContaining([{
                id: '115',
                path: ['115'],
                parentStopCode: '115',
                monday: 4,
                tuesday: 2,
                wednesday: 3,
                thursday: 12,
                friday: 8,
                saturday: 8,
                sunday: 11,
            }]),
        );
    });

    test('Route base disruption: Should aggregate the result and generate records for child stop, parent stop, route', () => {
        const result = transformPassengerCountToTreeData(rawPassengerCountData, DISRUPTION_TYPE.ROUTES);
        expect(result.length).toEqual(4);
        expect(result).toEqual(
            expect.arrayContaining([{
                id: 'STH-201_115_9100',
                path: ['STH-201', '115', '9100'],
                stopCode: '9100',
                monday: 3,
                tuesday: 0,
                wednesday: 0,
                thursday: 8,
                friday: 3,
                saturday: 2,
                sunday: 4,
            }]),
        );
        expect(result).toEqual(
            expect.arrayContaining([{
                id: 'STH-201_115_9101',
                path: ['STH-201', '115', '9101'],
                stopCode: '9101',
                monday: 1,
                tuesday: 2,
                wednesday: 3,
                thursday: 4,
                friday: 5,
                saturday: 6,
                sunday: 7,
            }]),
        );
        expect(result).toEqual(
            expect.arrayContaining([{
                id: 'STH-201_115',
                path: ['STH-201', '115'],
                parentStopCode: '115',
                monday: 4,
                tuesday: 2,
                wednesday: 3,
                thursday: 12,
                friday: 8,
                saturday: 8,
                sunday: 11,
            }]),
        );
        expect(result).toEqual(
            expect.arrayContaining([{
                id: 'STH-201',
                path: ['STH-201'],
                routeId: 'STH-201',
                monday: 4,
                tuesday: 2,
                wednesday: 3,
                thursday: 12,
                friday: 8,
                saturday: 8,
                sunday: 11,
            }]),
        );
    });
});

describe('getPassengerCountTotal', () => {
    const passengerCountData = [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    ].map(day => ({ [day]: new Array(24).fill(1) }));

    it('should sum all passenger count data when disruption is not recurrent', () => {
        expect(getPassengerCountTotal(passengerCountData, false)).toEqual(168);
    });

    it('should sum passenger count data filtering by week day and time when disruption is recurrent', () => {
        const recurrencePattern = {
            byweekday: [1, 2, 5, 6],
            dtstart: moment.utc('2022-12-28T14:00:00.000Z').toDate(),
            until: moment.utc('2023-01-01T16:00:00.000Z').toDate(),
            freq: 2,
        };
        expect(getPassengerCountTotal(passengerCountData, true, recurrencePattern, '2')).toEqual(9);
    });
});

describe('getAllChildStopCodesByStops', () => {
    it('Should get all child stops code if the input stop is a parent station', () => {
        const affectedStops = [
            { stopCode: '133', locationType: 1 },
            { stopCode: '9100', locationType: 0 },
        ];
        expect(getAllChildStopCodesByStops(affectedStops, allStops)).toEqual(['9001', '9002', '9100']);
    });
});

describe('extendPassengerCountData', () => {
    it('Should extend data with route name, stop name', () => {
        const passengerCountTreeData = [
            { id: 'STH-201_115_9001', stopCode: '9001' },
            { id: 'STH-201_115_9001', stopCode: '9001', parentStopCode: '133' },
            { id: 'STH-201_115_9001', routeId: 'STH-201' },
            { id: 'STH-201_115_9008', stopCode: '9008' },

        ];
        expect(extendPassengerCountData(passengerCountTreeData, allRoutes, allStops)).toEqual(
            [
                { id: 'STH-201_115_9001', stopCode: '9001', stopName: 'Britomart Train Station 1' },
                { id: 'STH-201_115_9001', stopCode: '9001', stopName: 'Britomart Train Station 1', parentStopCode: '133', parentStopName: 'Britomart Train Station' },
                { id: 'STH-201_115_9001', routeId: 'STH-201', routeShortName: 'STH' },
                { id: 'STH-201_115_9008', stopCode: '9008', stopName: 'Stop not available' },
            ],
        );
    });
});
