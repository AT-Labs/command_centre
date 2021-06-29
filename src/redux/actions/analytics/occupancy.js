import { keyBy, get } from 'lodash-es';
import { fetchOccupancyEvents } from '../../../utils/transmitters/event-store-api';
import { getAllRoutes } from '../../selectors/static/routes';
import { getAllRoutesMappings } from '../../selectors/static/routesMapping';
import ACTION_TYPES from '../../action-types';

export const updateLoading = isLoading => dispatch => dispatch({
    type: ACTION_TYPES.OCCUPANCY_IS_LOADING,
    payload: {
        isLoading,
    },
});

export const getOccupancy = (from = '') => async (dispatch, getState) => {
    const state = getState();
    await Promise.all([
        fetchOccupancyEvents(from),
        getAllRoutes(state),
        getAllRoutesMappings(state),
    ])
        .then(([occupancyEvents, routes, routesMappings]) => {
            const occupancyData = occupancyEvents;
            const allRoutes = keyBy(routes, 'route_id');
            const allRouteMappings = keyBy(routesMappings, 'oldId');
            return occupancyData.map(occupancy => ({ ...occupancy, ...allRoutes[get(allRouteMappings[occupancy.route_id], 'newId', '')] }));
        })
        .then((data) => {
            dispatch({
                type: ACTION_TYPES.SET_OCCUPANCY,
                payload: {
                    occupancy: data,
                },
            });
        })
        .catch((err) => { throw (err); });
    return dispatch(updateLoading(false));
};

export const updateOccupancyFilters = occupancyFilters => dispatch => dispatch({
    type: ACTION_TYPES.SET_OCCUPANCY_FILTERS,
    payload: {
        occupancyFilters,
    },
});

export const updateAgencyFilters = agencyFilter => dispatch => dispatch({
    type: ACTION_TYPES.SET_OCCUPANCY_AGENCY_FILTERS,
    payload: {
        agencyFilter,
    },
});

export const updateRoutesFilters = routesFilters => dispatch => dispatch({
    type: ACTION_TYPES.SET_OCCUPANCY_ROUTES_FILTERS,
    payload: {
        routesFilters,
    },
});
