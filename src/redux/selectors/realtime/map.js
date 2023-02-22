import { isEmpty, result, compact } from 'lodash-es';
import { createSelector } from 'reselect';
import L from 'leaflet';
import { getAllCoordinatesFromWKT } from '../../../utils/helpers';
import {
    getAddressDetail, getViewDetailEntity, getCheckedSearchResults,
} from './detail';
import { FOCUS_ZOOM } from '../../../components/Common/Map/constants';
import { getRealTimeSidePanelIsOpen, getActiveRealTimeDetailView, getRealTimeSidePanelIsActive } from '../navigation';
import VIEW_TYPE from '../../../types/view-types';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';

export const getMapState = state => result(state, 'realtime.map');
export const getMapRecenterStatus = createSelector(getMapState, mapState => result(mapState, 'shouldMapBeRecentered'));
export const getHoveredEntityKey = createSelector(getMapState, mapState => result(mapState, 'hoveredEntityKey'));

export const getShouldOffsetForSidePanel = createSelector(
    getRealTimeSidePanelIsActive,
    getRealTimeSidePanelIsOpen,
    (sidePanelIsActive, sidePanelIsOpen) => sidePanelIsActive && sidePanelIsOpen,
);
export const getBoundsToFit = createSelector(
    getAddressDetail,
    getViewDetailEntity,
    getCheckedSearchResults,
    getActiveRealTimeDetailView,
    (address, currentViewDetailEntity, checkedSearchResults, activeRealTimeDetailView) => {
        const pointsInBounds = [];
        const { ROUTE, STOP, BUS, FERRY, TRAIN } = SEARCH_RESULT_TYPE;
        if (activeRealTimeDetailView === VIEW_TYPE.REAL_TIME_DETAIL.LIST && checkedSearchResults.length) {
            checkedSearchResults.forEach((entity) => {
                if (STOP.type === entity.searchResultType) {
                    pointsInBounds.push([new L.LatLng(entity.stop_lat, entity.stop_lon)]);
                } else if (entity.searchResultType === ROUTE.type && entity.routes) {
                    entity.routes.forEach(r => pointsInBounds.push(getAllCoordinatesFromWKT(r.shape_wkt)));
                } else if ([BUS.type, TRAIN.type, FERRY.type].includes(entity.searchResultType) && entity.trip && entity.trip.shape_wkt) {
                    pointsInBounds.push(getAllCoordinatesFromWKT(entity.trip.shape_wkt));
                }
            });
        } else if (!isEmpty(currentViewDetailEntity)) {
            if ([STOP.type, ROUTE.type].includes(currentViewDetailEntity.searchResultType) && currentViewDetailEntity.routes) {
                currentViewDetailEntity.routes.forEach(r => pointsInBounds.push(getAllCoordinatesFromWKT(r.shape_wkt)));
            } else if (currentViewDetailEntity.trip && currentViewDetailEntity.trip.shape_wkt) {
                pointsInBounds.push(getAllCoordinatesFromWKT(currentViewDetailEntity.trip.shape_wkt));
            }
        }
        if (!isEmpty(address)) {
            pointsInBounds.push([new L.LatLng(address.lat, address.lng)]);
        }
        return compact(pointsInBounds);
    },
);

export const getMaxZoom = createSelector(getAddressDetail, (address) => {
    if (!isEmpty(address)) {
        return FOCUS_ZOOM;
    }
    return 0;
});
