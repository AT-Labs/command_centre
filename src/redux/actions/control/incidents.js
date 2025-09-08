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
    getSourceIncidentId,
    getEditMode,
} from '../../selectors/control/incidents';
import { getAllRoutes } from '../../selectors/static/routes';
import { getAllStops } from '../../selectors/static/stops';
import EDIT_TYPE from '../../../types/edit-types';

export const updateIncidentsSortingParams = sortingParams => ({
    type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_SORTING_PARAMS,
    payload: {
        sortingParams,
    },
});

const loadIncidentsDisruptions = disruptions => ({
    type: ACTION_TYPE.FETCH_CONTROL_INCIDENTS_DISRUPTIONS,
    payload: {
        disruptions,
    },
});

const loadIncidents = incidents => ({
    type: ACTION_TYPE.FETCH_CONTROL_INCIDENTS,
    payload: {
        incidents,
    },
});

const updateLoadingIncidentsState = isLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_LOADING,
    payload: {
        isLoading,
    },
});

const updateLoadingStopsByRoute = isLoadingStopsByRoute => ({
    type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_LOADING_STOPS_BY_ROUTE,
    payload: {
        isLoadingStopsByRoute,
    },
});

const updateLoadingRoutesByStop = isLoadingRoutesByStop => ({
    type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_LOADING_ROUTES_BY_STOP,
    payload: {
        isLoadingRoutesByStop,
    },
});

const updateLoadingIncidentForEditState = isIncidentForEditLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_FOR_EDIT_LOADING,
    payload: {
        isIncidentForEditLoading,
    },
});

const updateRequestingIncidentState = (isRequesting, resultIncidentId) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_REQUESTING,
    payload: {
        isRequesting,
        resultIncidentId,
    },
});

const updateIncidentsPermissionsAction = permissions => ({
    type: ACTION_TYPE.UPDATE_CONTROL_INCIDENTS_PERMISSIONS,
    payload: {
        permissions,
    },
});

export const setAllIncidents = allIncidents => ({
    type: ACTION_TYPE.UPDATE_CONTROL_SET_ALL_INCIDENTS,
    payload: {
        allIncidents,
    },
});

export const setAllDisruptions = allDisruptions => ({
    type: ACTION_TYPE.UPDATE_CONTROL_SET_ALL_INCIDENTS_DISRUPTIONS,
    payload: {
        allDisruptions,
    },
});

export const updateIncidentsPermissions = permissions => (dispatch) => {
    dispatch(updateIncidentsPermissionsAction(permissions));
};

export const updateRequestingIncidentResult = (
    resultIncidentId,
    { resultStatus, resultMessage, resultCreateNotification, resultIncidentVersion },
) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_RESULT,
    payload: {
        resultIncidentId,
        resultStatus,
        resultMessage,
        resultCreateNotification,
        resultIncidentVersion,
    },
});

const copyIncidentToClipboard = isCopied => ({
    type: ACTION_TYPE.COPY_INCIDENT,
    payload: {
        isCopied,
    },
});

export const updateAffectedRoutesState = affectedRoutes => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_AFFECTED_ENTITIES,
    payload: {
        affectedRoutes,
    },
});

export const updateAffectedStopsState = affectedStops => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_AFFECTED_ENTITIES,
    payload: {
        affectedStops,
    },
});

export const updateCachedShapesState = shapes => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_CACHED_SHAPES,
    payload: {
        shapes,
    },
});

export const updateCachedRoutesToStops = routesToStops => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_CACHED_ROUTES_TO_STOPS,
    payload: {
        routesToStops,
    },
});

export const updateCachedStopsToRoutes = stopsToRoutes => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_CACHED_STOPS_TO_ROUTES,
    payload: {
        stopsToRoutes,
    },
});

const showSelectedRoutesState = show => ({
    type: ACTION_TYPE.SHOW_INCIDENT_SELECTED_ROUTES,
    payload: {
        showSelectedRoutes: show,
    },
});

