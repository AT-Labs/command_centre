/* eslint-disable camelcase */
import { result, uniqBy, map, orderBy, compact, groupBy, keyBy, unionBy, each, indexof, filter, intersectionBy, join } from 'lodash-es';
import moment from 'moment-timezone';
import DATE_TYPE from '../../../../types/date-types';
import ACTION_TYPE from '../../../action-types';
import VIEW_TYPE from '../../../../types/view-types';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import { getChildStops } from '../../../selectors/static/stops';
import { getAllVehicles, getVehicleTripStartTimeISO } from '../../../selectors/realtime/vehicles';
import { updateDataLoading } from '../../activity';
import { clearDetail, updateViewDetailKey } from './common';
import { getAllRoutes } from '../../../selectors/static/routes';
import { updateRealTimeDetailView } from '../../navigation';

export const mergeRoutesDetails = (entityKey, trips, vehiclesInAllRoutes) => (dispatch) => {
    const routeVariants = groupBy(trips, 'trip_headsign');
    const visibleVehiclesKeydByTripId = keyBy(vehiclesInAllRoutes, 'vehicle.trip.tripId');

    const adjustedVisibleVehiclesByTripId = {};
    each(visibleVehiclesKeydByTripId, (trip) => {
        const tripId = result(trip, 'vehicle.trip.tripId');
        if (tripId != null) {
            adjustedVisibleVehiclesByTripId[tripId] = trip;
        }
        const replacementTripId = result(trip, 'vehicle.trip[".replacementTripId"]');
        if (replacementTripId != null && replacementTripId !== tripId) {
            adjustedVisibleVehiclesByTripId[replacementTripId] = trip;
        }
    });

    dispatch({
        type: ACTION_TYPE.FETCH_ROUTE_TRIPS,
        payload: {
            entityKey,
            routes: map(routeVariants, (routeVariantTrips, headsign) => ({
                shape_wkt: routeVariantTrips[0].shape_wkt,
                routeVariantName: headsign,
                vehicles: orderBy(compact(routeVariantTrips.map(({ trip_id }) => adjustedVisibleVehiclesByTripId[trip_id])), getVehicleTripStartTimeISO),
            })),
        },
    });
};

export const getStopsByRoute = (entityKey, routeTrips) => (dispatch, getState) => {
    const allStops = getChildStops(getState());
    const uniqueTrips = uniqBy(routeTrips, 'trip_headsign');
    return Promise.all(uniqueTrips.map(({ trip_id }) => ccStatic.getTripById(trip_id)))
        .then((trips) => {
            const stops = unionBy(
                ...trips.map(({ stopTimes }) => stopTimes.map(({ stop }) => allStops[stop.stop_code])),
                'stop_id',
            );
            dispatch({
                type: ACTION_TYPE.FETCH_ROUTE_STOPS,
                payload: { entityKey, stops },
            });
        });
};

export const getRoutesByRouteShortName = route => (dispatch, getState) => {
    const routeShortName = result(route, 'route_short_name');
    const entityKey = result(route, 'key');
    const serviceDate = moment().tz(DATE_TYPE.TIME_ZONE).format('YYYYMMDD');
    dispatch(updateDataLoading(true));
    return ccStatic.getRoutesByShortName(routeShortName, serviceDate)
        .then((routes) => {
            const tripsInAllRoutes = [];
            const routeIds = [];
            each(routes, ({ route_id, trips }) => {
                tripsInAllRoutes.push(...trips);
                routeIds.push(route_id);
            });
            const vehiclePredicate = vehicle => indexof(routeIds, result(vehicle, 'vehicle.trip.routeId')) >= 0;
            const vehiclesInAllRoutes = filter(getAllVehicles(getState()), vehiclePredicate);
            dispatch({
                type: ACTION_TYPE.UPDATE_ROUTE_VEHICLE_PREDICATE,
                payload: { entityKey, vehiclePredicate },
            });
            dispatch(mergeRoutesDetails(entityKey, tripsInAllRoutes, vehiclesInAllRoutes));
            dispatch(getStopsByRoute(entityKey, tripsInAllRoutes));
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

const generateRouteSelectedPayload = (route, state) => ({ ...route, agency_name: getOperatorsForDisplay(result(route, 'route_short_name'), state) });

export const routeSelected = route => (dispatch, getState) => {
    dispatch(clearDetail(true));
    dispatch(updateViewDetailKey(route.key));
    dispatch(updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.ROUTE));
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_ROUTE,
        payload: {
            entityKey: result(route, 'key'),
            route: generateRouteSelectedPayload(route, getState()),
        },
    });
    dispatch(getRoutesByRouteShortName(route));
};

export const routeChecked = route => (dispatch, getState) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_ROUTE,
        payload: {
            entityKey: result(route, 'key'),
            route: generateRouteSelectedPayload(route, getState()),
        },
    });
    dispatch(getRoutesByRouteShortName(route));
};
