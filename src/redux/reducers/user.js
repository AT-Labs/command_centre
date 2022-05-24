import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../action-types';

export const INIT_STATE = {
    profile: {
        userName: '',
        name: '',
        roles: [],
    },
    permissions: {
        controlRoutesView: false,
        controlBlocksView: false,
        controlStopMessagingView: false,
        controlDisruptionsView: false,
        controlAlertsView: false,
        controlTripReplaysView: false,
        controlFleetsView: false,
        controlNotificationsView: false,
    },
};

const handleProfileUpdate = (state, { payload: { profile } }) => ({
    ...state,
    profile: {
        ...state.profile,
        ...profile,
    },
});

const handlePermissionsUpdate = (state, { payload: { permissions } }) => ({
    ...state,
    permissions: {
        ...state.permissions,
        ...permissions,
    },
});

export default handleActions({
    [ACTION_TYPE.UPDATE_USER_PROFILE]: handleProfileUpdate,
    [ACTION_TYPE.UPDATE_USER_PERMISSIONS]: handlePermissionsUpdate,
}, INIT_STATE);
