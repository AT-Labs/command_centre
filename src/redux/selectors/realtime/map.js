import _ from 'lodash-es';
import { createSelector } from 'reselect';
import L from 'leaflet';
import {
    getAddressDetail, getStopDetail, getShapes, shouldGetActiveRealTimeDetailView,
} from './detail';
import { FOCUS_ZOOM } from '../../../components/RealTime/RealTimeMap/constants';
import { getRealTimeSidePanelIsOpen } from '../navigation';

export const getMapState = state => _.result(state, 'realtime.map');
export const getMapRecenterStatus = createSelector(getMapState, mapState => _.result(mapState, 'shouldMapBeRecentered'));
export const getShouldOffsetForSidePanel = createSelector(
    shouldGetActiveRealTimeDetailView,
    getRealTimeSidePanelIsOpen,
    (sidePanelIsActive, sidePanelIsOpen) => sidePanelIsActive && sidePanelIsOpen,
);
export const getBoundsToFit = createSelector(getAddressDetail, getStopDetail, getShapes, (address, stop, shapes) => {
    let pointsInBounds = [];

    if (!_.isEmpty(shapes)) {
        pointsInBounds = shapes;
    }

    if (!_.isEmpty(address)) {
        pointsInBounds.push([new L.LatLng(address.lat, address.lng)]);
    }

    return pointsInBounds;
});

export const getMaxZoom = createSelector(getAddressDetail, (address) => {
    if (!_.isEmpty(address)) {
        return FOCUS_ZOOM;
    }
    return 0;
});
