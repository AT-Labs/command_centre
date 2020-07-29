import { expect } from 'chai';

import { getActiveRouteVariant, getFilteredRouteVariants, getFilteredRouteVariantsTotal, getRouteVariantsForSearch } from './routeVariants';

const mockStoreRoutes = {
    1: {
        routeShortName: '1',
        routeType: 3,
        routeVariants: [{
            routeVariantId: '00001',
            routeLongName: 'variant1',
            routeShortName: '1',
            routeType: 3,
        }, {
            routeVariantId: '00002',
            routeLongName: 'variant2',
            routeShortName: '1',
            routeType: 3,
        }],
        agencyId: 'NZB',
    },
    2: {
        routeShortName: '2',
        routeType: 4,
        routeVariants: [{
            routeVariantId: '00003',
            routeLongName: 'variant3',
            routeShortName: '2',
            routeType: 4,
        }, {
            routeVariantId: '00004',
            routeLongName: 'variant4',
            routeShortName: '2',
            routeType: 4,
        }, {
            routeVariantId: '00005',
            routeLongName: 'variant5',
            routeShortName: '2',
            routeType: 4,
        }],
        agencyId: 'WBC',
    },
};

const mockStoreRouteVariants = {
    '00001': {
        routeLongName: 'variant1',
        routeVariantId: '00001',
        routeShortName: '1',
        routeType: 3,
        agencyId: 'NZB',
        serviceStartDate: '20190404',
        serviceEndDate: '20190406',
    },
    '00002': {
        routeLongName: 'variant2',
        routeVariantId: '00002',
        routeShortName: '1',
        routeType: 3,
        agencyId: 'NZB',
        serviceStartDate: '20190404',
        serviceEndDate: '20190406',
    },
    '00003': {
        routeLongName: 'variant3',
        routeVariantId: '00003',
        routeShortName: '2',
        routeType: 4,
        agencyId: 'WBC',
        serviceStartDate: '20190404',
        serviceEndDate: '20190406',
    },
    '00004': {
        routeLongName: 'variant4',
        routeVariantId: '00004',
        routeShortName: '2',
        routeType: 4,
        agencyId: 'WBC',
        serviceStartDate: '20190404',
        serviceEndDate: '20190406',
    },
    '00005': {
        routeLongName: 'variant5',
        routeVariantId: '00005',
        routeShortName: '2',
        routeType: 4,
        agencyId: 'WBC',
        serviceStartDate: '20190403',
        serviceEndDate: '20190407',
    },
};

const mockActiveRouteVariant = '00003';

const mockServiceDate = '2019-04-05';

const mockState = (options) => {
    const { filters, serviceDate } = options;
    return {
        control: {
            routes: {
                routes: {
                    all: mockStoreRoutes,
                },
                routeVariants: {
                    all: mockStoreRouteVariants,
                    active: mockActiveRouteVariant,
                },
                filters: filters || {},
            },
            serviceDate: {
                date: serviceDate || mockServiceDate,
            },
        },
    };
};

describe('Route variants selectors', () => {
    context('getFilteredRouteVariants and getFilteredRouteVariantsTotal', () => {
        it('returns correct route variants when filter by routeType', async () => {
            const filters = {
                routeType: 4,
            };
            expect(
                getFilteredRouteVariants(mockState({ filters })),
            ).to.eql([mockStoreRouteVariants['00003'], mockStoreRouteVariants['00004'], mockStoreRouteVariants['00005']]);
            expect(getFilteredRouteVariantsTotal(mockState({ filters }))).to.eql(3);
        });

        it('returns correct route variants when filter by agencyId', async () => {
            const filters = {
                agencyId: 'NZB',
            };
            expect(
                getFilteredRouteVariants(mockState({ filters })),
            ).to.eql([mockStoreRouteVariants['00001'], mockStoreRouteVariants['00002']]);
            expect(getFilteredRouteVariantsTotal(mockState({ filters }))).to.eql(2);
        });

        it('returns correct route variants when filter by routeShortName', async () => {
            const filters = {
                routeShortName: '2',
            };
            expect(
                getFilteredRouteVariants(mockState({ filters })),
            ).to.eql([mockStoreRouteVariants['00003'], mockStoreRouteVariants['00004'], mockStoreRouteVariants['00005']]);
            expect(getFilteredRouteVariantsTotal(mockState({ filters }))).to.eql(3);
        });

        it('returns correct route variants when filter by routeVariantId', async () => {
            const filters = {
                routeVariantId: '00003',
            };
            expect(getFilteredRouteVariants(mockState({ filters }))).to.eql([mockStoreRouteVariants['00003']]);
            expect(getFilteredRouteVariantsTotal(mockState({ filters }))).to.eql(1);
        });

        it('returns correct route variants when serviceDate is in the range of serviceStartDate and serviceEndDate', async () => {
            const serviceDate1 = '2019-04-03';
            expect(getFilteredRouteVariants(mockState({ serviceDate: serviceDate1 }))).to.eql([mockStoreRouteVariants['00005']]);
            const serviceDate2 = '2019-04-07';
            expect(getFilteredRouteVariants(mockState({ serviceDate: serviceDate2 }))).to.eql([mockStoreRouteVariants['00005']]);
        });

        it('returns correct route variants when serviceDate is before serviceStartDate', async () => {
            const serviceDate = '2019-04-02';
            expect(getFilteredRouteVariants(mockState({ serviceDate }))).to.eql([]);
        });

        it('returns correct route variants when serviceDate is after serviceEndDate', async () => {
            const serviceDate = '2019-04-08';
            expect(getFilteredRouteVariants(mockState({ serviceDate }))).to.eql([]);
        });
    });

    context('getRouteVariantsForSearch', () => {
        it('returns correct route variants when filter by routeType', async () => {
            const filters = {
                routeType: 4,
            };
            expect(
                getRouteVariantsForSearch(mockState({ filters })),
            ).to.eql([mockStoreRouteVariants['00003'], mockStoreRouteVariants['00004'], mockStoreRouteVariants['00005']]);
        });

        it('returns correct route variants when filter by agencyId', async () => {
            const filters = {
                agencyId: 'NZB',
            };
            expect(
                getRouteVariantsForSearch(mockState({ filters })),
            ).to.eql([mockStoreRouteVariants['00001'], mockStoreRouteVariants['00002']]);
        });

        it('is not affected by routeShortName filter', async () => {
            const filters = {
                routeShortName: '2',
            };
            expect(
                getRouteVariantsForSearch(mockState({ filters })),
            ).to.eql([
                mockStoreRouteVariants['00001'],
                mockStoreRouteVariants['00002'],
                mockStoreRouteVariants['00003'],
                mockStoreRouteVariants['00004'],
                mockStoreRouteVariants['00005'],
            ]);
        });

        it('is not affected by routeVariantId filter', async () => {
            const filters = {
                routeVariantId: '00003',
            };
            expect(getRouteVariantsForSearch(mockState({ filters }))).to.eql([
                mockStoreRouteVariants['00001'],
                mockStoreRouteVariants['00002'],
                mockStoreRouteVariants['00003'],
                mockStoreRouteVariants['00004'],
                mockStoreRouteVariants['00005'],
            ]);
        });
    });

    context('getActiveRouteVariant', () => {
        it('should return correct active route variant', async () => {
            expect(getActiveRouteVariant(mockState({}))).to.eql(mockStoreRouteVariants['00003']);
        });
    });
});
