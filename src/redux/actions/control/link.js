import ACTION_TYPE from '../../action-types';
import VIEW_TYPE from '../../../types/view-types';
import { updateActiveControlEntityId, updateControlDetailView, updateMainView, updateQueryParams } from '../navigation';
import { mergeRouteFilters } from './routes/filters';
import { setActiveRoute } from './routes/routes';
import { setActiveRouteVariant } from './routes/routeVariants';
import { clearActiveTripInstanceId } from './routes/trip-instances';
import { updateServiceDate } from './serviceDate';
import { parseStartAndDateTime } from './alerts';
import { updateRoutesTripsDatagridConfig } from '../datagrid';

import { updateActiveDisruptionId } from './disruptions';
import { updateActiveIncident, clearActiveIncident } from './incidents';

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
    dispatch(
        updateRoutesTripsDatagridConfig({
            filterModel: {
                items: [
                    {
                        columnField: 'startTime',
                        operatorValue: 'onOrAfter',
                        value: filters.startTimeFrom,
                    },
                ],
            },
        }),
    );
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

export const goToIncidentsView = (message, { setActiveIncident, openDetailPanel = true, scrollToParent = false }) => (dispatch) => {
    dispatch(updateMainView(VIEW_TYPE.MAIN.CONTROL));
    dispatch(updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.INCIDENTS));

    if (setActiveIncident) {
        dispatch(clearActiveIncident());
        dispatch(updateActiveIncident(message.incidentDisruptionNo));
        if (message.disruptionId) {
            dispatch(updateActiveDisruptionId(message.disruptionId));
        }
        dispatch({
            type: ACTION_TYPE.SET_DETAIL_PANEL_OPEN_FLAG,
            payload: { shouldOpenDetailPanel: openDetailPanel, scrollToParent },
        });
    }
};

export const goToDisruptionEditPage = (message, { setActiveDisruption }) => (dispatch) => {
    dispatch(updateMainView(VIEW_TYPE.MAIN.CONTROL));
    dispatch(updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS));
    dispatch(updateActiveControlEntityId(message.disruptionId.toString()));
    if (setActiveDisruption) dispatch(updateActiveDisruptionId(message.disruptionId));
};
