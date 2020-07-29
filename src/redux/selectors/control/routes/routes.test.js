import { expect } from 'chai';

import { getFilteredRoutes, getFilteredRoutesTotal, getRoutesForSearch, getActiveRoute } from './routes';

const mockStoreRoutes = {
    3: {
        routeShortName: '3',
        routeType: 3,
        routeVariants: [{
            routeVariantId: '00005',
            routeLongName: 'variant5',
        }, {
            routeVariantId: '00006',
            routeLongName: 'variant6',
        }],
        agencyId: 'NZB',
        agencyAgnostic: true,
    },
    1: {
        routeShortName: '1',
        routeType: 3,
        routeVariants: [{
            routeVariantId: '00001',
            routeLongName: 'variant1',
        }, {
            routeVariantId: '00002',
            routeLongName: 'variant2',
        }],
        agencyId: 'NZB',
        agencyAgnostic: true,
    },
    4: {
        routeShortName: '4',
        routeType: 4,
        routeVariants: [{
            routeVariantId: '00007',
            routeLongName: 'variant7',
        }, {
            routeVariantId: '00008',
            routeLongName: 'variant8',
        }],
        agencyId: 'WBC',
        agencyAgnostic: true,
    },
    2: {
        routeShortName: '2',
        routeType: 4,
        routeVariants: [{
            routeVariantId: '00003',
            routeLongName: 'variant3',
        }, {
            routeVariantId: '00004',
            routeLongName: 'variant4',
        }],
        agencyId: 'WBC',
        agencyAgnostic: true,
    },
};

const mockStoreRouteVariants = {
    '00001': {
        routeLongName: 'variant1',
        routeVariantId: '00001',
        routeShortName: '1',
    },
    '00002': {
        routeLongName: 'variant2',
        routeVariantId: '00002',
        routeShortName: '1',
    },
    '00003': {
        routeLongName: 'variant3',
        routeVariantId: '00003',
        routeShortName: '2',
    },
    '00004': {
        routeLongName: 'variant4',
        routeVariantId: '00004',
        routeShortName: '2',
    },
    '00005': {
        routeLongName: 'variant5',
        routeVariantId: '00005',
        routeShortName: '3',
    },
    '00006': {
        routeLongName: 'variant6',
        routeVariantId: '00006',
        routeShortName: '3',
    },
    '00007': {
        routeLongName: 'variant7',
        routeVariantId: '00007',
        routeShortName: '4',
    },
    '00008': {
        routeLongName: 'variant8',
        routeVariantId: '00008',
        routeShortName: '4',
    },
};

const mockActiveRoute = '4';

const mockStateWithFilters = filters => ({
    control: {
        routes: {
            routes: {
                all: mockStoreRoutes,
                active: mockActiveRoute,
            },
            routeVariants: {
                all: mockStoreRouteVariants,
            },
            filters,
        },
    },
});

describe('Routes selectors', () => {
    context('getFilteredRoutes and getFilteredRoutesTotal', () => {
        it('returns correct routes when filter by routeType', async () => {
            const filters = {
                routeType: 4,
            };
            expect(getFilteredRoutes(mockStateWithFilters(filters))).to.eql([mockStoreRoutes[2], mockStoreRoutes[4]]);
            expect(getFilteredRoutesTotal(mockStateWithFilters(filters))).to.eql(2);
        });

        it('returns correct routes when filter by agencyId', async () => {
            const filters = {
                agencyId: 'NZB',
            };
            expect(getFilteredRoutes(mockStateWithFilters(filters))).to.eql([mockStoreRoutes[1], mockStoreRoutes[3]]);
            expect(getFilteredRoutesTotal(mockStateWithFilters(filters))).to.eql(2);
        });

        it('returns correct routes when filter by routeShortName', async () => {
            const filters = {
                routeShortName: '2',
            };
            expect(getFilteredRoutes(mockStateWithFilters(filters))).to.eql([mockStoreRoutes[2]]);
            expect(getFilteredRoutesTotal(mockStateWithFilters(filters))).to.eql(1);
        });

        it('returns correct routes when filter by routeVariantId', async () => {
            const filters = {
                routeVariantId: '00008',
            };
            expect(getFilteredRoutes(mockStateWithFilters(filters))).to.eql([mockStoreRoutes[4]]);
            expect(getFilteredRoutesTotal(mockStateWithFilters(filters))).to.eql(1);
        });
    });

    context('getRoutesForSearch', () => {
        it('returns correct routes when filter by routeType', async () => {
            const filters = {
                routeType: 4,
            };
            expect(getRoutesForSearch(mockStateWithFilters(filters))).to.eql([mockStoreRoutes[2], mockStoreRoutes[4]]);
        });

        it('returns correct routes when filter by agencyId', async () => {
            const filters = {
                agencyId: 'NZB',
            };
            expect(getRoutesForSearch(mockStateWithFilters(filters))).to.eql([mockStoreRoutes[1], mockStoreRoutes[3]]);
        });

        it('is not affected by routeShortName filter', async () => {
            const filters = {
                routeShortName: '2',
            };
            expect(getRoutesForSearch(mockStateWithFilters(filters))).to.eql(
                [mockStoreRoutes[1], mockStoreRoutes[2], mockStoreRoutes[3], mockStoreRoutes[4]],
            );
        });

        it('is not affected by routeVariantId filter', async () => {
            const filters = {
                routeVariantId: '00008',
            };
            expect(getRoutesForSearch(mockStateWithFilters(filters))).to.eql(
                [mockStoreRoutes[1], mockStoreRoutes[2], mockStoreRoutes[3], mockStoreRoutes[4]],
            );
        });
    });

    context('getActiveRoute', () => {
        it('should return correct active route', async () => {
            expect(getActiveRoute(mockStateWithFilters({}))).to.eql(mockStoreRoutes[4]);
        });
    });
});