export const updateStopsByRoute = (stopsByRoute, isLoadingStopsByRoute = false) => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_STOPS_BY_ROUTE,
    payload: {
        stopsByRoute,
        isLoadingStopsByRoute,
    },
});

export const updateRoutesByStop = (routesByStop, isLoadingRoutesByStop = false) => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_ROUTES_BY_STOP,
    payload: {
        routesByStop,
        isLoadingRoutesByStop,
    },
});

const updateRequiresToUpdateNotesState = isRequiresToUpdateNotes => ({
    type: ACTION_TYPE.UPDATE_EFFECT_REQUIRES_TO_UPDATE_NOTES,
    payload: {
        isRequiresToUpdateNotes,
    },
});

const updateWorkaroundsNeedsToBeUpdatedState = isWorkaroundsNeedsToBeUpdated => ({
    type: ACTION_TYPE.UPDATE_WORKAROUNDS_NEED_TO_BE_UPDATED,
    payload: {
        isWorkaroundsNeedsToBeUpdated,
    },
});

export const getDisruptionsAndIncidents = () => (dispatch, getState) => {
    const state = getState();
    if (!state) {
        return [];
    }
    return disruptionsMgtApi.getIncidents(useDraftDisruptions(state)).then((response) => {
        const { incidents } = response;
        return disruptionsMgtApi.getDisruptions(useDraftDisruptions(state))
            .then((res) => {
                const { disruptions, _links: { permissions } } = res;
                if (disruptions.length > 0) {
                    dispatch(setAllDisruptions(disruptions));
                    dispatch(loadIncidentsDisruptions(disruptions));
                }
                if (incidents.length > 0) {
                    dispatch(setAllIncidents(incidents));
                    dispatch(loadIncidents(incidents));
                }
                if (permissions) dispatch(updateIncidentsPermissionsAction(permissions));
            })
            .catch(() => {
                if (ERROR_TYPE.fetchDisruptionsEnabled) {
                    const errorMessage = ERROR_TYPE.fetchDisruptions;
                    dispatch(setBannerError(errorMessage));
                }
            })
            .finally(() => dispatch(updateLoadingIncidentsState(false)));
    })
        .catch(() => {
            if (ERROR_TYPE.fetchDisruptionsEnabled) {
                const errorMessage = ERROR_TYPE.fetchIncidents;
                dispatch(setBannerError(errorMessage));
            }
        })
        .finally(() => dispatch(updateLoadingIncidentsState(false)));
};

export const clearIncidentActionResult = () => ({
    type: ACTION_TYPE.UPDATE_CONTROL_INCIDENT_ACTION_RESULT,
    payload: {
        incidentId: null,
        resultStatus: null,
        resultMessage: null,
        resultIncidentVersion: null,
    },
});

export const updateActiveIncidentId = activeIncidentId => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_INCIDENT_ID,
        payload: {
            activeIncidentId,
        },
    });
    dispatch(clearIncidentActionResult());
};

export const publishDraftIncident = incident => async (dispatch) => {
    let response;
    dispatch(updateRequestingIncidentState(true, incident.incidentId));
    try {
        response = await disruptionsMgtApi.updateIncident(incident);
        dispatch(
            updateRequestingIncidentResult(
                incident.incidentId,
                ACTION_RESULT.PUBLISH_DRAFT_SUCCESS(response.incidentId, response.version, response.createNotification),
            ),
        );
    } catch (error) {
        dispatch(updateRequestingIncidentResult(incident.incidentId, ACTION_RESULT.PUBLISH_DRAFT_ERROR(error.code)));
    } finally {
        dispatch(updateRequestingIncidentState(false, incident.incidentId));
    }

    await dispatch(getDisruptionsAndIncidents());
    return response;
};

