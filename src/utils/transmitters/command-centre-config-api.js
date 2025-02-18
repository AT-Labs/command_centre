import * as Sentry from '@sentry/react';

import { jsonResponseHandling } from '../fetch';
import { fetchWithAuthHeader } from '../../auth';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_REALTIME_COMMAND_CENTRE_CONFIG_API_URL } = process.env;
const { GET, PATCH } = HTTP_TYPES;

export const getUserPreferences = () => {
    const url = `${REACT_APP_REALTIME_COMMAND_CENTRE_CONFIG_API_URL}/preferences`;
    return fetchWithAuthHeader(
        url,
        {
            method: GET,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        },
    ).then(response => jsonResponseHandling(response)).catch(error => Sentry.captureException(`Failed to get user preferences ${error})`));
};

export const updateUserPreferences = (filterObject) => {
    const url = `${REACT_APP_REALTIME_COMMAND_CENTRE_CONFIG_API_URL}/preferences`;
    return fetchWithAuthHeader(
        url,
        {
            method: PATCH,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filterObject),
        },
    ).catch(error => Sentry.captureException(`Failed to update user preferences ${error})`));
};

export const getAlertCauses = () => {
    const url = `${REACT_APP_REALTIME_COMMAND_CENTRE_CONFIG_API_URL}/causes`;
    return fetchWithAuthHeader(
        url,
        {
            method: GET,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        },
    ).then(response => jsonResponseHandling(response)).catch(error => Sentry.captureException(`Failed to get alert causes ${error})`));
};

export const getAlertEffects = () => {
    const url = `${REACT_APP_REALTIME_COMMAND_CENTRE_CONFIG_API_URL}/effects`;
    return fetchWithAuthHeader(
        url,
        {
            method: GET,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        },
    ).then(response => jsonResponseHandling(response)).catch(error => Sentry.captureException(`Failed to get alert effects ${error})`));
};
