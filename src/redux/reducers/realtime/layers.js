import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    showIncidents: false,
    selectedIncidentFilters: [],
    selectedCongestionFilters: [],

    showRoadworks: false,
    selectedRoadworksFilters: [],
    mustCallRoadworks: true, // When first load/after refreshed, we must force call api at least once
};

// Incidents
const handleUpdateShowIncidents = (state, { payload: { showIncidents } }) => ({ ...state, showIncidents });
const handleUpdateSelectedIncidentFilters = (state, { payload: { selectedIncidentFilters } }) => ({ ...state, selectedIncidentFilters });
const handleUpdateSelectedCongestionFilters = (state, { payload: { selectedCongestionFilters } }) => ({ ...state, selectedCongestionFilters });

// Roadworks
const handleUpdateShowRoadworks = (state, { payload: { showRoadworks, selectedRoadworksFilters } }) => ({
    ...state,
    showRoadworks,
    selectedRoadworksFilters,
});

const handleUpdateSelectedRoadworksFilters = (state, { payload: { selectedRoadworksFilters } }) => ({ ...state, selectedRoadworksFilters });
const handleResetSelectedRoadworksFilters = state => ({
    ...state,
    selectedRoadworksFilters: [],
    showRoadworks: false,
});

const handleUpdateMustCallRoadworks = state => ({ ...state, mustCallRoadworks: false });
export default handleActions({
    // Incidents
    [ACTION_TYPE.UPDATE_SHOW_INCIDENTS]: handleUpdateShowIncidents,
    [ACTION_TYPE.UPDATE_SELECTED_INCIDENT_FILTERS]: handleUpdateSelectedIncidentFilters,
    [ACTION_TYPE.UPDATE_SELECTED_CONGESTION_FILTERS]: handleUpdateSelectedCongestionFilters,

    // Roadworks
    [ACTION_TYPE.UPDATE_SHOW_ROADWORKS]: handleUpdateShowRoadworks,
    [ACTION_TYPE.UPDATE_SELECTED_ROADWORKS_FILTERS]: handleUpdateSelectedRoadworksFilters,
    [ACTION_TYPE.RESET_SHOW_ROADWORKS]: handleResetSelectedRoadworksFilters,
    [ACTION_TYPE.UPDATE_ROADWORKS_CALLED_API]: handleUpdateMustCallRoadworks,

}, INIT_STATE);
