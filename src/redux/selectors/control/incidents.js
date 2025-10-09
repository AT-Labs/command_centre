import moment from 'moment';
import { result, find, pick, isEmpty, flatMap, get, uniqBy, orderBy } from 'lodash-es';
import { createSelector } from 'reselect';
import USER_PERMISSIONS from '../../../types/user-permissions-types';
import { getJSONFromWKT } from '../../../utils/helpers';
import EDIT_TYPE from '../../../types/edit-types';

export const getIncidentsState = state => result(state, 'control.incidents', {});
export const getGroupedIncidents = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'incidents'));
export const getIncidentsSortingParams = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'sortingParams'));
export const getAllIncidents = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'incidents'));
export const getAllDisruptions = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'disruptions'));
export const getIncidentsPermissions = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'permissions'));
export const getIncidentsLoadingState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isLoading'));
export const getIncidentsLoadingStopsByRouteState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isLoadingStopsByRoute'));
export const getIncidentsLoadingRoutesByStopState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isLoadingRoutesByStop'));
export const getIncidentForEditLoadingState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isIncidentForEditLoading'));
export const getScrollToParent = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'scrollToParent', false));

export const getSelectedEntityFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedEntity'));
export const getSelectedStatusFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedStatus'));
export const getSelectedStartDateFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedStartDate'));
export const getSelectedEndDateFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedEndDate'));
export const getSelectedImpactFilter = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'filters.selectedImpact'));

export const getIncidentsReverseGeocodeLoadingState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isDisruptionsReverseGeocodeLoading'));
export const getIncidentsRoutesLoadingState = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isDisruptionsRoutesLoading'));

export const getActiveDisruptionId = createSelector(getIncidentsState, action => result(action, 'activeDisruptionId'));
export const getIncidentToEdit = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'incidentToEdit'));

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
export const getSourceIncidentId = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'sourceIncidentId'));

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
    (allDisruptions, selectedEntity, selectedStatus, selectedStartDate, selectedEndDate, selectedImpact) => {
        let filteredDisruption = [...allDisruptions];
        if (get(selectedEntity, 'data.route_id')) {
            filteredDisruption = filteredDisruption.filter(({ affectedEntities }) => (
                affectedEntities.find(entity => entity.routeId === get(selectedEntity, 'data.route_id'))
            ));
        } else if (get(selectedEntity, 'data.stop_code')) {
            filteredDisruption = filteredDisruption.filter(({ affectedEntities }) => (
                affectedEntities.find(entity => entity.stopCode === get(selectedEntity, 'data.stop_code'))
            ));
        }

        if (selectedStatus) {
            filteredDisruption = filteredDisruption.filter(({ status }) => (
                status === selectedStatus
            ));
        }

        if (selectedStartDate) {
            filteredDisruption = filteredDisruption.filter(({ endTime }) => (
                !endTime || moment(endTime).isSameOrAfter(moment(selectedStartDate))
            ));
        }
        if (selectedEndDate) {
            filteredDisruption = filteredDisruption.filter(({ startTime }) => (
                moment(startTime).isSameOrBefore(moment(selectedEndDate))
            ));
        }

        if (selectedImpact) {
            filteredDisruption = filteredDisruption.filter(({ impact }) => (
                impact === selectedImpact
            ));
        }
        return filteredDisruption;
    },
);

export const getFilteredIncidents = createSelector(
    getAllIncidents,
    getFilteredDisruptions,
    (allIncidents, filteredDisruptions) => {
        let filteredIncidents = [...allIncidents];
        filteredIncidents = filteredIncidents.filter(incident => (filteredDisruptions.some(disruption => incident.disruptions.includes(disruption.disruptionId))));
        return filteredIncidents;
    },
);

export const getIncidentsWithDisruptions = createSelector(
    getAllDisruptions,
    getFilteredIncidents,
    (allDisruptions, filteredIncidents) => {
        if (isEmpty(allDisruptions) || isEmpty(filteredIncidents)) {
            return [];
        }
        const filteredDisruptions = allDisruptions.filter(disruption => (filteredIncidents.some(inc => inc.incidentId === disruption.incidentId)));
        const mergedIncidentsAndDisruptions = [];
        filteredIncidents.forEach((originalIncident) => {
            mergedIncidentsAndDisruptions.push({
                ...originalIncident,
                affectedEntities: [],
                impact: originalIncident.impact || '',
            });
        });
        filteredDisruptions.forEach((originalDisruption) => {
            // This is fix needs until we have a proper data in DB
            const disruption = {
                ...originalDisruption,
                incidentId: originalDisruption.incidentId || originalDisruption.disruptionId * 100,
                incidentDisruptionNo: originalDisruption.incidentDisruptionNo || originalDisruption.disruptionId * 100,
            };
            mergedIncidentsAndDisruptions.push({
                ...disruption,
            });
            const existing = mergedIncidentsAndDisruptions.find(inc => disruption.incidentId === inc.incidentId && !inc.disruptionId);
            if (existing) {
                // Merge affectedEntities
                existing.affectedEntities = existing.affectedEntities.concat(disruption.affectedEntities);
                existing.incidentDisruptionNo = disruption.incidentDisruptionNo || existing.incidentDisruptionNo;
                // Merge unique impact values
                const existingImpacts = new Set(existing.impact.split(',').map(s => s.trim()));
                const newImpacts = disruption.impact.split(',').map(s => s.trim());
                newImpacts.forEach(impact => existingImpacts.add(impact));
                existing.impact = Array.from(existingImpacts).join(', ');
            } else {
                // add the incident entity copied from disruption
                const incident = {
                    incidentId: disruption.incidentId,
                    header: disruption.header,
                    incidentDisruptionNo: disruption.incidentDisruptionNo,
                    affectedEntities: [...disruption.affectedEntities],
                    impact: disruption.impact || '',
                };
                mergedIncidentsAndDisruptions.push({
                    ...incident,
                });
            }
        });
        return mergedIncidentsAndDisruptions;
    },
);

export const getIncidentsDatagridConfig = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'datagridConfig'));

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
        : allIncidents.toSorted((a, b) => new Date(b.createdTime) - new Date(a.createdTime))),
);

export const isWorkaroundPanelOpen = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isWorkaroundPanelOpen'));
export const getDisruptionKeyToWorkaroundEdit = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'disruptionKeyToWorkaroundEdit'));
export const isEditEffectPanelOpen = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isEditEffectPanelOpen'));
export const getDisruptionKeyToEditEffect = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'disruptionKeyToEditEffect'));
export const isRequiresToUpdateNotes = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isRequiresToUpdateNotes'));
export const isWorkaroundsNeedsToBeUpdated = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isWorkaroundsNeedsToBeUpdated'));
export const getDisruptionForWorkaroundEdit = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'disruptionForWorkaroundEdit'));
export const isEditEffectUpdateRequested = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'requestToUpdateEditEffect'));
export const getRequestedDisruptionKeyToUpdateEditEffect = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'requestedDisruptionKeyToUpdateEditEffect'));
export const isCancellationEffectModalOpen = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isCancellationEffectOpen'));
export const isApplyChangesModalOpen = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isApplyChangesOpen'));
export const isPublishAndApplyChangesModalOpen = createSelector(getIncidentsState, incidentsState => result(incidentsState, 'isPublishAndApplyChangesOpen'));
