import ACTION_TYPE from '../../../action-types';
import ERROR_TYPE from '../../../../types/error-types';
import { getVehicleReplay, getVehiclePosition } from '../../../../utils/transmitters/vehicle-replay-api';
import { getTripReplayFilters } from '../../../selectors/control/tripReplays/filters';
import { setBannerError } from '../../activity';

const vechicleReplayEvents = (vehicleEvents, totalEvents, totalDisplayedEvents, hasMoreVehicleStausAndPositions) => ({
    type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS,
    payload: {
        vehicleEvents,
        totalEvents,
        totalDisplayedEvents,
        hasMoreVehicleStausAndPositions,
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

        if (currentVehiclePosition.type !== 'vehiclePosition') {
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

export const getVehicleReplayStatusAndPosition = () => (dispatch, getState) => {
    const vehiclePositionInitialValue = {
        page: 1,
        limit: 300,
        skip: 2,
    };
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
                        trips.event.forEach((events) => {
                            vehicleEvents.push({ ...events, tripId: trips.id });
                        });
                    });
                }

                vehiclePositions.forEach((vehiclePosition) => {
                    const id = [vehiclePosition.id, vehiclePosition.timestamp].join('-');
                    vehicleEvents.push({ ...vehiclePosition, type: 'vehiclePosition', id });
                });
                const totalEvents = vehicleEvents.length;

                vehicleEvents.sort((a, b) => (a.timestamp - b.timestamp));
                vehicleEvents.splice(300);
                const totalDisplayedEvents = vehicleEvents.length;
                const hasMore = totalEvents > totalDisplayedEvents;

                const mergedVehiclePosition = clusterVehiclePositionGroup(vehicleEvents)
                    .map(data => mergeVehiclePosition(data));

                dispatch(vechicleReplayEvents(mergedVehiclePosition, totalEvents, totalDisplayedEvents, hasMore));
            }
        })
        .catch(() => {
            if (ERROR_TYPE.fetchVehicleReplayMessage) {
                const errorMessage = ERROR_TYPE.fetchVehicleReplayMessage;
                dispatch(setBannerError(errorMessage));
            }
        });
};
