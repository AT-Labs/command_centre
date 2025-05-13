import { expect, assert } from 'chai';
import {
    formatTime,
    formatUnixTime,
    formatUnixDatetime,
    formatTimeForColumn,
    isDelayBetweenRange,
    getStopKey,
    getClosestTimeValueForFilter,
    getExpiredMessageRowClassName,
    generateUniqueID,
    getTimesFromStop,
    getAgencyDepotsOptions,
    getRandomPointWithinRadius,
    addOffsetToIncident, getDisruptionsUniqueStops,
} from './helpers';

const time = '2021-11-16 18:43:30.000Z';
const timestamp = 1637088210;
const agencies = [
    {
        agencyId: 'AM',
        agencyName: 'AT Metro',
        depots: [
            {
                depotId: '31',
                depotName: 'AT Metro West',
            },
            {
                depotId: '34',
                depotName: 'AT Metro Onehunga',
            },
            {
                depotId: '33',
                depotName: 'AT Metro South',
            },
            {
                depotId: '32',
                depotName: 'AT Metro East',
            },
        ],
    },
    {
        agencyId: 'ATMB',
        agencyName: 'AT Metro Bus',
        depots: [
            {
                depotId: '201',
                depotName: 'AT Metro',
            },
        ],
    },
    {
        agencyId: 'BAYES',
        agencyName: 'Bayes Coachlines',
        depots: [
            {
                depotId: '218',
                depotName: 'Bayes Coachlines',
            },
        ],
    },
    {
        agencyId: 'BFL',
        agencyName: 'Belaire Ferries',
        depots: [
            {
                depotId: '211',
                depotName: 'Belaire Ferries',
            },
        ],
    },
    {
        agencyId: 'EXPNZ',
        agencyName: 'Explore Group',
        depots: [
            {
                depotId: '240',
                depotName: 'Explore Group',
            },
        ],
    },
];

describe('getStopKey', () => {
    it('generate getStopkey using departureTime', () => {
        const stop = {
            stopId: '12',
            stopSequence: 3,
            departureTime: '15:00:00',
        };
        expect(getStopKey(stop)).to.equal('12-3-15:00:00');
    });
    it('generate getStopkey using arrivalTime', () => {
        const stop = {
            stopId: '12',
            stopSequence: 3,
            arrivalTime: '15:00:00',
        };
        expect(getStopKey(stop)).to.equal('12-3-15:00:00');
    });
});
describe('formatTime', () => {
    it('return formatted time with next day indicator', () => {
        const isNextDay = true;
        expect(formatTime(time, isNextDay)).to.contain('(+1)');
    });
    it('return formatted time without next day indicator', () => {
        const isNextDay = false;
        expect(formatTime(time, isNextDay)).to.not.contain('(+1)');
    });
    it('throws exception when null is passed', () => {
        const isNextDay = false;
        expect(() => formatTime(null, isNextDay)).throws(Error);
    });
    it('throws exception even when we set isNextDay to true', () => {
        const isNextDay = true;
        expect(() => formatTime(null, isNextDay)).throws(Error);
    });
});
describe('formatUnixTime', () => {
    const validTimestamp = 1647224431;
    const validSearchDate = '2022-03-13';
    const invalidTimestamp = 'not a timestamp';
    const invalidSearchDate = 'not a date';

    it('returns formatted timestamp with "(+1)" if timestamp is next day', () => {
        const result = formatUnixTime(validTimestamp, validSearchDate);
        expect(result).to.contain('(+1)');
    });

    it('returns formatted timestamp without "(+1)" if timestamp does not go over 23:59 for the day', () => {
        const result = formatUnixTime(timestamp, validSearchDate);
        expect(result).to.not.contain('(+1)');
    });

    it('throws error if timestamp and tripSignOn is invalid', () => {
        expect(() => formatUnixTime(invalidTimestamp, invalidSearchDate)).to.throw('Invalid date time');
    });
    it('throws error if search date is invalid but timestamp is valid', () => {
        expect(() => formatUnixTime(validTimestamp, invalidSearchDate)).to.throw('Invalid date time');
    });
    it('throws error if search date is valid but timestamp is invalid', () => {
        expect(() => formatUnixTime(invalidTimestamp, validSearchDate)).to.throw('Invalid date time');
    });
});
describe('formatUnixDatetime', () => {
    it('return formatted date time with next day indicator', () => {
        const isNextDay = true;
        expect(formatUnixDatetime(timestamp, isNextDay)).to.contain('(+1)');
    });
    it('return formatted date time without next day indicator', () => {
        const isNextDay = false;
        expect(formatUnixDatetime(timestamp, isNextDay)).to.not.contain('(+1)');
    });
});
describe('formatTimeForColumn', () => {
    const dateToCompare = '20220428';
    it('return date formatted for column with next day indicator', () => {
        expect(formatTimeForColumn('2022-04-29T12:00:04+12:00', dateToCompare)).to.equal('12:00:04 (+1)');
    });
    it('return date formatted for column should not contain next day indicator', () => {
        expect(formatTimeForColumn('2022-04-28T12:00:04+12:00', dateToCompare)).to.equal('12:00:04');
    });
    it('return empty when time is undefined', () => {
        // Using equal() as .empty triggers eslint complain
        expect(formatTimeForColumn(undefined, false)).equal('');
    });
    it('return empty when time is undefined even if nextDay is true', () => {
        // Using equal() as .empty triggers eslint complain
        expect(formatTimeForColumn(undefined, true)).equal('');
    });
});
describe('isDelayBetweenRage', () => {
    it('delay is not within range', () => {
        expect(isDelayBetweenRange(10, [2, 300])).equal(false);
    });
    it('delay is within range', () => {
        expect(isDelayBetweenRange(100, [1, 3])).equal(true);
    });
});
describe('getClosestTimeValueForFilter', () => {
    it('format when rounding down minute', () => {
        expect(getClosestTimeValueForFilter('23:45:00')).to.equal('23:30');
    });
    it('format when rounding up minute', () => {
        expect(getClosestTimeValueForFilter('23:15:00')).to.equal('23:00');
    });
    it('format when no seconds specified', () => {
        expect(getClosestTimeValueForFilter('23:15')).to.equal('23:00');
    });
    it('return empty when unexpected string is given', () => {
        expect(getClosestTimeValueForFilter('2022-12-12 22:15:00')).to.equal('');
    });
    it('return empty when no value is passed', () => {
        expect(getClosestTimeValueForFilter()).to.equal('');
    });
});
describe('getExpiredMessageRowClassName', () => {
    it('isCurrent is false and should return class', () => {
        expect(getExpiredMessageRowClassName({ isCurrent: false })).to.equal('bg-at-ocean-tint-10 text-muted');
    });
    it('isCurrent is true and should return empty string', () => {
        expect(getExpiredMessageRowClassName({ isCurrent: true })).to.equal('');
    });
});
describe('generateUniqueID', () => {
    it('generates unique id', () => {
        const id1 = generateUniqueID();
        const id2 = generateUniqueID();
        expect(id1).to.not.equal(id2);
    });
});

