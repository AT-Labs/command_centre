import _ from 'lodash-es';
import { createSelector } from 'reselect';

const getAppSettingsState = state => _.result(state, 'appSettings');
export const useNotifications = createSelector(getAppSettingsState, appSettingState => (_.result(appSettingState, 'useNotifications') === 'true'));
export const useRecurringCancellations = createSelector(getAppSettingsState, appSettingState => (_.result(appSettingState, 'useRecurringCancellations') === 'true'));
export const useWorkarounds = createSelector(getAppSettingsState, appSettingState => (_.result(appSettingState, 'useWorkarounds') === 'true'));
