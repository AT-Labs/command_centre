import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../action-types';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';

export const INIT_STATE = {
    isLoading: false,
    searchTerms: '',
    results: {
        [SEARCH_RESULT_TYPE.ADDRESS.type]: [],
        [SEARCH_RESULT_TYPE.ROUTE.type]: [],
        [SEARCH_RESULT_TYPE.STOP.type]: [],
        [SEARCH_RESULT_TYPE.BUS.type]: [],
        [SEARCH_RESULT_TYPE.TRAIN.type]: [],
        [SEARCH_RESULT_TYPE.FERRY.type]: [],
        [SEARCH_RESULT_TYPE.BLOCK.type]: [],
        [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: [],
        [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: [],
        [SEARCH_RESULT_TYPE.CONTROL_NOTIFICATIONS_ROUTES.type]: [],
        [SEARCH_RESULT_TYPE.STOP_GROUP.type]: [],
        [SEARCH_RESULT_TYPE.STOP_MESSAGE.type]: [],
        [SEARCH_RESULT_TYPE.STOP_IN_GROUP.type]: [],
    },
};

const handleSearchLoading = (state, { payload: { isLoading } }) => ({ ...state, isLoading });

const handleUpdateSearchTerms = (state, { payload: { searchTerms } }) => ({ ...state, searchTerms });

const handleClearSearchResults = state => ({ ...state, results: INIT_STATE.results, searchTerms: '' });

const handleUpdateSearchResults = (state, { payload }) => ({
    ...state,
    results: {
        ...state.results,
        ...payload,
    },
});

export default handleActions({
    [ACTION_TYPE.SEARCH_LOADING]: handleSearchLoading,
    [ACTION_TYPE.UPDATE_ADDRESS_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_STOP_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_ROUTE_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_VEHICLE_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_CONTROL_BLOCK_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_CONTROL_ROUTES_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_CONTROL_NOTIFICATIONS_ROUTES_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_STOP_GROUP_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_STOP_MESSAGE_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_STOP_IN_GROUP_SEARCH_RESULTS]: handleUpdateSearchResults,
    [ACTION_TYPE.UPDATE_SEARCH_TERMS]: handleUpdateSearchTerms,
    [ACTION_TYPE.CLEAR_SEARCH_RESULTS]: handleClearSearchResults,
}, INIT_STATE);
