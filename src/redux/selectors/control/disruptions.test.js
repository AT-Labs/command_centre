import { expect } from 'chai';

import { getFilteredDisruptions } from './disruptions';

const mockStoreDisruptions = [
    {
        disruptionId: 1,
        incidentNo: 'DISR00001',
        mode: 'Train',
        affectedEntities: [
            {
                routeId: 'WEST-201',
                routeShortName: 'WEST',
                routeType: 2,
            },
        ],
        impact: 'REDUCED_SERVICE',
        cause: 'TECHNICAL_PROBLEM',
        startTime: '2021-08-31T00:00:00.000Z',
        endTime: '2021-08-31T23:59:59.999Z',
        status: 'resolved',
        description: 'Test',
    },
    {
        disruptionId: 2,
        incidentNo: 'DISR00002',
        mode: 'Train',
        affectedEntities: [
            {
                routeId: 'EAST-201',
                routeShortName: 'EAST',
                routeType: 2,
            },
        ],
        impact: 'REDUCED_SERVICE',
        cause: 'TECHNICAL_PROBLEM',
        startTime: '2021-09-01T00:00:00.000Z',
        endTime: null,
        status: 'in-progress',
        description: 'Test',
    },
    {
        disruptionId: 3,
        incidentNo: 'DISR00003',
        mode: 'Train',
        affectedEntities: [
            {
                routeId: 'STH-201',
                routeShortName: 'STH',
                routeType: 2,
            },
        ],
        impact: 'REDUCED_SERVICE',
        cause: 'TECHNICAL_PROBLEM',
        startTime: '2021-09-01T00:00:00.001Z',
        endTime: null,
        status: 'in-progress',
        description: 'Test',
    },
    {
        disruptionId: 4,
        incidentNo: 'DISR00004',
        mode: 'Train',
        affectedEntities: [
            {
                stopId: '1-133',
                stopCode: '133',
                stopLat: -36.84429,
                stopLon: 174.76847,
                valueKey: 'stopId',
                labelKey: 'stopCode',
                type: 'stop',
                checked: true,
            },
        ],
        impact: 'REDUCED_SERVICE',
        cause: 'TECHNICAL_PROBLEM',
        startTime: '2021-09-01T12:00:00.000Z',
        endTime: '2021-09-01T18:00:00.000Z',
        status: 'resolved',
        description: 'Test',
    },
    {
        disruptionId: 5,
        incidentNo: 'DISR00005',
        mode: 'Train',
        affectedEntities: [
            {
                stopId: '1-133',
                stopCode: '133',
                stopLat: -36.84429,
                stopLon: 174.76847,
                valueKey: 'stopId',
                labelKey: 'stopCode',
                type: 'stop',
                checked: true,
            },
        ],
        impact: 'REDUCED_SERVICE',
        cause: 'TECHNICAL_PROBLEM',
        startTime: '2021-09-30T00:00:00.000Z',
        endTime: '2021-09-30T23:59:59.999Z',
        status: 'not-started',
        description: 'Test',
    },
];

const mockStateWithFilters = filters => ({
    control: {
        disruptions: {
            disruptions: mockStoreDisruptions,
            filters: {
                selectedEntity: {},
                selectedStatus: '',
                selectedStartDate: null,
                selectedEndDate: null,
                ...filters,
            },
        },
    },
});

describe('Filtered disruptions', () => {
    context('When route is selected', () => {
        it('should return an array with all disruptions that include the selected route', () => {
            const filters = {
                selectedEntity: {
                    text: 'EAST',
                    data: {
                        route_id: 'EAST-201',
                    },
                },
            };
            expect(getFilteredDisruptions(mockStateWithFilters(filters))).to.deep.equal([
                mockStoreDisruptions[1],
            ]);
        });
    });

    context('When status is selected', () => {
        it('should return an array with all disruptions in the selected status', () => {
            const filters = {
                selectedStatus: 'resolved',
            };
            expect(getFilteredDisruptions(mockStateWithFilters(filters))).to.deep.equal([
                mockStoreDisruptions[0],
                mockStoreDisruptions[3],
            ]);
        });
    });

    context('When start date is selected', () => {
        it('should return an array with all disruptions that are active or ended after the selected date', () => {
            const filters = {
                selectedStartDate: new Date('September 1 2021 00:00:00.000Z'),
            };
            expect(getFilteredDisruptions(mockStateWithFilters(filters))).deep.to.equal([
                mockStoreDisruptions[1],
                mockStoreDisruptions[2],
                mockStoreDisruptions[3],
                mockStoreDisruptions[4],
            ]);
        });
    });

    context('When end date is selected', () => {
        it('should return an array with all disruptions that started before the selected date', () => {
            const filters = {
                selectedEndDate: new Date('September 1 2021 00:00:00.000Z'),
            };
            expect(getFilteredDisruptions(mockStateWithFilters(filters))).deep.to.equal([
                mockStoreDisruptions[0],
                mockStoreDisruptions[1],
            ]);
        });
    });

    context('When all filters are selected', () => {
        it('should return an array with all disruptions that satisfy all filters condition', () => {
            const filters = {
                selectedEntity: {
                    text: '133 - Britomart Train Station',
                    data: {
                        stop_id: '1-133',
                    },
                },
                selectedStatus: 'resolved',
                selectedStartDate: new Date('September 1 2021 00:00:00.000Z'),
                selectedEndDate: new Date('September 1 2021 23:59:59.999Z'),
            };
            expect(getFilteredDisruptions(mockStateWithFilters(filters))).deep.to.equal([
                mockStoreDisruptions[3],
            ]);
        });
    });
});
