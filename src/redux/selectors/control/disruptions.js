import { result, find, pick } from 'lodash-es';
import { createSelector } from 'reselect';
import USER_PERMISSIONS from '../../../types/user-permissions-types';

export const getDisruptionsState = state => result(state, 'control.disruptions');
export const getAllDisruptions = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'disruptions'));
export const getDisruptionsPermissions = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'permissions'));
export const getDisruptionsLoadingState = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isLoading'));

export const getDisruptionsReverseGeocodeLoadingState = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isDisruptionsReverseGeocodeLoading'));
export const getDisruptionsRoutesLoadingState = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isDisruptionsRoutesLoading'));

export const getActiveDisruptionId = createSelector(getDisruptionsState, action => result(action, 'activeDisruptionId'));

export const isDisruptionUpdateAllowed = disruption => !!find(result(disruption, '_links.permissions'), { _rel: USER_PERMISSIONS.DISRUPTIONS.EDIT_DISRUPTION });
export const isDisruptionCreationAllowed = createSelector(getDisruptionsPermissions, permissions => !!find(permissions, { _rel: USER_PERMISSIONS.DISRUPTIONS.ADD_DISRUPTION }));

export const getDisruptionAction = createSelector(getDisruptionsState, ({ action }) => action);
export const getDisruptionActionState = createSelector(getDisruptionAction, action => result(action, 'isRequesting'));
export const getDisruptionActionResult = createSelector(getDisruptionAction, action => pick(action, ['resultStatus', 'resultMessage']));
