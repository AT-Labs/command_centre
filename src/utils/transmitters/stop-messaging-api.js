import { jsonResponseHandling } from '../fetch';
import { getViewPermission } from '../helpers';
import { fetchWithAuthHeader } from '../../auth';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_STOP_MESSAGING_API } = process.env;
const stopMessagesEndpoint = '/management/stop-messages/';
const stopGroupsEndpoint = '/management/stop-groups/';
const { GET, POST, PUT, DELETE } = HTTP_TYPES;

const fetchStopMessagingApi = async (endpoint) => {
    const response = await fetchWithAuthHeader(`${REACT_APP_STOP_MESSAGING_API}${endpoint}`, { method: GET });
    return jsonResponseHandling(response);
};

const updateStopMessagingApi = (endpoint, id, payload) => {
    const url = id ? `${REACT_APP_STOP_MESSAGING_API}${endpoint}${id}` : `${REACT_APP_STOP_MESSAGING_API}${endpoint}`;
    const method = payload ? PUT : DELETE;
    return fetchWithAuthHeader(
        url,
        {
            method: id ? method : POST,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    ).then(response => jsonResponseHandling(response));
};

/**
 * Stop messages endpoint
 */
export const getStopMessagingViewPermission = () => getViewPermission(`${REACT_APP_STOP_MESSAGING_API}/view`);

export const getStopMessages = () => fetchStopMessagingApi(`${stopMessagesEndpoint}?include_expired=true`);

export const updateStopMessage = (payload, stopMessageId) => updateStopMessagingApi(stopMessagesEndpoint, stopMessageId, payload);

/**
 * Stop groups endpoint
 */
export const getStopGroups = () => fetchStopMessagingApi(stopGroupsEndpoint);

export const updateStopGroup = (payload, stopGroupId) => updateStopMessagingApi(stopGroupsEndpoint, stopGroupId, payload);
