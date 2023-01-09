export const TRAIN_TYPE_ID = 2;
export const BUS_TYPE_ID = 3;
export const FERRY_TYPE_ID = 4;

export const TRIP_DIRECTION_OUTBOUND = 1;
export const TRIP_DIRECTION_INBOUND = 0;

export const VEHICLE_TYPES = ['Bus', 'Train', 'Ferry'];

export const VEHICLE_POSITION = 'vehiclePosition';

export default {
    [TRAIN_TYPE_ID]: {
        type: 'Train',
        className: 'vehicle-type-train',
    },
    [BUS_TYPE_ID]: {
        type: 'Bus',
        className: 'vehicle-type-bus',
    },
    [FERRY_TYPE_ID]: {
        type: 'Ferry',
        className: 'vehicle-type-ferry',
    },
    NIS: {
        type: 'NIS',
        className: 'vehicle-type-not-in-service',
    },

};
