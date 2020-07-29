/* eslint-disable camelcase */
import _ from 'lodash-es';
import cache, { isCacheValid } from '../../../utils/cache';
import ACTION_TYPE from '../../action-types';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import { reportError } from '../activity';
import { populateAgencies } from './agencies';

const loadRoutes = routes => ({
    type: ACTION_TYPE.FETCH_ROUTES,
    payload: {
        routes: _.keyBy(routes, 'route_id'),
    },
});

const tokenizeRoutes = routes => routes.map(route => ({
    ...route,
    tokens: route.route_short_name.toLowerCase().split(' '),
}));

export const getRoutes = () => dispatch => isCacheValid('routes')
    .then(({ isValid }) => {
        if (isValid) {
            return cache.routes.toArray();
        }
        return ccStatic.getAllRoutes()
            .then((routes) => {
                const tokenizedRoutes = tokenizeRoutes(routes);
                return cache.routes.clear()
                    .then(() => cache.routes.bulkAdd(tokenizedRoutes))
                    .then(() => tokenizedRoutes);
            })
            .catch((error) => {
                dispatch(reportError({ error: { critical: error } }));
                cache.routes.clear();
                return [];
            });
    })
    .then((routes) => {
        dispatch(loadRoutes(routes));
        dispatch(populateAgencies(routes));
    })
    .catch((error) => {
        dispatch(reportError({ error: { critical: error } }, true));
        throw error;
    });
