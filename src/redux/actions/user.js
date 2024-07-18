import { result, map, difference } from 'lodash-es';
import ACTION_TYPE from '../action-types';
import * as TRIP_MGT_API from '../../utils/transmitters/trip-mgt-api';
import * as BLOCK_MGT_API from '../../utils/transmitters/block-mgt-api';
import * as STOP_MESSAGING_API from '../../utils/transmitters/stop-messaging-api';
import * as DISRUPTION_MGT_API from '../../utils/transmitters/disruption-mgt-api';
import * as TRIP_REPLAY_API from '../../utils/transmitters/trip-replay-api';
import * as NOTIFICATIONS_API from '../../utils/transmitters/notifications-api';
import { getAlertsViewPermission } from '../../utils/transmitters/alerts-api';
import { getFleetsViewPermission } from '../../utils/transmitters/fleets-api';
import { getUserPreferences } from '../../utils/transmitters/command-centre-config-api';
import { reportError } from './activity';
import { mergeRouteFilters } from './control/routes/filters';
import { getAgencies } from '../selectors/control/agencies';
import { getAgencyDepotsOptions } from '../../utils/helpers';

export const updateUserProfile = user => (dispatch) => {
    const profile = {
        userName: result(user, 'username', ''),
        name: result(user, 'name', ''),
        roles: result(user, 'idTokenClaims.roles', []),
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
export const fetchFleetsViewPermission = () => fetchViewPermission('controlFleetsView', getFleetsViewPermission);
export const fetchNotificationsViewPermission = () => fetchViewPermission('controlNotificationsView', NOTIFICATIONS_API.getNotificationsViewPermission);
export const fetchPreferences = () => (dispatch, getState) => getUserPreferences()
    .then((preferences) => {
        const { routesFilters } = preferences;
        if (routesFilters) {
            const { agencyId, depotIds } = routesFilters;
            if (agencyId && depotIds?.length > 0) {
                if (difference(depotIds, map(getAgencyDepotsOptions(agencyId, getAgencies(getState())), 'value')).length > 0) {
                    routesFilters.depotIds = [];
                }
            }
            dispatch(mergeRouteFilters({ ...routesFilters }, false, true));
        }
    })
    .catch(error => dispatch(reportError({ error: { userPreferences: error } })));
