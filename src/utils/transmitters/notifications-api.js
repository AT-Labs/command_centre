import { jsonResponseHandling } from '../fetch';
import { fetchWithAuthHeader } from '../../auth';
import { getViewPermission } from '../helpers';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_NOTIFICATIONS_CONTENT_API } = process.env;
const { POST, GET } = HTTP_TYPES;

export const getNotificationsViewPermission = () => getViewPermission(`${REACT_APP_NOTIFICATIONS_CONTENT_API}/view`);

export const getNotifications = filterObject => fetchWithAuthHeader(
    `${REACT_APP_NOTIFICATIONS_CONTENT_API}/notification-content`,
    {
        method: POST,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterObject),
    },
).then(response => jsonResponseHandling(response));

export const getNotification = id => fetchWithAuthHeader(
    `${REACT_APP_NOTIFICATIONS_CONTENT_API}/notification-content/${id}`,
    {
        method: GET,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    },
).then(response => jsonResponseHandling(response));

export const getRenderedContent = notificationId => fetchWithAuthHeader(
    `${REACT_APP_NOTIFICATIONS_CONTENT_API}/rendered-content/${notificationId}`,
    {
        method: POST,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {
                filters: [
                    {
                        field: 'channel',
                        operator: '==',
                        value: 'service-alert',
                    },
                ],
                sorts: [
                    {
                        field: 'name',
                        direction: 'DESC',
                    },
                ],
                offset: 0,
                limit: 50,
            },
        ),
    },
).then(response => jsonResponseHandling(response));