export const createNewIncident = incident => async (dispatch, getState) => {
    let response;
    const state = getState();
    const sourceIncidentId = getSourceIncidentId(state);
    const myEditMode = getEditMode(state);
    dispatch(updateRequestingIncidentState(true));
    try {
        response = await disruptionsMgtApi.createIncident(incident);
        if (myEditMode === EDIT_TYPE.COPY) {
            dispatch(
                updateRequestingIncidentResult(
                    response.incidentId,
                    ACTION_RESULT.COPY_SUCCESS(response.incidentId, response.version, response.createNotification, sourceIncidentId),
                ),
            );
        } else {
            const isNotificationCreated = (incident.status === STATUSES.DRAFT ? false : response.createNotification);
            dispatch(
                updateRequestingIncidentResult(
                    response.incidentId,
                    ACTION_RESULT.CREATE_SUCCESS(response.incidentId, response.version, isNotificationCreated),
                ),
            );
        }
    } catch (error) {
        dispatch(updateRequestingIncidentResult(null, ACTION_RESULT.CREATE_ERROR(error.code)));
    } finally {
        dispatch(modalStatus(true));
        dispatch(updateRequestingIncidentState(false));
        dispatch(updateAffectedRoutesState([]));
    }

    await dispatch(getDisruptionsAndIncidents());
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
                            routeColor: allRoutes[route.routeId]?.route_color,
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
    dispatch(copyIncidentToClipboard(isCopied));
};

const updateOpenCreateIncident = isCreateEnabled => ({
    type: ACTION_TYPE.OPEN_CREATE_INCIDENTS,
    payload: {
        isCreateEnabled,
    },
});

export const openCopyIncident = (isCreateEnabled, sourceIncidentId) => ({
    type: ACTION_TYPE.OPEN_COPY_INCIDENTS,
    payload: {
        isCreateEnabled,
        sourceIncidentId,
    },
});

export const openCreateIncident = isCreateEnabled => (dispatch) => {
    dispatch(updateOpenCreateIncident(isCreateEnabled));
};

export const resetState = () => ({
    type: ACTION_TYPE.RESET_INCIDENT_STATE,
});

export const deleteAffectedEntities = () => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.DELETE_INCIDENT_AFFECTED_ENTITIES,
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

export const addShapesToEntities = (entities, routesWithShapes) => entities.map((entity) => {
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
    dispatch(updateLoadingIncidentsState(true));

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
        { ...route, routeColor: allRoutes[route.routeId]?.route_color }
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
            dispatch(updateLoadingIncidentsState(false));
        })
        .catch((err) => {
            throw err;
        });
};

export const cancelCreateIncident = () => (dispatch) => {
    dispatch(({
        type: ACTION_TYPE.CANCEL_CREATE_INCIDENTS,
        payload: {
            affectedRoutes: [],
        },
    }));
};

export const showAndUpdateAffectedRoutes = (routes, show) => (dispatch) => {
    dispatch(showSelectedRoutesState(show));
    dispatch(updateAffectedRoutesState(routes));
};

export const toggleIncidentModals = (type, isOpen) => ({
    type: ACTION_TYPE.SET_INCIDENTS_MODAL_STATUS,
    payload: {
        type,
        isOpen,
    },
});

export const toggleWorkaroundPanel = isOpen => ({
    type: ACTION_TYPE.SET_WORKAROUND_PANEL_STATUS,
    payload: {
        isOpen,
    },
});

export const toggleEditEffectPanel = isEditEffectPanelOpen => ({
    type: ACTION_TYPE.SET_EDIT_EFFECT_PANEL_STATUS,
    payload: {
        isEditEffectPanelOpen,
    },
});

export const updateCurrentStep = activeStep => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_CURRENT_STEP,
    payload: {
        activeStep,
    },
});

export const updateEditMode = editModeParam => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_EDIT_MODE,
    payload: {
        editMode: editModeParam,
    },
});

export const updateIncidentToEdit = incidentToEdit => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_TO_EDIT,
    payload: {
        incidentToEdit,
    },
});

export const updateIncidentFilters = filter => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_FILTERS,
    payload: {
        filters: filter,
    },
});

export const updateDisruptionKeyToWorkaroundEdit = disruptionKeyToWorkaroundEdit => ({
    type: ACTION_TYPE.UPDATE_DISRUPTION_KEY_TO_WORKAROUND_EDIT,
    payload: {
        disruptionKeyToWorkaroundEdit,
    },
});

