import parse from 'wellknown';
import { get, find, findLastIndex } from 'lodash-es';
import { TRIP_UPDATE_TYPE, TRIP_FINAL_STATUS } from '../../constants/tripReplays';

export const getJsonFromWkt = wkt => parse(wkt).coordinates.map(coors => [
    coors[1],
    coors[0],
]);

export const isTripCanceled = ({ finalStatus }) => (finalStatus === TRIP_FINAL_STATUS.CANCELED);

export const isTripMissed = ({ finalStatus }) => (finalStatus === TRIP_FINAL_STATUS.MISSED);

export const isCopyTrip = ({ operationalEvents }) => (
    !!find(operationalEvents, { type: TRIP_UPDATE_TYPE.COPY_TRIP })
);

export const getCanceledEvent = (operationalEvents) => {
    if (!operationalEvents) return undefined;
    let result;
    operationalEvents.forEach((event) => {
        if (!result && event.type === TRIP_UPDATE_TYPE.CANCELED) {
            result = event;
        } else if (event.type === TRIP_UPDATE_TYPE.REINSTATE_TRIP) {
            result = undefined;
        }
    });
    return result;
};

export const getSkippedStops = (operationalEvents) => {
    if (!operationalEvents) return {};
    const skippedStops = {};
    operationalEvents.forEach((event) => {
        if (event.type === TRIP_UPDATE_TYPE.SKIPPED) {
            const stopSequence = get(event, 'stop.stopSequence');
            if (!skippedStops[stopSequence]) {
                skippedStops[stopSequence] = event;
            }
        } else if (event.type === TRIP_UPDATE_TYPE.REINSTATE_STOP) {
            const stopSequence = get(event, 'stop.stopSequence');
            delete skippedStops[stopSequence];
        }
    });
    return skippedStops;
};

export const getPlatformChanges = (operationalEvents) => {
    if (!operationalEvents) return {};
    const platformChanges = {};
    operationalEvents.forEach((event) => {
        if (event.type === TRIP_UPDATE_TYPE.PLATFORM_CHANGE) {
            const stopSequence = get(event, 'stop.stopSequence');
            if (!platformChanges[stopSequence]) {
                platformChanges[stopSequence] = event;
            } else if (platformChanges[stopSequence].oldStop.stopId === event.newStop.stopId) {
                delete platformChanges[stopSequence];
            } else {
                platformChanges[stopSequence].newStop = event.newStop;
                platformChanges[stopSequence].timestamp = event.timestamp;
            }
        }
    });
    return platformChanges;
};

export const getStopIndexAfterCancel = (stops, canceledEvent) => {
    if (!get(canceledEvent, 'timestamp')) return undefined;
    const cancelTime = parseInt(canceledEvent.timestamp, 10);
    const stopIndexBeforeCancel = findLastIndex(stops, (stop) => {
        const stopDepartureTime = parseInt(get(stop, 'departure.time'), 10);
        return stopDepartureTime && stopDepartureTime <= cancelTime;
    });
    return stopIndexBeforeCancel === -1 ? 0 : stopIndexBeforeCancel + 1;
};
