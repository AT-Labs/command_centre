/* eslint-disable camelcase */
import { isEmpty, uniqBy, each } from 'lodash-es';

import { ACTION_RESULT } from '../../../types/disruptions-types';
import ERROR_TYPE from '../../../types/error-types';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import { toCamelCaseKeys } from '../../../utils/control/disruptions';
import ACTION_TYPE from '../../action-types';
import { setBannerError, modalStatus } from '../activity';
import { getCachedShapes, getCachedStopsToRoutes } from '../../selectors/control/disruptions';
import { getAllRoutes } from '../../selectors/static/routes';

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
    type: ACTION_TYPE.UPDATE_AFFECTED_ENTITIES,
    payload: {
        affectedRoutes,
    },
});

export const updateAffectedStopsState = affectedStops => ({
    type: ACTION_TYPE.UPDATE_AFFECTED_ENTITIES,
    payload: {
        affectedStops,
    },
});

export const updateCachedShapesState = shapes => ({
    type: ACTION_TYPE.UPDATE_CACHED_SHAPES,
    payload: {
        shapes,
    },
});

export const updateCachedStopsToRoutes = stopsToRoutes => ({
    type: ACTION_TYPE.UPDATE_CACHED_STOPS_TO_ROUTES,
    payload: {
        stopsToRoutes,
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

export const getRoutesByStop = stops => async (dispatch, getState) => {
    dispatch(updateLoadingDisruptionsState(true));
    if (!isEmpty(stops)) {
        const cachedShapes = getCachedShapes(getState());
        const cachedStopsToRoutes = getCachedStopsToRoutes(getState());

        const routesByStop = {};

        const missingStops = [];
        const missingCacheShapes = {};
        const missingCacheStopsToRoutes = {};

        stops.forEach((stop) => {
            if (cachedStopsToRoutes[stop.stopId]) {
                routesByStop[stop.stopId] = cachedStopsToRoutes[stop.stopId].map(route => ({ ...route, shapeWkt: cachedShapes[route.routeId] }));
                return;
            }
            missingStops.push(stop);
        });

        return Promise.all(missingStops.map(stop => ccStatic.getRoutesByStop(stop.stopCode)))
            .then((allStopsToRoutes) => {
                allStopsToRoutes.forEach((routes, index) => {
                    const camelCaseRoutes = toCamelCaseKeys(uniqBy(routes, 'route_id'));
                    routesByStop[missingStops[index].stopId] = camelCaseRoutes;
                    camelCaseRoutes.forEach((route) => {
                        missingCacheShapes[route.routeId] = route.shapeWkt;
                        missingCacheStopsToRoutes[missingStops[index].stopId] = (missingCacheStopsToRoutes[missingStops[index].stopId] || []).concat([{
                            routeId: route.routeId,
                            routeLongName: route.routeLongName,
                            routeShortName: route.routeShortName,
                            routeType: route.routeType,
                        }]);
                    });
                });
            })
            .catch((error) => {
                dispatch(updateLoadingDisruptionsState(false));
                throw error;
            })
            .finally(() => {
                dispatch(updateCachedShapesState(missingCacheShapes));
                dispatch(updateCachedStopsToRoutes(missingCacheStopsToRoutes));
                dispatch(updateRoutesByStop(routesByStop, false));
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

export const getRoutesByShortName = currentRoutes => (dispatch, getState) => {
    dispatch(updateLoadingDisruptionsState(true));

    const state = getState();
    const cachedShapes = getCachedShapes(state);
    const allRoutes = getAllRoutes(state);

    const missingCacheRoutes = [];
    const missingCacheShapes = {};
    const routesWithShapes = [];

    currentRoutes.map(route => (
        { ...route, routeColor: allRoutes[route.routeId] && allRoutes[route.routeId].route_color }
    )).forEach((route) => {
        if (cachedShapes[route.routeId]) {
            routesWithShapes.push({ ...route, shapeWkt: cachedShapes[route.routeId] });
            return;
        }
        missingCacheRoutes.push(route);
    });

    return Promise.all(missingCacheRoutes.map(route => ccStatic.getRoutesByShortName(route.routeShortName)))
        .then((routes) => {
            each(routes.flat(), ({ route_id, trips }) => {
                if (trips && trips.length > 0 && trips[0].shape_wkt) {
                    const route = missingCacheRoutes.find(({ routeId }) => routeId === route_id);
                    if (route) {
                        route.shapeWkt = trips[0].shape_wkt;
                        routesWithShapes.push(route);
                        missingCacheShapes[route_id] = route.shapeWkt;
                    }
                }
            });

            return routesWithShapes;
        })
        .then(() => {
            dispatch(updateCachedShapesState(missingCacheShapes));
            dispatch(updateAffectedRoutesState(routesWithShapes));
            dispatch(updateLoadingDisruptionsState(false));
        })
        .catch((err) => {
            throw err;
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

export const showAndUpdateAffectedRoutes = (routes, show) => (dispatch) => {
    dispatch(showSelectedRoutesState(show));
    dispatch(updateAffectedRoutesState(routes));
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

export const updateEditMode = isEditMode => ({
    type: ACTION_TYPE.UPDATE_EDIT_MODE,
    payload: {
        isEditMode,
    },
});

export const updateDisruptionToEdit = disruptionToEdit => ({
    type: ACTION_TYPE.UPDATE_DISRUPTION_TO_EDIT,
    payload: {
        disruptionToEdit,
    },
});

export const updateDisruptionFilters = filter => ({
    type: ACTION_TYPE.UPDATE_DISRUPTION_FILTERS,
    payload: {
        filters: filter,
    },
});
