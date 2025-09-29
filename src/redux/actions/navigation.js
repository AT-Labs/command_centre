import ACTION_TYPE from '../action-types';
import VIEW_TYPE from '../../types/view-types';
import { getRealTimeSidePanelIsOpen } from '../selectors/navigation';

export const toggleRealTimeSidePanel = () => ({ type: ACTION_TYPE.TOGGLE_RT_SIDE_PANEL });
export const resetRealTimeSidePanel = () => ({ type: ACTION_TYPE.RESET_RT_SIDE_PANEL });
export const updateMainView = activeMainView => ({
    type: ACTION_TYPE.UPDATE_MAIN_VIEW,
    payload: {
        activeMainView,
    },
});

export const updateRealTimeDetailView = activeRealTimeDetailView => (dispatch, getState) => {
    if (activeRealTimeDetailView !== VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT && !getRealTimeSidePanelIsOpen(getState())) {
        dispatch(toggleRealTimeSidePanel());
    }
    dispatch({
        type: ACTION_TYPE.DISPLAY_REAL_TIME_DETAIL,
        payload: {
            activeRealTimeDetailView,
        },
    });
};

export const updateControlDetailView = activeControlDetailView => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
    payload: {
        activeControlDetailView,
    },
});

export const updateSecondaryPanelView = activeSecondaryPanelView => ({
    type: ACTION_TYPE.UPDATE_SECONDARY_PANEL_VIEW,
    payload: {
        activeSecondaryPanelView,
    },
});

export const updateQueryParams = queryParams => ({
    type: ACTION_TYPE.UPDATE_QUERY_PARAMS,
    payload: {
        queryParams,
    },
});

export const updateActiveControlEntityId = activeControlEntityId => ({
    type: ACTION_TYPE.UPDATE_ACTIVE_CONTROL_ENTITY_ID,
    payload: {
        activeControlEntityId,
    },
});
