import { expect } from 'chai';

import { getControlDetailRoutesViewType } from './filters';
import VIEW_TYPE from '../../../../types/view-types';

const mockState = filters => ({
    control: {
        routes: {
            filters: filters || {},
        },
    },
});

describe('Filters selectors', () => {
    context('getControlDetailRoutesViewType', () => {
        it('should return a correct view type when grouped by both route and route variant', async () => {
            const filters = {
                isGroupedByRoute: true,
                isGroupedByRouteVariant: true,
            };
            expect(getControlDetailRoutesViewType(mockState(filters))).to.eql(VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS);
        });

        it('should return a correct view type when grouped by nether route nor route variant', async () => {
            const filters = {
                isGroupedByRoute: false,
                isGroupedByRouteVariant: false,
            };
            expect(getControlDetailRoutesViewType(mockState(filters))).to.eql(VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS);
        });

        it('should return a correct view type when grouped by route', async () => {
            const filters = {
                isGroupedByRoute: true,
                isGroupedByRouteVariant: false,
            };
            expect(getControlDetailRoutesViewType(mockState(filters))).to.eql(VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS);
        });

        it('should return a correct view type when grouped by route variants', async () => {
            const filters = {
                isGroupedByRoute: false,
                isGroupedByRouteVariant: true,
            };
            expect(getControlDetailRoutesViewType(mockState(filters))).to.eql(VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTE_VARIANTS_TRIPS);
        });
    });
});
