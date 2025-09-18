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
export const useViewDisruptionDetailsPage = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useViewDisruptionDetailsPage') === 'true'));
export const useTripHistory = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useTripHistory') === 'true'));
export const tripHistoryEnabledFromDate = createSelector(getAppSettingsState, appSettingState => result(appSettingState, 'tripHistoryEnabledFromDate'));
export const useCongestionLayer = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useCongestionLayer') === 'true'));
export const useRealtimeMapRouteColors = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRealtimeMapRouteColors') === 'true'));
export const useNonStopping = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useNonStopping') === 'true'));
export const useRouteView = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRouteView') === 'true'));
export const useIncidentLayer = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useIncidentLayer') === 'true'));
export const useBulkStopsUpdate = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useBulkStopsUpdate') === 'true'));
export const useRemoveStops = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRemoveStops') === 'true'));
export const useRoutesTripsPreferences = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRoutesTripsPreferences') === 'true'));
export const useNextDayTrips = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useNextDayTrips') === 'true'));
export const useUnscheduledFilter = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useUnscheduledFilter') === 'true'));
export const useNextDayChangePlatform = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useNextDayChangePlatform') === 'true'));
export const useNewRealtimeMapFilters = createSelector(
    getAppSettingsState,
    appSettingState => (result(appSettingState, 'useNewRealtimeMapFilters') === 'true'),
);
export const useBusPriorityDataManagement = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useBusPriorityDataManagement') === 'true'));
export const useNextDayChangePlatformBulkUpdate = createSelector(
    getAppSettingsState,
    appSettingState => (result(appSettingState, 'useNextDayChangePlatformBulkUpdate') === 'true'),
);
export const useDisruptionEmailFormat = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useDisruptionEmailFormat') === 'true'));
export const useGeoSearchRoutesByDisruptionPeriod = createSelector(
    getAppSettingsState,
    appSettingState => (result(appSettingState, 'useGeoSearchRoutesByDisruptionPeriod') === 'true'),
);
export const useRouteAlertsLayer = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useRouteAlertsLayer') === 'true'));
export const useCarsRoadworksLayer = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useCarsRoadworksLayer') === 'true'));
export const useDraftDisruptions = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useDraftDisruptions') === 'true'));
export const useDisruptionDraftEmailSharing = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useDisruptionDraftEmailSharing') === 'true'));
export const useNewMonitoring = createSelector(
    getAppSettingsState,
    appSettingState => (result(appSettingState, 'useNewMonitoring') === 'true'),
);

export const useDiversion = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useDiversion') === 'true'));
export const useHideSkippedStop = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useHideSkippedStop') === 'true'));
export const useStopBasedDisruptionsLayer = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useStopBasedDisruptionsLayer') === 'true'));
export const useHoldTrip = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useHoldTrip') === 'true'));
export const useStopBasedDisruptionsSearch = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useStopBasedDisruptionsSearch') === 'true'));
export const useTripOperationNotes = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useTripOperationNotes') === 'true'));
export const useTripCancellationCause = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useTripCancellationCause') === 'true'));
export const useParentChildIncident = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useParentChildIncident') === 'true'));
export const useEditEffectPanel = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useEditEffectPanel') === 'true'));
export const useAdditionalFrontendChanges = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useAdditionalFrontendChanges') === 'true'));
export const useNotificationEffectColumn = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useNotificationEffectColumn') === 'true'));
export const useDisruptionNotePopup = createSelector(getAppSettingsState, appSettingState => (result(appSettingState, 'useDisruptionNotePopup') === 'true'));
