import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getServiceDateState = state => result(state, 'control.serviceDate');
export const getServiceDate = createSelector(getServiceDateState, state => result(state, 'date'));
