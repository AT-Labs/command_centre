import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../action-types';
import VIEW_TYPE from '../../types/view-types';

export const INIT_STATE = {
    activeMainView: VIEW_TYPE.MAIN.REAL_TIME,
    activeRealTimeDetailView: VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT,
    activeSecondaryPanelView: '',
    activeControlDetailView: '',
    isSidePanelOpen: true,
};

const handleUpdateMainView = (state, { payload: { activeMainView } }) => ({ ...state, activeMainView });
const handleToggleRealTimeSidePanel = state => ({ ...state, isSidePanelOpen: !state.isSidePanelOpen });
const handleUpdateSecondaryPanelView = (state, { payload: { activeSecondaryPanelView } }) => ({ ...state, activeSecondaryPanelView });
const handleUpdateRealTimeDetailView = (state, { payload: { activeRealTimeDetailView } }) => ({ ...state, activeRealTimeDetailView });
const handleUpdateControlDetailView = (state, { payload: { activeControlDetailView } }) => ({ ...state, activeControlDetailView });

export default handleActions({
    [ACTION_TYPE.UPDATE_MAIN_VIEW]: handleUpdateMainView,
    [ACTION_TYPE.TOGGLE_RT_SIDE_PANEL]: handleToggleRealTimeSidePanel,
    [ACTION_TYPE.UPDATE_SECONDARY_PANEL_VIEW]: handleUpdateSecondaryPanelView,
    [ACTION_TYPE.DISPLAY_REAL_TIME_DETAIL]: handleUpdateRealTimeDetailView,
    [ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW]: handleUpdateControlDetailView,
}, INIT_STATE);
