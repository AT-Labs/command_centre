import { findIndex, some, get } from 'lodash-es';

import USER_PERMISSIONS from '../types/user-permissions-types';

const { ROUTES, BLOCKS, STOP_MESSAGING, ALERTS, RECURRING_CANCELLATIONS } = USER_PERMISSIONS;
export const isGlobalActionPermitted = (permissions, action) => some(permissions, { _rel: action });
const isContainingPermission = (instance, permission) => {
    const userPermissions = get(instance, '_links.permissions', []);
    return findIndex(userPermissions, { _rel: permission }) !== -1;
};

// R&T
export const isHideCancellationPermitted = tripInstance => isContainingPermission(tripInstance, ROUTES.HIDE_TRIP);
export const isTripCancelPermitted = tripInstance => isContainingPermission(tripInstance, ROUTES.CANCEL_TRIP);
export const isTripDelayPermitted = tripInstance => isContainingPermission(tripInstance, ROUTES.EDIT_TRIP_DELAY);
export const isTripCopyPermitted = tripInstance => isContainingPermission(tripInstance, ROUTES.NEW_TRIP);
export const isUpdateStopHeadsignPermitted = stopInstance => isContainingPermission(stopInstance, ROUTES.UPDATE_HEADSIGN);
export const isMoveToStopPermitted = instance => isContainingPermission(instance, ROUTES.ADVANCER); // instance might be trip or stop
export const isSkipStopPermitted = stopInstance => isContainingPermission(stopInstance, ROUTES.SKIP_STOP);
export const isChangeStopPermitted = stopInstance => isContainingPermission(stopInstance, ROUTES.CHANGE_STOP);
export const isRecurringCancellationUpdatePermitted = recurring => isContainingPermission(recurring, RECURRING_CANCELLATIONS.UPDATE_RECURRING_CANCELLATIONS);
export const isHideSkippedStopPermitted = stopInstance => isContainingPermission(stopInstance, ROUTES.HIDE_STOP);

// Blocks
export const isGlobalAddBlocksPermitted = permissions => isGlobalActionPermitted(permissions, BLOCKS.ADD_BLOCK);
export const isIndividualEditBlockPermitted = block => isContainingPermission(block, BLOCKS.EDIT_BLOCK);

// Stop messages
export const isGlobalEditStopMessagesPermitted = permissions => isGlobalActionPermitted(permissions, STOP_MESSAGING.EDIT_STOP_MESSAGE);
export const isIndividualEditStopMessagesPermitted = message => isContainingPermission(message, STOP_MESSAGING.EDIT_STOP_MESSAGE);

// Alerts
export const isAlertDismissPermitted = _links => findIndex(_links.permissions, { _rel: ALERTS.DISMISS_ALERT }) !== -1;
