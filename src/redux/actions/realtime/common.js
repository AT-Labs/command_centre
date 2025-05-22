import { clearDetail, clearSelectedSearchResult } from './detail/common';
import { clearSearchResults } from '../search';
import { mergeVehicleFilters } from './vehicles';
import { updateMapDetails } from './map';
import { updateMainView, updateRealTimeDetailView, resetRealTimeSidePanel } from '../navigation';
import VIEW_TYPE from '../../../types/view-types';
import {
    updateSelectedCongestionFilters,
    updateSelectedIncidentFilters,
    updateShowIncidents,
    resetShowRoadworks,
    updateShowRouteAlerts,
    updateShowAllRouteAlerts,
    updateShowDisruptions,
} from './layers';
import { MAP_DATA } from '../../../types/map-types';

export const resetRealtimeToDefault = () => (dispatch) => {
    dispatch(clearDetail());
    dispatch(clearSelectedSearchResult());
    dispatch(clearSearchResults());
    dispatch(resetRealTimeSidePanel());
    dispatch(mergeVehicleFilters({
        routeType: null,
        agencyIds: null,
        isShowingNIS: false,
        isShowingUnscheduled: false,
        showingDelay: {},
        showingOccupancyLevels: [],
        showingTags: [],
        isShowingDirectionInbound: true,
        isShowingDirectionOutbound: true,
        isShowingSchoolBus: false,
    }));
    dispatch(updateMainView(VIEW_TYPE.MAIN.REAL_TIME));
    dispatch(updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT));
    dispatch(updateSelectedIncidentFilters([]));
    dispatch(resetShowRoadworks());
    dispatch(updateShowAllRouteAlerts(false));
    dispatch(updateShowRouteAlerts(false));
    dispatch(updateShowIncidents(false));
    dispatch(updateShowDisruptions({ showDisruptions: false, selectedDisruptionFilters: [] }));
    dispatch(updateSelectedCongestionFilters([]));
    dispatch(updateMapDetails(MAP_DATA.centerLocation, MAP_DATA.zoomLevel.initial));
};
