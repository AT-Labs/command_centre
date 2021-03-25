/* eslint-disable camelcase */
import { result, uniqBy, map, orderBy, compact, pick, groupBy, keyBy, unionBy, each, indexof, filter, intersectionBy, join } from 'lodash-es';
import VIEW_TYPE from '../../../../types/view-types';
import ACTION_TYPE from '../../../action-types';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import { getChildStops } from '../../../selectors/static/stops';
import { getVisibleVehicles, getVehicleTripStartTimeISO } from '../../../selectors/realtime/vehicles';
import { updateDataLoading } from '../../activity';
import { updateVisibleStops } from '../../static/stops';
import { mergeVehicleFilters } from '../vehicles';
import { updateRealTimeDetailView } from '../../navigation';
import { clearDetail } from './common';
import { updateSearchTerms } from '../../search';
import { getRouteSearchTerms, getAllRoutes } from '../../../selectors/static/routes';

export const displayRoutesDetails = trips => (dispatch, getState) => {
    const state = getState();
    const routeVariants = groupBy(trips, 'trip_headsign');
    const visibleVehiclesKeydByTripId = keyBy(getVisibleVehicles(state), 'vehicle.trip.tripId');

    dispatch({
        type: ACTION_TYPE.FETCH_ROUTE_TRIPS,
        payload: {
            routes: map(routeVariants, (routeVariantTrips, headsign) => ({
                shape_wkt: routeVariantTrips[0].shape_wkt,
                routeVariantName: headsign,
                vehicles: orderBy(compact(routeVariantTrips.map(({ trip_id }) => visibleVehiclesKeydByTripId[trip_id])), getVehicleTripStartTimeISO),
            })),
        },
    });
};

export const updateVisibleStopsByRoute = routeTrips => (dispatch, getState) => {
    const allStops = getChildStops(getState());
    const uniqueTrips = uniqBy(routeTrips, 'trip_headsign');
    return Promise.all(uniqueTrips.map(({ trip_id }) => ccStatic.getTripById(trip_id)))
        .then((trips) => {
            const stops = unionBy(
                ...trips.map(({ stopTimes }) => stopTimes.map(({ stop }) => allStops[stop.stop_code])),
                'stop_id',
            );
            dispatch(updateVisibleStops(stops));
        });
};

export const getRoutesByRouteShortName = route => (dispatch) => {
    const routeShortName = result(route, 'route_short_name');

    dispatch(updateDataLoading(true));
    return ccStatic.getRoutesByShortName(routeShortName)
        .then((routes) => {
            const tripsInAllRoutes = [];
            const routeIds = [];
            each(routes, ({ route_id, trips }) => {
                tripsInAllRoutes.push(...trips);
                routeIds.push(route_id);
            });
            dispatch(updateVisibleStopsByRoute(tripsInAllRoutes));
            dispatch(mergeVehicleFilters({ predicate: vehicle => indexof(routeIds, result(vehicle, 'vehicle.trip.routeId')) >= 0 }));
            dispatch(displayRoutesDetails(tripsInAllRoutes));
            dispatch(updateDataLoading(false));
        });
};
const getOperatorsForDisplay = (route_short_name, state) => {
    const tokenResults = filter(getAllRoutes(state), route => route.route_short_name === route_short_name);
    const filteredRoutes = intersectionBy(tokenResults, 'agency_name');
    const routeAgencys = map(filteredRoutes, route => route.agency_name);
    const routeAgencyForDisplay = join(routeAgencys, ', ');
    return routeAgencyForDisplay;
};
const generateRouteSelectedPayload = (route, state) => {
    const payload = pick(route, ['route_short_name', 'route_type']);
    payload.agency_name = getOperatorsForDisplay(payload.route_short_name, state);
    return payload;
};
export const routeSelected = route => (dispatch, getState) => {
    dispatch(clearDetail(true));
    dispatch(updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.ROUTE));
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_ROUTE,
        payload: {
            route: generateRouteSelectedPayload(route, getState()),
        },
    });
    dispatch(getRoutesByRouteShortName(route));
    dispatch(updateSearchTerms(getRouteSearchTerms(route)));
};
