import _ from 'lodash-es';
import ACTION_TYPE from '../action-types';
import * as TRIP_MGT_API from '../../utils/transmitters/trip-mgt-api';
import * as BLOCK_MGT_API from '../../utils/transmitters/block-mgt-api';
import * as STOP_MESSAGING_API from '../../utils/transmitters/stop-messaging-api';
import * as DISRUPTION_MGT_API from '../../utils/transmitters/disruption-mgt-api';
import * as TRIP_REPLAY_API from '../../utils/transmitters/trip-replay-api';
import { getAlertsViewPermission } from '../../utils/transmitters/alerts-api';
import { reportError } from './activity';

export const updateUserProfile = user => (dispatch) => {
    const profile = {
        userName: _.result(user, 'userName', ''),
        name: _.result(user, 'profile.name', ''),
        roles: _.result(user, 'profile.roles', []),
    };
    dispatch({
        type: ACTION_TYPE.UPDATE_USER_PROFILE,
        payload: {
            profile,
        },
    });
};

export const updateUserPermissions = permissions => ({
    type: ACTION_TYPE.UPDATE_USER_PERMISSIONS,
    payload: {
        permissions,
    },
});

const fetchViewPermission = (view, api) => dispatch => api()
    .then(isViewPermitted => dispatch(updateUserPermissions({ [view]: isViewPermitted })))
    .catch(error => dispatch(reportError({ error: { userPermissions: error } })));

export const fetchRoutesViewPermission = () => fetchViewPermission('controlRoutesView', TRIP_MGT_API.getRoutesViewPermission);
export const fetchBlocksViewPermission = () => fetchViewPermission('controlBlocksView', BLOCK_MGT_API.getBlocksViewPermission);
export const fetchStopMessagingViewPermission = () => fetchViewPermission('controlStopMessagingView', STOP_MESSAGING_API.getStopMessagingViewPermission);
export const fetchDisruptionsViewPermission = () => fetchViewPermission('controlDisruptionsView', DISRUPTION_MGT_API.getDisruptionsViewPermission);
export const fetchAlertsViewPermission = () => fetchViewPermission('controlAlertsView', getAlertsViewPermission);
export const fetchTripReplaysViewPermission = () => fetchViewPermission('controlTripReplaysView', TRIP_REPLAY_API.getTripReplaysViewPermission);
