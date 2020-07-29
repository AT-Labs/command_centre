/* eslint-disable no-console */
import ReconnectingWS from 'reconnectingwebsocket';

const reconnectInterval = 2000;
const maxReconnectAttempts = null;
const timeoutInterval = 10000;

export const subscribeVehicleAllocation = ({ onData, onError }) => {
    const socket = new ReconnectingWS(process.env.REACT_APP_VEHICLE_ALLOCATION_STREAMING_API_URL, null, {
        automaticOpen: true,
        reconnectDecay: 1,
        reconnectInterval,
        timeoutInterval,
        maxReconnectAttempts,
    });

    try {
        socket.onmessage = (message) => {
            const { data } = message;
            onData(JSON.parse(data));
        };

        socket.onerror = () => {
            const error = new Error('Error occurred while subscribing to vehicle allocation websocket');
            console.error(error);
            onError(error);
        };
    } catch (err) {
        console.error('Unexpected error occurred when opening websocket connection: ', err);
    }
};
