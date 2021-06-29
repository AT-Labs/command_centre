import { subscribeRealTime, unsubscribeRealTime } from '../ws-client';
import { jsonResponseHandling } from '../fetch';

const GTFS_REALTIME_SNAPSHOT_QUERY_URL = process.env.REACT_APP_GTFS_REALTIME_QUERY_URL;
const GTFS_ID_MAPPING_URL = process.env.REACT_APP_GTFS_ID_MAPPING_API;

const realTimeTrackingSubscription = `
{
    id
    vehicle {
        vehicle {
            id
            label
        }
        trip {
            tripId
            routeId
            startTime
            startDate
            directionId
        }
        timestamp
        position {
            bearing
            latitude
            longitude
        }
        occupancyStatus
    }
    tripUpdate
}
`;

export const subscribeRealTimeUpdate = ({ onData, onError }) => subscribeRealTime({
    queryString: realTimeTrackingSubscription,
    filters: {
        $or: {
            vehicle: true,
            tripUpdate: true,
        },
    },
    onData,
    onError,
});

export const unsubscribeRealTimeUpdate = () => unsubscribeRealTime();

export const getRealTimeSnapshot = () => {
    const controller = new AbortController();
    return fetch(`${GTFS_REALTIME_SNAPSHOT_QUERY_URL}/vehiclepositions`, {
        headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        },
        signal: controller.signal,
    }).then(async (response) => {
        if (response.ok) {
            if (response.status === 204) {
                return response;
            }
            const res = await response.json();
            controller.abort();
            return res;
        }
        return [];
    });
};

export const getTripUpdateRealTimeSnapshot = (tripId) => {
    const controller = new AbortController();
    const baseUrl = `${GTFS_REALTIME_SNAPSHOT_QUERY_URL}/tripupdates`;
    const url = !tripId ? baseUrl : `${baseUrl}/${tripId}`;
    return fetch(url, {
        headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        },
        signal: controller.signal,
    }).then(async (response) => {
        if (response.ok) {
            if (response.status === 204) {
                return response;
            }
            const res = await response.json();
            controller.abort();
            return res;
        }
        return [];
    });
};

export const getNewTripId = oldTripId => fetch(`${GTFS_ID_MAPPING_URL}/mappings/oldtonew/${oldTripId}?current=true&routes=false&shapes=false&stops=false`, { method: 'GET' })
    .then(response => jsonResponseHandling(response));

export const fetchRouteMappings = () => fetch(`${GTFS_ID_MAPPING_URL}/mappings/routes`, { method: 'GET' })
    .then(response => jsonResponseHandling(response));
