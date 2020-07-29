import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    notifications: [],
    filters: {
        route: '',
        status: '',
        operator: '',
        severity: '',
        routeType: 0,
    },
};

const handleNotificationsUpdate = (state, { payload: { notifications } }) => ({ ...state, notifications });
const handleNotificationsFiltersUpdate = (state, action) => ({
    ...state,
    filters: {
        ...state.filters,
        ...action.payload,
    },
});

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_NOTIFICATIONS]: handleNotificationsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_FILTERS]: handleNotificationsFiltersUpdate,
}, INIT_STATE);
