/* eslint-disable camelcase */
import { isEmpty, uniqBy, each } from 'lodash-es';

import { ACTION_RESULT, DISRUPTION_TYPE, STATUSES } from '../../../types/disruptions-types';
import ERROR_TYPE from '../../../types/error-types';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import { toCamelCaseKeys } from '../../../utils/control/disruptions';
import ACTION_TYPE from '../../action-types';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';
import { setBannerError, modalStatus } from '../activity';
import { useDraftDisruptions } from '../../selectors/appSettings';
import {
    getAffectedStops,
    getAffectedRoutes,
    getCachedShapes,
    getCachedRoutesToStops,
    getCachedStopsToRoutes,
    getSourceIncidentNo,
    getEditMode,
} from '../../selectors/control/disruptions';
import { getAllRoutes } from '../../selectors/static/routes';
import { getAllStops } from '../../selectors/static/stops';
import EDIT_TYPE from '../../../types/edit-types';

const loadDisruptions = disruptions => ({
    type: ACTION_TYPE.FETCH_CONTROL_DISRUPTIONS,
    payload: {
        disruptions,
    },
});

const updateLoadingDisruptionsState = isLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING,
    payload: {
        isLoading,
    },
});

const updateLoadingStopsByRoute = isLoadingStopsByRoute => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING_STOPS_BY_ROUTE,
    payload: {
        isLoadingStopsByRoute,
    },
});

const updateLoadingRoutesByStop = isLoadingRoutesByStop => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING_ROUTES_BY_STOP,
    payload: {
        isLoadingRoutesByStop,
    },
});

const updateRequestingDisruptionState = (isRequesting, resultDisruptionId) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_REQUESTING,
    payload: {
        isRequesting,
        resultDisruptionId,
    },
});

const updateDisruptionsPermissionsAction = permissions => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_PERMISSIONS,
    payload: {
        permissions,
    },
});

export const updateDisruptionsPermissions = permissions => (dispatch) => {
    dispatch(updateDisruptionsPermissionsAction(permissions));
};

export const updateRequestingDisruptionResult = (
    resultDisruptionId,
    { resultStatus, resultMessage, resultCreateNotification, resultDisruptionVersion },
) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
    payload: {
        resultDisruptionId,
        resultStatus,
        resultMessage,
        resultCreateNotification,
        resultDisruptionVersion,
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

export const updateCachedRoutesToStops = routesToStops => ({
    type: ACTION_TYPE.UPDATE_CACHED_ROUTES_TO_STOPS,
    payload: {
        routesToStops,
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

export const updateStopsByRoute = (stopsByRoute, isLoadingStopsByRoute = false) => ({
    type: ACTION_TYPE.UPDATE_STOPS_BY_ROUTE,
    payload: {
        stopsByRoute,
        isLoadingStopsByRoute,
    },
});

export const updateRoutesByStop = (routesByStop, isLoadingRoutesByStop = false) => ({
    type: ACTION_TYPE.UPDATE_ROUTES_BY_STOP,
    payload: {
        routesByStop,
        isLoadingRoutesByStop,
    },
});

export const getDisruptions = () => (dispatch, getState) => {
    const state = getState();
    return disruptionsMgtApi.getDisruptions(useDraftDisruptions(state))
        .then((response) => {
            const { disruptions, _links: { permissions } } = response;
            dispatch(updateDisruptionsPermissionsAction(permissions));
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
    const { disruptionId, incidentNo, createNotification } = disruption;
    dispatch(updateRequestingDisruptionState(true, disruptionId));

    let result;
    try {
        result = await disruptionsMgtApi.updateDisruption(disruption);
        if (disruption.status === STATUSES.DRAFT) {
            dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.SAVE_DRAFT_SUCCESS(incidentNo, false)));
        } else {
            dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.UPDATE_SUCCESS(incidentNo, createNotification)));
        }
    } catch (error) {
        dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.UPDATE_ERROR(incidentNo, error.code)));
    } finally {
        dispatch(updateRequestingDisruptionState(false, disruptionId));
    }
    await dispatch(getDisruptions());

    return result;
};

