import moment from 'moment';
import { result, find, pick, isEmpty, flatMap, get, uniqBy, orderBy } from 'lodash-es';
import { createSelector } from 'reselect';
import USER_PERMISSIONS from '../../../types/user-permissions-types';
import { getJSONFromWKT } from '../../../utils/helpers';
import EDIT_TYPE from '../../../types/edit-types';

export const getIncidentsState = state => result(state, 'control.incidents', {});
export const getGroupedIncidents = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'incidents'));
export const getIncidentsSortingParams = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'sortingParams'));
export const getAllDisruptions = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'disruptions'));
export const getIncidentsPermissions = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'permissions'));
export const getIncidentsLoadingState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isLoading'));
export const getIncidentsLoadingStopsByRouteState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isLoadingStopsByRoute'));
export const getIncidentsLoadingRoutesByStopState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isLoadingRoutesByStop'));

export const getSelectedEntityFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedEntity'));
export const getSelectedStatusFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedStatus'));
export const getSelectedStartDateFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedStartDate'));
export const getSelectedEndDateFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedEndDate'));
export const getSelectedImpactFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedImpact'));

export const getIncidentsReverseGeocodeLoadingState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isDisruptionsReverseGeocodeLoading'));
export const getIncidentsRoutesLoadingState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isDisruptionsRoutesLoading'));

export const getActiveDisruptionId = createSelector(getIncidentsState, action => result(action, 'activeDisruptionId'));
export const getIncidentToEdit = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'disruptionToEdit'));

export const isIncidentUpdateAllowed = incident => !!find(result(incident, '_links.permissions'), { _rel: USER_PERMISSIONS.DISRUPTIONS.EDIT_DISRUPTION });
export const isIncidentCreationAllowed = createSelector(getIncidentsPermissions, permissions => !!find(permissions, { _rel: USER_PERMISSIONS.DISRUPTIONS.ADD_DISRUPTION }));
export const isIncidentCreationOpen = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isCreateEnabled'));
export const isIncidentCancellationModalOpen = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isCancellationOpen'));

export const getIncidentAction = createSelector(getIncidentsState, ({ action }) => action);
export const getIncidentActionState = createSelector(getIncidentAction, action => result(action, 'isRequesting'));
export const getIncidentActionResult = createSelector(getIncidentAction, action => pick(action, ['resultStatus', 'resultMessage']));
export const getIncidentStepCreation = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'activeStep'));

export const getCachedShapes = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'cachedShapes'));
export const getCachedRoutesToStops = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'cachedRoutesToStops'));
export const getCachedStopsToRoutes = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'cachedStopsToRoutes'));

export const getStopsByRoute = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'stopsByRoute'));
export const getRoutesByStop = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'routesByStop'));
export const isEditEnabled = createSelector(getIncidentsState, incidentsState => incidentsState.editMode === EDIT_TYPE.EDIT);
export const getEditMode = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'editMode'));
export const getSourceIncidentNo = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'sourceIncidentNo'));

export const getAffectedStops = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'affectedEntities.affectedStops'));
export const getAffectedRoutes = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'affectedEntities.affectedRoutes'));
export const getShapes = createSelector(getAffectedRoutes, getAffectedStops, (affectedRoutes, affectedStops) => {
    const allAffectedRoutes = uniqBy([...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)], route => route.routeId);
    if (!isEmpty(allAffectedRoutes)) {
        const withShapes = [];
        flatMap(allAffectedRoutes).forEach((r) => {
            if (r.shapeWkt) {
                withShapes.push(getJSONFromWKT(r.shapeWkt).coordinates.map(c => c.reverse()));
            } else { // need a null here to ensure the routecolors has the same array length
                withShapes.push(null);
            }
        });

        return withShapes;
    }
    return [];
});
export const getRouteColors = createSelector(getAffectedRoutes, getAffectedStops, (affectedRoutes, affectedStops) => {
    const allAffectedRoutes = uniqBy([...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)], route => route.routeId);
    if (!isEmpty(allAffectedRoutes)) {
        const withRouteColors = [];
        flatMap(allAffectedRoutes).forEach((r) => {
            if (r.routeColor) {
                withRouteColors.push(r.routeColor);
            } else {
                withRouteColors.push(null);
            }
        });

        return withRouteColors;
    }
    return [];
});

