import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getAgenciesState = state => _.result(state, 'control.agencies');
export const getAgencies = createSelector(getAgenciesState, agenciesState => _.result(agenciesState, 'all'));
