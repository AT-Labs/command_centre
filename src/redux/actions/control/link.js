import ACTION_TYPE from '../../action-types';
import VIEW_TYPE from '../../../types/view-types';
import { updateControlDetailView, updateMainView, updateQueryParams } from '../navigation';
import { mergeRouteFilters } from './routes/filters';
import { setActiveRoute } from './routes/routes';
import { setActiveRouteVariant } from './routes/routeVariants';
import { clearActiveTripInstanceId, updateTripsDatagridConfig } from './routes/trip-instances';
import { updateServiceDate } from './serviceDate';
import { parseStartAndDateTime } from './alerts';

import { updateActiveDisruptionId } from './disruptions';

export const goToRoutesView = (trip, filters) => (dispatch) => {
    const {
        routeVariantId, routeType, startTime, routeShortName, agencyId, tripStartDate, tripStartTime,
    } = trip;

    if (tripStartDate && tripStartTime) {
        dispatch(updateServiceDate(parseStartAndDateTime(tripStartDate, tripStartTime).toISOString()));
    }

    dispatch(clearActiveTripInstanceId());
    dispatch({
        type: ACTION_TYPE.UPDATE_TRIP_CROSS_LINK,
        payload: {
            routeVariantId, routeType, startTime, routeShortName, agencyId,
        },
    });
    dispatch(updateMainView(VIEW_TYPE.MAIN.CONTROL));
    dispatch(updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.ROUTES));
    dispatch(setActiveRoute(routeShortName));
    dispatch(setActiveRouteVariant(routeVariantId));
    dispatch(mergeRouteFilters(filters, false));
    dispatch(updateTripsDatagridConfig({
        filterModel: { items: [{
            columnField: 'startTime',
            operatorValue: 'onOrAfter',
            value: filters.startTimeFrom,
        }] },
    }));
};

export const goToBlocksView = trip => (dispatch) => {
    const {
        routeVariantId, routeType, startTime, routeShortName, agencyId,
    } = trip;
    dispatch({
        type: ACTION_TYPE.UPDATE_TRIP_CROSS_LINK,
        payload: {
            routeVariantId,
            routeType,
            startTime,
            routeShortName,
            agencyId: agencyId || '',
        },
    });
    dispatch(updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.BLOCKS));
};

export const goToNotificationsView = queryParams => (dispatch) => {
    if (queryParams) {
        dispatch(updateQueryParams(queryParams));
    }
    dispatch(updateMainView(VIEW_TYPE.MAIN.CONTROL));
    dispatch(updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.NOTIFICATIONS));
};

export const goToDisruptionsView = (message, { setActiveDisruption }) => (dispatch) => {
    dispatch(updateMainView(VIEW_TYPE.MAIN.CONTROL));
    dispatch(updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS));
    if (setActiveDisruption) dispatch(updateActiveDisruptionId(message.incidentId));
};
