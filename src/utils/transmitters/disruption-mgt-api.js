import _ from 'lodash-es';
import { jsonResponseHandling } from '../fetch';
import { getViewPermission } from '../helpers';
import { fetchWithAuthHeader } from '../../auth';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_DISRUPTION_MGT_QUERY_URL } = process.env;
const { GET, POST, PUT } = HTTP_TYPES;

/**
 * transform a disruption from {affectedEntities:[], cause: , ...} to {affectedRoutes:[],affectedStops:[], cause: , ...}
 * @param rawDisruption disruption returned from API
 * @returns {*} disruption for front end usage
 */
export const splitAffectedEntities = (rawDisruption) => {
    const disruption = _.cloneDeep(rawDisruption);
    const entities = {
        affectedRoutes: [],
        affectedStops: [],
    };
    _.forEach(disruption.affectedEntities, (entity) => {
        if (entity.stopId && !entity.routeId) {
            entities.affectedStops.push(entity);
        } else if (entity.routeId && !entity.stopId) {
            entities.affectedRoutes.push(entity);
        } else {
            throw new Error('Invalid disruption');
        }
    });
    delete disruption.affectedEntities;
    Object.assign(disruption, entities);
    return disruption;
};

/**
 * transform a disruption from {affectedRoutes:[],affectedStops:[], cause: , ...} to {affectedEntities:[], cause: , ...}
 * @param rawDisruption disruption assembled from UI
 * @returns {*} disruption suitable for back end usage
 */
export const combineAffectedEntities = (rawDisruption) => {
    const disruption = _.cloneDeep(rawDisruption);
    disruption.affectedEntities = _.concat(rawDisruption.affectedRoutes, rawDisruption.affectedStops);
    delete disruption.affectedRoutes;
    delete disruption.affectedStops;
    return disruption;
};

export const getDisruptionsViewPermission = () => getViewPermission(`${REACT_APP_DISRUPTION_MGT_QUERY_URL}/view`);

export const getDisruptions = () => fetchWithAuthHeader(`${REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions`, { method: GET })
    .then(response => jsonResponseHandling(response))
    .then((response) => {
        if (response.disruptions && _.isArray(response.disruptions)) {
            response.disruptions = response.disruptions.map(splitAffectedEntities);
        }
        return response;
    });

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
            body: JSON.stringify(combineAffectedEntities(disruption)),
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
            body: JSON.stringify(combineAffectedEntities(disruption)),
        },
    ).then(response => jsonResponseHandling(response));
};
