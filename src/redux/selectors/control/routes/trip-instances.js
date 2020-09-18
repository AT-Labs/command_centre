import _ from 'lodash-es';
import { createSelector } from 'reselect';

import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import USER_PERMISSIONS from '../../../../types/user-permissions-types';
import { getTripInstanceId } from '../../../../utils/helpers';
import { ERROR_MESSAGE_TYPE, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES } from '../../../../types/message-types';

export const getTripsState = state => _.result(state, 'control.routes.tripInstances');
export const getAllTripInstances = createSelector(getTripsState, tripInstancesState => _.result(tripInstancesState, 'all'));
export const getAllTripIds = createSelector(getAllTripInstances, tripInstances => _.values(tripInstances).map(tripInstance => tripInstance.tripId));
export const getAllTripInstancesList = createSelector(getAllTripInstances, tripInstances => _.values(tripInstances));
export const getAllTripInstancesTotal = createSelector(getTripsState, tripInstancesState => _.result(tripInstancesState, 'total'));
export const getTripInstancesLoadingState = createSelector(getTripsState, tripInstancesState => _.result(tripInstancesState, 'isLoading'));
export const getTripInstancesUpdatingState = createSelector(getTripsState, tripInstancesState => _.result(tripInstancesState, 'isUpdating'));
export const getTripInstancesActionResults = createSelector(getTripsState, tripInstancesState => _.result(tripInstancesState, 'actionResults'));
export const getTripInstancesActionLoading = createSelector(getTripsState, tripInstancesState => _.result(tripInstancesState, 'isActionLoading'));
export const getActiveTripInstance = createSelector(getTripsState, ({ all, active }) => _.compact(active.map(tripId => all[tripId])));
export const getSelectedTripInstances = createSelector(getTripsState, tripInstancesState => _.result(tripInstancesState, 'selected'));
export const getSelectedTripsKeys = createSelector(getTripsState, tripInstancesState => Object.keys(_.result(tripInstancesState, 'selected')));
// eslint-disable-next-line no-underscore-dangle,max-len
export const getAllNotCompletedTrips = allTrips => _.pickBy(allTrips, value => (value.status !== TRIP_STATUS_TYPES.completed && value._links && value._links.permissions.map(permission => permission._rel).indexOf(USER_PERMISSIONS.ROUTES.CANCEL_TRIP) !== -1));
export const getBulkUpdateMessagesByType = (actionResults, selectedTrips, messageType, messageActionType) => actionResults
    .filter(action => action.actionType === messageActionType
            && action.type === messageType
            && (selectedTrips ? !_.isEmpty(selectedTrips[action.tripId]) : true));
export const getSelectedStops = createSelector(getTripsState, tripInstancesState => _.result(tripInstancesState, 'selectedStops'));
export const getSelectedStopsByTripKey = (selectedStops, tripInstance) => (tripInstance ? selectedStops[getTripInstanceId(tripInstance)] : {});
export const getSelectedStopsUpdatingState = createSelector(getTripsState, tripInstancesState => _.result(tripInstancesState, 'areSelectedStopsUpdating'));

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
