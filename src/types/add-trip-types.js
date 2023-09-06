import ERROR_TYPE from './error-types';

export const ACTION_RESULT_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
};

export const ACTION_RESULT = {
    SUCCESS: () => ({
        resultStatus: ACTION_RESULT_TYPES.SUCCESS,
    }),
    ERROR: () => ({
        resultStatus: ACTION_RESULT_TYPES.ERROR,
        resultMessage: ERROR_TYPE.addTripFailed,
    }),
};
