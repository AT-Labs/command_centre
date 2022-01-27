import _ from 'lodash-es';
import { createSelector } from 'reselect';

import { hasFleetLoaded } from './static/fleet';
import { hasRoutesLoaded } from './static/routes';
import { hasStopsLoaded } from './static/stops';

export const getActivityState = state => _.result(state, 'activity');
export const isLoading = createSelector(getActivityState, activityState => _.result(activityState, 'isLoading', false));
export const getError = createSelector(getActivityState, activityState => _.result(activityState, 'error'));
export const getBannerError = createSelector(getActivityState, activityState => _.result(activityState, 'bannerError'));
export const isAnyError = createSelector(
    getActivityState,
    activityState => !_.isUndefined(_.find(_.result(activityState, 'error'), error => !_.isNull(error))),
);

export const hasPrerequisiteDataLoaded = createSelector(
    hasFleetLoaded,
    hasRoutesLoaded,
    hasStopsLoaded,
    (fleetReady, routesReady, stopsReady) => fleetReady && routesReady && stopsReady,
);

export const isModalOpen = createSelector(getActivityState, activityState => _.result(activityState, 'isLoading', false));
