import { getOccupancyEvents } from '../../../utils/transmitters/event-store-api';
import ACTION_TYPES from '../../action-types';

export const getOccupancy = from => dispatch => getOccupancyEvents(from)
    .then((data) => {
        dispatch({
            type: ACTION_TYPES.SET_OCCUPANCY,
            payload: {
                occupancy: data,
            },
        });
    })
    .catch((err) => { throw (err); });

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

export const updateLoading = isLoading => dispatch => dispatch({
    type: ACTION_TYPES.OCCUPANCY_IS_LOADING,
    payload: {
        isLoading,
    },
});
