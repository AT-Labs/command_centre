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
export const useAddTrip = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useAddTrip') === 'true'));
export const useAddTripStopUpdate = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useAddTripStopUpdate') === 'true'));
export const useHideTrip = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useHideTrip') === 'true'));
export const useCAFMapFilter = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useCAFMapFilter') === 'true'));
export const useRoutesTripsFilterCollapse = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRoutesTripsFilterCollapse') === 'true'));
export const useDisruptionsNotificationsDirectLink = createSelector(
    getAppSettingsState,
    appSettingState => (result(appSettingState, 'useDisruptionsNotificationsDirectLink') === 'true'),
);
export const useAddMultipleTrips = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useAddMultipleTrips') === 'true'));
export const useViewDisruptionDetailsPage = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useViewDisruptionDetailsPage') === 'true'));
export const useTripHistory = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useTripHistory') === 'true'));
export const tripHistoryEnabledFromDate = createSelector(getAppSettingsState, appSettingState => result(appSettingState, 'tripHistoryEnabledFromDate'));
export const useCongestionLayer = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useCongestionLayer') === 'true'));
export const useRealtimeMapRouteColors = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRealtimeMapRouteColors') === 'true'));
export const useNonStopping = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useNonStopping') === 'true'));
