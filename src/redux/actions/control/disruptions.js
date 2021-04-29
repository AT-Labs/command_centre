/* eslint-disable camelcase */
import { isEmpty, uniqBy } from 'lodash-es';

import { ACTION_RESULT } from '../../../types/disruptions-types';
import ERROR_TYPE from '../../../types/error-types';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../action-types';
import { setBannerError, modalStatus } from '../activity';

const loadDisruptions = disruptions => ({
    type: ACTION_TYPE.FETCH_CONTROL_DISRUPTIONS,
    payload: {
        disruptions,
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

export const updateAffectedRoutesState = affectedRoutes => ({
    type: ACTION_TYPE.UPDATE_AFFECTED_ROUTES,
    payload: {
        affectedRoutes,
    },
});

export const updateAffectedStopsState = affectedStops => ({
    type: ACTION_TYPE.UPDATE_AFFECTED_STOPS,
    payload: {
        affectedStops,
    },
});

export const updateAffectedEntitiesState = affectedEntities => ({
    type: ACTION_TYPE.UPDATE_AFFECTED_ENTITIES,
    payload: {
        affectedEntities,
    },
});

const showSelectedRoutesState = show => ({
    type: ACTION_TYPE.SHOW_SELECTED_ROUTES,
    payload: {
        showSelectedRoutes: show,
    },
});

export const updateRoutesByStop = (routesByStop, isLoading = false) => ({
    type: ACTION_TYPE.UPDATE_ROUTES_BY_STOP,
    payload: {
        routesByStop,
        isLoading,
    },
});

export const getDisruptions = () => dispatch => disruptionsMgtApi.getDisruptions()
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
        dispatch(modalStatus(true));
        dispatch(updateRequestingDisruptionState(false));
        dispatch(updateAffectedRoutesState([]));
    }

    await dispatch(getDisruptions(false));
};

export const getRoutesByStop = stops => async (dispatch) => {
    dispatch(updateLoadingDisruptionsState(true));
    if (!isEmpty(stops)) {
        const shapesByStop = {};
        return Promise.all(stops.map(stop => ccStatic.getRoutesByStop(stop.stop_code)))
            .then((allRoutes) => {
                allRoutes.forEach((routes, index) => {
                    shapesByStop[stops[index].stop_id] = uniqBy(routes, 'route_id');
                });
            })
            .catch((error) => {
                dispatch(updateLoadingDisruptionsState(false));
                throw error;
            })
            .finally(() => {
                dispatch(updateRoutesByStop(shapesByStop, false));
            });
    }
    return dispatch(updateRoutesByStop({}, false));
};

export const updateCopyDisruptionState = isCopied => async (dispatch) => {
    dispatch(copyDisruptionToClipboard(isCopied));
};

const updateOpenCreateDisruption = isCreateEnabled => ({
    type: ACTION_TYPE.OPEN_CREATE_DISRUPTIONS,
    payload: {
        isCreateEnabled,
    },
});

export const openCreateDisruption = isCreateEnabled => (dispatch) => {
    dispatch(updateOpenCreateDisruption(isCreateEnabled));
};

const updatedSelectedRoutes = () => ({
    type: ACTION_TYPE.DESELECT_ALL_ROUTES,
    payload: {
        deselectAllRoutes: true,
    },
});

export const deselectAllRoutes = () => (dispatch) => {
    dispatch(updatedSelectedRoutes());
};

export const resetState = () => ({
    type: ACTION_TYPE.RESET_STATE,
});

export const deleteAffectedEntities = () => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.DELETE_AFFECTED_ENTITIES,
        payload: {
            activeStep: 1,
            showSelectedRoutes: false,
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [],
            },
            routesByStop: {},
        },
    });
};

export const getRoutes = routesToUpdate => (dispatch) => {
    dispatch(updateLoadingDisruptionsState(true));
    const newRouteSelected = routesToUpdate[routesToUpdate.length - 1];
    ccStatic.getRoutesByShortName(newRouteSelected.route_short_name)
        .then((routes) => {
            const route = routes.find(({ route_id }) => route_id === newRouteSelected.route_id);
            newRouteSelected.shape_wkt = route ? route.trips[0].shape_wkt : '';
            return newRouteSelected;
        }).finally(() => {
            dispatch(updateAffectedRoutesState(routesToUpdate));
            dispatch(updateLoadingDisruptionsState(false));
        });
};

export const cancelCreateDisruption = () => (dispatch) => {
    dispatch(({
        type: ACTION_TYPE.CANCEL_CREATE_DISRUPTIONS,
        payload: {
            affectedRoutes: [],
        },
    }));
};

export const updateAffectedRoutes = (routes, show) => (dispatch) => {
    dispatch(showSelectedRoutesState(show));
    dispatch(updateAffectedRoutesState(routes));
};

export const updateAffectedStops = routes => (dispatch) => {
    dispatch(updateAffectedStopsState(routes));
};

export const toggleDisruptionModals = (type, isOpen) => ({
    type: ACTION_TYPE.SET_DISRUPTIONS_MODAL_STATUS,
    payload: {
        type,
        isOpen,
    },
});

export const updateCurrentStep = activeStep => ({
    type: ACTION_TYPE.UPDATE_CURRENT_STEP,
    payload: {
        activeStep,
    },
});