export const clearDisruptionActionResult = () => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
    payload: {
        disruptionId: null,
        resultStatus: null,
        resultMessage: null,
        resultDisruptionVersion: null,
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

export const publishDraftDisruption = disruption => async (dispatch) => {
    let response;
    dispatch(updateRequestingDisruptionState(true, disruption.disruptionId));
    try {
        response = await disruptionsMgtApi.updateDisruption(disruption);
        dispatch(
            updateRequestingDisruptionResult(
                disruption.disruptionId,
                ACTION_RESULT.PUBLISH_DRAFT_SUCCESS(response.incidentNo, response.version, response.createNotification),
            ),
        );
    } catch (error) {
        dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.PUBLISH_DRAFT_ERROR(error.code)));
    } finally {
        dispatch(updateRequestingDisruptionState(false, disruption.disruptionId));
    }

    await dispatch(getDisruptions());
    return response;
};

export const createDisruption = disruption => async (dispatch, getState) => {
    let response;
    const state = getState();
    const sourceIncidentNo = getSourceIncidentNo(state);
    const myEditMode = getEditMode(state);

    dispatch(updateRequestingDisruptionState(true));
    try {
        response = await disruptionsMgtApi.createDisruption(disruption);
        if (myEditMode === EDIT_TYPE.COPY) {
            dispatch(
                updateRequestingDisruptionResult(
                    response.disruptionId,
                    ACTION_RESULT.COPY_SUCCESS(response.incidentNo, response.version, response.createNotification, sourceIncidentNo),
                ),
            );
        } else {
            const isNotificationCreated = (disruption.status === STATUSES.DRAFT ? false : response.createNotification);
            dispatch(
                updateRequestingDisruptionResult(
                    response.disruptionId,
                    ACTION_RESULT.CREATE_SUCCESS(response.incidentNo, response.version, isNotificationCreated),
                ),
            );
        }
    } catch (error) {
        dispatch(updateRequestingDisruptionResult(null, ACTION_RESULT.CREATE_ERROR(error.code)));
    } finally {
        dispatch(modalStatus(true));
        dispatch(updateRequestingDisruptionState(false));
        dispatch(updateAffectedRoutesState([]));
    }

    await dispatch(getDisruptions());
};

export const getStopsByRoute = routes => async (dispatch, getState) => {
    dispatch(updateLoadingStopsByRoute(true));
    if (!isEmpty(routes)) {
        const state = getState();
        const cachedRoutesToStops = getCachedRoutesToStops(state);
        const stopsByRoute = {};

        const missingRoutes = [];
        const missingCacheRoutesToStops = {};

        routes.forEach((route) => {
            if (cachedRoutesToStops[route.routeId]) {
                stopsByRoute[route.routeId] = cachedRoutesToStops[route.routeId];
                return;
            }
            missingRoutes.push(route);
        });

        return Promise.all(missingRoutes.map(route => ccStatic.getStopsByRoute(route.routeId)))
            .then((allRoutesToStops) => {
                allRoutesToStops.forEach((stops, index) => {
                    const camelCaseStops = toCamelCaseKeys(stops);
                    stopsByRoute[missingRoutes[index].routeId] = camelCaseStops;
                    missingCacheRoutesToStops[missingRoutes[index].routeId] = camelCaseStops;
                });
            })
            .catch((error) => {
                dispatch(updateLoadingStopsByRoute(false));
                throw error;
            })
            .finally(() => {
                dispatch(updateCachedRoutesToStops(missingCacheRoutesToStops));
                dispatch(updateStopsByRoute(stopsByRoute, false));
            });
    }
    return dispatch(updateLoadingStopsByRoute(false));
};

