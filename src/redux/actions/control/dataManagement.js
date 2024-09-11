import { keyBy } from 'lodash-es';
import ACTION_TYPE from '../../action-types';
import STOP_MESSAGE_TYPE from '../../../types/stop-messages-types';
import ERROR_TYPE from '../../../types/error-types';
import * as stopMessagingApi from '../../../utils/transmitters/stop-messaging-api';
import * as busPriorityApi from '../../../utils/transmitters/bus-priority-api';
import { setBannerError, reportError } from '../activity';

export const updateDataManagementPageSettings = model => ({
    type: ACTION_TYPE.UPDATE_CONTROL_DATAMANAGEMENT_PAGESETTINGS,
    payload: model,
});

const loadStopGroups = (stopGroups, stopGroupsIncludingDeleted) => ({
    type: ACTION_TYPE.FETCH_CONTROL_STOP_GROUPS,
    payload: {
        stopGroups,
        stopGroupsIncludingDeleted,
    },
});

const updateBusPriorityPermissions = permissions => ({
    type: ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_PERMISSIONS,
    payload: {
        permissions,
    },
});

const updateLoadingStopGroupsState = isStopGroupsLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_STOP_GROUPS_LOADING,
    payload: {
        isStopGroupsLoading,
    },
});

export const getStopGroups = () => (dispatch) => {
    dispatch(updateLoadingStopGroupsState(true));
    return stopMessagingApi.getStopGroups()
        .then((stopGroups) => {
            const filteredStopGroups = stopGroups.filter(
                stopGroup => stopGroup.workflowState !== STOP_MESSAGE_TYPE.WORKFLOW_STATUS.DELETED,
            );
            const mappedStopGroups = keyBy(stopGroups, group => group.id);
            dispatch(loadStopGroups(filteredStopGroups, mappedStopGroups));
            dispatch(updateLoadingStopGroupsState(false));
        })
        .catch((error) => {
            if (ERROR_TYPE.fetchStopMessagesEnabled) {
                const errorMessage = error.code === 500 ? ERROR_TYPE.fetchStopGroups : error.message;
                dispatch(setBannerError(errorMessage));
            }
            dispatch(updateLoadingStopGroupsState(false));
        });
};

export const updateStopGroup = (payload, stopGroupId) => (dispatch) => {
    dispatch(updateLoadingStopGroupsState(true));
    return stopMessagingApi.updateStopGroup(payload, stopGroupId)
        .then(() => {
            dispatch(getStopGroups());
            dispatch(updateLoadingStopGroupsState(false));
        })
        .catch((error) => {
            const errorMessage = error.code === 500 ? ERROR_TYPE.createStopGroup : error.message;
            dispatch(reportError({ error: { createStopGroup: errorMessage } }));
            dispatch(updateLoadingStopGroupsState(false));
            return Promise.reject();
        });
};

const loadBusPriorityRoutes = priorityRoutes => ({
    type: ACTION_TYPE.FETCH_CONTROL_BUS_PRIORITY_ROUTES,
    payload: {
        priorityRoutes,
    },
});

const updateLoadingBusPriorityRoutes = isPriorityRoutesLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_ROUTES_LOADING,
    payload: {
        isPriorityRoutesLoading,
    },
});

export const getBusPriorityRoutes = () => (dispatch) => {
    dispatch(updateLoadingBusPriorityRoutes(true));
    return busPriorityApi.getBusPriorityRoutes()
        .then((response) => {
            const { priorityRoutes, _links: { permissions } } = response;
            dispatch(updateBusPriorityPermissions(permissions));
            dispatch(loadBusPriorityRoutes(priorityRoutes));
            dispatch(updateLoadingBusPriorityRoutes(false));
        })
        .catch((error) => {
            const errorMessage = error.code === 500 ? ERROR_TYPE.fetchPriorityBusRoutes : error.message;
            dispatch(setBannerError(errorMessage));
            dispatch(updateLoadingBusPriorityRoutes(false));
        });
};

export const updateBusPriorityRoutesDatagridConfig = model => ({
    type: ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_ROUTES_DATAGRID_CONFIG,
    payload: model,
});

export const deleteBusPriorityRoutes = routeIds => dispatch => busPriorityApi.deleteBusPriorityRoutes(routeIds)
    .then(() => {
        dispatch(getBusPriorityRoutes());
    })
    .catch((error) => {
        const errorMessage = error.code === 500 ? ERROR_TYPE.fetchPriorityBusRoutes : error.message;
        dispatch(setBannerError(errorMessage));
    });

export const addBusPriorityRoute = routeId => dispatch => busPriorityApi.addBusPriorityRoute(routeId)
    .then(() => {
        dispatch(getBusPriorityRoutes());
    })
    .catch((error) => {
        const errorMessage = error.code === 500 ? ERROR_TYPE.fetchPriorityBusRoutes : error.message;
        dispatch(setBannerError(errorMessage));
    });

const loadBusPriorityIntersections = intersections => ({
    type: ACTION_TYPE.FETCH_CONTROL_BUS_PRIORITY_INTERSECTIONS,
    payload: {
        intersections,
    },
});

const updateLoadingBusPriorityIntersections = isIntersectionsLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_ROUTES_LOADING,
    payload: {
        isIntersectionsLoading,
    },
});

export const getBusPriorityIntersections = () => (dispatch) => {
    dispatch(updateLoadingBusPriorityRoutes(true));
    return busPriorityApi.getBusPriorityIntersections()
        .then((response) => {
            const { intersections, _links: { permissions } } = response;
            dispatch(updateBusPriorityPermissions(permissions));
            dispatch(loadBusPriorityIntersections(intersections));
            dispatch(updateLoadingBusPriorityIntersections(false));
        })
        .catch((error) => {
            const errorMessage = error.code === 500 ? ERROR_TYPE.fetchPriorityBusRoutes : error.message;
            dispatch(setBannerError(errorMessage));
            dispatch(updateLoadingBusPriorityRoutes(false));
        });
};

export const updateBusPriorityIntersectionsDatagridConfig = model => ({
    type: ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_INTERSECTIONS_DATAGRID_CONFIG,
    payload: model,
});

export const updateBusPriorityIntersection = body => dispatch => busPriorityApi.updateIntersection(body)
    .then(() => {
        dispatch(loadBusPriorityIntersections);
    })
    .catch((error) => {
        const errorMessage = error.code === 500 ? ERROR_TYPE.fetchPriorityBusIntersections : error.message;
        dispatch(setBannerError(errorMessage));
    });
