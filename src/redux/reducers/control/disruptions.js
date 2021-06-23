import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    activeDisruptionId: null,
    permissions: [],
    disruptions: [],
    cachedShapes: {},
    cachedStopsToRoutes: {},
    disruptionToEdit: {},
    affectedEntities: {
        affectedRoutes: [],
        affectedStops: [],
    },
    routesByStop: {},
    deselectAllRoutes: false,
    isCreateEnabled: false,
    isLoading: false,
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
        isCopied: false,
    },
    shapes: [],
    isEditMode: false,
};

const handleDisruptionsLoadingUpdate = (state, { payload: { isLoading } }) => ({ ...state, isLoading });
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
const handleDisruptionActionResultUpdate = (state, { payload: { resultDisruptionId, resultMessage, resultStatus } }) => ({
    ...state,
    action: {
        ...state.action,
        resultMessage,
        resultStatus,
        resultDisruptionId,
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
const handleDeselectRoutes = (state, { payload: { deselectAllRoutes } }) => ({ ...state, deselectAllRoutes });
const handleUpdateAffectedEntities = (state, { payload }) => ({ ...state, affectedEntities: { ...state.affectedEntities, ...payload } });
const handleUpdateCachedShapes = (state, { payload }) => ({ ...state, cachedShapes: { ...state.cachedShapes, ...payload.shapes } });
const handleUpdateCachedStopsToRoutes = (state, { payload }) => ({ ...state, cachedStopsToRoutes: { ...state.cachedStopsToRoutes, ...payload.stopsToRoutes } });

const handleShowRoutes = (state, { payload: { showSelectedRoutes } }) => ({ ...state, showSelectedRoutes });
const handleDisruptionModal = (state, { payload: { type, isOpen } }) => ({
    ...state,
    [type]: isOpen,
});
const handleUpdateCurrentStep = (state, { payload: { activeStep } }) => ({ ...state, activeStep });
const handleUpdateRoutesByStop = (state, { payload: { routesByStop, isLoading } }) => ({ ...state, routesByStop, isLoading });
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
const handleUpdateEditMode = (state, { payload: { isEditMode } }) => ({ ...state, isEditMode });
const handleDisruptionToEdit = (state, { payload: { disruptionToEdit } }) => ({ ...state, disruptionToEdit });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_PERMISSIONS]: handleDisruptionsPermissionsUpdate,
    [ACTION_TYPE.UPDATE_DISRUPTIONS_REVERSE_GEOCODE_LOADING_STATE]: handleDisruptionsReverseGeocodeLoadingUpdate,
    [ACTION_TYPE.UPDATE_DISRUPTIONS_ROUTES_LOADING_STATE]: handleDisruptionsRoutesLoadingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_ACTIVE_DISRUPTION_ID]: handleUpdateActiveDisruptionId,
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING]: handleDisruptionsLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_DISRUPTIONS]: handleDisruptionsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_REQUESTING]: handleDisruptionActionRequestingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT]: handleDisruptionActionResultUpdate,
    [ACTION_TYPE.COPY_DISRUPTION]: handleCopyDisruptionsUpdate,
    [ACTION_TYPE.OPEN_CREATE_DISRUPTIONS]: handleOpenDisruptions,
    [ACTION_TYPE.DESELECT_ALL_ROUTES]: handleDeselectRoutes,
    [ACTION_TYPE.UPDATE_AFFECTED_ENTITIES]: handleUpdateAffectedEntities,
    [ACTION_TYPE.UPDATE_CACHED_SHAPES]: handleUpdateCachedShapes,
    [ACTION_TYPE.UPDATE_CACHED_STOPS_TO_ROUTES]: handleUpdateCachedStopsToRoutes,
    [ACTION_TYPE.SHOW_SELECTED_ROUTES]: handleShowRoutes,
    [ACTION_TYPE.SET_DISRUPTIONS_MODAL_STATUS]: handleDisruptionModal,
    [ACTION_TYPE.UPDATE_CURRENT_STEP]: handleUpdateCurrentStep,
    [ACTION_TYPE.UPDATE_ROUTES_BY_STOP]: handleUpdateRoutesByStop,
    [ACTION_TYPE.DELETE_AFFECTED_ENTITIES]: handleAffectedEntities,
    [ACTION_TYPE.RESET_STATE]: handleResetState,
    [ACTION_TYPE.UPDATE_EDIT_MODE]: handleUpdateEditMode,
    [ACTION_TYPE.UPDATE_DISRUPTION_TO_EDIT]: handleDisruptionToEdit,
}, INIT_STATE);
