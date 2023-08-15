import { result } from 'lodash-es';
import { createSelector } from 'reselect';

const getAppSettingsState = state => result(state, 'appSettings');
export const useRecurringCancellations = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRecurringCancellations') === 'true'));
export const useRecurringCancellationsGridView = createSelector(
    getAppSettingsState,
    appSettingState => (result(appSettingState, 'useRecurringCancellationsGridView') === 'true'),
);
export const usePassengerImpact = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'usePassengerImpact') === 'true'));
export const useRoutesTripsDatagrid = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRoutesTripsDatagrid') === 'true'));
export const useHeadsignUpdate = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useHeadsignUpdate') === 'true'));
export const useCAFMapFilter = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useCAFMapFilter') === 'true'));
export const useRoutesTripsFilterCollapse = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRoutesTripsFilterCollapse') === 'true'));
