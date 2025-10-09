import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getDiversionsState = state => result(state, 'control.diversions');
export const getIsDiversionManagerOpen = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'isDiversionManagerOpen'));
export const getDiversionEditMode = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'diversionEditMode'));
export const getDiversionResultState = createSelector(getDiversionsState, ({ diversionResultState }) => diversionResultState);
export const getDiversionForEditing = createSelector(getDiversionsState, ({ diversion }) => diversion);
