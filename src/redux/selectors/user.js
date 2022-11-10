import _ from 'lodash-es';
import { createSelector } from 'reselect';
import { IS_LOGIN_NOT_REQUIRED } from '../../auth';

export const getUserState = state => _.result(state, 'user');
export const getUserProfile = createSelector(getUserState, userState => _.result(userState, 'profile'));
export const getName = createSelector(getUserProfile, profile => _.result(profile, 'name'));
export const getUserPermissions = createSelector(getUserState, userState => _.result(userState, 'permissions'));
export const getOperatorPermissions = createSelector(getUserProfile, userState => _.result(userState, 'roles'));
export const getControlBlockViewPermission = createSelector(
    getUserPermissions,
    userPermissions => IS_LOGIN_NOT_REQUIRED || _.result(userPermissions, 'controlBlocksView', false),
);
