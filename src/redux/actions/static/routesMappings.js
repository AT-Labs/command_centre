import { fetchRouteMappings } from '../../../utils/transmitters/gtfs-realtime';
import cache from '../../../utils/cache';
import ACTION_TYPE from '../../action-types';
import { reportError } from '../activity';

export const loadRoutesMappings = routesMappings => ({
    type: ACTION_TYPE.FETCH_ROUTES_MAPPINGS,
    payload: {
        routesMappings,
    },
});

export const getAllRouteMappings = () => dispatch => fetchRouteMappings()
    .then(
        routeMappings => cache.route_mappings.clear()
            .then(() => cache.route_mappings.bulkAdd(routeMappings))
            .then(() => {
                dispatch(loadRoutesMappings(routeMappings));
                return routeMappings;
            }),
    )
    .catch((error) => {
        cache.route_mappings.clear();
        dispatch(reportError({ error: { critical: error } }, true));
        throw error;
    });
