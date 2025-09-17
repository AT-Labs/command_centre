import { handleActions } from 'redux-actions';
import EDIT_TYPE from '../../../types/edit-types';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    activeIncidentId: null,
    activeDisruptionId: null,
    permissions: [],
    disruptions: [],
    incidents: [],
    sortingParams: {},
    cachedShapes: {},
    cachedRoutesToStops: {},
    cachedStopsToRoutes: {},
    incidentToEdit: {},
    affectedEntities: {
        affectedRoutes: [],
        affectedStops: [],
    },
    currentPage: 1,
    stopsByRoute: {},
    routesByStop: {},
    isCreateEnabled: false,
    isLoading: false,
    isLoadingStopsByRoute: false,
    isLoadingRoutesByStop: false,
    isIncidentForEditLoading: false,
    isConfirmationOpen: false,
    isCancellationOpen: false,
    isDisruptionsReverseGeocodeLoading: false,
    isDisruptionsRoutesLoading: false,
    showSelectedRoutes: false,
    activeStep: 1,
    action: {
        resultIncidentId: null,
        isRequesting: false,
        resultStatus: null,
        resultMessage: null,
        resultCreateNotification: false,
        isCopied: false,
    },
    shapes: [],
    editMode: EDIT_TYPE.CREATE,
    sourceIncidentId: null,
    filters: {
        selectedEntity: {},
        selectedStatus: '',
        selectedStartDate: null,
        selectedEndDate: null,
        selectedImpact: null,
    },
    datagridConfig: {
        columns: [],
        page: 0,
        pageSize: 100,
        sortModel: [],
        density: 'standard',
        routeSelection: '',
        filterModel: { items: [], linkOperator: 'and' },
        pinnedColumns: { right: ['__go_to_disruption_details__', '__go_to_notification__', '__detail_panel_toggle__'] },
    },
    isCreateDiversionEnabled: false,
    diversionEditMode: EDIT_TYPE.CREATE,
    isWorkaroundPanelOpen: false,
    disruptionKeyToWorkaroundEdit: '',
    disruptionKeyToEditEffect: '',
    isEditEffectPanelOpen: false,
    isRequiresToUpdateNotes: false,
    isWorkaroundsNeedsToBeUpdated: false,
    disruptionForWorkaroundEdit: {},
    requestToUpdateEditEffect: false,
    requestedDisruptionKeyToUpdateEditEffect: '',
    isCancellationEffectOpen: false,
    isApplyChangesOpen: false,
    isPublishAndApplyChangesOpen: false,
    selectedEffect: null,
};

const handleIncidentsLoadingUpdate = (state, { payload: { isLoading } }) => ({ ...state, isLoading });
const handleIncidentsLoadingStopsByRouteUpdate = (state, { payload: { isLoadingStopsByRoute } }) => ({ ...state, isLoadingStopsByRoute });
const handleIncidentsLoadingRoutesByStopUpdate = (state, { payload: { isLoadingRoutesByStop } }) => ({ ...state, isLoadingRoutesByStop });
const handleIncidentForEditLoadingUpdate = (state, { payload: { isIncidentForEditLoading } }) => ({ ...state, isIncidentForEditLoading });
const handleIncidentsReverseGeocodeLoadingUpdate = (state, { payload: { isIncidentsReverseGeocodeLoading } }) => ({ ...state, isIncidentsReverseGeocodeLoading });
const handleIncidentsRoutesLoadingUpdate = (state, { payload: { isIncidentsRoutesLoading } }) => ({ ...state, isIncidentsRoutesLoading });
const handleUpdateActiveIncidentId = (state, { payload: { activeIncidentId } }) => ({ ...state, activeIncidentId });
const handleIncidentsDisruptionsUpdate = (state, { payload: { disruptions } }) => ({ ...state, disruptions });
const handleIncidentsUpdate = (state, { payload: { incidents } }) => ({ ...state, incidents });
const handleIncidentsPermissionsUpdate = (state, { payload: { permissions } }) => ({ ...state, permissions });
const handleIncidentActionRequestingUpdate = (state, { payload: { isRequesting, resultIncidentId = state.action.resultIncidentId } }) => ({
    ...state,
    action: {
        ...state.action,
        isRequesting,
        resultIncidentId,
    },
});
const handleIncidentActionResultUpdate = (state, { payload: { resultIncidentId, resultMessage, resultStatus, resultCreateNotification, resultDisruptionVersion } }) => ({
    ...state,
    action: {
        ...state.action,
        resultMessage,
        resultStatus,
        resultIncidentId,
        resultCreateNotification,
        resultDisruptionVersion,
    },
});
const handleUpdateSelectedEffect = (state, { payload: { selectedEffect } }) => ({ ...state, selectedEffect });

const handleCopyIncidentsUpdate = (state, { payload: { isCopied } }) => ({
    ...state,
    action: {
        ...state.action,
        isCopied,
    },
});

