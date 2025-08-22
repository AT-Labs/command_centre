import { subscribeRealTime, unsubscribeRealTime } from '../ws-client';

const GTFS_REALTIME_SNAPSHOT_QUERY_URL = process.env.REACT_APP_GTFS_REALTIME_QUERY_URL;

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
            .replacementTripId
        }
        timestamp
        position {
            bearing
            latitude
            longitude
        }
        occupancyStatus
        tags
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

            // // eslint-disable-next-line no-console
            // console.log("Response res", res);
            // // eslint-disable-next-line no-debugger
            // debugger;
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
