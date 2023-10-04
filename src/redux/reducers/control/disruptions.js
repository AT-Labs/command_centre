import { handleActions } from 'redux-actions';
import EDIT_TYPE from '../../../types/edit-types';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    activeDisruptionId: null,
    permissions: [],
    disruptions: [],
    cachedShapes: {},
    cachedRoutesToStops: {},
    cachedStopsToRoutes: {},
    disruptionToEdit: {},
    affectedEntities: {
        affectedRoutes: [],
        affectedStops: [],
    },
    stopsByRoute: {},
    routesByStop: {},
    isCreateEnabled: false,
    isLoading: false,
    isLoadingStopsByRoute: false,
    isLoadingRoutesByStop: false,
    isConfirmationOpen: false,
    isCancellationOpen: false,
    isDisruptionsReverseGeocodeLoading: false,
    isDisruptionsRoutesLoading: false,
    showSelectedRoutes: false,
    activeStep: 1,
    action: {
        resultDisruptionId: null,
        isRequesting: false,
        resultStatus: null,
        resultMessage: null,
        resultCreateNotification: false,
        isCopied: false,
    },
    shapes: [],
    editMode: EDIT_TYPE.CREATE,
    sourceIncidentNo: null,
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
        pageSize: 15,
        sortModel: [],
        density: 'standard',
        routeSelection: '',
        filterModel: { items: [], linkOperator: 'and' },
        pinnedColumns: { right: ['__go_to_notification__', '__detail_panel_toggle__'] },
    },
};

const handleDisruptionsLoadingUpdate = (state, { payload: { isLoading } }) => ({ ...state, isLoading });
const handleDisruptionsLoadingStopsByRouteUpdate = (state, { payload: { isLoadingStopsByRoute } }) => ({ ...state, isLoadingStopsByRoute });
const handleDisruptionsLoadingRoutesByStopUpdate = (state, { payload: { isLoadingRoutesByStop } }) => ({ ...state, isLoadingRoutesByStop });
const handleDisruptionsReverseGeocodeLoadingUpdate = (state, { payload: { isDisruptionsReverseGeocodeLoading } }) => ({ ...state, isDisruptionsReverseGeocodeLoading });
const handleDisruptionsRoutesLoadingUpdate = (state, { payload: { isDisruptionsRoutesLoading } }) => ({ ...state, isDisruptionsRoutesLoading });
const handleUpdateActiveDisruptionId = (state, { payload: { activeDisruptionId } }) => ({ ...state, activeDisruptionId });
const handleDisruptionsUpdate = (state, { payload: { disruptions } }) => ({ ...state, disruptions });
const handleDisruptionsPermissionsUpdate = (state, { payload: { permissions } }) => ({ ...state, permissions });
const handleDisruptionActionRequestingUpdate = (state, { payload: { isRequesting, resultDisruptionId = state.action.resultDisruptionId } }) => ({
    ...state,
    action: {
        ...state.action,
        isRequesting,
        resultDisruptionId,
    },
});
const handleDisruptionActionResultUpdate = (state, { payload: { resultDisruptionId, resultMessage, resultStatus, resultCreateNotification, resultDisruptionVersion } }) => ({
    ...state,
    action: {
        ...state.action,
        resultMessage,
        resultStatus,
        resultDisruptionId,
        resultCreateNotification,
        resultDisruptionVersion,
    },
});

const handleCopyDisruptionsUpdate = (state, { payload: { isCopied } }) => ({
    ...state,
    action: {
        ...state.action,
        isCopied,
    },
});

const handleOpenDisruptions = (state, { payload: { isCreateEnabled } }) => ({ ...state, isCreateEnabled });
const handleOpenCopyDisruptions = (state, { payload: { isCreateEnabled, sourceIncidentNo } }) => ({ ...state, isCreateEnabled, sourceIncidentNo });
const handleUpdateAffectedEntities = (state, { payload }) => ({ ...state, affectedEntities: { ...state.affectedEntities, ...payload } });
const handleUpdateCachedShapes = (state, { payload }) => ({ ...state, cachedShapes: { ...state.cachedShapes, ...payload.shapes } });
const handleUpdateCachedRoutesToStops = (state, { payload }) => ({ ...state, cachedRoutesToStops: { ...state.cachedRoutesToStops, ...payload.routesToStops } });
const handleUpdateCachedStopsToRoutes = (state, { payload }) => ({ ...state, cachedStopsToRoutes: { ...state.cachedStopsToRoutes, ...payload.stopsToRoutes } });

