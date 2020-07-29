import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    activeDisruptionId: null,
    permissions: [],
    disruptions: [],
    isLoading: false,
    isDisruptionsReverseGeocodeLoading: false,
    isDisruptionsRoutesLoading: false,
    action: {
        resultDisruptionId: null,
        isRequesting: false,
        resultStatus: null,
        resultMessage: null,
        isCopied: false,
    },
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
}, INIT_STATE);
