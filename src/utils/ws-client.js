/* eslint-disable no-console */
import _ from 'lodash-es';
import ReconnectingWS from 'reconnectingwebsocket';

const REALTIME_SUBSCRIPTIONS_URL = process.env.REACT_APP_GTFS_REALTIME_SUBSCRIPTIONS_URL
    + process.env.REACT_APP_GTFS_REALTIME_SUBSCRIPTIONS_KEY;
const REALTIME_SUBSCRIPTIONS_KEY = process.env.REACT_APP_GTFS_REALTIME_SUBSCRIPTIONS_KEY;

const logPrefix = 'Command Centre WebSocket Client:';
// Pinging
const idleWait = Math.ceil((10 + _.random(0, 10, true)) * 1000); // Randomise the idle wait for clients to prevent DDOSing server.
const maxPingCount = 10;
const pingInterval = 2 * 1000;
// Autoreconnect
const reconnectInterval = 2000;
const maxReconnectAttempts = null; // keep retrying
const timeoutInterval = 10000;

let socket = null;
let pingCount = 0;
let pingIntervalHandle;

const createWebSocket = () => new ReconnectingWS(REALTIME_SUBSCRIPTIONS_URL, null, {
    automaticOpen: true,
    reconnectDecay: 1,
    reconnectInterval,
    timeoutInterval,
    maxReconnectAttempts,
});

const debouncedPinging = _.debounce((onError) => {
    console.debug(`${logPrefix} start pinging`);
    pingIntervalHandle = window.setInterval(() => {
        if (pingCount < maxPingCount) {
            pingCount += 1;
            try {
                socket.send('ping');
                console.debug(`${logPrefix} ping sent ${pingCount}`);
            } catch (err) {
                console.error('Unexpected error occurred when sending a ping to websocket: ', err);
            }
        } else {
            try {
                socket.refresh();
            } catch (err) {
                console.error('Unexpected error occurred while attempting to refresh websocket connection: ', err);
            }
            window.clearInterval(pingIntervalHandle);
            pingIntervalHandle = null;
            console.debug(`${logPrefix} ping failed`);
            onError(new Error('Websocket connection is inactive'));
        }
    }, pingInterval);
}, idleWait);

const stopPinging = () => {
    if (pingIntervalHandle) {
        console.debug(`${logPrefix} stop pinging`);
        pingCount = 0;
        window.clearInterval(pingIntervalHandle);
        pingIntervalHandle = null;
    }
};

export const subscribeRealTime = ({
    queryString, onData, onError, filters = _.noop,
}) => {
    try {
        if (socket) {
            socket.open();
        } else {
            socket = createWebSocket();

            const request = {
                subscription_key: REALTIME_SUBSCRIPTIONS_KEY,
                filters,
                query: queryString,
            };

            socket.onopen = () => {
                console.debug(`${logPrefix} connection opened`);
                socket.send(JSON.stringify(request));
            };

            socket.onclose = () => {
                console.debug(`${logPrefix} connection closed`);
                stopPinging();
            };

            socket.onmessage = (message) => {
                const { data } = message;

                if (data !== 'pong') {
                    onData(JSON.parse(message.data));
                }

                stopPinging();
                debouncedPinging(onError);
            };

            socket.onerror = () => {
                const error = new Error('Error occurred while subscribing to websocket');
                console.error(error);
                onError(error);
                stopPinging();
            };
        }
    } catch (err) {
        console.error('Unexpected error occurred when opening websocket connection: ', err);
    }
};

export const unsubscribeRealTime = () => {
    try {
        if (socket) {
            socket.close();
            debouncedPinging.cancel();
        }
    } catch (err) {
        console.error('Unexpected error occurred while attempting to close websocket connection: ', err);
    }
};
