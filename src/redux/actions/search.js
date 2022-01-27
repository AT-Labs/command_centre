/* eslint-disable camelcase */
import _ from 'lodash-es';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import VEHICLE_TYPE from '../../types/vehicle-types';
import * as publicApi from '../../utils/transmitters/public-api';
import ACTION_TYPE from '../action-types';
import ERROR_TYPE from '../../types/error-types';
import { getAllBlocks } from '../selectors/control/blocks';
import { getAllRoutes } from '../selectors/static/routes';
import { getAllStops } from '../selectors/static/stops';
import { getRoutesForSearch as getControlRoutes } from '../selectors/control/routes/routes';
import { getAllFleetBuses, getAllFleetTrains, getAllFleetFerries } from '../selectors/static/fleet';
import { getRouteVariantsForSearch as getControlRouteVariants } from '../selectors/control/routes/routeVariants';
import { getAllNotifications } from '../selectors/control/notifications';
import { getSearchTerms } from '../selectors/search';
import { allStopGroupsWithTokens, mergedAllStopGroupsWithTokens } from '../selectors/control/stopMessaging/stopGroups';
import { getAllStopMessages } from '../selectors/control/stopMessaging/stopMessages';
import { reportError } from './activity';

export const updateSearchTerms = searchTerms => ({
    type: ACTION_TYPE.UPDATE_SEARCH_TERMS,
    payload: {
        searchTerms,
    },
});

export const updateSearchLoading = isLoading => ({
    type: ACTION_TYPE.SEARCH_LOADING,
    payload: {
        isLoading,
    },
});

export const clearSearchResults = () => ({
    type: ACTION_TYPE.CLEAR_SEARCH_RESULTS,
});

export const updateSearchBarFocus = isFocus => ({
    type: ACTION_TYPE.UPDATE_SEARCH_BAR_FOCUS,
    payload: {
        isFocus,
    },
});

const formatAddressSearchResults = addressEntries => addressEntries.map((entry) => {
    const { address } = entry;
    return {
        text: address.split('\n')[0],
        data: entry,
        category: SEARCH_RESULT_TYPE.ADDRESS,
        icon: SEARCH_RESULT_TYPE.ADDRESS.icon,
    };
});

export const searchAddresses = searchTerms => (dispatch, getState) => {
    dispatch(updateSearchLoading(true));
    dispatch(updateSearchTerms(searchTerms));

    return publicApi.searchAddresses(searchTerms)
        .then((addresses) => {
            dispatch(updateSearchLoading(false));
            if (getSearchTerms(getState()) !== searchTerms) return;
            dispatch({
                type: ACTION_TYPE.UPDATE_ADDRESS_SEARCH_RESULTS,
                payload: { [SEARCH_RESULT_TYPE.ADDRESS.type]: formatAddressSearchResults(addresses) },
            });
        })
        .catch((error) => {
            dispatch(updateSearchLoading(false));
            if (ERROR_TYPE.geocodeEnabled) {
                dispatch(reportError({ error: { geocode: error } }));
            }
        });
};

export const performTokenSearch = (searchTerms, entries, intersectionBy) => new Promise((resolve) => {
    const searchTokens = searchTerms.toLowerCase().split(' ');
    // remove '-' as it interferes with search. entry tokens do not have a '-' in them
    _.remove(searchTokens, token => token === '-');
    const tokenResults = searchTokens.map(searchTerm => _.filter(entries, entry => _.some(entry.tokens, token => _.startsWith(token, searchTerm))));
    const results = _.intersectionBy(...tokenResults, intersectionBy);
    resolve(_.orderBy(results, intersectionBy));
});

export const formatStopSearchResults = stops => stops.map((stop) => {
    const { stop_code, stop_name } = stop;
    return {
        text: `${stop_code} - ${stop_name}`,
        data: stop,
        category: SEARCH_RESULT_TYPE.STOP,
        icon: SEARCH_RESULT_TYPE.STOP.icon,
    };
});

export const formatRouteSearchResults = routes => routes.map((route) => {
    const { route_short_name } = route;
    return {
        text: route_short_name,
        data: route,
        category: SEARCH_RESULT_TYPE.ROUTE,
        icon: VEHICLE_TYPE[route.route_type].type,
    };
});

export const formatVehiclesSearchResults = (vehicles, mode) => vehicles.map((vehicle) => {
    let text;
    if (mode.type === SEARCH_RESULT_TYPE.BUS.type) {
        text = `${vehicle.label} ${vehicle.registration ? `- ${vehicle.registration}` : ''}`;
    } else if (mode.type === SEARCH_RESULT_TYPE.TRAIN.type) {
        text = vehicle.label;
    } else if (mode.type === SEARCH_RESULT_TYPE.FERRY.type) {
        text = `${vehicle.label} - ${vehicle.id}`;
    }

    return ({
        text,
        data: vehicle,
        category: mode,
        icon: mode.type,
    });
});

