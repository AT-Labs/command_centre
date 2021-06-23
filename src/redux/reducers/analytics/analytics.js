import { handleActions } from 'redux-actions';
import ACTION_TYPES from '../../action-types';
import { occupancyOptions } from '../../../constants/Analytics';

export const INITIAL_STATE = {
    routeIdMappings: [],
    occupancy: [],
    occupancyFilters: occupancyOptions,
    agencyFilter: {},
    routesFilters: [],
    isLoading: true,
};

const handleUpdateIdMappings = (state, { payload: { routeIdMappings } }) => ({ ...state, routeIdMappings });
const handleUpdateOccupancy = (state, { payload: { occupancy } }) => ({ ...state, occupancy });
const handleUpdateOccupancyFilters = (state, { payload: { occupancyFilters } }) => ({ ...state, occupancyFilters });
const handleUpdateAgencyFilters = (state, { payload: { agencyFilter } }) => ({ ...state, agencyFilter });
const handleUpdateRoutesFilters = (state, { payload: { routesFilters } }) => ({ ...state, routesFilters });
const handleUpdateIsLoading = (state, { payload: { isLoading } }) => ({ ...state, isLoading });

export default handleActions({
    [ACTION_TYPES.SET_ID_MAPPINGS]: handleUpdateIdMappings,
    [ACTION_TYPES.SET_OCCUPANCY]: handleUpdateOccupancy,
    [ACTION_TYPES.SET_OCCUPANCY_FILTERS]: handleUpdateOccupancyFilters,
    [ACTION_TYPES.SET_OCCUPANCY_AGENCY_FILTERS]: handleUpdateAgencyFilters,
    [ACTION_TYPES.SET_OCCUPANCY_ROUTES_FILTERS]: handleUpdateRoutesFilters,
    [ACTION_TYPES.OCCUPANCY_IS_LOADING]: handleUpdateIsLoading,
}, INITIAL_STATE);
