import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getDiversionsState = state => result(state, 'control.diversions');
export const getDiversionCreationState = createSelector(getDiversionsState, ({ diversionCreationState }) => diversionCreationState);
