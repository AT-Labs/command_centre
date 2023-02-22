import { merge } from 'lodash-es';
import { handleActions } from 'redux-actions';
import actionType from '../action-types';

export const INIT_STATE = {
    isLoading: false,
    error: {
        critical: null,
        fetchPastStops: null,
        fetchPastVehicles: null,
        fetchPidInformation: null,
        geocode: null,
        realtime: null,
        routesByStop: null,
        snapshot: null,
        upcomingVehicles: null,
        upcomingStops: null,
        vehicleFleetInfo: null,
        userPermissions: null,
        // The following items (out of realtime) don't use bannerError for being rendered inside a modal
        addBlock: null,
        moveTrips: null,
        createStopMessage: null,
        createStopGroup: null,
    },
    bannerError: null,
    isOpen: false,
};

const clearAnErrorByType = (state, errorType) => {
    if (state.error[errorType]) {
        return {
            ...state,
            error: {
                ...state.error,
                [errorType]: null,
            },
        };
    }
    return state;
};

const handleDataLoading = (state, { payload: { isLoading } }) => ({ ...state, isLoading });
const handleDataError = (state, { payload: { error } }) => (merge({}, state, error));
const handleDataErrorDismiss = (state, { payload: { errorType } }) => clearAnErrorByType(state, errorType);
const handleBannerError = (state, { payload: { error } }) => (merge({}, state, { bannerError: error }));
const handleModalStatus = (state, { payload: { isOpen } }) => ({ ...state, isOpen });

export default handleActions({
    [actionType.DATA_LOADING]: handleDataLoading,
    [actionType.DATA_ERROR]: handleDataError,
    [actionType.DISMISS_DATA_ERROR]: handleDataErrorDismiss,
    [actionType.SET_MODAL_ERROR]: handleBannerError,
    [actionType.SET_MODAL_STATUS]: handleModalStatus,
}, INIT_STATE);