describe('getTimesFromStop', () => {
    it('should return correct scheduledTime and time object', () => {
        const searchDate = new Date('2023-03-22T00:00:00.000Z');
        const stop = {
            arrival: {
                scheduledTime: '1648018800',
                time: '1648018200',
            },
            departure: {
                scheduledTime: '1648035600',
                time: '1648036200',
            },
            stopLat: -37.02351,
            stopLon: 174.89562,
            stopCode: '6048',
            stopName: 'Stop A Manurewa Station',
            exitDistance: 30,
            stopSequence: 52,
            entryDistance: 30,
            occupancyStatus: null,
        };
        const expected = {
            scheduledTime: {
                arrival: '20:00:00',
                departure: '00:40:00',
            },
            time: {
                arrival: '19:50:00',
                departure: '00:50:00',
            },
        };
        const result = getTimesFromStop(stop, searchDate);
        expect(result.scheduledTime.arrival).to.equal(expected.scheduledTime.arrival);
        expect(result.scheduledTime.departure).to.equal(expected.scheduledTime.departure);
        expect(result.time.arrival).to.equal(expected.time.arrival);
        expect(result.time.departure).to.equal(expected.time.departure);
    });
});

describe('getAgencyDepotsOptions', () => {
    it('should return an empty array when selectedAgency is undefined', () => {
        assert.deepStrictEqual(getAgencyDepotsOptions(undefined, agencies), []);
    });

    it('should return an array of AM depots', () => {
        assert.deepStrictEqual(getAgencyDepotsOptions('AM', agencies), [
            {
                label: 'AT Metro West',
                value: '31',
            },
            {
                label: 'AT Metro Onehunga',
                value: '34',
            },
            {
                label: 'AT Metro South',
                value: '33',
            },
            {
                label: 'AT Metro East',
                value: '32',
            },
        ]);
    });
});

describe('getRandomPointWithinRadius', () => {
    it('should return a point within the specified radius', () => {
        const x = 0;
        const y = 0;
        const radius = 5;

        for (let i = 0; i < 1000; i++) {
            const [xPoint, yPoint] = getRandomPointWithinRadius(x, y, radius);
            const distance = Math.sqrt((xPoint - x) ** 2 + (yPoint - y) ** 2);
            expect(distance).to.be.at.most(radius);
        }
    });
});

