import { createSelector } from 'reselect';
import { result } from 'lodash-es';

export const getDiversionsState = state => result(state, 'control.diversions');
export const getIsDiversionManagerOpen = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'isDiversionManagerOpen'));
export const getDiversionEditMode = createSelector(getDiversionsState, disruptionsState => result(disruptionsState, 'diversionEditMode'));
export const getDiversionResultState = createSelector(getDiversionsState, ({ diversionResultState }) => diversionResultState);
export const getDiversionForEditing = createSelector(getDiversionsState, ({ diversion }) => diversion);
export const getSelectedRouteVariant = createSelector(getDiversionsState, ({ selectedRouteVariant }) => selectedRouteVariant);

// Check if diversion feature is enabled
export const useDiversion = createSelector(
    state => result(state, 'appSettings'),
    appSettings => appSettings?.useDiversion === 'true',
);

// Centralized diversions data selectors
export const getDiversionsData = createSelector(getDiversionsState, ({ diversionsData }) => diversionsData);
export const getDiversionsLoading = createSelector(getDiversionsState, ({ diversionsLoading }) => diversionsLoading);
export const getDiversionsError = createSelector(getDiversionsState, ({ diversionsError }) => diversionsError);

// Selector for specific disruption diversions
export const getDiversionsForDisruption = disruptionId => createSelector(
    getDiversionsData,
    diversionsData => diversionsData[disruptionId] || [],
);

// Selector for loading state of specific disruption
export const getDiversionsLoadingForDisruption = disruptionId => createSelector(
    getDiversionsLoading,
    diversionsLoading => diversionsLoading[disruptionId] || false,
);

// Selector for error state of specific disruption
export const getDiversionsErrorForDisruption = disruptionId => createSelector(
    getDiversionsError,
    diversionsError => diversionsError[disruptionId] || null,
);
