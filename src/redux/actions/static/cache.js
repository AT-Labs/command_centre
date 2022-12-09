import cache, { isCacheValid } from '../../../utils/cache';
import { getStops, loadStops } from './stops';
import { getRoutes, loadRoutes } from './routes';
import { populateAgencies } from './agencies';

export const setCache = () => dispatch => isCacheValid()
    .then(({ isValid }) => {
        if (!isValid) {
            return Promise.all([dispatch(getStops()), dispatch(getRoutes())]);
        }
        return Promise.all([
            cache.stops.toArray().then(stops => dispatch(loadStops(stops))),
            cache.routes.toArray().then(routes => dispatch(loadRoutes(routes))),
            cache.routes.toArray().then(routes => dispatch(populateAgencies(routes))),
        ]);
    });
