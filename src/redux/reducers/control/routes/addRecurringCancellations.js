import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../../action-types';

export const INIT_STATE = {
    isLoading: false,
    message: {
        recurringCancellationId: null,
        resultStatus: null,
        resultMessage: null,
    },
    inputFieldValidation: {
        isRouteVariantValid: false,
        isStartTimeValid: false,
        isRouteValid: false,
    },
    displayError: false,
};

const handleRecurringCancellationIsLoading = (state, { payload: { isLoading } }) => ({ ...state, isLoading });
const handleRecurringCancellationMessage = (state, action) => (
    { ...state, message: { ...state.message, ...action.payload } }
);
const handleClearRecurringCancellationMessage = (state, action) => (
    { ...state, message: { ...state.message, ...action.payload } }
);
const handleRecurringCancellationInputFieldValidation = (state, action) => (
    { ...state, inputFieldValidation: { ...state.inputFieldValidation, ...action.payload } }
);
const handleRecurringCancellationDisplayOperatoeError = (state, { payload: { displayError } }) => ({ ...state, displayError });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_IS_LOADING]: handleRecurringCancellationIsLoading,
    [ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_MESSAGE]: handleRecurringCancellationMessage,
    [ACTION_TYPE.CLEAR_CONTROL_RECURRING_CANCELLATIONS_MESSAGE]: handleClearRecurringCancellationMessage,
    [ACTION_TYPE.CLEAR_CONTROL_RECURRING_CANCELLATIONS_VALIDATION]: handleRecurringCancellationInputFieldValidation,
    [ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_DISPLAY_OPERATOR_ERROR]: handleRecurringCancellationDisplayOperatoeError,
}, INIT_STATE);
