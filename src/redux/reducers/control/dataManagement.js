import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    pageSettings: {
        drawerOpen: true,
        selectedIndex: 0,
    },
    stopGroups: [],
    stopGroupsIncludingDeleted: [],
    isStopGroupsLoading: false,
    busPriority: {
        permissions: [],
        priorityRoutes: [],
        isPriorityRoutesLoading: false,
        priorityRoutesDatagridConfig: {
            columns: [],
            page: 0,
            pageSize: 100,
            sortModel: [],
            density: 'standard',
            filterModel: { items: [], linkOperator: 'and' },
        },
        intersections: [],
        isIntersectionsLoading: false,
        intersectionsDatagridConfig: {
            columns: [],
            page: 0,
            pageSize: 100,
            sortModel: [],
            density: 'standard',
            filterModel: { items: [], linkOperator: 'and' },
        },
        thresholds: [],
        isThresholdsLoading: false,
        thresholdsDatagridConfig: {
            columns: [],
            page: 0,
            pageSize: 100,
            sortModel: [],
            density: 'standard',
            filterModel: { items: [], linkOperator: 'and' },
        },
    },
};

const handlePageSettingsUpdate = (state, action) => ({ ...state, pageSettings: { ...state.pageSettings, ...action.payload } });
const handleStopGroupsLoadingUpdate = (state, { payload: { isStopGroupsLoading } }) => ({ ...state, isStopGroupsLoading });
const handleStopGroupsUpdate = (state, { payload: { stopGroups, stopGroupsIncludingDeleted } }) => ({ ...state, stopGroups, stopGroupsIncludingDeleted });
const handleBusPriorityRoutesLoadingUpdate = (state, { payload: { isPriorityRoutesLoading } }) => ({
    ...state,
    busPriority: { ...state.busPriority, isPriorityRoutesLoading } });
const handleBusPriorityRoutesUpdate = (state, { payload: { priorityRoutes } }) => ({
    ...state,
    busPriority: { ...state.busPriority, priorityRoutes },
});
const handleBusPriorityRoutesDatagridConfig = (state, action) => ({
    ...state,
    busPriority: {
        ...state.busPriority,
        priorityRoutesDatagridConfig: {
            ...state.busPriority.priorityRoutesDatagridConfig,
            ...action.payload,
        },
    },
});
const handleBusPriorityPermissionsUpdate = (state, { payload: { permissions } }) => ({
    ...state,
    busPriority: { ...state.busPriority, permissions },
});
const handleBusPriorityIntersectionsLoadingUpdate = (state, { payload: { isIntersectionsLoading } }) => ({
    ...state,
    busPriority: { ...state.busPriority, isIntersectionsLoading } });
const handleBusPriorityIntersectionsUpdate = (state, { payload: { intersections } }) => ({
    ...state,
    busPriority: { ...state.busPriority, intersections },
});
const handleBusPriorityIntersectionsDatagridConfig = (state, action) => ({
    ...state,
    busPriority: {
        ...state.busPriority,
        intersectionsDatagridConfig: {
            ...state.busPriority.intersectionsDatagridConfig,
            ...action.payload,
        },
    },
});
const handleBusPriorityThresholdsLoadingUpdate = (state, { payload: { isThresholdsLoading } }) => ({
    ...state,
    busPriority: { ...state.busPriority, isThresholdsLoading } });
const handleBusPriorityThresholdsUpdate = (state, { payload: { thresholds } }) => ({
    ...state,
    busPriority: { ...state.busPriority, thresholds },
});
const handleBusPriorityThresholdsDatagridConfig = (state, action) => ({
    ...state,
    busPriority: {
        ...state.busPriority,
        thresholdsDatagridConfig: {
            ...state.busPriority.thresholdsDatagridConfig,
            ...action.payload,
        },
    },
});

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_DATAMANAGEMENT_PAGESETTINGS]: handlePageSettingsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_STOP_GROUPS_LOADING]: handleStopGroupsLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_STOP_GROUPS]: handleStopGroupsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_ROUTES_LOADING]: handleBusPriorityRoutesLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_BUS_PRIORITY_ROUTES]: handleBusPriorityRoutesUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_ROUTES_DATAGRID_CONFIG]: handleBusPriorityRoutesDatagridConfig,
    [ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_INTERSECTIONS_LOADING]: handleBusPriorityIntersectionsLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_BUS_PRIORITY_INTERSECTIONS]: handleBusPriorityIntersectionsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_INTERSECTIONS_DATAGRID_CONFIG]: handleBusPriorityIntersectionsDatagridConfig,
    [ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_THRESHOLDS_LOADING]: handleBusPriorityThresholdsLoadingUpdate,
    [ACTION_TYPE.FETCH_CONTROL_BUS_PRIORITY_THRESHOLDS]: handleBusPriorityThresholdsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_THRESHOLDS_DATAGRID_CONFIG]: handleBusPriorityThresholdsDatagridConfig,
    [ACTION_TYPE.UPDATE_CONTROL_BUS_PRIORITY_PERMISSIONS]: handleBusPriorityPermissionsUpdate,
}, INIT_STATE);
