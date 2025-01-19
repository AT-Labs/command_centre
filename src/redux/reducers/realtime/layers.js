import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    showIncidents: false,
    selectedIncidentFilters: [],
    selectedCongestionFilters: [],
};

const handleUpdateShowIncidents = (state, { payload: { showIncidents } }) => ({ ...state, showIncidents });
const handleUpdateSelectedIncidentFilters = (state, { payload: { selectedIncidentFilters } }) => ({ ...state, selectedIncidentFilters });
const handleUpdateSelectedCongestionFilters = (state, { payload: { selectedCongestionFilters } }) => ({ ...state, selectedCongestionFilters });

export default handleActions({
    [ACTION_TYPE.UPDATE_SHOW_INCIDENTS]: handleUpdateShowIncidents,
    [ACTION_TYPE.UPDATE_SELECTED_INCIDENT_FILTERS]: handleUpdateSelectedIncidentFilters,
    [ACTION_TYPE.UPDATE_SELECTED_CONGESTION_FILTERS]: handleUpdateSelectedCongestionFilters,
}, INIT_STATE);
