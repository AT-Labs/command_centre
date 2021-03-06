import gql from 'graphql-tag';
import _ from 'lodash-es';
import { jsonResponseHandling } from '../fetch';
import { mutateStatic } from '../graphql';
import { fetchWithAuthHeader, getAuthToken } from '../../auth';
import { getViewPermission } from '../helpers';
import TRIP_STATUS_TYPES from '../../types/trip-status-types';

const { REACT_APP_TRIP_MGT_QUERY_URL } = process.env;

export const getAgencies = () => fetchWithAuthHeader(
    `${REACT_APP_TRIP_MGT_QUERY_URL}/agencies`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));

export const getRoutes = () => fetchWithAuthHeader(
    `${REACT_APP_TRIP_MGT_QUERY_URL}/routes`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));

export const getPlatforms = () => fetchWithAuthHeader(
    `${REACT_APP_TRIP_MGT_QUERY_URL}/stops`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));

export const getTrips = ({
    agencyId, routeType, serviceDate,
    routeVariantIds, page, limit,
    startTimeFrom, startTimeTo, tripIds,
    tripStatus, depotIds,
    trackingStatuses,
    sorting,
    isGroupedByRoute,
    isGroupedByRouteVariant,
}) => {
    const variables = { serviceDate };
    if (agencyId) { variables.agencyId = agencyId; }
    if (depotIds) { variables.depotIds = depotIds; }
    if (routeType) { variables.routeType = routeType; }
    if (routeVariantIds) { variables.routeVariantIds = routeVariantIds; }
    if (page) { variables.page = page; }
    if (limit) { variables.limit = limit; }
    if (startTimeFrom) { variables.startTimeFrom = `${startTimeFrom}:00`; }
    if (startTimeTo) { variables.startTimeTo = `${startTimeTo}:00`; }
    if (tripIds) { variables.tripIds = tripIds; }
    if (tripStatus) { variables.tripStatus = tripStatus; }
    if (TRIP_STATUS_TYPES.inProgress === tripStatus && trackingStatuses) { variables.trackingStatuses = trackingStatuses; }
    if (sorting && !isGroupedByRoute && !isGroupedByRouteVariant) { variables.sorting = sorting; }


    const url = `${REACT_APP_TRIP_MGT_QUERY_URL}/tripinstances`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(variables),
        },
    ).then(response => jsonResponseHandling(response));
};

export const getRoutesViewPermission = () => getViewPermission(`${REACT_APP_TRIP_MGT_QUERY_URL}/view`);

const tripInstanceFields = `
    tripId
    routeId
    routeVariantId
    routeShortName
    routeLongName
    routeType
    agencyId
    startTime
    endTime
    vehicleLabel
    serviceDate
    serviceId
    status
    delay
    referenceId
    stops {
        stopId
        stopSequence
        stopCode
        stopName
        arrivalTime
        departureTime
        status
        parent
    }`;

const updateTripGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $tripStatus: Status!, $startTime: String) {
        updateTripStatus( tripId: $tripId, serviceDate: $serviceDate, tripStatus: $tripStatus, startTime: $startTime) {
            ${tripInstanceFields}
        }
    }`;

const copyTripGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $startTime: String!, $newStartTime: String!, $referenceId: String!) {
        copyTrip( tripId: $tripId, serviceDate: $serviceDate, startTime: $startTime, newStartTime: $newStartTime, referenceId: $referenceId) {
            ${tripInstanceFields}
        }
    }`;

export const updateTripStatus = (options) => {
    const { tripId, serviceDate, tripStatus, startTime } = options;

    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: updateTripGqlMutation,
        variables: { tripId, serviceDate, tripStatus, startTime },
        params: 'updateTripStatus',
        authToken: getAuthToken(),
    }).then(response => _.result(response, 'data.updateTripStatus', {}));
};

export const copyTrip = (options) => {
    const { tripId, serviceDate, startTime, newStartTime, referenceId } = options;

    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: copyTripGqlMutation,
        variables: { tripId, serviceDate, startTime, newStartTime, referenceId },
        params: 'copyTrip',
        authToken: getAuthToken(),
    });
};

const setDelayTripGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $startTime: String!, $delay: Float) {
        setDelayTrip( tripId: $tripId, serviceDate: $serviceDate, startTime: $startTime, delay: $delay) {
            ${tripInstanceFields}
        }
    }`;

export const updateTripDelay = (options) => {
    const { tripId, serviceDate, startTime, delay } = options;

    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: setDelayTripGqlMutation,
        variables: { tripId, serviceDate, startTime, delay },
        params: 'setDelayTrip',
        authToken: getAuthToken(),
    }).then(response => _.result(response, 'data.setDelayTrip', {}));
};

const updateStopStatusGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $startTime: String!, $stopSequence: Float!, $stopStatus: StopStatus!) {
        updateStopStatus( tripId: $tripId, serviceDate: $serviceDate, startTime: $startTime, stopSequence: $stopSequence, stopStatus: $stopStatus) {
            ${tripInstanceFields}
        }
    }`;

export const updateStopStatus = (options) => {
    const {
        tripId, serviceDate, startTime, stopSequence, stopStatus,
    } = options;

    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: updateStopStatusGqlMutation,
        variables: {
            tripId, serviceDate, startTime, stopSequence, stopStatus,
        },
        params: 'updateStopStatus',
        authToken: getAuthToken(),
    }).then(response => _.result(response, 'data.updateStopStatus', {}));
};

const updateStopIdGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $startTime: String!, $stopSequence: Float!, $stopId: String!) {
        updateStopId( tripId: $tripId, serviceDate: $serviceDate, startTime: $startTime, stopSequence: $stopSequence, stopId: $stopId) {
            ${tripInstanceFields}
        }
    }`;

export const updateStopId = (options) => {
    const {
        tripId, serviceDate, startTime, stopSequence, stopId,
    } = options;

    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: updateStopIdGqlMutation,
        variables: {
            tripId, serviceDate, startTime, stopSequence, stopId,
        },
        params: 'updateStopId',
        authToken: getAuthToken(),
    }).then(response => _.result(response, 'data.updateStopId', {}));
};

const moveToNextStopGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $startTime: String!) {
        moveToNextStop( tripId: $tripId, serviceDate: $serviceDate, startTime: $startTime) {
            ${tripInstanceFields}
        }
    }`;

export const moveToNextStop = (options) => {
    const { tripId, serviceDate, startTime } = options;
    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: moveToNextStopGqlMutation,
        variables: { tripId, serviceDate, startTime },
        params: 'moveToNextStop',
        authToken: getAuthToken(),
    }).then(response => _.result(response, 'data.moveToNextStop', {}));
};

const moveToStopGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $startTime: String!, $stopSequence: Float!) {
        moveToStop( tripId: $tripId, serviceDate: $serviceDate, startTime: $startTime, stopSequence: $stopSequence) {
            ${tripInstanceFields}
        }
    }`;

export const moveTotStop = (options) => {
    const { tripId, serviceDate, startTime, stopSequence } = options;

    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: moveToStopGqlMutation,
        variables: { tripId, serviceDate, startTime, stopSequence },
        params: 'moveToStop',
        authToken: getAuthToken(),
    }).then(response => _.result(response, 'data.moveToStop', {}));
};
