import { expect } from 'chai';
import { getTitle, getDescription, getAndParseInformedEntities } from './notifications';

const data = {
    items: [
        {
            activePeriods: [
                {
                    startTime: '1653012180',
                    endTime: '1658973900',
                },
            ],
            informedEntities: [
                {
                    stopId: '123-02f15431',
                    stopCode: '123',
                    stopName: 'Fruitvale Rd Train Station',
                    routeId: null,
                    routeShortName: null,
                    routeType: 0,
                },
            ],
            name: 'title',
            channel: 'service-alert',
            content: 'Stop closed',
            _links: {
                permissions: [
                    {
                        _rel: 'view',
                    },
                    {
                        _rel: 'edit',
                    },
                ],
            },
        },
        {
            activePeriods: [
                {
                    startTime: '1653012180',
                    endTime: '1658973900',
                },
            ],
            informedEntities: [
                {
                    stopId: '123-02f15431',
                    stopCode: '123',
                    stopName: 'Fruitvale Rd Train Station',
                    routeId: null,
                    routeShortName: null,
                    routeType: 0,
                },
            ],
            name: 'description',
            channel: 'service-alert',
            content:
                'Fri May 20 2:03pm to Thu Jul 28 2:05pm the following stops are impacted \n - stop closed for stop 123 at Fruitvale Rd Train Station for all routes',
            _links: {
                permissions: [
                    {
                        _rel: 'view',
                    },
                    {
                        _rel: 'edit',
                    },
                ],
            },
        },
    ],
    totalResults: 2,
    _links: {
        permissions: [
            {
                _rel: 'view',
            },
            {
                _rel: 'edit',
            },
        ],
    },
};

const wrongData = {
    items: [
        {
            activePeriods: [
                {
                    startTime: '1653012180',
                    endTime: '1658973900',
                },
            ],
            informedEntities: [
                {
                    stopId: '123-02f15431',
                    stopCode: '123',
                    stopName: 'Fruitvale Rd Train Station',
                    routeId: null,
                    routeShortName: null,
                    routeType: 0,
                },
            ],
            channel: 'service-alert',
            content: 'Stop closed',
            _links: {
                permissions: [
                    {
                        _rel: 'view',
                    },
                    {
                        _rel: 'edit',
                    },
                ],
            },
        },
        {
            activePeriods: [
                {
                    startTime: '1653012180',
                    endTime: '1658973900',
                },
            ],
            informedEntities: [
                {
                    stopId: '123-02f15431',
                    stopCode: '123',
                    stopName: 'Fruitvale Rd Train Station',
                    routeId: null,
                    routeShortName: null,
                    routeType: 0,
                },
            ],
            channel: 'service-alert',
            content:
                'Fri May 20 2:03pm to Thu Jul 28 2:05pm the following stops are impacted \n - stop closed for stop 123 at Fruitvale Rd Train Station for all routes',
            _links: {
                permissions: [
                    {
                        _rel: 'view',
                    },
                    {
                        _rel: 'edit',
                    },
                ],
            },
        },
    ],
    totalResults: 2,
    _links: {
        permissions: [
            {
                _rel: 'view',
            },
            {
                _rel: 'edit',
            },
        ],
    },
};
describe('getTitle', () => {
    it('test if the object have the valid title', () => {
        expect(getTitle(data.items)).to.equal('Stop closed');
    });

    it('test if the function return an empty string if the title is not valid', () => {
        expect(getTitle(wrongData.items)).to.equal('');
    });
});

describe('getDescription', () => {
    it('test if the object have the valid description', () => {
        expect(getDescription(data.items)).to.equal(
            'Fri May 20 2:03pm to Thu Jul 28 2:05pm the following stops are impacted \n - stop closed for stop 123 at Fruitvale Rd Train Station for all routes',
        );
    });

    it('test if the function return an empty string if the description is not valid.', () => {
        expect(getDescription(wrongData.items)).to.equal('');
    });
});

describe('getAndParseInformedEntities', () => {
    it('should return route affected entity when informedEntityType is route with no stops', () => {
        const informedEntities = [{
            informedEntityType: 'route',
            stops: [],
            routeId: 'AIR-221',
            routeShortName: 'AIR',
            routeType: 3,
        }];
        expect(getAndParseInformedEntities(informedEntities)).to.deep.equal([{
            routeId: 'AIR-221',
            routeShortName: 'AIR',
            routeType: 3,
            type: 'route',
        }]);
    });

    it('should return route affected entity when informedEntityType is route with stops', () => {
        const informedEntities = [{
            informedEntityType: 'route',
            stops: [
                {
                    informedEntityType: 'stop',
                    routes: [],
                    stopId: '6925-157d9f39',
                    stopCode: '6925',
                    stopName: 'Ronwood Avenue/Hayman Park',
                },
                {
                    informedEntityType: 'stop',
                    routes: [],
                    stopId: '1791-5e1a78f6',
                    stopCode: '1791',
                    stopName: 'Stop A Puhinui',
                },
            ],
            routeId: 'AIR-221',
            routeShortName: 'AIR',
            routeType: 3,
        }];
        expect(getAndParseInformedEntities(informedEntities)).to.deep.equal([
            {
                routeId: 'AIR-221',
                routeShortName: 'AIR',
                routeType: 3,
                stopId: '6925-157d9f39',
                stopCode: '6925',
                stopName: 'Ronwood Avenue/Hayman Park',
                text: '6925',
                type: 'route',
            },
            {
                routeId: 'AIR-221',
                routeShortName: 'AIR',
                routeType: 3,
                stopId: '1791-5e1a78f6',
                stopCode: '1791',
                stopName: 'Stop A Puhinui',
                text: '1791',
                type: 'route',
            },
        ]);
    });

    it('should return stop affected entity when informedEntityType is stop with no routes', () => {
        const informedEntities = [
            {
                informedEntityType: 'stop',
                routes: [],
                stopId: '8018-e3724964',
                stopCode: '8018',
                stopName: 'Pt Chevalier Road/Pt Chevalier Shops',
            },
        ];
        expect(getAndParseInformedEntities(informedEntities)).to.deep.equal([{
            stopId: '8018-e3724964',
            stopCode: '8018',
            stopName: 'Pt Chevalier Road/Pt Chevalier Shops',
            text: '8018',
            type: 'stop',
        }]);
    });

    it('should return stop affected entity when informedEntityType is stop with routes', () => {
        const informedEntities = [
            {
                informedEntityType: 'stop',
                routes: [
                    {
                        informedEntityType: 'route',
                        stops: [],
                        routeId: '66-206',
                        routeShortName: '66',
                        routeType: 3,
                    },
                    {
                        informedEntityType: 'route',
                        stops: [],
                        routeId: '650-202',
                        routeShortName: '650',
                        routeType: 3,
                    },
                ],
                stopId: '8018-e3724964',
                stopCode: '8018',
                stopName: 'Pt Chevalier Road/Pt Chevalier Shops',
            },
        ];
        expect(getAndParseInformedEntities(informedEntities)).to.deep.equal([
            {
                stopId: '8018-e3724964',
                stopCode: '8018',
                stopName: 'Pt Chevalier Road/Pt Chevalier Shops',
                text: '8018',
                routeId: '66-206',
                routeShortName: '66',
                routeType: 3,
                type: 'stop',
            },
            {
                stopId: '8018-e3724964',
                stopCode: '8018',
                stopName: 'Pt Chevalier Road/Pt Chevalier Shops',
                text: '8018',
                routeId: '650-202',
                routeShortName: '650',
                routeType: 3,
                type: 'stop',
            },
        ]);
    });
});
