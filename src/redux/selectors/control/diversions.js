import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getDiversionsState = state => result(state, 'control.diversions');
export const getIsDiversionManagerOpen = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'isDiversionManagerOpen'));
export const getIsDiversionManagerLoading = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'isDiversionManagerLoading'));
export const getIsDiversionManagerReady = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'isDiversionManagerReady'));
export const getDiversionEditMode = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'diversionEditMode'));
export const getDiversionResultState = createSelector(getDiversionsState, diversionsState => diversionsState?.diversionResultState);
export const getDiversionForEditing = createSelector(getDiversionsState, ({ diversion } = {}) => diversion);
export const getDiversionsData = createSelector(getDiversionsState, diversionsState => diversionsState?.diversionsData);
export const getDiversionsLoading = createSelector(getDiversionsState, diversionsState => diversionsState?.diversionsLoading);
export const getDiversionsError = createSelector(getDiversionsState, diversionsState => diversionsState?.diversionsError);
const createDisruptionSelector = (baseSelector, defaultValue) => disruptionId => createSelector(
    baseSelector,
    data => data?.[disruptionId] ?? defaultValue,
);

export const getDiversionsForDisruption = createDisruptionSelector(getDiversionsData, []);
export const getDiversionsLoadingForDisruption = createDisruptionSelector(getDiversionsLoading, false);
export const getDiversionsErrorForDisruption = createDisruptionSelector(getDiversionsError, null);
