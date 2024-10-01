import { result, find } from 'lodash-es';
import { createSelector } from 'reselect';
import USER_PERMISSIONS from '../../../../types/user-permissions-types';

export const getDataManagementState = state => result(state, 'control.dataManagement');
export const getAllBusPriorityRoutes = createSelector(getDataManagementState, dataManagmentState => result(dataManagmentState, 'busPriority.priorityRoutes'));
export const getBusPriorityRoutesDatagridConfig = createSelector(
    getDataManagementState,
    dataManagmentState => result(dataManagmentState, 'busPriority.priorityRoutesDatagridConfig'),
);
export const getIsLoadingBusPriorityRoutes = createSelector(getDataManagementState, dataManagmentState => result(dataManagmentState, 'busPriority.isPriorityRoutesLoading'));

export const getAllBusPriorityIntersections = createSelector(getDataManagementState, dataManagmentState => result(dataManagmentState, 'busPriority.intersections'));
export const getBusPriorityIntersectionsDatagridConfig = createSelector(
    getDataManagementState,
    dataManagmentState => result(dataManagmentState, 'busPriority.intersectionsDatagridConfig'),
);
export const getIsLoadingBusPriorityIntersections = createSelector(getDataManagementState, dataManagmentState => result(dataManagmentState, 'busPriority.isIntersectionsLoading'));

export const getAllBusPriorityThresholds = createSelector(getDataManagementState, dataManagmentState => result(dataManagmentState, 'busPriority.thresholds'));
export const getBusPriorityThresholdsDatagridConfig = createSelector(
    getDataManagementState,
    dataManagmentState => result(dataManagmentState, 'busPriority.thresholdsDatagridConfig'),
);
export const getIsLoadingBusPriorityThresholds = createSelector(getDataManagementState, dataManagmentState => result(dataManagmentState, 'busPriority.isThresholdsLoading'));

export const getBusPriorityPermissions = createSelector(getDataManagementState, dataManagmentState => result(dataManagmentState, 'busPriority.permissions'));
export const isBusPriorityEditAllowed = createSelector(
    getBusPriorityPermissions,
    permissions => !!find(permissions, { _rel: USER_PERMISSIONS.DATA_MANAGEMENT_BUS_PRIORITY.EDIT_BUS_PRIORITY }),
);