export const searchStops = searchTerms => (dispatch, getState) => performTokenSearch(
    searchTerms,
    getAllStops(getState()),
    ({ stop_code }) => parseInt(stop_code, 10),
).then((stops) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_STOP_SEARCH_RESULTS,
        payload: { [SEARCH_RESULT_TYPE.STOP.type]: formatStopSearchResults(stops) },
    });
});

export const searchRoutes = searchTerms => (dispatch, getState) => performTokenSearch(searchTerms, getAllRoutes(getState()), 'route_short_name')
    .then((routes) => {
        dispatch({
            type: ACTION_TYPE.UPDATE_ROUTE_SEARCH_RESULTS,
            payload: { [SEARCH_RESULT_TYPE.ROUTE.type]: formatRouteSearchResults(routes) },
        });
    });

export const searchVehicles = (searchTerms, allFleetVehiclesSelector, mode) => (dispatch, getState) => performTokenSearch(
    searchTerms,
    allFleetVehiclesSelector(getState()),
    'id',
).then((fleetVehicles) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_VEHICLE_SEARCH_RESULTS,
        payload: { [mode.type]: formatVehiclesSearchResults(fleetVehicles, mode) },
    });
});

export const formatBlockSearchResults = blocks => blocks.map(block => ({
    text: block.operationalBlockId,
    data: block,
    category: SEARCH_RESULT_TYPE.BLOCK,
    icon: '',
}));

export const searchBlocks = searchTerms => (dispatch, getState) => {
    const blocks = _.filter(getAllBlocks(getState()), block => _.startsWith(block.operationalBlockId.toUpperCase(), searchTerms.toUpperCase()));
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_BLOCK_SEARCH_RESULTS,
        payload: { [SEARCH_RESULT_TYPE.BLOCK.type]: formatBlockSearchResults(blocks) },
    });
};

export const formatControlRoutesSearchResults = routes => routes.map(route => ({
    text: route.routeShortName,
    data: route,
    category: SEARCH_RESULT_TYPE.CONTROL_ROUTE,
    icon: '',
}));

export const searchControlRoutes = searchTerms => (dispatch, getState) => {
    const routes = _.filter(getControlRoutes(getState()), route => _.startsWith(route.routeShortName.toUpperCase(), searchTerms.toUpperCase()));
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_ROUTES_SEARCH_RESULTS,
        payload: { [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: formatControlRoutesSearchResults(routes) },
    });
};

export const formatControlRouteVariantsSearchResults = routes => routes.map(route => ({
    text: route.routeVariantId,
    data: route,
    category: SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT,
    icon: '',
}));

export const searchControlRouteVariants = searchTerms => (dispatch, getState) => {
    const routes = _.filter(
        getControlRouteVariants(getState()),
        route => _.startsWith(route.routeVariantId.toUpperCase(), searchTerms.toUpperCase()),
    );
    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS_SEARCH_RESULTS,
        payload: { [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: formatControlRouteVariantsSearchResults(routes) },
    });
};

const formatNotificationsRoutesSearchResults = routes => routes.map(route => ({
    text: route.route_short_name,
    data: route,
    category: SEARCH_RESULT_TYPE.CONTROL_NOTIFICATIONS_ROUTES,
    icon: '',
}));

export const searchControlNotificationsRoutes = searchTerms => (dispatch, getState) => {
    const allRoutes = getAllRoutes(getState());
    const allNotifications = getAllNotifications(getState());
    const routesInNotificationsList = _.uniqBy(_.flatten(
        allNotifications.map(
            notification => _.filter(allRoutes, route => route.route_short_name === notification.routeShortName),
        ),
    ), 'route_id');
    const routes = _.filter(routesInNotificationsList, route => _.startsWith(route.route_short_name.toUpperCase(), searchTerms.toUpperCase()));

    dispatch({
        type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_ROUTES_SEARCH_RESULTS,
        payload: { [SEARCH_RESULT_TYPE.CONTROL_NOTIFICATIONS_ROUTES.type]: formatNotificationsRoutesSearchResults(routes) },
    });
};

export const formatStopGroupSearchResults = stopGroups => stopGroups.map(group => ({
    text: group.title,
    data: group,
    category: SEARCH_RESULT_TYPE.STOP_GROUP,
    icon: '',
}));

export const searchStopGroups = searchTerms => (dispatch, getState) => performTokenSearch(searchTerms, allStopGroupsWithTokens(getState()), 'id')
    .then((stopGroups) => {
        dispatch({
            type: ACTION_TYPE.UPDATE_STOP_GROUP_SEARCH_RESULTS,
            payload: { [SEARCH_RESULT_TYPE.STOP_GROUP.type]: formatStopGroupSearchResults(stopGroups) },
        });
    });

export const formatMergedStopGroupSearchResults = stopGroups => stopGroups.map(group => ({
    text: group.title,
    data: group,
    category: SEARCH_RESULT_TYPE.STOP_GROUP_MERGED,
    icon: '',
}));

