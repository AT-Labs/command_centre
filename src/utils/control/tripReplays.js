import parse from 'wellknown';
import { get, find, findLastIndex, has } from 'lodash-es';
import { TRIP_UPDATE_TYPE, TRIP_FINAL_STATUS } from '../../constants/tripReplays';

export const getJsonFromWkt = wkt => parse(wkt).coordinates.map(coors => [
    coors[1],
    coors[0],
]);

export const isTripCanceled = ({ finalStatus }) => (finalStatus === TRIP_FINAL_STATUS.CANCELED);

export const isTripMissed = ({ finalStatus }) => (finalStatus === TRIP_FINAL_STATUS.MISSED);

export const tripHasDisruption = ({ hasDisruption }) => hasDisruption;

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

export const formatTimeLabel = (times, prefix) => {
    if (has(times, 'signedOn')) {
        return 'Signed on time';
    }

    if ((has(times, 'arrival') && has(times, 'departure'))
    || (!has(times, 'arrival') && !has(times, 'departure'))) {
        return `${prefix} time`.trim();
    }

    if (has(times, 'arrival')) {
        return `${prefix} arrival`.trim();
    }

    return `${prefix} departure`.trim();
};

export const formatArrivalDeparture = (times) => {
    if (has(times, 'signedOn')) {
        return get(times, 'signedOn');
    }

    if (has(times, 'arrival') && has(times, 'departure')) {
        return `${get(times, 'arrival')} - ${get(times, 'departure')}`;
    }

    if (!has(times, 'arrival') && !has(times, 'departure')) {
        return '-';
    }

    if (has(times, 'arrival')) {
        return get(times, 'arrival');
    }

    return get(times, 'departure');
};