describe('addOffsetToIncident', () => {
    it('should add an offset to the incident coordinates if conditions are met', () => {
        const incident = {
            isPoint: false,
            features: [
                {
                    coordinates: [
                        [10, 20],
                    ],
                },
            ],
        };

        const modifiedIncident = addOffsetToIncident(incident);
        expect(modifiedIncident).to.not.deep.equal(incident);
        const originalCoordinates = incident.features[0].coordinates[0];
        const newCoordinates = modifiedIncident.features[0].coordinates[0];

        const distance = Math.sqrt((newCoordinates[0] - originalCoordinates[0]) ** 2 + (newCoordinates[1] - originalCoordinates[1]) ** 2);
        expect(distance).to.be.at.most(0.0001);
    });

    it('should return the same incident if it is a point', () => {
        const incident = {
            isPoint: true,
            features: [
                {
                    coordinates: [
                        [10, 20],
                    ],
                },
            ],
        };

        const modifiedIncident = addOffsetToIncident(incident);
        expect(modifiedIncident).to.deep.equal(incident);
    });

    it('should return the same incident if coordinates are not properly defined', () => {
        const incident = {
            isPoint: false,
            features: [
                {
                    coordinates: [],
                },
            ],
        };

        const modifiedIncident = addOffsetToIncident(incident);
        expect(modifiedIncident).to.deep.equal(incident);
    });
});

describe('getDisruptionsUniqueStops', () => {
    const disruptions = [
        {
            disruptionId: 138304,
            incidentNo: 'DISR138304',
            mode: '',
            affectedEntities: [
                {
                    stopId: '3722-c965b636',
                    stopName: 'Bush Road/William Pickering Drive',
                    stopCode: '3722',
                    locationType: 0,
                    stopLat: -36.75198,
                    stopLon: 174.70667,
                    parentStation: null,
                    platformCode: null,
                    routeType: 3,
                    text: '3722 - Bush Road/William Pickering Drive',
                    category: {
                        type: 'stop',
                        icon: 'stop',
                        label: 'Stops',
                    },
                    icon: 'stop',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'route',
                },
                {
                    stopId: '8076-bf09e8e8',
                    stopName: 'Ponsonby Road/Picton Street',
                    stopCode: '8076',
                    locationType: 0,
                    stopLat: -36.85665,
                    stopLon: 174.74638,
                    parentStation: null,
                    platformCode: null,
                    routeType: 3,
                    text: '8076 - Ponsonby Road/Picton Street',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                },
            ],
            impact: 'BUS_STOP_MOVED',
            cause: 'BREAKDOWN',
            header: 'Disruption - MW',
            severity: 'SERIOUS',
        },
        {
            disruptionId: 138292,
            incidentNo: 'DISR138292',
            mode: '',
            affectedEntities: [
                {
                    stopId: '8075-ec7774a9',
                    stopName: 'Fitzroy Street',
                    stopCode: '8075',
                    locationType: 0,
                    stopLat: -36.85694,
                    stopLon: 174.74404,
                    parentStation: null,
                    platformCode: null,
                    routeType: 3,
                    text: '8075 - Fitzroy Street',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                },
                {
                    stopId: '8076-bf09e8e8',
                    stopName: 'Ponsonby Road/Picton Street',
                    stopCode: '8076',
                    locationType: 0,
                    stopLat: -36.85665,
                    stopLon: 174.74638,
                    parentStation: null,
                    platformCode: null,
                    routeType: 3,
                    text: '8076 - Ponsonby Road/Picton Street',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                },
            ],
            impact: 'BUS_STOP_CLOSED',
            cause: 'CAPACITY_ISSUE',
            status: 'in-progress',
            header: 'Test - non-draft 1',
            severity: 'SERIOUS',
        },
    ];

    it('should return unique stops from disruptions', () => {
        const expectedUniqueStops = [
            {
                stopId: '8076-bf09e8e8',
                stopName: 'Ponsonby Road/Picton Street',
                stopCode: '8076',
                locationType: 0,
                stopLat: -36.85665,
                stopLon: 174.74638,
                parentStation: null,
                platformCode: null,
                routeType: 3,
                text: '8076 - Ponsonby Road/Picton Street',
                valueKey: 'stopCode',
                labelKey: 'stopCode',
                type: 'stop',
            },
            {
                stopId: '8075-ec7774a9',
                stopName: 'Fitzroy Street',
                stopCode: '8075',
                locationType: 0,
                stopLat: -36.85694,
                stopLon: 174.74404,
                parentStation: null,
                platformCode: null,
                routeType: 3,
                text: '8075 - Fitzroy Street',
                valueKey: 'stopCode',
                labelKey: 'stopCode',
                type: 'stop',
            },
        ];

        const uniqueStops = getDisruptionsUniqueStops(disruptions);
        expect(uniqueStops).to.deep.equal(expectedUniqueStops);
    });
});
