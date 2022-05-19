import { jsonResponseHandling } from '../fetch';
import { fetchWithAuthHeader } from '../../auth';
import { getViewPermission } from '../helpers';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_NOTIFICATIONS_CONTENT_API } = process.env;
const { POST } = HTTP_TYPES;

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
