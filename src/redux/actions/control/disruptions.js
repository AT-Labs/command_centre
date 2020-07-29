import _ from 'lodash-es';

import { ACTION_RESULT } from '../../../types/disruptions-types';
import ERROR_TYPE from '../../../types/error-types';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../action-types';
import { setBannerError } from '../activity';

const loadDisruptions = disruptions => ({
    type: ACTION_TYPE.FETCH_CONTROL_DISRUPTIONS,
    payload: {
        disruptions,
    },
});

const updateDisruptionsRoutesLoadingState = isDisruptionsRoutesLoading => ({
    type: ACTION_TYPE.UPDATE_DISRUPTIONS_ROUTES_LOADING_STATE,
    payload: {
        isDisruptionsRoutesLoading,
    },
});

const updateDisruptionsPermissions = permissions => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_PERMISSIONS,
    payload: {
        permissions,
    },
});

const updateLoadingDisruptionsState = isLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING,
    payload: {
        isLoading,
    },
});

const updateRequestingDisruptionState = (isRequesting, resultDisruptionId) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_REQUESTING,
    payload: {
        isRequesting,
        resultDisruptionId,
    },
});

const updateRequestingDisruptionResult = (resultDisruptionId, { resultStatus, resultMessage }) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
    payload: {
        resultDisruptionId,
        resultStatus,
        resultMessage,
    },
});

const copyDisruptionToClipboard = isCopied => ({
    type: ACTION_TYPE.COPY_DISRUPTION,
    payload: {
        isCopied,
    },
});

export const getDisruptions = (isVisible = true) => (dispatch) => {
    dispatch(updateLoadingDisruptionsState(!!isVisible));
    return disruptionsMgtApi.getDisruptions()
        .then((response) => {
            const { disruptions, _links: { permissions } } = response;
            dispatch(updateDisruptionsPermissions(permissions));
            dispatch(loadDisruptions(disruptions));
        })
        .catch(() => {
            if (ERROR_TYPE.fetchDisruptionsEnabled) {
                const errorMessage = ERROR_TYPE.fetchDisruptions;
                dispatch(setBannerError(errorMessage));
            }
        })
        .finally(() => dispatch(updateLoadingDisruptionsState(false)));
};

export const updateDisruption = disruption => async (dispatch) => {
    const { disruptionId, incidentNo } = disruption;
    dispatch(updateRequestingDisruptionState(true, disruptionId));
    try {
        await disruptionsMgtApi.updateDisruption(disruption);
        dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.UPDATE_SUCCESS(incidentNo)));
    } catch (error) {
        dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.UPDATE_ERROR(incidentNo, error.code)));
    } finally {
        dispatch(updateRequestingDisruptionState(false, disruptionId));
    }

    await dispatch(getDisruptions(false));
};

export const clearDisruptionActionResult = () => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
    payload: {
        disruptionId: null,
        resultStatus: null,
        resultMessage: null,
    },
});

export const updateActiveDisruptionId = activeDisruptionId => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_DISRUPTION_ID,
        payload: {
            activeDisruptionId,
        },
    });
    dispatch(clearDisruptionActionResult());
};

export const createDisruption = disruption => async (dispatch) => {
    let response;
    dispatch(updateRequestingDisruptionState(true));
    try {
        response = await disruptionsMgtApi.createDisruption(disruption);
        dispatch(updateRequestingDisruptionResult(response.disruptionId, ACTION_RESULT.CREATE_SUCCESS(response.incidentNo)));
    } catch (error) {
        dispatch(updateRequestingDisruptionResult(null, ACTION_RESULT.CREATE_ERROR(error.code)));
    } finally {
        dispatch(updateRequestingDisruptionState(false));
    }

    await dispatch(getDisruptions(false));
};

export const getRoutesByStop = stops => async (dispatch) => {
    try {
        dispatch(updateDisruptionsRoutesLoadingState(true));
        if (!_.isEmpty(stops)) {
            const routesByStop = stops.map(
                stop => ccStatic.getRoutesByStop(stop.stop_code)
                    .then(routes => routes),
            );

            return Promise.all(routesByStop)
                .then((routes) => {
                    dispatch(updateDisruptionsRoutesLoadingState(false));
                    return routes;
                });
        }

        dispatch(updateDisruptionsRoutesLoadingState(false));
        return null;
    } catch (error) {
        dispatch(updateDisruptionsRoutesLoadingState(false));
        throw error;
    }
};

export const updateCopyDisruptionState = isCopied => async (dispatch) => {
    dispatch(copyDisruptionToClipboard(isCopied));
};
