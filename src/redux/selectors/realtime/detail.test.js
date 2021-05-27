import { expect } from 'chai';

import { getViewDetailEntity, getVisibleEntities, getCheckedStops, getVisibleStops } from './detail';
import VIEW_TYPE from '../../../types/view-types';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';

describe('Detail selectors', () => {
    context('getViewDetailEntity', () => {
        it('should return empty object when no active detail view', () => {
            const detailEntity = getViewDetailEntity.resultFunc(undefined, undefined, undefined, undefined);
            expect(detailEntity).to.eql({});
        });

        it('should return route when active detail view is ROUTE', () => {
            const routeDetail = { key: 'route_1', route_id: 'route_id_1' };
            const detailEntity = getViewDetailEntity.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.ROUTE, routeDetail, undefined, undefined);
            expect(detailEntity).to.eql(routeDetail);
        });

        it('should return stop when active detail view is STOP', () => {
            const stopDetail = { key: 'stop_1', stop_id: 'stop_id_1' };
            const detailEntity = getViewDetailEntity.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.STOP, undefined, stopDetail, undefined);
            expect(detailEntity).to.eql(stopDetail);
        });

        it('should return vehicle when active detail view is VEHICLE', () => {
            const vehicleDetail = { key: 'vehicle_1', vehicle_id: 'vhicle_id_1' };
            const detailEntity = getViewDetailEntity.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.VEHICLE, undefined, undefined, vehicleDetail);
            expect(detailEntity).to.eql(vehicleDetail);
        });
    });

    context('getVisibleEntities', () => {
        it('should return empty array when no active detail view', () => {
            const visibleEntities = getVisibleEntities.resultFunc(undefined, undefined, undefined);
            expect(visibleEntities).to.eql([]);
        });

        it('should return checked search result list when active detail view is LIST or ROUTE ', () => {
            const checkedSearchResults = [
                { key: 'route_1', route_id: 'route_id_1' },
                { key: 'stop_1', stop_id: 'stop_id_1' },
                { key: 'vehicle_1', vehicle_id: 'vhicle_id_1' },
            ];
            let visibleEntities = getVisibleEntities.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.ROUTE, undefined, checkedSearchResults);
            expect(visibleEntities).to.eql(checkedSearchResults);
            visibleEntities = getVisibleEntities.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.LIST, undefined, checkedSearchResults);
            expect(visibleEntities).to.eql(checkedSearchResults);
        });

        it('should return active detail entity as list when has an active detail entity', () => {
            const activeDetailEntity = { key: 'vehicle_1', route_id: 'vhicle_id_1', checked: true };
            const visibleEntities = getVisibleEntities.resultFunc(VIEW_TYPE.REAL_TIME_DETAIL.VEHICLE, activeDetailEntity, undefined);
            expect(visibleEntities).to.eql([activeDetailEntity]);
        });
    });

    context('getCheckedStops', () => {
        it('should return all stops from checked search result list', () => {
            const checkedSearchResults = [
                { key: 'route_1', route_id: 'route_id_1', searchResultType: SEARCH_RESULT_TYPE.ROUTE.type },
                { key: 'stop_1', stop_id: 'stop_id_1', searchResultType: SEARCH_RESULT_TYPE.STOP.type, checked: false },
                { key: 'stop_2', stop_id: 'stop_id_2', searchResultType: SEARCH_RESULT_TYPE.STOP.type, checked: true },
                { key: 'vehicle_1', vehicle_id: 'vhicle_id_1', searchResultType: SEARCH_RESULT_TYPE.BUS.type },
            ];
            const stops = getCheckedStops.resultFunc(checkedSearchResults);
            expect(stops).to.eql([{ key: 'stop_2', stop_id: 'stop_id_2', searchResultType: SEARCH_RESULT_TYPE.STOP.type, checked: true }]);
        });
    });

    context('getVisibleStops', () => {
        it('should return related stops from current active detail entity', () => {
            const currentDetailEntity = {
                key: 'route_1',
                route_id: 'route_id_1',
                checked: true,
                searchResultType: SEARCH_RESULT_TYPE.ROUTE.type,
                stops: [{ stop_id: 'stop_id_1' }, { stop_id: 'stop_id_2' }],
            };
            const stops = getVisibleStops.resultFunc(currentDetailEntity);
            expect(stops).to.eql([{ stop_id: 'stop_id_1' }, { stop_id: 'stop_id_2' }]);
        });
    });
});
