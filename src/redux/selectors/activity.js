import { result, isUndefined, find, isNull } from 'lodash-es';
import { createSelector } from 'reselect';

import { hasFleetLoaded } from './static/fleet';
import { hasRoutesLoaded } from './static/routes';
import { hasStopsLoaded } from './static/stops';

export const getActivityState = state => result(state, 'activity');
export const isLoading = createSelector(getActivityState, activityState => result(activityState, 'isLoading', false));
export const getError = createSelector(getActivityState, activityState => result(activityState, 'error'));
export const getBannerError = createSelector(getActivityState, activityState => result(activityState, 'bannerError'));
export const isAnyError = createSelector(
    getActivityState,
    activityState => !isUndefined(find(result(activityState, 'error'), error => !isNull(error))),
);

export const hasPrerequisiteDataLoaded = createSelector(
    hasFleetLoaded,
    hasRoutesLoaded,
    hasStopsLoaded,
    (fleetReady, routesReady, stopsReady) => fleetReady && routesReady && stopsReady,
);

export const isModalOpen = createSelector(getActivityState, activityState => result(activityState, 'isLoading', false));
