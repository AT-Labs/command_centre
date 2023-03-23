import cache, { isCacheValid } from '../../../utils/cache';
import { getRoutes, loadRoutes } from './routes';
import { populateAgencies } from './agencies';

export const setCache = () => dispatch => isCacheValid()
    .then(({ isValid }) => {
        if (!isValid) {
            return Promise.all([dispatch(getRoutes())]);
        }
        return Promise.all([
            cache.routes.toArray().then(routes => dispatch(loadRoutes(routes))),
            cache.routes.toArray().then(routes => dispatch(populateAgencies(routes))),
        ]);
    });