export const updateDisruptionKeyToEditEffect = disruptionKeyToEditEffect => ({
    type: ACTION_TYPE.UPDATE_DISRUPTION_KEY_TO_EDIT_EFFECT,
    payload: {
        disruptionKeyToEditEffect,
    },
});

export const setRequestToUpdateEditEffectState = requestToUpdateEditEffect => ({
    type: ACTION_TYPE.SET_REQUEST_TO_UPDATE_EDIT_EFFECT,
    payload: {
        requestToUpdateEditEffect,
    },
});

export const setRequestedDisruptionKeyToUpdateEditEffect = requestedDisruptionKeyToUpdateEditEffect => ({
    type: ACTION_TYPE.SET_REQUESTED_DISRUPTION_KEY_TO_UPDATE_EDIT_EFFECT,
    payload: {
        requestedDisruptionKeyToUpdateEditEffect,
    },
});

export const uploadIncidentFiles = (incident, file) => async (dispatch) => {
    const { disruptionId, incidentId } = incident;
    dispatch(updateRequestingIncidentState(true, disruptionId));
    try {
        await disruptionsMgtApi.uploadDisruptionFiles(incident, file);
        dispatch(updateRequestingIncidentResult(incident.disruptionId, ACTION_RESULT.UPDATE_SUCCESS(incidentId)));
    } catch (error) {
        dispatch(updateRequestingIncidentResult(incident.disruptionId, ACTION_RESULT.UPDATE_ERROR(incidentId, error.code)));
    } finally {
        dispatch(updateRequestingIncidentState(false, disruptionId));
    }

    await dispatch(getDisruptionsAndIncidents());
};

export const deleteIncidentFile = (incident, fileId) => async (dispatch) => {
    const { disruptionId, incidentId } = incident;
    dispatch(updateRequestingIncidentState(true, disruptionId));
    try {
        await disruptionsMgtApi.deleteDisruptionFile(incident, fileId);
        dispatch(updateRequestingIncidentResult(incident.disruptionId, ACTION_RESULT.UPDATE_SUCCESS(incidentId)));
    } catch (error) {
        dispatch(updateRequestingIncidentResult(incident.disruptionId, ACTION_RESULT.UPDATE_ERROR(incidentId, error.code)));
    } finally {
        dispatch(updateRequestingIncidentState(false, disruptionId));
    }

    await dispatch(getDisruptionsAndIncidents());
};

export const updateIncidentsDatagridConfig = dataGridConfig => ({
    type: ACTION_TYPE.UPDATE_INCIDENT_DATAGRID_CONFIG,
    payload: dataGridConfig,
});

export const clearDisruptionActionResult = () => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
    payload: {
        incidentId: null,
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
    const existingAffectedRoutes = getAffectedRoutes(getState());
    const newAffectedRoutes = [...new Set(existingAffectedRoutes.concat(enrichedRoutes))];
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
    const existingAffectedStops = getAffectedStops(getState());
    const newAffectedStops = [...new Set(existingAffectedStops.concat(enrichedStops))];
    dispatch(updateAffectedStopsState(newAffectedStops));
};

export const searchByDrawing = (incidentType, content) => async (dispatch) => {
    dispatch(updateLoadingIncidentsState(true));

    try {
        if (incidentType === DISRUPTION_TYPE.ROUTES) {
            await dispatch(geographySearchRoutes(content));
        } else if (incidentType === DISRUPTION_TYPE.STOPS) {
            await dispatch(geographySearchStops(content));
        }
    } finally {
        dispatch(updateLoadingIncidentsState(false));
    }
};

export const setActiveIncident = activeIncidentId => ({
    type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_INCIDENT,
    payload: {
        activeIncidentId,
    },
});

export const clearActiveIncident = () => (dispatch) => {
    dispatch(setActiveIncident(null));
};

export const updateActiveIncident = activeIncidentId => (dispatch) => {
    dispatch(setActiveIncident(activeIncidentId));
};

