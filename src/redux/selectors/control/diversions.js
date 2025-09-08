import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getDiversionsState = state => result(state, 'control.diversions');
export const getIsDiversionManagerOpen = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'isDiversionManagerOpen'));
export const getDiversionEditMode = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'diversionEditMode'));
export const getDiversionResultState = createSelector(getDiversionsState, ({ diversionResultState }) => diversionResultState);
export const getDiversionForEditing = createSelector(getDiversionsState, ({ diversion }) => diversion);

export const getDiversionsData = createSelector(getDiversionsState, ({ diversionsData } = {}) => diversionsData);
export const getDiversionsLoading = createSelector(getDiversionsState, ({ diversionsLoading } = {}) => diversionsLoading);
export const getDiversionsError = createSelector(getDiversionsState, ({ diversionsError } = {}) => diversionsError);

export const getDiversionsForDisruption = disruptionId => createSelector(
    getDiversionsData,
    (diversionsData) => {
        const diversionsResult = diversionsData?.[disruptionId] || [];
        return diversionsResult;
    },
);

export const getDiversionsLoadingForDisruption = disruptionId => createSelector(
    getDiversionsLoading,
    (diversionsLoading) => {
        const loadingResult = diversionsLoading?.[disruptionId] || false;
        return loadingResult;
    },
);

export const getDiversionsErrorForDisruption = disruptionId => createSelector(
    getDiversionsError,
    diversionsError => diversionsError?.[disruptionId] || null,
);
