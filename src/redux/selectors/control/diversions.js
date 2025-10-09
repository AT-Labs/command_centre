import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getDiversionsState = state => result(state, 'control.diversions');
export const getIsDiversionManagerOpen = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'isDiversionManagerOpen'));
export const getIsDiversionManagerLoading = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'isDiversionManagerLoading'));
export const getIsDiversionManagerReady = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'isDiversionManagerReady'));
export const getDiversionEditMode = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'diversionEditMode'));
export const getDiversionResultState = createSelector(getDiversionsState, diversionsState => diversionsState?.diversionResultState);
export const getDiversionForEditing = createSelector(getDiversionsState, ({ diversion } = {}) => diversion);
