import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getLayersState = state => result(state, 'realtime.layers');
export const getShowIncidents = createSelector(getLayersState, layersState => result(layersState, 'showIncidents'));
export const getSelectedIncidentFilters = createSelector(getLayersState, layersState => result(layersState, 'selectedIncidentFilters'));
export const getSelectedCongestionFilters = createSelector(getLayersState, layersState => result(layersState, 'selectedCongestionFilters'));
