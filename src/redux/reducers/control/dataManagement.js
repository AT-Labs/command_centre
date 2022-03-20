import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    pageSettings: {
        drawerOpen: true,
        selectedIndex: 0,
    },
    stopGroups: [],
    stopGroupsIncludingDeleted: [],
    isStopGroupsLoading: false,
};

const handlePageSettingsUpdate = (state, action) => ({ ...state, pageSettings: { ...state.pageSettings, ...action.payload } });
const handleStopGroupsLoadingUpdate = (state, { payload: { isStopGroupsLoading } }) => ({ ...state, isStopGroupsLoading });
const handleStopGroupsUpdate = (state, { payload: { stopGroups, stopGroupsIncludingDeleted } }) => ({ ...state, stopGroups, stopGroupsIncludingDeleted });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_DATAMANAGEMENT_PAGESETTINGS]: handlePageSettingsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_STOP_GROUPS_LOADING]: handleStopGroupsLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_STOP_GROUPS]: handleStopGroupsUpdate,
}, INIT_STATE);
