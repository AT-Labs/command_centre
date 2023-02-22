import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getLinkState = state => result(state, 'control.link');
export const getLinkRouteShortName = createSelector(getLinkState, linkState => result(linkState, 'routeShortName'));
export const getLinkRouteVariantId = createSelector(getLinkState, linkState => result(linkState, 'routeVariantId'));
export const getLinkStartTime = createSelector(getLinkState, linkState => result(linkState, 'startTime'));
