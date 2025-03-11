import ACTION_TYPE from '../../action-types';

// TomTom
export const updateShowIncidents = showIncidents => ({
    type: ACTION_TYPE.UPDATE_SHOW_INCIDENTS,
    payload: {
        showIncidents,
    },
});

export const updateSelectedIncidentFilters = selectedIncidentFilters => ({
    type: ACTION_TYPE.UPDATE_SELECTED_INCIDENT_FILTERS,
    payload: {
        selectedIncidentFilters,
    },
});

export const updateSelectedCongestionFilters = selectedCongestionFilters => ({
    type: ACTION_TYPE.UPDATE_SELECTED_CONGESTION_FILTERS,
    payload: {
        selectedCongestionFilters,
    },
});

export const updateShowRouteAlerts = payload => ({ type: ACTION_TYPE.UPDATE_SHOW_ROUTE_ALERTS, payload });
export const updateShowAllRouteAlerts = payload => ({ type: ACTION_TYPE.UPDATE_SHOW_ALL_ROUTE_ALERTS, payload });
export const updateSelectedRouteAlerts = payload => ({ type: ACTION_TYPE.UPDATE_SELECTED_ROUTE_ALERTS, payload });

// Roadworks
export const updateShowRoadworks = payload => ({ type: ACTION_TYPE.UPDATE_SHOW_ROADWORKS, payload });
export const updateSelectedRoadworksFilters = payload => ({ type: ACTION_TYPE.UPDATE_SELECTED_ROADWORKS_FILTERS, payload });
export const resetShowRoadworks = payload => ({ type: ACTION_TYPE.RESET_SHOW_ROADWORKS, payload });
export const calledRoadworksApi = payload => ({ type: ACTION_TYPE.UPDATE_ROADWORKS_CALLED_API, payload });
