/* eslint-disable max-len */
import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getAddRecurringCancellationsDetails = state => result(state, 'control.routes.addRecurringCancellations');
export const getAddRecurringCancellationIsLoading = createSelector(getAddRecurringCancellationsDetails, recurringCancellationsDetails => result(recurringCancellationsDetails, 'isLoading'));
export const getAddRecurringCancellationMessage = createSelector(getAddRecurringCancellationsDetails, recurringCancellationsDetails => result(recurringCancellationsDetails, 'message'));
export const getAddRecurringCancellationValidationField = createSelector(getAddRecurringCancellationsDetails, recurringCancellationsDetails => result(recurringCancellationsDetails, 'inputFieldValidation'));
export const getAddRecurringCancellationOperatorErrorDisplay = createSelector(getAddRecurringCancellationsDetails, recurringCancellationsDetails => result(recurringCancellationsDetails, 'displayError'));

export const getAddRecurringCancellationInputFieldValidation = createSelector(getAddRecurringCancellationValidationField, (recurringCancellationsValidationField) => {
    const { isRouteVariantValid, isStartTimeValid, isRouteValid } = recurringCancellationsValidationField;
    return isRouteVariantValid && isStartTimeValid && isRouteValid;
});
