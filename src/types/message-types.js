export const ERROR_MESSAGE_TYPE = 'danger';
export const ALERT_MESSAGE_TYPE = 'warning';
export const ALERT_ERROR_MESSAGE_TYPE = 'error';
export const CONFIRMATION_MESSAGE_TYPE = 'success';
export const MESSAGE_ACTION_TYPES = {
    tripDelayUpdate: 'tripDelayUpdate',
    stopStatusUpdate: 'stopStatusUpdate',
    stopPlatformUpdate: 'stopPlatformUpdate',
    moveTripStop: 'moveTripStop',
    moveTripNextStop: 'moveTripNextStop',
    bulkStatusUpdate: 'bulkStatusUpdate',
    bulkStopStatusUpdate: 'bulkStopStatusUpdate',
    updateDestination: 'updateDestination',
    tripOperationNotesUpdate: 'tripOperationNotesUpdate',
};

export default [
    ERROR_MESSAGE_TYPE,
    ALERT_ERROR_MESSAGE_TYPE,
    ALERT_MESSAGE_TYPE,
    CONFIRMATION_MESSAGE_TYPE,
    MESSAGE_ACTION_TYPES,
];
