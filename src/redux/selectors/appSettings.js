import _ from 'lodash-es';
import { createSelector } from 'reselect';

const getAppSettingsState = state => _.result(state, 'appSettings');
export const useRecurringCancellations = createSelector(getAppSettingsState, appSettingState => (_.result(appSettingState, 'useRecurringCancellations') === 'true'));
export const useWorkarounds = createSelector(getAppSettingsState, appSettingState => (_.result(appSettingState, 'useWorkarounds') === 'true'));
export const useRecurringCancellationsGridView = createSelector(
    getAppSettingsState,
    appSettingState => (_.result(appSettingState, 'useRecurringCancellationsGridView') === 'true'),
);