const handleShowRoutes = (state, { payload: { showSelectedRoutes } }) => ({ ...state, showSelectedRoutes });
const handleDisruptionModal = (state, { payload: { type, isOpen } }) => ({
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
const handleDisruptionToEdit = (state, { payload: { disruptionToEdit } }) => ({ ...state, disruptionToEdit });
const handleUpdateDisruptionFilters = (state, { payload: { filters } }) => ({ ...state, filters: { ...state.filters, ...filters } });

const handleDatagridConfig = (state, action) => ({ ...state, datagridConfig: { ...state.datagridConfig, ...action.payload } });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_PERMISSIONS]: handleDisruptionsPermissionsUpdate,
    [ACTION_TYPE.UPDATE_DISRUPTIONS_REVERSE_GEOCODE_LOADING_STATE]: handleDisruptionsReverseGeocodeLoadingUpdate,
    [ACTION_TYPE.UPDATE_DISRUPTIONS_ROUTES_LOADING_STATE]: handleDisruptionsRoutesLoadingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_ACTIVE_DISRUPTION_ID]: handleUpdateActiveDisruptionId,
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING]: handleDisruptionsLoadingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING_STOPS_BY_ROUTE]: handleDisruptionsLoadingStopsByRouteUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING_ROUTES_BY_STOP]: handleDisruptionsLoadingRoutesByStopUpdate,
    [ACTION_TYPE.FETCH_CONTROL_DISRUPTIONS]: handleDisruptionsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_REQUESTING]: handleDisruptionActionRequestingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT]: handleDisruptionActionResultUpdate,
    [ACTION_TYPE.COPY_DISRUPTION]: handleCopyDisruptionsUpdate,
    [ACTION_TYPE.OPEN_CREATE_DISRUPTIONS]: handleOpenDisruptions,
    [ACTION_TYPE.OPEN_COPY_DISRUPTIONS]: handleOpenCopyDisruptions,
    [ACTION_TYPE.UPDATE_AFFECTED_ENTITIES]: handleUpdateAffectedEntities,
    [ACTION_TYPE.UPDATE_CACHED_SHAPES]: handleUpdateCachedShapes,
    [ACTION_TYPE.UPDATE_CACHED_ROUTES_TO_STOPS]: handleUpdateCachedRoutesToStops,
    [ACTION_TYPE.UPDATE_CACHED_STOPS_TO_ROUTES]: handleUpdateCachedStopsToRoutes,
    [ACTION_TYPE.SHOW_SELECTED_ROUTES]: handleShowRoutes,
    [ACTION_TYPE.SET_DISRUPTIONS_MODAL_STATUS]: handleDisruptionModal,
    [ACTION_TYPE.UPDATE_CURRENT_STEP]: handleUpdateCurrentStep,
    [ACTION_TYPE.UPDATE_STOPS_BY_ROUTE]: handleUpdateStopsByRoute,
    [ACTION_TYPE.UPDATE_ROUTES_BY_STOP]: handleUpdateRoutesByStop,
    [ACTION_TYPE.DELETE_AFFECTED_ENTITIES]: handleAffectedEntities,
    [ACTION_TYPE.RESET_STATE]: handleResetState,
    [ACTION_TYPE.UPDATE_EDIT_MODE]: handleUpdateEditMode,
    [ACTION_TYPE.UPDATE_DISRUPTION_TO_EDIT]: handleDisruptionToEdit,
    [ACTION_TYPE.UPDATE_DISRUPTION_FILTERS]: handleUpdateDisruptionFilters,
    [ACTION_TYPE.UPDATE_DISRUPTION_DATAGRID_CONFIG]: handleDatagridConfig,
}, INIT_STATE);
