import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getFleetsState = state => result(state, 'control.fleets');
export const getAllFleets = createSelector(getFleetsState, fleetsState => result(fleetsState, 'fleets'));
export const getFleetsDatagridConfig = createSelector(getFleetsState, fleetsState => result(fleetsState, 'fleetsDatagridConfig'));
