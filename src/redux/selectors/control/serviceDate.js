import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getServiceDateState = state => _.result(state, 'control.serviceDate');
export const getServiceDate = createSelector(getServiceDateState, state => _.result(state, 'date'));