const handleOpenIncidents = (state, { payload: { isCreateEnabled } }) => ({ ...state, isCreateEnabled });
const handleOpenCopyIncidents = (state, { payload: { isCreateEnabled, sourceIncidentId } }) => ({ ...state, isCreateEnabled, sourceIncidentId });
const handleUpdateAffectedEntities = (state, { payload }) => ({ ...state, affectedEntities: { ...state.affectedEntities, ...payload } });
const handleUpdateCachedShapes = (state, { payload }) => ({ ...state, cachedShapes: { ...state.cachedShapes, ...payload.shapes } });
const handleUpdateCachedRoutesToStops = (state, { payload }) => ({ ...state, cachedRoutesToStops: { ...state.cachedRoutesToStops, ...payload.routesToStops } });
const handleUpdateCachedStopsToRoutes = (state, { payload }) => ({ ...state, cachedStopsToRoutes: { ...state.cachedStopsToRoutes, ...payload.stopsToRoutes } });

const handleShowRoutes = (state, { payload: { showSelectedRoutes } }) => ({ ...state, showSelectedRoutes });
const handleIncidentModal = (state, { payload: { type, isOpen } }) => ({
    ...state,
    [type]: isOpen,
});
const handleUpdateCurrentStep = (state, { payload: { activeStep } }) => ({ ...state, activeStep });
const handleUpdateStopsByRoute = (state, { payload: { stopsByRoute, isLoadingStopsByRoute } }) => ({ ...state, stopsByRoute, isLoadingStopsByRoute });
const handleUpdateRoutesByStop = (state, { payload: { routesByStop, isLoadingRoutesByStop } }) => ({ ...state, routesByStop, isLoadingRoutesByStop });
const handleAffectedEntities = (state, { payload: {
    showSelectedRoutes,
    affectedEntities,
    activeStep,
    routesByStop,
} }) => ({
    ...state,
    showSelectedRoutes,
    affectedEntities,
    activeStep,
    routesByStop,
});
const handleResetState = () => ({ ...INIT_STATE });
const handleUpdateEditMode = (state, { payload: { editMode } }) => ({ ...state, editMode });
const handleIncidentToEdit = (state, { payload: { incidentToEdit } }) => ({ ...state, incidentToEdit });
const handleUpdateIncidentFilters = (state, { payload: { filters } }) => ({ ...state, filters: { ...state.filters, ...filters } });

const handleDatagridConfig = (state, action) => ({ ...state, datagridConfig: { ...state.datagridConfig, ...action.payload } });

