import { uniqBy, map, pick, sortBy } from 'lodash-es';
import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = [];

const handlePopulateAgencies = (state, { payload: { routes } }) => {
    const uniqueAgencyRoutes = uniqBy(routes, route => `${route.agency_id}${route.route_type}`);
    return sortBy(map(uniqueAgencyRoutes, route => pick(route, ['agency_id', 'agency_name', 'route_type'])), 'agency_name');
};

export default handleActions({
    [ACTION_TYPE.POPULATE_AGENCIES]: handlePopulateAgencies,
}, INIT_STATE);
