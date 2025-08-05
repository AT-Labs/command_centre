import { result, flatten, uniq, map, filter } from 'lodash-es';
import { createSelector } from 'reselect';
import { getAllStops } from '../stopMessaging/stops';

export const SYSTEM_STOP_GROUP_ID = -1;
export const SYSTEM_STOP_GROUP_STOP_START = 1000;
export const SYSTEM_STOP_GROUP_STOP_END = 8999;

export const getDataManagementState = state => result(state, 'control.dataManagement');
export const getAllStopGroups = createSelector(getDataManagementState, stopGroupsState => result(stopGroupsState, 'stopGroups'));
export const getStopGroupsLoadingState = createSelector(getDataManagementState, stopGroupsState => result(stopGroupsState, 'isStopGroupsLoading'));
export const getStopGroupsIncludingDeleted = createSelector(getDataManagementState, stopGroupsState => {
    const stopGroupsArray = result(stopGroupsState, 'stopGroupsIncludingDeleted');
    if (Array.isArray(stopGroupsArray)) {
        // Convert array to object with id as key
        return stopGroupsArray.reduce((acc, stopGroup) => {
            acc[stopGroup.id] = stopGroup;
            return acc;
        }, {});
    }
    return stopGroupsArray || {};
});

export const allSystemStopGroups = [
    { value: 0, label: '__ All Stops __', stopGroup: { id: 0, title: '__ All Stops __' } },
    { value: -1, label: `__ ${SYSTEM_STOP_GROUP_STOP_START} to ${SYSTEM_STOP_GROUP_STOP_END} __`, stopGroup: { id: -1, title: `__ ${SYSTEM_STOP_GROUP_STOP_START} to ${SYSTEM_STOP_GROUP_STOP_END} __` } },
];

const tokenizeStopGroups = stopGroups => map(stopGroups, g => ({
    ...g,
    tokens: uniq(flatten(map(g.stops, s => s.label.toLowerCase().split(' ')))).concat(g.title.toLowerCase().split(' ')),
}));

const getAllSystemStopGroups = state => map(allSystemStopGroups, (g) => {
    const allStops = getAllStops(state);
    if (g.stopGroup.id === 0) {
        return { ...g.stopGroup, stops: allStops };
    }
    return { ...g.stopGroup, stops: filter(allStops, s => +s.value >= SYSTEM_STOP_GROUP_STOP_START && +s.value <= SYSTEM_STOP_GROUP_STOP_END) };
});

const mergedAllStopGroups = state => [...getAllStopGroups(state), ...getAllSystemStopGroups(state)];

export const allStopGroupsWithTokens = state => tokenizeStopGroups(getAllStopGroups(state));
export const mergedAllStopGroupsWithTokens = state => tokenizeStopGroups(mergedAllStopGroups(state));
