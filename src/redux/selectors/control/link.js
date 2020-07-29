import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getLinkState = state => _.result(state, 'control.link');
export const getLinkRouteShortName = createSelector(getLinkState, linkState => _.result(linkState, 'routeShortName'));
export const getLinkRouteVariantId = createSelector(getLinkState, linkState => _.result(linkState, 'routeVariantId'));
export const getLinkStartTime = createSelector(getLinkState, linkState => _.result(linkState, 'startTime'));
