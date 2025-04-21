import { map } from 'lodash-es';
import { jsonResponseHandling } from '../fetch';
import { getViewPermission } from '../helpers';
import { fetchWithAuthHeader } from '../../auth';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_DISRUPTION_MGT_QUERY_URL } = process.env;
const { GET, POST, PUT, DELETE } = HTTP_TYPES;

export const getDisruptionsViewPermission = () => getViewPermission(`${REACT_APP_DISRUPTION_MGT_QUERY_URL}/view`);

export const getDisruptions = (includeDrafts = false) => fetchWithAuthHeader(`${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions?includeDraft=${includeDrafts}`, { method: GET })
    .then(response => jsonResponseHandling(response));

export const getDisruption = (disruptionId, signal) => fetchWithAuthHeader(`${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions/${disruptionId}`, { method: GET, signal })
    .then(response => jsonResponseHandling(response));

export const updateDisruption = (disruption) => {
    const { disruptionId } = disruption;
    const url = `${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions/${disruptionId}`;
    return fetchWithAuthHeader(
        url,
        {
            method: PUT,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(disruption),
        },
    ).then(response => jsonResponseHandling(response));
};

export const createDisruption = (disruption) => {
    const url = `${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions/`;
    return fetchWithAuthHeader(
        url,
        {
            method: POST,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(disruption),
        },
    ).then(response => jsonResponseHandling(response));
};

export const uploadDisruptionFiles = (disruption, files) => {
    const { disruptionId } = disruption;
    const url = `${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions/${disruptionId}/files`;

    const formData = new FormData();
    map(files, (file, index) => formData.append(`file${index}`, file));

    return fetchWithAuthHeader(
        url,
        {
            method: POST,
            headers: {
                Accept: 'application/json',
            },
            body: formData,
        },
    ).then(response => jsonResponseHandling(response));
};

export const deleteDisruptionFile = (disruption, fileId) => {
    const { disruptionId } = disruption;
    const url = `${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions/${disruptionId}/file/${fileId}`;

    return fetchWithAuthHeader(
        url,
        {
            method: DELETE,
            headers: {
                Accept: 'application/json',
            },
        },
    ).then(response => jsonResponseHandling(response));
};

export const addDiversion = (diversion) => {
    const url = `${REACT_APP_DISRUPTION_MGT_QUERY_URL}/diversions`;
    return fetchWithAuthHeader(
        url,
        {
            method: POST,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(diversion),
        },
    ).then(response => jsonResponseHandling(response));
};