export const getRoutesByStop = stops => async (dispatch, getState) => {
    dispatch(updateLoadingRoutesByStop(true));
    if (!isEmpty(stops)) {
        const state = getState();
        const allRoutes = getAllRoutes(state);
        const cachedShapes = getCachedShapes(state);
        const cachedStopsToRoutes = getCachedStopsToRoutes(state);

        const routesByStop = {};

        const missingStops = [];
        const missingCacheShapes = {};
        const missingCacheStopsToRoutes = {};

        stops.forEach((stop) => {
            if (cachedStopsToRoutes[stop.stopCode]) {
                routesByStop[stop.stopCode] = cachedStopsToRoutes[stop.stopCode].map(route => ({ ...route, shapeWkt: cachedShapes[route.routeId] }));
                return;
            }
            missingStops.push(stop);
        });

        return Promise.all(missingStops.map(stop => ccStatic.getRoutesByStop(stop.stopCode)))
            .then((allStopsToRoutes) => {
                allStopsToRoutes.forEach((routes, index) => {
                    const camelCaseRoutes = toCamelCaseKeys(uniqBy(routes, 'route_id'));
                    routesByStop[missingStops[index].stopCode] = camelCaseRoutes;
                    camelCaseRoutes.forEach((route) => {
                        missingCacheShapes[route.routeId] = route.shapeWkt;
                        missingCacheStopsToRoutes[missingStops[index].stopCode] = (missingCacheStopsToRoutes[missingStops[index].stopCode] || []).concat([{
                            routeId: route.routeId,
                            routeLongName: route.routeLongName,
                            routeShortName: route.routeShortName,
                            routeType: route.routeType,
                        }]);
                    });
                });
            })
            .catch((error) => {
                dispatch(updateLoadingRoutesByStop(false));
                throw error;
            })
            .finally(() => {
                stops.forEach((stop) => {
                    if (routesByStop[stop.stopCode]) {
                        routesByStop[stop.stopCode] = routesByStop[stop.stopCode].map(route => ({
                            ...route,
                            routeColor: allRoutes[route.routeId] && allRoutes[route.routeId].route_color,
                        }));
                    }
                });
                dispatch(updateCachedShapesState(missingCacheShapes));
                dispatch(updateCachedStopsToRoutes(missingCacheStopsToRoutes));
                dispatch(updateRoutesByStop(routesByStop, false));
            });
    }
    return dispatch(updateLoadingRoutesByStop(false));
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

export const openCopyDisruption = (isCreateEnabled, sourceIncidentNo) => ({
    type: ACTION_TYPE.OPEN_COPY_DISRUPTIONS,
    payload: {
        isCreateEnabled,
        sourceIncidentNo,
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
            activeStep: 2,
            showSelectedRoutes: false,
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [],
            },
            stopsByRoute: {},
            routesByStop: {},
        },
    });
};

const addShapesToEntities = (entities, routesWithShapes) => entities.map((entity) => {
    const mappedEntity = { ...entity };
    if (mappedEntity.routeId) {
        const route = routesWithShapes.find(routeWithShapes => entity.routeId === routeWithShapes.routeId);

        if (route) {
            mappedEntity.shapeWkt = route.shapeWkt;
            mappedEntity.routeColor = route.routeColor;
        }
    }
    return mappedEntity;
});

