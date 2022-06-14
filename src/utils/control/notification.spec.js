import { expect } from 'chai';
import { getTitle, getDescription } from './notifications';

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
