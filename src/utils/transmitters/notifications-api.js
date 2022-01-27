import { jsonResponseHandling } from '../fetch';
import { fetchWithAuthHeader } from '../../auth';
import { getViewPermission } from '../helpers';

const { REACT_APP_ALERTS_API } = process.env;

export const getNotificationsViewPermission = () => getViewPermission(`${REACT_APP_ALERTS_API}/view`);

export const getNotifications = (latestModifyAt) => {
    const controller = new AbortController();
    const options = {
        method: 'GET',
        signal: controller.signal,
        headers: {
            'if-match': latestModifyAt,
            'cache-control': 'no-store',
        },
    };
    return fetchWithAuthHeader(
        `${REACT_APP_ALERTS_API}/alerts`,
        options,
    ).then(async (response) => {
        if (response.ok) {
            if (response.status === 204) {
                return response;
            }
            const res = await response.json();
            controller.abort();
            return res;
        }
        return [];
    });
};

export const dismissNotification = id => fetchWithAuthHeader(
    `${REACT_APP_ALERTS_API}/alerts/${id}`,
    { method: 'DELETE' },
).then(response => jsonResponseHandling(response));
