import { handleActions } from 'redux-actions';
import get from 'lodash-es/get';
import has from 'lodash-es/has';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    tripUpdates: {},
};

const isValidTripUpdate = tripUpdate => has(tripUpdate, 'timestamp') && has(tripUpdate, 'vehicle');

const isNewer = (existingTrip, tripUpdate) => get(existingTrip, 'timestamp', -Infinity) < tripUpdate.timestamp;

const validateTripUpdate = (tripUpdates, tripUpdate) => {
    const key = get(tripUpdate, 'vehicle.id');
    const existingTrip = tripUpdates[key];
    return isValidTripUpdate(tripUpdate) && isNewer(existingTrip, tripUpdate);
};

const handleGetTripSnapshot = (state, { payload: { tripUpdate } }) => {
    const { tripUpdates } = state;
    if (validateTripUpdate(tripUpdates, tripUpdate)) {
        const key = get(tripUpdate, 'vehicle.id');
        const newTripUpdates = { ...tripUpdates };
        newTripUpdates[key] = tripUpdate;
        return { tripUpdates: newTripUpdates };
    }

    return state;
};

const getNowSeconds = () => Math.floor(Date.now() / 1000);

let LAST_FILTER_TIMESTAMP = getNowSeconds();

const FILTER_INTERVAL = 60 * 60; // 1 hour expiration

const filterOldTrips = (trips) => {
    const now = getNowSeconds();
    // We filter old transactions on intervals.
    if (LAST_FILTER_TIMESTAMP > now - FILTER_INTERVAL) {
        return trips;
    }

    const validTrips = {};
    Object.entries(trips).forEach(([key, trip]) => {
        if (trip.timestamp > LAST_FILTER_TIMESTAMP) {
            validTrips[key] = trip;
        }
    });
    LAST_FILTER_TIMESTAMP = now;
    return validTrips;
};

const handleTripUpdates = (state, action) => {
    const { payload: { tripUpdates } } = action;
    const updates = {};
    Object.values(tripUpdates).forEach((tripUpdate) => {
        if (validateTripUpdate(state.tripUpdates, tripUpdate)) {
            const key = get(tripUpdate, 'vehicle.id');
            updates[key] = tripUpdate;
        }
    });

    const existingTrips = filterOldTrips(state.tripUpdates);
    return {
        ...state,
        tripUpdates: {
            ...existingTrips,
            ...updates,
        },
    };
};

export default handleActions({
    [ACTION_TYPE.FETCH_TRIP_UPDATE_SNAPSHOT]: handleGetTripSnapshot,
    [ACTION_TYPE.FETCH_TRIP_UPDATES_REALTIME]: handleTripUpdates,
}, INIT_STATE);
