import { expect } from 'chai';
import { getTitle, getDescription, getAndParseInformedEntities, flatInformedEntities, findNotificationByQuery, buildQueryParams } from './notifications';

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

describe('flatInformedEntities', () => {
    it('test case when routes under stops', () => {
        const informedEntities = [
            {
                informedEntityType: 'stop',
                routes: [
                    {
                        informedEntityType: 'route',
                        stops: [],
                        routeId: 'S088-217',
                        routeShortName: '088',
                        routeType: 3,
                    },
                    {
                        informedEntityType: 'route',
                        stops: [],
                        routeId: '502-217',
                        routeShortName: '502',
                        routeType: 3,
                    },
                ],
                stopId: '1121-095b53b3',
                stopCode: '1121',
                stopName: '2 O\'Brien Road',
            },
        ];
        const expected = [
            {
                informedEntityType: 'stop',
                routes: [
                    {
                        informedEntityType: 'route',
                        routeId: 'S088-217',
                        routeShortName: '088',
                        routeType: 3,
                        stops: [],
                    },
                    {
                        informedEntityType: 'route',
                        routeId: '502-217',
                        routeShortName: '502',
                        routeType: 3,
                        stops: [],
                    },
                ],
                stopCode: '1121',
                stopId: '1121-095b53b3',
                stopName: '2 O\'Brien Road',
            },
            {
                informedEntityType: 'route',
                routeId: 'S088-217',
                routeShortName: '088',
                routeType: 3,
                stops: [],
            },
            {
                informedEntityType: 'route',
                routeId: '502-217',
                routeShortName: '502',
                routeType: 3,
                stops: [],
            },
        ];
        expect(flatInformedEntities(informedEntities)).to.deep.equal(expected);
    });

    it('test case when stops under routes', () => {
        const informedEntities = [
            {
                informedEntityType: 'route',
                stops: [
                    {
                        informedEntityType: 'stop',
                        routes: [],
                        stopId: '9329-e7f6fe12',
                        stopCode: '9329',
                        stopName: 'Swanson Train Station 2',
                        directionId: 0,
                    },
                    {
                        informedEntityType: 'stop',
                        routes: [],
                        stopId: '9328-f6f84eac',
                        stopCode: '9328',
                        stopName: 'Swanson Train Station 1',
                        directionId: 0,
                    },
                    {
                        informedEntityType: 'stop',
                        routes: [],
                        stopId: '9322-6bc7f9b8',
                        stopCode: '9322',
                        stopName: 'Henderson Train Station 1',
                        directionId: 0,
                    },
                ],
                routeId: 'WEST-201',
                routeShortName: 'WEST',
                routeType: 2,
            },
        ];
        const expected = [
            {
                informedEntityType: 'route',
                routeId: 'WEST-201',
                routeShortName: 'WEST',
                routeType: 2,
                stops: [
                    {
                        directionId: 0,
                        informedEntityType: 'stop',
                        routes: [],
                        stopCode: '9329',
                        stopId: '9329-e7f6fe12',
                        stopName: 'Swanson Train Station 2',
                    },
                    {
                        directionId: 0,
                        informedEntityType: 'stop',
                        routes: [],
                        stopCode: '9328',
                        stopId: '9328-f6f84eac',
                        stopName: 'Swanson Train Station 1',
                    },
                    {
                        directionId: 0,
                        informedEntityType: 'stop',
                        routes: [],
                        stopCode: '9322',
                        stopId: '9322-6bc7f9b8',
                        stopName: 'Henderson Train Station 1',
                    },
                ],
            },
            {
                directionId: 0,
                informedEntityType: 'stop',
                routes: [],
                stopCode: '9329',
                stopId: '9329-e7f6fe12',
                stopName: 'Swanson Train Station 2',
            },
            {
                directionId: 0,
                informedEntityType: 'stop',
                routes: [],
                stopCode: '9328',
                stopId: '9328-f6f84eac',
                stopName: 'Swanson Train Station 1',
            },
            {
                directionId: 0,
                informedEntityType: 'stop',
                routes: [],
                stopCode: '9322',
                stopId: '9322-6bc7f9b8',
                stopName: 'Henderson Train Station 1',
            },
        ];
        expect(flatInformedEntities(informedEntities)).to.deep.equal(expected);
    });
});

describe('buildQueryParams', () => {
    it('should build params with parentDisruptionId and useNotificationEffectColumn', () => {
        const query = { parentDisruptionId: 123, disruptionId: 456, source: 'DISR' };
        const params = buildQueryParams(query, true);
        expect(params.some(p => p.columnField === 'parentSourceId')).to.equal(true);
        expect(params.some(p => p.columnField === 'sourceId')).to.equal(true);
        expect(params.some(p => p.columnField === 'sourceType')).to.equal(true);
    });

    it('should not include parentSourceId if useNotificationEffectColumn is false', () => {
        const query = { parentDisruptionId: 123, disruptionId: 456, source: 'DISR' };
        const params = buildQueryParams(query, false);
        expect(params.some(p => p.columnField === 'parentSourceId')).to.equal(false);
    });

    it('should handle missing disruptionId', () => {
        const query = { parentDisruptionId: 123, source: 'DISR' };
        const params = buildQueryParams(query, true);
        expect(params.some(p => p.columnField === 'sourceId')).to.equal(false);
    });

    it('should always include sourceType', () => {
        const query = { source: 'DISR' };
        const params = buildQueryParams(query, false);
        expect(params.some(p => p.columnField === 'sourceType')).to.equal(true);
    });
});

describe('findNotificationByQuery', () => {
    const notifications = [
        { source: { parentIdentifier: 1, identifier: 10, version: 1, title: 'A', type: 'DISR' }, notificationContentId: 'a' },
        { source: { parentIdentifier: 1, identifier: 10, version: 2, title: 'B', type: 'DISR' }, notificationContentId: 'b' },
        { source: { parentIdentifier: 2, identifier: 20, version: 1, title: 'C', type: 'DISR' }, notificationContentId: 'c' },
    ];

    it('should filter by parentDisruptionId and useNotificationEffectColumn', () => {
        const query = { parentDisruptionId: 1 };
        const result = findNotificationByQuery(query, notifications, true);
        expect(['a', 'b']).to.include(result.notificationContentId);
    });

    it('should filter by disruptionId and version', () => {
        const query = { disruptionId: 10, version: 2 };
        const result = findNotificationByQuery(query, notifications, false);
        expect(result.notificationContentId).to.equal('b');
    });

    it('should return notification with max by version and disruptionId if not specified', () => {
        const query = { disruptionId: 10 };
        const result = findNotificationByQuery(query, notifications, false);
        expect(result.notificationContentId).to.equal('c');
    });

    it('should return null if no match', () => {
        const query = { disruptionId: 999, version: 1 };
        const result = findNotificationByQuery(query, notifications, false);
        expect(result).to.equal(null);
    });

    it('should handle empty items', () => {
        const query = { disruptionId: 10, version: 1 };
        const result = findNotificationByQuery(query, [], false);
        expect(result).to.equal(null);
    });
});
