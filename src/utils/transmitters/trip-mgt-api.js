import gql from 'graphql-tag';
import { result } from 'lodash-es';
import { jsonResponseHandling } from '../fetch';
import { mutateStatic } from '../graphql';
import { fetchWithAuthHeader, getAuthToken } from '../../auth';
import { getViewPermission } from '../helpers';
import TRIP_STATUS_TYPES from '../../types/trip-status-types';

const { REACT_APP_TRIP_MGT_QUERY_URL } = process.env;

export const getRecurringCancellations = () => fetchWithAuthHeader(
    `${REACT_APP_TRIP_MGT_QUERY_URL}/recurring-operations`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));

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

export const getTrips = ({
    agencyId, routeType, serviceDate,
    routeVariantIds, page, limit,
    startTimeFrom, startTimeTo, tripIds,
    endTimeFrom, endTimeTo,
    tripStatus, depotIds,
    vehicleLabels, referenceIds,
    trackingStatuses,
    trackingStatus,
    sorting,
    isGroupedByRoute,
    isGroupedByRouteVariant,
    delayRange,
    firstStopCode,
    lastStopCode,
    source,
    display,
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
    if (endTimeFrom) { variables.endTimeFrom = `${endTimeFrom}:00`; }
    if (endTimeTo) { variables.endTimeTo = `${endTimeTo}:00`; }
    if (tripIds) { variables.tripIds = tripIds; }
    if (vehicleLabels) { variables.vehicleLabels = vehicleLabels; }
    if (referenceIds) { variables.referenceIds = referenceIds; }
    if (tripStatus) { variables.tripStatus = tripStatus; }
    if (TRIP_STATUS_TYPES.inProgress === tripStatus && trackingStatuses) { variables.trackingStatuses = trackingStatuses; }
    if (trackingStatus) { variables.trackingStatuses = trackingStatus; }
    if (sorting && !isGroupedByRoute && !isGroupedByRouteVariant) {
        variables.sorting = sorting.sortBy === 'delay' ? { ...sorting, sortBy: 'combinedDelay' } : sorting;
    }
    if (delayRange && delayRange.min != null) { variables.delayMin = delayRange.min * 60; }
    if (delayRange && delayRange.max != null) { variables.delayMax = delayRange.max * 60; }
    if (firstStopCode) { variables.firstStopCode = firstStopCode; }
    if (lastStopCode) { variables.lastStopCode = lastStopCode; }
    if (source) { variables.source = source; }
    if (display) { variables.display = display; }

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
    ).then(response => jsonResponseHandling(response))
        .then(res => ({ ...res, tripInstances: res.tripInstances.map(tripInstance => ({ ...tripInstance, delay: tripInstance.combinedDelay })) }));
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
    display
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

const updateHeadsignGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $startTime: String!, $headsign: String!, $stopCodes: [String!]!) {
        updateHeadsign(tripId: $tripId, serviceDate: $serviceDate, startTime: $startTime, headsign: $headsign, stopCodes: $stopCodes) {
            ${tripInstanceFields}
        }
    }`;

const addTripGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $startTime: String!, $routeId: String!, $routeShortName: String!, $routeType: Int!, $routeVariantId: String!, $directionId: Int!, $routeLongName: String!, $agencyId: String!, $depotId: String!, $endTime: String!, $stops: [StopInput!]!, $shapeId: String!, $tripHeadsign: String!, $referenceId: String!) {
        addNewTrip(
            tripId: $tripId
            serviceDate: $serviceDate
            startTime: $startTime
            routeId: $routeId
            routeShortName: $routeShortName
            routeType: $routeType
            routeVariantId: $routeVariantId
            directionId: $directionId
            routeLongName: $routeLongName
            agencyId: $agencyId
            depotId: $depotId
            endTime: $endTime
            stops: $stops
            shapeId: $shapeId
            tripHeadsign: $tripHeadsign
            referenceId: $referenceId
        ) {
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
    }).then(response => result(response, 'data.updateTripStatus', {}));
};

export const updateHeadsign = (options) => {
    const { tripId, serviceDate, startTime, stopCodes, headsign } = options;

    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: updateHeadsignGqlMutation,
        variables: { tripId, serviceDate, startTime, stopCodes, headsign },
        params: 'updateHeadsign',
        authToken: getAuthToken(),
    }).then(response => result(response, 'data.updateHeadsign', {}));
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
    }).then(response => result(response, 'data.setDelayTrip', {}));
};

const updateTripDisplayGqlMutation = gql`
    mutation($tripId: String!, $serviceDate: Moment!, $startTime: String!, $display: Boolean!) {
        updateTripDisplay( tripId: $tripId, serviceDate: $serviceDate, startTime: $startTime, display: $display) {
            ${tripInstanceFields}
        }
    }`;

export const updateTripDisplay = (options) => {
    const { tripId, serviceDate, startTime, display } = options;

    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: updateTripDisplayGqlMutation,
        variables: { tripId, serviceDate, startTime, display },
        params: 'updateTripDisplay',
        authToken: getAuthToken(),
    }).then(response => result(response, 'data.updateTripDisplay', {}));
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
    }).then(response => result(response, 'data.updateStopStatus', {}));
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
    }).then(response => result(response, 'data.updateStopId', {}));
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
    }).then(response => result(response, 'data.moveToNextStop', {}));
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
    }).then(response => result(response, 'data.moveToStop', {}));
};

export const recurringUpdateTripStatus = (variables) => {
    const url = `${REACT_APP_TRIP_MGT_QUERY_URL}/recurring-operations`;
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

export const recurringDeleteTripStatus = (recurringCancellationId) => {
    const url = `${REACT_APP_TRIP_MGT_QUERY_URL}/recurring-operations/${recurringCancellationId}`;

    return fetchWithAuthHeader(
        url,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
            },
        },
    ).then(response => jsonResponseHandling(response));
};

export const recurringCancellationUploadFile = (variables) => {
    const { operator, csvFile } = variables;
    const url = `${REACT_APP_TRIP_MGT_QUERY_URL}/recurring-operations-upload`;

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('operator', operator);

    return fetchWithAuthHeader(
        url,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: formData,
        },
    ).then(response => jsonResponseHandling(response));
};

export const searchTrip = (params) => {
    const url = `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        },
    ).then(response => jsonResponseHandling(response));
};

export const addTrip = (options) => {
    const {
        tripId,
        serviceDate,
        startTime,
        routeId,
        routeShortName,
        routeType,
        routeVariantId,
        directionId,
        routeLongName,
        agencyId,
        depotId,
        endTime,
        stops,
        shapeId,
        tripHeadsign,
        referenceId,
    } = options;

    return mutateStatic({
        url: `${REACT_APP_TRIP_MGT_QUERY_URL}/trips`,
        mutation: addTripGqlMutation,
        variables: {
            tripId,
            serviceDate,
            startTime,
            routeId,
            routeShortName,
            routeType,
            routeVariantId,
            directionId,
            routeLongName,
            agencyId,
            depotId,
            endTime,
            stops,
            shapeId,
            tripHeadsign,
            referenceId,
        },
        params: 'addNewTrip',
        authToken: getAuthToken(),
    });
};
