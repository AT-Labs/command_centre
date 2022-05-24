import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getFleetsState = state => _.result(state, 'control.fleets');
export const getAllFleets = createSelector(getFleetsState, fleetsState => _.result(fleetsState, 'fleets'));
export const getFleetsDatagridConfig = createSelector(getFleetsState, fleetsState => _.result(fleetsState, 'fleetsDatagridConfig'));
