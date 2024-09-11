import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';
import { getViewPermission } from '../helpers';

const { REACT_APP_BUS_PRIORITY_URL } = process.env;

export const getBusPriorityViewPermission = () => getViewPermission(`${REACT_APP_BUS_PRIORITY_URL}/view`);

export const getBusPriorityRoutes = () => {
    const url = `${REACT_APP_BUS_PRIORITY_URL}/priorityroute`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        },
    ).then(response => jsonResponseHandling(response));
};

export const deleteBusPriorityRoutes = (routeIds) => {
    const url = `${REACT_APP_BUS_PRIORITY_URL}/priorityroute`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ routeIds }),
        },
    );
};

export const addBusPriorityRoute = (routeId) => {
    const url = `${REACT_APP_BUS_PRIORITY_URL}/priorityroute`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ routeId }),
        },
    );
};

export const getBusPriorityIntersections = () => {
    const url = `${REACT_APP_BUS_PRIORITY_URL}/intersection`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        },
    ).then(response => jsonResponseHandling(response));
};

export const updateIntersection = (body) => {
    const url = `${REACT_APP_BUS_PRIORITY_URL}/intersection`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        },
    );
};
