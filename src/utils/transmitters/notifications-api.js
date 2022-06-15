import { jsonResponseHandling } from '../fetch';
import { fetchWithAuthHeader } from '../../auth';
import { getViewPermission } from '../helpers';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_NOTIFICATIONS_CONTENT_API } = process.env;
const { POST, GET, PATCH, DELETE } = HTTP_TYPES;

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

const patchRequest = (updateObject, url) => fetchWithAuthHeader(
    url,
    {
        method: PATCH,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateObject),
    },
).then(response => jsonResponseHandling(response));

export const updateNotification = (id, title, description) => {
    const url = `${REACT_APP_NOTIFICATIONS_CONTENT_API}/rendered-content/${id}/service-alert`;

    const updateObject = [
        { name: 'title', content: title },
        { name: 'description', content: description },
    ];

    return patchRequest(updateObject, url);
};

export const publishNotification = (id) => {
    const url = `${REACT_APP_NOTIFICATIONS_CONTENT_API}/notification-content/${id}`;

    const updateObject = { condition: 'published' };

    return patchRequest(updateObject, url);
};

export const deleteNotification = (id) => {
    const url = `${REACT_APP_NOTIFICATIONS_CONTENT_API}/notification-content/${id}`;

    return fetchWithAuthHeader(
        url,
        {
            method: DELETE,
        },
    ).then(response => jsonResponseHandling(response));
};
