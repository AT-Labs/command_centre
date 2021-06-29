import cache, { isCacheValid } from '../../../utils/cache';
import { getStops, loadStops } from './stops';
import { getRoutes, loadRoutes } from './routes';
import { populateAgencies } from './agencies';
import { getAllRouteMappings, loadRoutesMappings } from './routesMappings';

export const setCache = () => dispatch => isCacheValid()
    .then(({ isValid }) => {
        if (!isValid) {
            return Promise.all([dispatch(getStops()), dispatch(getRoutes()), dispatch(getAllRouteMappings())]);
        }
        return Promise.all([
            cache.route_mappings.toArray().then(routesMappings => dispatch(loadRoutesMappings(routesMappings))),
            cache.stops.toArray().then(stops => dispatch(loadStops(stops))),
            cache.routes.toArray().then(routes => dispatch(loadRoutes(routes))),
            cache.routes.toArray().then(routes => dispatch(populateAgencies(routes))),
        ]);
    });
