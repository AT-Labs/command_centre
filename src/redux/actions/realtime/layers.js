import ACTION_TYPE from '../../action-types';

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
