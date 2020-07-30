import _ from 'lodash-es';
import { createSelector } from 'reselect';
import { getAllStops } from './stops';

export const getStopMessagingState = state => _.result(state, 'control.stopMessaging');
export const getAllStopGroups = createSelector(getStopMessagingState, stopGroupsState => _.result(stopGroupsState, 'stopGroups'));
export const getStopGroupsLoadingState = createSelector(getStopMessagingState, stopGroupsState => _.result(stopGroupsState, 'isStopGroupsLoading'));

export const allSystemStopGroups = [
    { value: 0, label: '__ All Stops __', stopGroup: { id: 0, title: '__ All Stops __' } },
    { value: -1, label: '__ 1000 to 8999 __', stopGroup: { id: -1, title: '__ 1000 to 8999 __' } },
];

export const getAllSystemStopGroups = state => _.map(allSystemStopGroups, (g) => {
    const allStops = getAllStops(state);
    if (g.stopGroup.id === 0) {
        return { ...g.stopGroup, stops: allStops };
    }
    return { ...g.stopGroup, stops: _.filter(allStops, s => Number(s.value) >= 1000 && Number(s.value) <= 8999) };
});
