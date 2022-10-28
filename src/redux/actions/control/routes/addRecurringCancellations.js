import moment from 'moment';
import ACTION_TYPE from '../../../action-types';
import { DATE_FORMAT_DDMMYYYY } from '../../../../utils/dateUtils';
import { recurringUpdateTripStatus, recurringDeleteTripStatus } from '../../../../utils/transmitters/trip-mgt-api';
import { getAddRecurringCancellationValidationField } from '../../../selectors/control/routes/addRecurringCancellations';
import { ALERT_ERROR_MESSAGE_TYPE, CONFIRMATION_MESSAGE_TYPE, ALERT_MESSAGE_TYPE } from '../../../../types/message-types';

export const updateRecurringCancellationIsLoading = isLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_IS_LOADING,
    payload: {
        isLoading,
    },
});

export const updateStatusMessage = (recurringCancellationId, resultStatus, resultMessage) => ({
    type: ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_MESSAGE,
    payload: {
        recurringCancellationId,
        resultStatus,
        resultMessage,
    },
});

export const clearStatusMessage = () => ({
    type: ACTION_TYPE.CLEAR_CONTROL_RECURRING_CANCELLATIONS_MESSAGE,
    payload: {
        recurringCancellationId: null,
        resultStatus: null,
        resultMessage: null,
    },
});

export const updateValidationOfInputField = (isRouteVariantValid, isStartTimeValid, isRouteValid) => ({
    type: ACTION_TYPE.CLEAR_CONTROL_RECURRING_CANCELLATIONS_VALIDATION,
    payload: {
        isRouteVariantValid,
        isStartTimeValid,
        isRouteValid,
    },
});

const formatRecurringCancellationData = (recurringCancellationData) => {
    const { startTime, id } = recurringCancellationData;
    const formattedStartTime = startTime.match('^(([0-2][0-9])):[0-5][0-9]$') ? `${startTime}:00` : startTime;

    const savingRecurringCancellationData = {
        id,
        startTime: formattedStartTime,
        routeVariantId: recurringCancellationData.routeVariant,
        cancelFrom: moment(recurringCancellationData.startDate, DATE_FORMAT_DDMMYYYY),
        cancelTo: moment(recurringCancellationData.endDate, DATE_FORMAT_DDMMYYYY),
        dayPattern: JSON.stringify(recurringCancellationData.selectedWeekdays),
        routeShortName: recurringCancellationData.route,
        agencyId: recurringCancellationData.operator,
    };
    return savingRecurringCancellationData;
};

export const saveRecurringCancellationInDatabase = addRecurringCancellationData => (dispatch) => {
    const savingRecurringCancellationData = formatRecurringCancellationData(addRecurringCancellationData);

    dispatch(updateRecurringCancellationIsLoading(true));
    return recurringUpdateTripStatus(savingRecurringCancellationData)
        .then((response) => {
            if (response) {
                dispatch(updateRecurringCancellationIsLoading(false));
                dispatch(updateStatusMessage('', CONFIRMATION_MESSAGE_TYPE, 'Recurring cancellation successfully saved'));
            }
        })
        .catch(() => {
            dispatch(updateRecurringCancellationIsLoading(false));
            dispatch(updateStatusMessage('', ALERT_ERROR_MESSAGE_TYPE, 'Recurring cancellation failed to be saved'));
        });
};

export const deleteRecurringCancellationInDatabase = deleteRecurringCancellationData => (dispatch) => {
    dispatch(updateRecurringCancellationIsLoading(true));
    let recurringCancellationIdToBeDeleted;
    let totalNUmberOfRecurringCancellationToBeDeleted;
    if (Array.isArray(deleteRecurringCancellationData)) {
        recurringCancellationIdToBeDeleted = deleteRecurringCancellationData.join(',');
        totalNUmberOfRecurringCancellationToBeDeleted = deleteRecurringCancellationData.length;
    } else {
        recurringCancellationIdToBeDeleted = deleteRecurringCancellationData;
        totalNUmberOfRecurringCancellationToBeDeleted = 1;
    }

    recurringDeleteTripStatus(recurringCancellationIdToBeDeleted)
        .then((response) => {
            if (response) {
                dispatch(updateRecurringCancellationIsLoading(false));
                const responseMessage = `Recurring cancellation ${response.affected}/${totalNUmberOfRecurringCancellationToBeDeleted} successfully deleted in database`;
                if (response.affected !== totalNUmberOfRecurringCancellationToBeDeleted) {
                    dispatch(updateStatusMessage('', ALERT_MESSAGE_TYPE, responseMessage));
                } else {
                    dispatch(updateStatusMessage('', CONFIRMATION_MESSAGE_TYPE, responseMessage));
                }
            }
        })
        .catch(() => {
            dispatch(updateRecurringCancellationIsLoading(false));
            dispatch(updateStatusMessage('', ALERT_ERROR_MESSAGE_TYPE, 'Recurring cancellation failed to be deleted'));
        });
};

export const checkValidityOfInputField = statusOfInputField => (dispatch, getState) => {
    const currentStateOfInputFieldValidity = getAddRecurringCancellationValidationField(getState());
    const updatedStateOfInputFieldValidity = { ...currentStateOfInputFieldValidity, ...statusOfInputField };
    const { isRouteVariantValid, isStartTimeValid, isRouteValid } = updatedStateOfInputFieldValidity;
    dispatch(updateValidationOfInputField(isRouteVariantValid, isStartTimeValid, isRouteValid));
};
