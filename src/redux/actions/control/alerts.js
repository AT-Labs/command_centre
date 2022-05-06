import moment from 'moment-timezone';
import _ from 'lodash-es';

import DATE_TYPE from '../../../types/date-types';
import ACTION_TYPE from '../../action-types';
import ERROR_TYPE from '../../../types/error-types';
import * as alertsApi from '../../../utils/transmitters/alerts-api';
import { setBannerError } from '../activity';
import { latestModifyAt } from '../../selectors/control/alerts';

const loadAlerts = alerts => ({
    type: ACTION_TYPE.FETCH_CONTROL_ALERTS,
    payload: {
        alerts,
    },
});

export const updateAlertsFilters = filter => ({
    type: ACTION_TYPE.UPDATE_CONTROL_ALERTS_FILTERS,
    payload: {
        ...filter,
    },
});

export const parseStartAndDateTime = (date, time) => moment.tz(`${date}-${time}`, 'YYYYMMDD-HH:mm:ss', DATE_TYPE.TIME_ZONE);

export const getAlerts = () => (dispatch, getState) => {
    const latestModify = latestModifyAt(getState());
    return alertsApi.getAlerts(latestModify)
        .then((alerts) => {
            const alertTypeDisplayMapping = {
                Signon: 'Sign-on',
            };
            if (alerts.length > 0) {
                const activeAlertsWithinLast12hs = _.orderBy(alerts.map((alert) => {
                    // eslint-disable-next-line no-param-reassign
                    alert.customTitle = `${_.result(alertTypeDisplayMapping, alert.type, alert.type)} Trip`;
                    if (alert.type !== 'Signon') {
                        // eslint-disable-next-line max-len
                        const alertDatetime = new Date(alert.tripStartDate.slice(0, 4), alert.tripStartDate.slice(4, 6) - 1, alert.tripStartDate.slice(6), alert.tripStartTime.slice(0, 2), alert.tripStartTime.slice(3, 5), alert.tripStartTime.slice(6), 0);
                        const diffFromScheduleTimeInMins = Math.floor(Math.abs(new Date() - alertDatetime) / (60 * 1000)).toString();
                        const routeVariantAndStartTime = `${alert.routeVariantId} - ${alert.tripStartTime.slice(0, 5)}`;
                        // eslint-disable-next-line no-param-reassign
                        alert.message = (`No vehicle has started scheduled trip ${routeVariantAndStartTime} for ${diffFromScheduleTimeInMins} minutes from scheduled departure`);
                    }
                    return alert;
                }), ['createdAt', 'tripStartDate', 'tripStartTime'], ['desc', 'desc', 'desc']);
                dispatch(loadAlerts(activeAlertsWithinLast12hs));
            }
        })
        .catch(() => {
            if (ERROR_TYPE.fetchStopMessages) {
                dispatch(setBannerError(ERROR_TYPE.fetchStopMessages));
            }
        });
};

export const dismissAlert = alert => dispatch => alertsApi.dismissAlert(alert)
    .then(() => {
        dispatch(getAlerts());
    });

export const startPollingAlerts = () => (dispatch) => {
    dispatch(getAlerts());
    setInterval(() => dispatch(getAlerts()), 5 * 60 * 1000);
};

export const updateAlertsDatagridConfig = model => ({
    type: ACTION_TYPE.UPDATE_CONTROL_ALERTS_DATAGRID_CONFIG,
    payload: model,
});