export const getBoundsToFit = createSelector(getShapes, (shapes) => {
    let pointsInBounds = [];

    if (!isEmpty(shapes)) {
        pointsInBounds = shapes.filter(shape => !!shape);
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
    (allIncidents, selectedEntity, selectedStatus, selectedStartDate, selectedEndDate, selectedImpact) => {
        let filteredIncidents = [...allIncidents];
        if (get(selectedEntity, 'data.route_id')) {
            filteredIncidents = filteredIncidents.filter(({ affectedEntities }) => (
                affectedEntities.find(entity => entity.routeId === get(selectedEntity, 'data.route_id'))
            ));
        } else if (get(selectedEntity, 'data.stop_code')) {
            filteredIncidents = filteredIncidents.filter(({ affectedEntities }) => (
                affectedEntities.find(entity => entity.stopCode === get(selectedEntity, 'data.stop_code'))
            ));
        }

        if (selectedStatus) {
            filteredIncidents = filteredIncidents.filter(({ status }) => (
                status === selectedStatus
            ));
        }

        if (selectedStartDate) {
            filteredIncidents = filteredIncidents.filter(({ endTime }) => (
                !endTime || moment(endTime).isSameOrAfter(moment(selectedStartDate))
            ));
        }
        if (selectedEndDate) {
            filteredIncidents = filteredIncidents.filter(({ startTime }) => (
                moment(startTime).isSameOrBefore(moment(selectedEndDate))
            ));
        }

        if (selectedImpact) {
            filteredIncidents = filteredIncidents.filter(({ impact }) => (
                impact === selectedImpact
            ));
        }

        return filteredIncidents;
    },
);

export const getFilteredIncidents = createSelector(getFilteredDisruptions, (filteredIncidents) => {
    const mergedMap = new Map();

    filteredIncidents.forEach((originalDisruption) => {
        // This is fix needs until we have a proper data in DB
        const disruption = {
            ...originalDisruption,
            incidentId: originalDisruption.incidentId || originalDisruption.disruptionId,
        };

        const existing = mergedMap.get(disruption.incidentId);
        if (existing) {
            // Merge affectedEntities
            existing.affectedEntities = existing.affectedEntities.concat(disruption.affectedEntities);
            // Merge unique impact values
            const existingImpacts = new Set(existing.impact.split(',').map(s => s.trim()));
            const newImpacts = disruption.impact.split(',').map(s => s.trim());
            newImpacts.forEach(impact => existingImpacts.add(impact));
            existing.impact = Array.from(existingImpacts).join(', ');
        } else {
            // Clone to avoid mutating original
            mergedMap.set(disruption.incidentId, {
                ...disruption,
                affectedEntities: [...disruption.affectedEntities],
                impact: disruption.impact || '',
            });
        }
    });

    const mergedDisruptions = Array.from(mergedMap.values());
    return mergedDisruptions;
});

export const getDisruptionsDatagridConfig = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'datagridConfig'));

export const isDiversionCreationOpen = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isCreateDiversionEnabled'));
export const getDiversionEditMode = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'diversionEditMode'));

export const getActiveIncident = createSelector(getIncidentsState, (incidentsState) => {
    const incidents = result(incidentsState, 'incidents');
    const activeIncidentId = result(incidentsState, 'activeIncidentId');
    return find(incidents, ({ incidentId }) => activeIncidentId && incidentId === activeIncidentId);
});

export const getSortedIncidents = createSelector(
    getFilteredIncidents,
    getIncidentsSortingParams,
    (allIncidents, incidentSortingParams) => (!isEmpty(incidentSortingParams)
        ? orderBy(allIncidents, incidentSortingParams.sortBy, incidentSortingParams.order)
        : allIncidents),
);

export const isWorkaroundPanelOpen = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isWorkaroundPanelOpen'));

export const getDisruptionToWorkaroundEdit = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'disruptionToWorkaroundEdit'));
