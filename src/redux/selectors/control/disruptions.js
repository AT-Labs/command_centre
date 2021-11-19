import moment from 'moment';
import { result, find, pick, isEmpty, flatMap, get } from 'lodash-es';
import { createSelector } from 'reselect';
import USER_PERMISSIONS from '../../../types/user-permissions-types';
import { getJSONFromWKT } from '../../../utils/helpers';

export const getDisruptionsState = state => result(state, 'control.disruptions');
export const getAllDisruptions = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'disruptions'));
export const getDisruptionsPermissions = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'permissions'));
export const getDisruptionsLoadingState = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isLoading'));

export const getSelectedEntityFilter = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'filters.selectedEntity'));
export const getSelectedStatusFilter = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'filters.selectedStatus'));
export const getSelectedStartDateFilter = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'filters.selectedStartDate'));
export const getSelectedEndDateFilter = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'filters.selectedEndDate'));
export const getSelectedImpactFilter = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'filters.selectedImpact'));

export const getDisruptionsReverseGeocodeLoadingState = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isDisruptionsReverseGeocodeLoading'));
export const getDisruptionsRoutesLoadingState = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isDisruptionsRoutesLoading'));

export const getActiveDisruptionId = createSelector(getDisruptionsState, action => result(action, 'activeDisruptionId'));
export const getDisruptionToEdit = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'disruptionToEdit'));

export const isDisruptionUpdateAllowed = disruption => !!find(result(disruption, '_links.permissions'), { _rel: USER_PERMISSIONS.DISRUPTIONS.EDIT_DISRUPTION });
export const isDisruptionCreationAllowed = createSelector(getDisruptionsPermissions, permissions => !!find(permissions, { _rel: USER_PERMISSIONS.DISRUPTIONS.ADD_DISRUPTION }));
export const isDisruptionCreationOpen = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isCreateEnabled'));
export const isDisruptionCancellationModalOpen = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isCancellationOpen'));

export const getDisruptionAction = createSelector(getDisruptionsState, ({ action }) => action);
export const getDisruptionActionState = createSelector(getDisruptionAction, action => result(action, 'isRequesting'));
export const getDisruptionActionResult = createSelector(getDisruptionAction, action => pick(action, ['resultStatus', 'resultMessage']));
export const getDisruptionStepCreation = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'activeStep'));

export const getCachedShapes = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'cachedShapes'));
export const getCachedStopsToRoutes = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'cachedStopsToRoutes'));

export const getRoutesByStop = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'routesByStop'));
export const isEditEnabled = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'isEditMode'));

export const getAffectedStops = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'affectedEntities.affectedStops'));
export const getAffectedRoutes = createSelector(getDisruptionsState, disruptionsState => result(disruptionsState, 'affectedEntities.affectedRoutes'));
export const getShapes = createSelector(getAffectedRoutes, (affectedRoutes) => {
    if (!isEmpty(affectedRoutes)) {
        const withShapes = [];
        flatMap(affectedRoutes).forEach((r) => {
            if (r.shapeWkt) {
                withShapes.push(getJSONFromWKT(r.shapeWkt).coordinates.map(c => c.reverse()));
            }
        });

        return withShapes;
    }
    return [];
});
export const getRouteColors = createSelector(getAffectedRoutes, (affectedRoutes) => {
    if (!isEmpty(affectedRoutes)) {
        const withRouteColors = [];
        flatMap(affectedRoutes).forEach((r) => {
            if (r.routeColor) {
                withRouteColors.push(r.routeColor);
            }
        });

        return withRouteColors;
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

export const getFilteredDisruptions = createSelector(
    getAllDisruptions,
    getSelectedEntityFilter,
    getSelectedStatusFilter,
    getSelectedStartDateFilter,
    getSelectedEndDateFilter,
    getSelectedImpactFilter,
    (allDisruptions, selectedEntity, selectedStatus, selectedStartDate, selectedEndDate, selectedImpact) => {
        let filteredDisruptions = [...allDisruptions];

        if (get(selectedEntity, 'data.route_id')) {
            filteredDisruptions = filteredDisruptions.filter(({ affectedEntities }) => (
                affectedEntities.find(entity => entity.routeId === get(selectedEntity, 'data.route_id'))
            ));
        } else if (get(selectedEntity, 'data.stop_id')) {
            filteredDisruptions = filteredDisruptions.filter(({ affectedEntities }) => (
                affectedEntities.find(entity => entity.stopId === get(selectedEntity, 'data.stop_id'))
            ));
        }

        if (selectedStatus) {
            filteredDisruptions = filteredDisruptions.filter(({ status }) => (
                status === selectedStatus
            ));
        }

        if (selectedStartDate) {
            filteredDisruptions = filteredDisruptions.filter(({ endTime }) => (
                !endTime || moment(endTime).isSameOrAfter(moment(selectedStartDate))
            ));
        }
        if (selectedEndDate) {
            filteredDisruptions = filteredDisruptions.filter(({ startTime }) => (
                moment(startTime).isSameOrBefore(moment(selectedEndDate))
            ));
        }

        if (selectedImpact) {
            filteredDisruptions = filteredDisruptions.filter(({ impact }) => (
                impact === selectedImpact
            ));
        }

        return filteredDisruptions;
    },
);
