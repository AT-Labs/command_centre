import { result, find, pick, isEmpty, flatMap } from 'lodash-es';
import { createSelector } from 'reselect';
import USER_PERMISSIONS from '../../../types/user-permissions-types';
import { getJSONFromWKT } from '../../../utils/helpers';

export const getDisruptionsState = state => result(state, 'control.disruptions');
export const getAllDisruptions = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'disruptions'));
export const getDisruptionsPermissions = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'permissions'));
export const getDisruptionsLoadingState = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isLoading'));

export const getDisruptionsReverseGeocodeLoadingState = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isDisruptionsReverseGeocodeLoading'));
export const getDisruptionsRoutesLoadingState = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isDisruptionsRoutesLoading'));

export const getActiveDisruptionId = createSelector(getDisruptionsState, action => result(action, 'activeDisruptionId'));

export const isDisruptionUpdateAllowed = disruption => !!find(result(disruption, '_links.permissions'), { _rel: USER_PERMISSIONS.DISRUPTIONS.EDIT_DISRUPTION });
export const isDisruptionCreationAllowed = createSelector(getDisruptionsPermissions, permissions => !!find(permissions, { _rel: USER_PERMISSIONS.DISRUPTIONS.ADD_DISRUPTION }));
export const isDisruptionCreationOpen = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isCreateEnabled'));
export const isDisruptionCancellationModalOpen = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isCancellationOpen'));

export const getDisruptionAction = createSelector(getDisruptionsState, ({ action }) => action);
export const getDisruptionActionState = createSelector(getDisruptionAction, action => result(action, 'isRequesting'));
export const getDisruptionActionResult = createSelector(getDisruptionAction, action => pick(action, ['resultStatus', 'resultMessage']));
export const getDisruptionStepCreation = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'activeStep'));

export const getAffectedEntities = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'affectedEntities'));
export const getAffectedRoutes = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'affectedEntities.affectedRoutes'));
export const getShapes = createSelector(getAffectedRoutes, (affectedRoutes) => {
    if (!isEmpty(affectedRoutes)) {
        const withShapes = [];
        flatMap(affectedRoutes).forEach((r) => {
            if (r.shape_wkt) {
                withShapes.push(getJSONFromWKT(r.shape_wkt).coordinates.map(c => c.reverse()));
            }
        });
        return withShapes;
    }
    return [];
});
export const getBoundsToFit = createSelector(getShapes, (shape) => {
    let pointsInBounds = [];

    if (!isEmpty(shape)) {
        pointsInBounds = shape;
    }

    return pointsInBounds;
});
export const getAffectedStops = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'affectedEntities.affectedStops'));
export const getRoutesByStop = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'routesByStop'));