export const searchMergedStopGroups = searchTerms => (dispatch, getState) => performTokenSearch(searchTerms, mergedAllStopGroupsWithTokens(getState()), 'id')
    .then((stopGroups) => {
        dispatch({
            type: ACTION_TYPE.UPDATE_STOP_GROUP_MERGED_SEARCH_RESULTS,
            payload: { [SEARCH_RESULT_TYPE.STOP_GROUP_MERGED.type]: formatMergedStopGroupSearchResults(stopGroups) },
        });
    });

export const formatStopMessageSearchResults = stopMessages => stopMessages.map(stopMessage => ({
    text: stopMessage.message,
    data: stopMessage,
    category: SEARCH_RESULT_TYPE.STOP_MESSAGE,
    icon: '',
}));

export const searchStopMessages = searchTerms => (dispatch, getState) => {
    const allStopMessages = getAllStopMessages(getState());
    const stopMessages = _.filter(allStopMessages, stopMessage => _.includes(stopMessage.message.toLowerCase(), searchTerms.toLowerCase()));

    dispatch({
        type: ACTION_TYPE.UPDATE_STOP_MESSAGE_SEARCH_RESULTS,
        payload: { [SEARCH_RESULT_TYPE.STOP_MESSAGE.type]: formatStopMessageSearchResults(stopMessages) },
    });
};

export const formatStopInGroupsSearchResults = stops => stops.map(stop => ({
    text: stop.label,
    data: stop,
    category: SEARCH_RESULT_TYPE.STOP_IN_GROUP,
    icon: SEARCH_RESULT_TYPE.STOP_IN_GROUP.icon,
}));

export const searchStopInGroups = searchTerms => (dispatch, getState) => {
    const allStopGroups = allStopGroupsWithTokens(getState());
    const stopInGroups = _.uniqBy(_.flatten(_.map(allStopGroups, stopInGroup => stopInGroup.stops)), 'value');
    const filteredStops = _.filter(stopInGroups, stop => _.includes(stop.label.toLowerCase(), searchTerms.toLowerCase()));
    const tokenizedStops = _.map(filteredStops, stop => ({
        ...stop,
        tokens: stop.label.toLowerCase().split(' '),
    }));

    performTokenSearch(
        searchTerms,
        tokenizedStops,
        'value',
    ).then((stops) => {
        dispatch({
            type: ACTION_TYPE.UPDATE_STOP_IN_GROUP_SEARCH_RESULTS,
            payload: { [SEARCH_RESULT_TYPE.STOP_IN_GROUP.type]: formatStopInGroupsSearchResults(stops) },
        });
    });
};

export const search = (searchTerms, searchInCategory) => (dispatch) => {
    const searchInCategoryActions = new Map([
        [SEARCH_RESULT_TYPE.ADDRESS.type, () => dispatch(searchAddresses(searchTerms))],
        [SEARCH_RESULT_TYPE.STOP.type, () => dispatch(searchStops(searchTerms))],
        [SEARCH_RESULT_TYPE.ROUTE.type, () => dispatch(searchRoutes(searchTerms))],
        [SEARCH_RESULT_TYPE.TRAIN.type, () => dispatch(searchVehicles(searchTerms, getAllFleetTrains, SEARCH_RESULT_TYPE.TRAIN))],
        [SEARCH_RESULT_TYPE.BUS.type, () => dispatch(searchVehicles(searchTerms, getAllFleetBuses, SEARCH_RESULT_TYPE.BUS))],
        [SEARCH_RESULT_TYPE.FERRY.type, () => dispatch(searchVehicles(searchTerms, getAllFleetFerries, SEARCH_RESULT_TYPE.FERRY))],
        [SEARCH_RESULT_TYPE.BLOCK.type, () => dispatch(searchBlocks(searchTerms))],
        [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type, () => dispatch(searchControlRoutes(searchTerms))],
        [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type, () => dispatch(searchControlRouteVariants(searchTerms))],
        [SEARCH_RESULT_TYPE.CONTROL_NOTIFICATIONS_ROUTES.type, () => dispatch(searchControlNotificationsRoutes(searchTerms))],
        [SEARCH_RESULT_TYPE.STOP_GROUP.type, () => dispatch(searchStopGroups(searchTerms))],
        [SEARCH_RESULT_TYPE.STOP_GROUP_MERGED.type, () => dispatch(searchMergedStopGroups(searchTerms))],
        [SEARCH_RESULT_TYPE.STOP_MESSAGE.type, () => dispatch(searchStopMessages(searchTerms))],
        [SEARCH_RESULT_TYPE.STOP_IN_GROUP.type, () => dispatch(searchStopInGroups(searchTerms))],
    ]);

    if (_.isArray(searchInCategory)) _.map(searchInCategory, (category) => { searchInCategoryActions.get(category)(); });
    else searchInCategoryActions.get(searchInCategory)();
};
