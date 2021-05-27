import { clearDetail, clearSelectedSearchResult } from './detail/common';
import { clearSearchResults } from '../search';
import { mergeVehicleFilters } from './vehicles';
import { recenterMap } from './map';
import { updateMainView, updateRealTimeDetailView } from '../navigation';
import VIEW_TYPE from '../../../types/view-types';

export const resetRealtimeToDefault = () => (dispatch) => {
    dispatch(recenterMap(true));
    dispatch(clearDetail());
    dispatch(clearSelectedSearchResult());
    dispatch(clearSearchResults());
    dispatch(mergeVehicleFilters({ routeType: null }));
    dispatch(updateMainView(VIEW_TYPE.MAIN.REAL_TIME));
    dispatch(updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT));
};
