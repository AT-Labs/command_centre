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
export const getBusPriorityPermissions = createSelector(getDataManagementState, dataManagmentState => result(dataManagmentState, 'busPriority.permissions'));
export const isBusPriorityEditAllowed = createSelector(
    getBusPriorityPermissions,
    permissions => !!find(permissions, { _rel: USER_PERMISSIONS.DATA_MANAGEMENT_BUS_PRIORITY.EDIT_BUS_PRIORITY }),
);
