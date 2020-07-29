import _ from 'lodash-es';
import ACTION_TYPE from '../action-types';
import { getSiteStatus } from '../../utils/transmitters/cc-host';

const dismissDelayHandles = {};
const DISMISS_DELAY_TIME = 10000;

export const updateDataLoading = isLoading => ({
    type: ACTION_TYPE.DATA_LOADING,
    payload: {
        isLoading,
    },
});

export const dismissError = errorType => dispatch => dispatch({
    type: ACTION_TYPE.DISMISS_DATA_ERROR,
    payload: {
        errorType,
    },
});

export const reportError = (error, disableDismiss) => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.DATA_ERROR,
        payload: {
            error,
        },
    });

    if (disableDismiss) return;

    const errorTypes = _.keys(error.error);
    errorTypes.forEach((errorType) => {
        if (dismissDelayHandles[errorType]) {
            clearTimeout(dismissDelayHandles[errorType]);
        }

        dismissDelayHandles[errorType] = setTimeout(() => dispatch(dismissError(errorType)), DISMISS_DELAY_TIME);
    });
};

export const setBannerError = error => dispatch => dispatch({
    type: ACTION_TYPE.SET_MODAL_ERROR,
    payload: {
        error,
    },
});

export const checkSiteStatus = () => getSiteStatus().then((isSiteInMaintenance) => {
    if (isSiteInMaintenance === true) {
        window.location.reload();
    }
});

export const startPollingSiteStatus = () => () => {
    checkSiteStatus();
    setInterval(() => checkSiteStatus(), 10000);
};

export const modalStatus = isOpen => ({
    type: ACTION_TYPE.SET_MODAL_STATUS,
    payload: {
        isOpen,
    },
});
