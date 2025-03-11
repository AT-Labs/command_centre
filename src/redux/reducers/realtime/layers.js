import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    showIncidents: false,
    selectedIncidentFilters: [],
    selectedCongestionFilters: [],
    showRouteAlerts: false,
    showAllRouteAlerts: false,
    selectedRouteAlerts: [],

    showRoadworks: false,
    selectedRoadworksFilters: [],
    mustCallRoadworks: true, // When first load/after refreshed, we must force call api at least once
};

// TomTom
const handleUpdateShowIncidents = (state, { payload: { showIncidents } }) => ({ ...state, showIncidents });
const handleUpdateSelectedIncidentFilters = (state, { payload: { selectedIncidentFilters } }) => ({ ...state, selectedIncidentFilters });
const handleUpdateSelectedCongestionFilters = (state, { payload: { selectedCongestionFilters } }) => ({ ...state, selectedCongestionFilters });
const handleUpdateShowRouteAlerts = (state, { payload: { showRouteAlerts } }) => ({ ...state, showRouteAlerts });
const handleUpdateShowAllRouteAlerts = (state, { payload: { showAllRouteAlerts } }) => ({ ...state, showAllRouteAlerts });
const handleUpdateSelectedRouteAlerts = (state, { payload: { selectedRouteAlerts } }) => ({ ...state, selectedRouteAlerts });

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
    // TomTom
    [ACTION_TYPE.UPDATE_SHOW_INCIDENTS]: handleUpdateShowIncidents,
    [ACTION_TYPE.UPDATE_SELECTED_INCIDENT_FILTERS]: handleUpdateSelectedIncidentFilters,
    [ACTION_TYPE.UPDATE_SELECTED_CONGESTION_FILTERS]: handleUpdateSelectedCongestionFilters,
    [ACTION_TYPE.UPDATE_SHOW_ROUTE_ALERTS]: handleUpdateShowRouteAlerts,
    [ACTION_TYPE.UPDATE_SHOW_ALL_ROUTE_ALERTS]: handleUpdateShowAllRouteAlerts,
    [ACTION_TYPE.UPDATE_SELECTED_ROUTE_ALERTS]: handleUpdateSelectedRouteAlerts,

    // Roadworks
    [ACTION_TYPE.UPDATE_SHOW_ROADWORKS]: handleUpdateShowRoadworks,
    [ACTION_TYPE.UPDATE_SELECTED_ROADWORKS_FILTERS]: handleUpdateSelectedRoadworksFilters,
    [ACTION_TYPE.RESET_SHOW_ROADWORKS]: handleResetSelectedRoadworksFilters,
    [ACTION_TYPE.UPDATE_ROADWORKS_CALLED_API]: handleUpdateMustCallRoadworks,

}, INIT_STATE);
