import { isEmpty } from 'lodash-es';
import ACTION_TYPE from '../../../action-types';
import ERROR_TYPE from '../../../../types/error-types';
import { getVehicleReplay, getVehiclePosition } from '../../../../utils/transmitters/vehicle-replay-api';
import { getTripReplayFilters } from '../../../selectors/control/tripReplays/filters';
import { setBannerError } from '../../activity';
import { getAllRoutes } from '../../../selectors/static/routes';
import { VEHICLE_POSITION } from '../../../../types/vehicle-types';

export const vechicleReplayEvents = (vehicleEventsAndPositions, totalEvents, totalDisplayedEvents, hasMoreVehicleStausAndPositions) => ({
    type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS,
    payload: {
        vehicleEventsAndPositions,
        totalEvents,
        totalDisplayedEvents,
        hasMoreVehicleStausAndPositions,
    },
});

export const clearVehicleReplayCurrentReplayDetail = () => ({
    type: ACTION_TYPE.CLEAR_CONTROL_VEHICLE_REPLAYS_CURRENT_REPLAY_DETAIL,
    payload: {
        vehicleEventsAndPositions: null,
        totalEvents: null,
    },
});

const splitVechicleReplayEventsAndPositions = (vehicleEvents, vehiclePositions) => ({
    type: ACTION_TYPE.UPDATE_SPLIT_CONTROL_VEHICLE_REPLAYS_EVENTS,
    payload: {
        vehicleEvents,
        vehiclePositions,
    },
});

const updateVehicleReplayFirstEvents = firstEvent => ({
    type: ACTION_TYPE.UPDATE_CONTROL_VEHICLE_FIRST_REPLAY_EVENT,
    payload: {
        firstEvent,
    },
});

export const setVehicleViewTabStatus = vehicleViewTabStatus => ({
    type: ACTION_TYPE.UPDATE_VEHICLE_VIEW_TAB_STATUS,
    payload: {
        vehicleViewTabStatus,
    },
});

const clusterVehiclePositionGroup = (vehicleEvents) => {
    let vehiclePositionLowerBound = 0;
    let vehiclePositionUpperBound = 0;
    const output = [];

    for (let i = 0; i < vehicleEvents.length - 1; i++) {
        vehiclePositionUpperBound += 1;
        let skip = false;
        const currentVehiclePosition = vehicleEvents[i];
        const next = vehicleEvents[i + 1] || [];

        if (currentVehiclePosition.type !== VEHICLE_POSITION) {
            output.push([currentVehiclePosition]);
            vehiclePositionLowerBound = i + 1;
            skip = true;
        }

        if (currentVehiclePosition.type !== next.type && !skip) {
            output.push(vehicleEvents.slice(vehiclePositionLowerBound, vehiclePositionUpperBound));
            vehiclePositionLowerBound = i + 1;
        }
    }

    output.push(vehicleEvents.slice(vehiclePositionLowerBound, vehiclePositionUpperBound + 1));
    return output;
};

const mergeVehiclePosition = (data) => {
    const lastTimestamp = data[data.length - 1].timestamp;
    const initialTimestamp = data[0].timestamp;

    return initialTimestamp === lastTimestamp ? data[0] : { ...data[0], startOfRangeTime: initialTimestamp, endOfRangeTime: lastTimestamp, child: data };
};

const updateRouteShortName = (element, allRoutes) => (!isEmpty(element.routeId) ? allRoutes[element.routeId].route_short_name : '');

const segregateVehiclePositionAndEvents = (mergedVehiclePosition) => {
    const splitVehicleEvents = [];
    const splitVehiclePosition = [];
    mergedVehiclePosition.forEach((vehicleStatusAndPosition) => {
        if (vehicleStatusAndPosition.type === VEHICLE_POSITION) {
            if (vehicleStatusAndPosition.child) {
                vehicleStatusAndPosition.child.map(vp => splitVehiclePosition.push(vp));
            } else {
                splitVehiclePosition.push(vehicleStatusAndPosition);
            }
        } else {
            splitVehicleEvents.push(vehicleStatusAndPosition);
        }
    });

    return { splitVehicleEvents, splitVehiclePosition };
};

export const getVehicleReplayStatusAndPosition = () => (dispatch, getState) => {
    const LIMIT = 600;
    const vehiclePositionInitialValue = {
        page: 1,
        limit: LIMIT,
        skip: 2,
    };
    const allRoutes = getAllRoutes(getState());
    const filters = getTripReplayFilters(getState());
    return Promise.all([
        getVehicleReplay(filters),
        getVehiclePosition({ ...filters, ...vehiclePositionInitialValue }),
    ])
        .then(([vehicleStatus, vehiclePositionsData]) => {
            const vehiclePositions = vehiclePositionsData.data;
            if (vehicleStatus.length === 0 && vehiclePositions.length === 0) {
                dispatch(vechicleReplayEvents([], 0, 0, false));
            } else {
                const vehicleEvents = [];
                if (vehicleStatus.length !== 0) {
                    vehicleStatus[0].trip.forEach((trips) => {
                        const routeShortName = updateRouteShortName(trips, allRoutes);
                        trips.event.forEach((events) => {
                            vehicleEvents.push({ ...events, tripId: trips.id, routeShortName });
                        });
                    });
                }

                const totalEvents = vehiclePositionsData.count + vehicleEvents.length;

                vehiclePositions.forEach((vehiclePosition) => {
                    const routeShortName = updateRouteShortName(vehiclePosition, allRoutes);
                    let tripId = '';
                    let routeId = '';
                    const id = [vehiclePosition.id, vehiclePosition.timestamp].join('-');
                    if (vehiclePosition.trip) {
                        tripId = vehiclePosition.trip.tripId;
                        routeId = vehiclePosition.trip.routeId;
                    }
                    vehicleEvents.push({ ...vehiclePosition, id, routeShortName, tripId, routeId });
                });

                vehicleEvents.sort((a, b) => (a.timestamp - b.timestamp));
                vehicleEvents.splice(LIMIT);
                const totalDisplayedEvents = vehicleEvents.length;
                const hasMore = totalEvents > LIMIT;

                const mergedVehiclePosition = clusterVehiclePositionGroup(vehicleEvents)
                    .map(data => mergeVehiclePosition(data));

                dispatch(vechicleReplayEvents(mergedVehiclePosition, totalEvents, totalDisplayedEvents, hasMore));

                const splitData = segregateVehiclePositionAndEvents(mergedVehiclePosition);
                const { splitVehicleEvents, splitVehiclePosition } = splitData;

                dispatch(splitVechicleReplayEventsAndPositions(splitVehicleEvents, splitVehiclePosition));
                dispatch(updateVehicleReplayFirstEvents(splitVehiclePosition[0]));
            }
        })
        .catch(() => {
            if (ERROR_TYPE.fetchVehicleReplayMessage) {
                const errorMessage = ERROR_TYPE.fetchVehicleReplayMessage;
                dispatch(setBannerError(errorMessage));
            }
        });
};
