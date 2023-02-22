import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getDataManagementState = state => result(state, 'control.dataManagement');
export const getPageSettings = createSelector(getDataManagementState, dataManagementState => result(dataManagementState, 'pageSettings'));
