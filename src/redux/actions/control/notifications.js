import moment from 'moment-timezone';
import _ from 'lodash-es';

import DATE_TYPE from '../../../types/date-types';
import ACTION_TYPE from '../../action-types';
import ERROR_TYPE from '../../../types/error-types';
import * as notificationsApi from '../../../utils/transmitters/notifications-api';
import { setBannerError } from '../activity';
import { latestModifyAt } from '../../selectors/control/notifications';

const loadNotifications = notifications => ({
    type: ACTION_TYPE.FETCH_CONTROL_NOTIFICATIONS,
    payload: {
        notifications,
    },
});

export const updateNotificationsFilters = filter => ({
    type: ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_FILTERS,
    payload: {
        ...filter,
    },
});

export const parseStartAndDateTime = (date, time) => moment.tz(`${date}-${time}`, 'YYYYMMDD-HH:mm:ss', DATE_TYPE.TIME_ZONE);

export const getNotifications = () => (dispatch, getState) => {
    const latestModify = latestModifyAt(getState());
    return notificationsApi.getNotifications(latestModify)
        .then((notifications) => {
            const notificationTypeDisplayMapping = {
                Signon: 'Sign-on',
            };
            if (notifications.length > 0) {
                const activeNotificationsWithinLast12hs = _.orderBy(notifications.map((notification) => {
                    // eslint-disable-next-line no-param-reassign
                    notification.customTitle = `${_.result(notificationTypeDisplayMapping, notification.type, notification.type)} Trip`;
                    if (notification.type !== 'Signon') {
                        // eslint-disable-next-line max-len
                        const notificationDatetime = new Date(notification.tripStartDate.slice(0, 4), notification.tripStartDate.slice(4, 6) - 1, notification.tripStartDate.slice(6), notification.tripStartTime.slice(0, 2), notification.tripStartTime.slice(3, 5), notification.tripStartTime.slice(6), 0);
                        const diffFromScheduleTimeInMins = Math.floor(Math.abs(new Date() - notificationDatetime) / (60 * 1000)).toString();
                        const routeVariantAndStartTime = `${notification.routeVariantId} - ${notification.tripStartTime.slice(0, 5)}`;
                        // eslint-disable-next-line no-param-reassign
                        notification.message = (`No vehicle has started scheduled trip ${routeVariantAndStartTime} for ${diffFromScheduleTimeInMins} minutes from scheduled departure`);
                    }
                    return notification;
                }), ['createdAt', 'tripStartDate', 'tripStartTime'], ['desc', 'desc', 'desc']);

                dispatch(loadNotifications(activeNotificationsWithinLast12hs));
            }
        })
        .catch(() => {
            if (ERROR_TYPE.fetchStopMessages) {
                dispatch(setBannerError(ERROR_TYPE.fetchStopMessages));
            }
        });
};

export const dismissNotification = notification => dispatch => notificationsApi.dismissNotification(notification)
    .then(() => {
        dispatch(getNotifications());
    });

export const startPollingNotifications = () => (dispatch) => {
    dispatch(getNotifications());
    setInterval(() => dispatch(getNotifications()), 5 * 60 * 1000);
};