const handleOpenCreateDiversion = (state, { payload: { isCreateDiversionEnabled } }) => ({ ...state, isCreateDiversionEnabled });
const handleUpdateDiversionEditMode = (state, { payload: { diversionEditMode } }) => ({ ...state, diversionEditMode });
const handleUpdateSetAllIncidents = (state, { payload: { allIncidents } }) => ({ ...state, incidents: allIncidents });
const handleUpdateSetAllIncidentsDisruptions = (state, { payload: { allDisruptions } }) => ({ ...state, disruptions: allDisruptions });
const handleSortingParamsUpdate = (state, { payload: { sortingParams } }) => ({ ...state, sortingParams });
const handleWorkaroundPanel = (state, { payload: { isOpen } }) => ({
    ...state,
    isWorkaroundPanelOpen: isOpen,
});
const handleEditEffectPanel = (state, { payload: { isEditEffectPanelOpen } }) => ({ ...state, isEditEffectPanelOpen });
const handleDisruptionKeyToWorkaroundEdit = (state, { payload: { disruptionKeyToWorkaroundEdit } }) => ({ ...state, disruptionKeyToWorkaroundEdit });
const handleDisruptionKeyToEditEffect = (state, { payload: { disruptionKeyToEditEffect } }) => ({ ...state, disruptionKeyToEditEffect });
const handleUpdateEffectRequiresToUpdateNotes = (state, { payload: { isRequiresToUpdateNotes } }) => ({ ...state, isRequiresToUpdateNotes });
const handleUpdateWorkaroundsForm = (state, { payload: { isWorkaroundsNeedsToBeUpdated } }) => ({ ...state, isWorkaroundsNeedsToBeUpdated });
const handleDisruptionForWorkaroundEdit = (state, { payload: { disruptionForWorkaroundEdit } }) => ({ ...state, disruptionForWorkaroundEdit });
const handleRequestToUpdateEditEffect = (state, { payload: { requestToUpdateEditEffect } }) => ({ ...state, requestToUpdateEditEffect });
const handleUpdateDisruptionKeyToUpdateEditEffect = (state, { payload: { requestedDisruptionKeyToUpdateEditEffect } }) => ({ ...state, requestedDisruptionKeyToUpdateEditEffect });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_PERMISSIONS]: handleIncidentsPermissionsUpdate,
    [ACTION_TYPE.UPDATE_INCIDENTS_REVERSE_GEOCODE_LOADING_STATE]: handleIncidentsReverseGeocodeLoadingUpdate,
    [ACTION_TYPE.UPDATE_INCIDENTS_ROUTES_LOADING_STATE]: handleIncidentsRoutesLoadingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_ACTIVE_INCIDENT_ID]: handleUpdateActiveIncidentId,
    [ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_LOADING]: handleIncidentsLoadingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_LOADING_STOPS_BY_ROUTE]: handleIncidentsLoadingStopsByRouteUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_LOADING_ROUTES_BY_STOP]: handleIncidentsLoadingRoutesByStopUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_INCIDENT_FOR_EDIT_LOADING]: handleIncidentForEditLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_INCIDENTS_DISRUPTIONS]: handleIncidentsDisruptionsUpdate,
    [ACTION_TYPE.FETCH_CONTROL_INCIDENTS]: handleIncidentsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING]: handleIncidentActionRequestingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_RESULT]: handleIncidentActionResultUpdate,
    [ACTION_TYPE.COPY_INCIDENT]: handleCopyIncidentsUpdate,
    [ACTION_TYPE.OPEN_CREATE_INCIDENTS]: handleOpenIncidents,
    [ACTION_TYPE.OPEN_COPY_INCIDENTS]: handleOpenCopyIncidents,
    [ACTION_TYPE.UPDATE_INCIDENT_AFFECTED_ENTITIES]: handleUpdateAffectedEntities,
    [ACTION_TYPE.UPDATE_INCIDENT_CACHED_SHAPES]: handleUpdateCachedShapes,
    [ACTION_TYPE.UPDATE_INCIDENT_CACHED_ROUTES_TO_STOPS]: handleUpdateCachedRoutesToStops,
    [ACTION_TYPE.UPDATE_INCIDENT_CACHED_STOPS_TO_ROUTES]: handleUpdateCachedStopsToRoutes,
    [ACTION_TYPE.SHOW_INCIDENT_SELECTED_ROUTES]: handleShowRoutes,
    [ACTION_TYPE.SET_INCIDENTS_MODAL_STATUS]: handleIncidentModal,
    [ACTION_TYPE.UPDATE_INCIDENT_CURRENT_STEP]: handleUpdateCurrentStep,
    [ACTION_TYPE.UPDATE_INCIDENT_STOPS_BY_ROUTE]: handleUpdateStopsByRoute,
    [ACTION_TYPE.UPDATE_INCIDENT_ROUTES_BY_STOP]: handleUpdateRoutesByStop,
    [ACTION_TYPE.DELETE_INCIDENT_AFFECTED_ENTITIES]: handleAffectedEntities,
    [ACTION_TYPE.RESET_INCIDENT_STATE]: handleResetState,
    [ACTION_TYPE.UPDATE_INCIDENT_EDIT_MODE]: handleUpdateEditMode,
    [ACTION_TYPE.UPDATE_INCIDENT_TO_EDIT]: handleIncidentToEdit,
    [ACTION_TYPE.UPDATE_INCIDENT_FILTERS]: handleUpdateIncidentFilters,
    [ACTION_TYPE.UPDATE_INCIDENT_DATAGRID_CONFIG]: handleDatagridConfig,
    [ACTION_TYPE.OPEN_CREATE_DIVERSION]: handleOpenCreateDiversion,
    [ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE]: handleUpdateDiversionEditMode,
    [ACTION_TYPE.UPDATE_CONTROL_SET_ALL_INCIDENTS]: handleUpdateSetAllIncidents,
    [ACTION_TYPE.UPDATE_CONTROL_SET_ALL_INCIDENTS_DISRUPTIONS]: handleUpdateSetAllIncidentsDisruptions,
    [ACTION_TYPE.UPDATE_CONTROL_ACTIVE_INCIDENT]: handleUpdateActiveIncidentId,
    [ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_SORTING_PARAMS]: handleSortingParamsUpdate,
    [ACTION_TYPE.SET_WORKAROUND_PANEL_STATUS]: handleWorkaroundPanel,
    [ACTION_TYPE.UPDATE_DISRUPTION_KEY_TO_WORKAROUND_EDIT]: handleDisruptionKeyToWorkaroundEdit,
    [ACTION_TYPE.SET_EDIT_EFFECT_PANEL_STATUS]: handleEditEffectPanel,
    [ACTION_TYPE.UPDATE_DISRUPTION_KEY_TO_EDIT_EFFECT]: handleDisruptionKeyToEditEffect,
    [ACTION_TYPE.UPDATE_EFFECT_REQUIRES_TO_UPDATE_NOTES]: handleUpdateEffectRequiresToUpdateNotes,
    [ACTION_TYPE.UPDATE_WORKAROUNDS_NEED_TO_BE_UPDATED]: handleUpdateWorkaroundsForm,
    [ACTION_TYPE.SET_DISRUPTION_FOR_WORKAROUND_EDIT]: handleDisruptionForWorkaroundEdit,
    [ACTION_TYPE.SET_REQUEST_TO_UPDATE_EDIT_EFFECT]: handleRequestToUpdateEditEffect,
    [ACTION_TYPE.SET_REQUESTED_DISRUPTION_KEY_TO_UPDATE_EDIT_EFFECT]: handleUpdateDisruptionKeyToUpdateEditEffect,
    [ACTION_TYPE.UPDATE_SELECTED_EFFECT]: handleUpdateSelectedEffect,
}, INIT_STATE);
