/* eslint-disable max-len */
import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getAddRecurringCancellationsDetails = state => _.result(state, 'control.routes.addRecurringCancellations');
export const getAddRecurringCancellationIsLoading = createSelector(getAddRecurringCancellationsDetails, recurringCancellationsDetails => _.result(recurringCancellationsDetails, 'isLoading'));
export const getAddRecurringCancellationMessage = createSelector(getAddRecurringCancellationsDetails, recurringCancellationsDetails => _.result(recurringCancellationsDetails, 'message'));
export const getAddRecurringCancellationValidationField = createSelector(getAddRecurringCancellationsDetails, recurringCancellationsDetails => _.result(recurringCancellationsDetails, 'inputFieldValidation'));

export const getAddRecurringCancellationInputFieldValidation = createSelector(getAddRecurringCancellationValidationField, (recurringCancellationsValidationField) => {
    const { isRouteVariantValid, isStartTimeValid, isRouteValid } = recurringCancellationsValidationField;
    return isRouteVariantValid && isStartTimeValid && isRouteValid;
});
