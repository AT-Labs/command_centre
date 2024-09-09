import { result } from 'lodash-es';
import { createSelector } from 'reselect';
import { IS_LOGIN_NOT_REQUIRED } from '../../auth';

export const getUserState = state => result(state, 'user');
export const getUserProfile = createSelector(getUserState, userState => result(userState, 'profile'));
export const getName = createSelector(getUserProfile, profile => result(profile, 'name'));
export const getUserPermissions = createSelector(getUserState, userState => result(userState, 'permissions'));
export const getOperatorPermissions = createSelector(getUserProfile, userState => result(userState, 'roles'));
export const getControlBlockViewPermission = createSelector(
    getUserPermissions,
    userPermissions => IS_LOGIN_NOT_REQUIRED || result(userPermissions, 'controlBlocksView', false),
);
export const getControlBusPriorityViewPermission = createSelector(
    getUserPermissions,
    userPermissions => IS_LOGIN_NOT_REQUIRED || result(userPermissions, 'controlBusPriorityView', false),
);
