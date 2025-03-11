import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getLayersState = state => result(state, 'realtime.layers');
export const getShowIncidents = createSelector(getLayersState, layersState => result(layersState, 'showIncidents'));
export const getSelectedIncidentFilters = createSelector(getLayersState, layersState => result(layersState, 'selectedIncidentFilters'));
export const getSelectedCongestionFilters = createSelector(getLayersState, layersState => result(layersState, 'selectedCongestionFilters'));
export const getShowRouteAlerts = createSelector(getLayersState, layersState => result(layersState, 'showRouteAlerts'));
export const getShowAllRouteAlerts = createSelector(getLayersState, layersState => result(layersState, 'showAllRouteAlerts'));
export const getSelectedRouteAlerts = createSelector(getLayersState, layersState => result(layersState, 'selectedRouteAlerts'));
export const getSelectedRoadworksFilters = createSelector(getLayersState, layersState => result(layersState, 'selectedRoadworksFilters'));