export const setIncidentToUpdate = (incidentId, incidentNo, requireToUpdateForm = false) => (dispatch) => {
    dispatch(updateLoadingIncidentForEditState(true));
    return disruptionsMgtApi.getIncident(incidentId)
        .then((response) => {
            const { _links, ...incidentData } = response;
            dispatch(updateIncidentToEdit(incidentData));
        })
        .catch(() => {
            const errorMessage = ERROR_TYPE.fetchIncident;
            dispatch(setBannerError(errorMessage));
        })
        .finally(() => {
            dispatch(updateLoadingIncidentForEditState(false));
            dispatch(openCreateIncident(true));
            if (requireToUpdateForm) {
                dispatch(updateRequiresToUpdateNotesState(true));
            }
            if (incidentNo) {
                dispatch(updateDisruptionKeyToEditEffect(incidentNo));
                dispatch(toggleEditEffectPanel(true));
            }
        });
};

export const setIncidentLoaderState = isIncidentForEditLoading => (dispatch) => {
    dispatch(updateLoadingIncidentForEditState(isIncidentForEditLoading));
};

export const updateDisruption = disruption => async (dispatch) => {
    dispatch(updateLoadingIncidentForEditState(true));
    const { incidentId, incidentNo, createNotification } = disruption;
    dispatch(updateRequestingIncidentState(true, incidentId));

    let result;
    try {
        result = await disruptionsMgtApi.updateDisruption(disruption);
        if (disruption.status === STATUSES.DRAFT) {
            dispatch(updateRequestingIncidentResult(incidentId, ACTION_RESULT.SAVE_DRAFT_SUCCESS(incidentNo, false)));
        } else {
            dispatch(updateRequestingIncidentResult(incidentId, ACTION_RESULT.UPDATE_SUCCESS(incidentNo, createNotification)));
        }
    } catch (error) {
        dispatch(updateRequestingIncidentResult(incidentId, ACTION_RESULT.UPDATE_ERROR(incidentNo, error.code)));
    } finally {
        dispatch(setIncidentToUpdate(incidentId, undefined, true));
        dispatch(updateRequestingIncidentState(false, incidentId));
    }
    await dispatch(getDisruptionsAndIncidents());
    return result;
};

export const setRequireToUpdateIncidentForEditState = isRequireUpdate => (dispatch) => {
    dispatch(updateRequiresToUpdateNotesState(isRequireUpdate));
};

export const setRequireToUpdateWorkaroundsState = isWorkaroundsNeedsToBeUpdated => (dispatch) => {
    dispatch(updateWorkaroundsNeedsToBeUpdatedState(isWorkaroundsNeedsToBeUpdated));
};

export const setDisruptionForWorkaroundEdit = disruptionForWorkaroundEdit => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.SET_DISRUPTION_FOR_WORKAROUND_EDIT,
        payload: {
            disruptionForWorkaroundEdit,
        },
    });
};

export const updateIncident = incident => async (dispatch) => {
    const { incidentId, createNotification } = incident;
    dispatch(updateRequestingIncidentState(true, incidentId));

    let result;
    try {
        result = await disruptionsMgtApi.updateIncident(incident);
        if (incident.status === STATUSES.DRAFT) {
            dispatch(updateRequestingIncidentResult(incident.incidentId, ACTION_RESULT.SAVE_DRAFT_SUCCESS(incidentId, false)));
        } else {
            dispatch(updateRequestingIncidentResult(incident.incidentId, ACTION_RESULT.UPDATE_SUCCESS(incidentId, createNotification)));
        }
    } catch (error) {
        dispatch(updateRequestingIncidentResult(incident.incidentId, ACTION_RESULT.UPDATE_ERROR(incidentId, error.code)));
    } finally {
        dispatch(updateRequestingIncidentState(false, incidentId));
        dispatch(deleteAffectedEntities());
        dispatch(toggleWorkaroundPanel(false));
        dispatch(updateDisruptionKeyToWorkaroundEdit(''));
        dispatch(toggleEditEffectPanel(false));
        dispatch(updateDisruptionKeyToEditEffect(''));
        dispatch(setDisruptionForWorkaroundEdit({}));
    }
    await dispatch(getDisruptionsAndIncidents());

    return result;
};
