import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getDataManagementState = state => _.result(state, 'control.dataManagement');
export const getPageSettings = createSelector(getDataManagementState, dataManagementState => _.result(dataManagementState, 'pageSettings'));
