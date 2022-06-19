import ERROR_TYPE from './error-types';

export const NOTIFICATION_CONDITION = {
    draft: 'draft',
    published: 'published',
};

export const NOTIFICATION_STATUS = {
    overwritten: 'overwritten',
    inProgress: 'in-progress',
};

export const ACTION_RESULT_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
};

export const ACTION_RESULT = {
    UPDATE_SUCCESS: (disruptionId, version) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Notification for Disruption ${disruptionId} version ${version} has been updated.`,
    }),
    UPDATE_ERROR: (disruptionId, version) => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.notificationUpdate(disruptionId, version),
    }),
    PUBLISH_SUCCESS: (disruptionId, version) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Notification for Disruption ${disruptionId} version ${version} has been published.`,
    }),
    PUBLISH_ERROR: (disruptionId, version) => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.notificationPublish(disruptionId, version),
    }),
    DELETE_SUCCESS: (disruptionId, version) => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
        resultMessage: `Notification for Disruption ${disruptionId} version ${version} has been deleted.`,
    }),
    DELETE_ERROR: (disruptionId, version) => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.notificationDelete(disruptionId, version),
    }),
};