export const getRoutesByShortName = currentRoutes => (dispatch, getState) => {
    dispatch(updateLoadingDisruptionsState(true));

    const state = getState();
    const cachedShapes = getCachedShapes(state);
    const allRoutes = getAllRoutes(state);
    const affectedStops = getAffectedStops(state);
    const affectedRoutes = getAffectedRoutes(state);

    const missingCacheRoutes = [];
    const missingCacheShapes = {};
    const routesWithShapes = [];
    let stopsWithShapes = [];
    let affectedRoutesWithShapes = [];

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

            stopsWithShapes = addShapesToEntities(affectedStops, routesWithShapes);

            affectedRoutesWithShapes = addShapesToEntities(affectedRoutes, routesWithShapes);

            return [stopsWithShapes, affectedRoutesWithShapes];
        })
        .then(() => {
            dispatch(updateCachedShapesState(missingCacheShapes));
            dispatch(updateAffectedRoutesState(affectedRoutesWithShapes));
            dispatch(updateAffectedStopsState(stopsWithShapes));
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

export const updateEditMode = editModeParam => ({
    type: ACTION_TYPE.UPDATE_EDIT_MODE,
    payload: {
        editMode: editModeParam,
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

export const uploadDisruptionFiles = (disruption, file) => async (dispatch) => {
    const { disruptionId, incidentNo } = disruption;
    dispatch(updateRequestingDisruptionState(true, disruptionId));
    try {
        await disruptionsMgtApi.uploadDisruptionFiles(disruption, file);
        dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.UPDATE_SUCCESS(incidentNo)));
    } catch (error) {
        dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.UPDATE_ERROR(incidentNo, error.code)));
    } finally {
        dispatch(updateRequestingDisruptionState(false, disruptionId));
    }

    await dispatch(getDisruptions());
};

export const deleteDisruptionFile = (disruption, fileId) => async (dispatch) => {
    const { disruptionId, incidentNo } = disruption;
    dispatch(updateRequestingDisruptionState(true, disruptionId));
    try {
        await disruptionsMgtApi.deleteDisruptionFile(disruption, fileId);
        dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.UPDATE_SUCCESS(incidentNo)));
    } catch (error) {
        dispatch(updateRequestingDisruptionResult(disruption.disruptionId, ACTION_RESULT.UPDATE_ERROR(incidentNo, error.code)));
    } finally {
        dispatch(updateRequestingDisruptionState(false, disruptionId));
    }

    await dispatch(getDisruptions());
};

export const updateDisruptionsDatagridConfig = dataGridConfig => ({
    type: ACTION_TYPE.UPDATE_DISRUPTION_DATAGRID_CONFIG,
    payload: dataGridConfig,
});

const geographySearchRoutes = searchBody => async (dispatch, getState) => {
    const routesSearchResult = await ccStatic.geoSearch(searchBody, 'routes');
    const allRoutes = getAllRoutes(getState());
    const enrichedRoutes = routesSearchResult.map(({ route_id }) => {
        const route = allRoutes[route_id];
        return {
            routeId: route.route_id,
            routeType: route.route_type,
            routeShortName: route.route_short_name,
            agencyName: route.agency_name,
            agencyId: route.agency_id,
            text: route.route_short_name,
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: SEARCH_RESULT_TYPE.ROUTE.type,
        };
    });
    const exisingAffectedRoutes = getAffectedRoutes(getState());
    const newAffectedRoutes = [...new Set(exisingAffectedRoutes.concat(enrichedRoutes))];
    dispatch(updateAffectedRoutesState(newAffectedRoutes));
    dispatch(getRoutesByShortName(newAffectedRoutes));
};

const geographySearchStops = searchBody => async (dispatch, getState) => {
    const stopsSearchResult = await ccStatic.geoSearch(searchBody, 'stops');
    const allStops = getAllStops(getState());
    const enrichedStops = stopsSearchResult.map(({ stop_code }) => {
        const stop = allStops[stop_code];
        return {
            stopId: stop.stop_id,
            stopName: stop.stop_name,
            stopCode: stop.stop_code,
            locationType: stop.location_type,
            stopLat: stop.stop_lat,
            stopLon: stop.stop_lon,
            parentStation: stop.parent_station,
            platformCode: stop.platform_code,
            routeType: stop.route_type,
            text: `${stop.stop_code} - ${stop.stop_name}`,
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: SEARCH_RESULT_TYPE.STOP.type,
        };
    });
    const exisingAffectedStops = getAffectedStops(getState());
    const newAffectedStops = [...new Set(exisingAffectedStops.concat(enrichedStops))];
    dispatch(updateAffectedStopsState(newAffectedStops));
};

export const searchByDrawing = (disruptionType, content) => async (dispatch) => {
    dispatch(updateLoadingDisruptionsState(true));

    try {
        if (disruptionType === DISRUPTION_TYPE.ROUTES) {
            await dispatch(geographySearchRoutes(content));
        } else if (disruptionType === DISRUPTION_TYPE.STOPS) {
            await dispatch(geographySearchStops(content));
        }
    } finally {
        dispatch(updateLoadingDisruptionsState(false));
    }
};
