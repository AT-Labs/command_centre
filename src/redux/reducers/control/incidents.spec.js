import reducer, { INIT_STATE } from './incidents';
import ACTION_TYPE from '../../action-types';
import EDIT_TYPE from '../../../types/edit-types';

describe('incidents reducer (Jest)', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(INIT_STATE);
    });

    it('should handle UPDATE_CONTROL_INCIDENTS_LOADING', () => {
        const action = {
            type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_LOADING,
            payload: { isLoading: true },
        };
        expect(reducer(undefined, action).isLoading).toBe(true);
    });

    it('should handle UPDATE_CONTROL_ACTIVE_INCIDENT_ID', () => {
        const action = {
            type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_INCIDENT_ID,
            payload: { activeIncidentId: 'abc123' },
        };
        expect(reducer(undefined, action).activeIncidentId).toBe('abc123');
    });

    it('should handle FETCH_CONTROL_INCIDENTS_DISRUPTIONS', () => {
        const disruptions = [{ id: 1 }, { id: 2 }];
        const action = {
            type: ACTION_TYPE.FETCH_CONTROL_INCIDENTS_DISRUPTIONS,
            payload: { disruptions },
        };
        expect(reducer(undefined, action).disruptions).toEqual(disruptions);
    });

    it('should handle UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING', () => {
        const action = {
            type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING,
            payload: { isRequesting: true, resultIncidentId: 'incident123' },
        };
        const newState = reducer(undefined, action);
        expect(newState.action.isRequesting).toBe(true);
        expect(newState.action.resultIncidentId).toBe('incident123');
    });

    it('should handle RESET_INCIDENT_STATE', () => {
        const preloadedState = {
            ...INIT_STATE,
            activeIncidentId: 'not-null',
        };
        const action = { type: ACTION_TYPE.RESET_INCIDENT_STATE };
        expect(reducer(preloadedState, action)).toEqual(INIT_STATE);
    });

    it('should handle UPDATE_INCIDENT_EDIT_MODE', () => {
        const action = {
            type: ACTION_TYPE.UPDATE_INCIDENT_EDIT_MODE,
            payload: { editMode: EDIT_TYPE.EDIT },
        };
        expect(reducer(undefined, action).editMode).toBe(EDIT_TYPE.EDIT);
    });

    it('should handle UPDATE_INCIDENT_FILTERS', () => {
        const filters = { selectedStatus: 'active' };
        const action = {
            type: ACTION_TYPE.UPDATE_INCIDENT_FILTERS,
            payload: { filters },
        };
        expect(reducer(undefined, action).filters.selectedStatus).toBe('active');
    });

    it('should handle UPDATE_INCIDENT_TO_EDIT', () => {
        const incidentToEdit = { id: 'disruption1' };
        const action = {
            type: ACTION_TYPE.UPDATE_INCIDENT_TO_EDIT,
            payload: { incidentToEdit },
        };
        expect(reducer(undefined, action).incidentToEdit).toEqual(incidentToEdit);
    });

    it('should handle OPEN_COPY_INCIDENTS', () => {
        const action = {
            type: ACTION_TYPE.OPEN_COPY_INCIDENTS,
            payload: { isCreateEnabled: true, sourceIncidentId: 'INC123' },
        };
        const newState = reducer(undefined, action);
        expect(newState.isCreateEnabled).toBe(true);
        expect(newState.sourceIncidentId).toBe('INC123');
    });

    it('should handle UPDATE_CONTROL_INCIDENTS_SORTING_PARAMS', () => {
        const sortingParams = { field: 'date', order: 'desc' };
        const action = {
            type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_SORTING_PARAMS,
            payload: { sortingParams },
        };
        expect(reducer(undefined, action).sortingParams).toEqual(sortingParams);
    });

    it('should handle UPDATE_INCIDENT_DATAGRID_CONFIG', () => {
        const datagridConfig = { pageSize: 20 };
        const action = {
            type: ACTION_TYPE.UPDATE_INCIDENT_DATAGRID_CONFIG,
            payload: datagridConfig,
        };
        expect(reducer(undefined, action).datagridConfig.pageSize).toBe(20);
    });

    it('should handle SHOW_INCIDENT_SELECTED_ROUTES', () => {
        const action = {
            type: ACTION_TYPE.SHOW_INCIDENT_SELECTED_ROUTES,
            payload: { showSelectedRoutes: true },
        };
        expect(reducer(undefined, action).showSelectedRoutes).toBe(true);
    });

    it('should handle SET_INCIDENTS_MODAL_STATUS', () => {
        const action = {
            type: ACTION_TYPE.SET_INCIDENTS_MODAL_STATUS,
            payload: { type: 'isConfirmationOpen', isOpen: true },
        };
        expect(reducer(undefined, action).isConfirmationOpen).toBe(true);
    });
});
