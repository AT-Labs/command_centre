import { result, values, compact, isEmpty, pickBy, find } from 'lodash-es';
import { createSelector } from 'reselect';

import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import USER_PERMISSIONS from '../../../../types/user-permissions-types';
import { getTripInstanceId } from '../../../../utils/helpers';
import { ERROR_MESSAGE_TYPE, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES } from '../../../../types/message-types';

export const getTripsState = state => result(state, 'control.routes.tripInstances');
export const getAllTripInstances = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'all'));
export const getAllTripIds = createSelector(getAllTripInstances, tripInstances => values(tripInstances).map(tripInstance => tripInstance.tripId));
export const getAllTripInstancesList = createSelector(getAllTripInstances, tripInstances => values(tripInstances));
export const getAllTripInstancesTotal = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'total'));
export const getTripInstancesLoadingState = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'isLoading'));
export const getTripInstancesUpdatingState = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'isUpdating'));
export const getTripInstancesActionResults = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'actionResults'));
export const getTripInstancesActionLoading = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'isActionLoading'));
export const getActiveTripInstance = createSelector(getTripsState, ({ all, active }) => compact(active.map(tripId => all[tripId])));
export const getSelectedTripInstances = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'selected'));
export const getSelectedTripsKeys = createSelector(getTripsState, tripInstancesState => Object.keys(result(tripInstancesState, 'selected')));
// eslint-disable-next-line no-underscore-dangle,max-len
export const getAllNotCompletedTrips = allTrips => pickBy(allTrips, value => (value.status !== TRIP_STATUS_TYPES.completed && value._links && value._links.permissions.map(permission => permission._rel).indexOf(USER_PERMISSIONS.ROUTES.CANCEL_TRIP) !== -1));
export const getBulkUpdateMessagesByType = (actionResults, selectedTrips, messageType, messageActionType) => actionResults
    .filter(action => action.actionType === messageActionType
            && action.type === messageType
            && (selectedTrips ? !isEmpty(selectedTrips[action.tripId]) : true));
export const getSelectedStops = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'selectedStops'));
export const getSelectedStopsByTripKey = (selectedStops, tripInstance) => (tripInstance ? selectedStops[getTripInstanceId(tripInstance)] : {});
export const getSelectedStopsUpdatingState = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'areSelectedStopsUpdating'));

// ABOUT REMOVING SELECTED STOPS AFTER UPDATE
// The next two selectors are stops specific and return the action message even if selectedStops have been cleared in the store.
// If selected stops are being kept (which has been the case so far and will be if we want to integrate the "undo" feature),
// this selector should be used instead: getBulkUpdateMessagesByType.
// Deselect stops after update (for this case) is in: actions/trip-instances.js -> updateSelectedStopsStatus()
export const getBulkUpdateSuccessMessagesForStops = createSelector(
    getTripInstancesActionResults,
    actionResults => actionResults.filter(action => action.actionType === MESSAGE_ACTION_TYPES.bulkStopStatusUpdate && action.type === CONFIRMATION_MESSAGE_TYPE),
);
export const getBulkUpdateErrorMessagesForStops = createSelector(
    getTripInstancesActionResults,
    actionResults => actionResults.filter(action => action.actionType === MESSAGE_ACTION_TYPES.bulkStopStatusUpdate && action.type === ERROR_MESSAGE_TYPE),
);

export const getTripStatusModalOriginState = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'tripStatusModalOrigin'));

export const isTripReccuringUpdateAllowed = trip => !!find(result(trip, '_links.permissions'), { _rel: USER_PERMISSIONS.ROUTES.RECURRENT_CANCEL });

export const getTripsDatagridConfig = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'datagridConfig'));

export const getLastFilterRequest = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'lastFilterRequest'));

export const getTotalTripInstancesCount = createSelector(getTripsState, tripInstancesState => result(tripInstancesState, 'totalTripInstancesCount'));

export const getStartStopInputValue = createSelector(getTripsState, (tripInstancesState) => {
    const filter = result(tripInstancesState, 'datagridConfig.filterModel.items')?.find(item => item.columnField === 'firstStopCode');
    return filter?.value?.text;
});

export const getEndStopInputValue = createSelector(getTripsState, (tripInstancesState) => {
    const filter = result(tripInstancesState, 'datagridConfig.filterModel.items')?.find(item => item.columnField === 'lastStopCode');
    return filter?.value?.text;
});
