/* eslint-disable camelcase */
import ACTION_TYPE from '../../action-types';
import ERROR_TYPE from '../../../types/error-types';
import * as fleetApi from '../../../utils/transmitters/fleet-api';
import { reportError } from '../activity';

const loadTrains = fleet => ({
    type: ACTION_TYPE.FETCH_TRAINS_FROM_FLEET,
    payload: {
        fleet,
    },
});

const loadBuses = fleet => ({
    type: ACTION_TYPE.FETCH_BUSES_FROM_FLEET,
    payload: {
        fleet,
    },
});

const loadFerries = fleet => ({
    type: ACTION_TYPE.FETCH_FERRIES_FROM_FLEET,
    payload: {
        fleet,
    },
});

const tokenizeBuses = buses => buses.map(bus => ({
    ...bus,
    tokens: [bus.label?.toLowerCase(), bus.registration?.toLowerCase(), bus.id],
}));

const tokenizeTrains = trains => trains.map(train => ({
    ...train,
    tokens: train.label?.toLowerCase().split(/  +/g),
}));

const tokenizeFerries = ferries => ferries.map(ferry => ({
    ...ferry,
    tokens: [ferry.label?.toLowerCase().split(' '), ferry.id],
}));

export const getTrains = () => dispatch => fleetApi.fetchTrains()
    .then((trains) => {
        const tokenizedTrains = tokenizeTrains(trains);
        dispatch(loadTrains(tokenizedTrains));
    })
    .catch((error) => {
        if (ERROR_TYPE.fetchFleetEnabled) {
            dispatch(reportError({ error: { critical: error } }, true));
            throw error;
        }
        return [];
    });

export const getBuses = () => dispatch => fleetApi.fetchBuses()
    .then((buses) => {
        const tokenizedBuses = tokenizeBuses(buses);
        dispatch(loadBuses(tokenizedBuses));
    })
    .catch((error) => {
        if (ERROR_TYPE.fetchFleetEnabled) {
            dispatch(reportError({ error: { critical: error } }, true));
            throw error;
        }
        return [];
    });

export const getFerries = () => dispatch => fleetApi.fetchFerries()
    .then((ferries) => {
        const tokenizedFerries = tokenizeFerries(ferries);
        dispatch(loadFerries(tokenizedFerries));
    })
    .catch((error) => {
        if (ERROR_TYPE.fetchFleetEnabled) {
            dispatch(reportError({ error: { critical: error } }, true));
            throw error;
        }
        return [];
    });
