/* eslint-disable camelcase */
import _ from 'lodash-es';
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

export const getRoutes = () => dispatch => ccStatic.getAllRoutes()
    .then((routes) => {
        dispatch(loadRoutes(routes));
        dispatch(populateAgencies(routes));
    })
    .catch((error) => {
        dispatch(reportError({ error: { critical: error } }, true));
        throw error;
    });
