
import { result } from 'lodash-es';
import moment from 'moment';

import { jsonResponseHandling } from '../fetch';
import { BLOCKS_SERVICE_DATE_FORMAT } from '../control/blocks';
import { getViewPermission } from '../helpers';
import { fetchWithAuthHeader } from '../../auth';

const { REACT_APP_BLOCK_MGT_QUERY_URL, REACT_APP_BLOCK_MGT_CLIENT_QUERY_URL } = process.env;

export const getBlocksViewPermission = () => getViewPermission(`${REACT_APP_BLOCK_MGT_QUERY_URL}/view`);

export const getOperationalBlockRuns = ({ blockId, serviceDate } = {}) => {
    const blockIdParam = blockId ? `operationalBlockId=${blockId}&` : '';
    const date = serviceDate || moment().format(BLOCKS_SERVICE_DATE_FORMAT);
    const serviceDateParam = `serviceDate=${date}`;
    return fetchWithAuthHeader(`${REACT_APP_BLOCK_MGT_QUERY_URL}/block-runs?${blockIdParam}${serviceDateParam}`, { method: 'GET' })
        .then(response => jsonResponseHandling(response));
};

export const getOrphanOperationalTripRuns = async ({ serviceDate }) => {
    const filterParam = 'filter=orphan&';
    const date = serviceDate || moment().format(BLOCKS_SERVICE_DATE_FORMAT);
    const serviceDateParam = `serviceDate=${date}`;

    const response = await fetchWithAuthHeader(`${REACT_APP_BLOCK_MGT_QUERY_URL}/trip-runs?${filterParam}${serviceDateParam}`, { method: 'GET' });
    const json = await jsonResponseHandling(response);
    return json;
};

export const allocateVehicles = (blockId, payload) => {
    const url = `${REACT_APP_BLOCK_MGT_QUERY_URL}/block-runs/${blockId}`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    ).then(response => jsonResponseHandling(response));
};

export const addOperationalBlockRun = (operationalBlockRun) => {
    const url = `${REACT_APP_BLOCK_MGT_QUERY_URL}/block-runs/`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(operationalBlockRun),
        },
    ).then(response => jsonResponseHandling(response));
};

export const moveOperationalTrips = (payload) => {
    const url = `${REACT_APP_BLOCK_MGT_QUERY_URL}/block-runs/`;
    return fetchWithAuthHeader(
        url,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    ).then(response => jsonResponseHandling(response));
};

export const getAllocationSnapshot = () => fetchWithAuthHeader(`${REACT_APP_BLOCK_MGT_CLIENT_QUERY_URL}/allocations/`, { method: 'GET' })
    .then(response => jsonResponseHandling(response))
    .then(data => result(data, 'all', []));
