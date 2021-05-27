import _ from 'lodash-es';
import { createSelector } from 'reselect';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';

export const getSearchState = state => _.result(state, 'search');
export const isSearchLoading = createSelector(getSearchState, searchState => _.result(searchState, 'isLoading'));
export const getSearchTerms = createSelector(getSearchState, searchState => _.result(searchState, 'searchTerms'));
export const getSearchResults = createSelector(getSearchState, searchState => _.result(searchState, 'results'));
export const getAddressSearchResults = createSelector(getSearchResults, searchResults => _.result(searchResults, SEARCH_RESULT_TYPE.ADDRESS.type));
export const getStopSearchResults = createSelector(getSearchResults, searchResults => _.result(searchResults, SEARCH_RESULT_TYPE.STOP.type));
export const getRouteSearchResults = createSelector(getSearchResults, searchResults => _.result(searchResults, SEARCH_RESULT_TYPE.ROUTE.type));
export const getVehicleSearchResults = createSelector(getSearchResults, searchResults => _.result(searchResults, SEARCH_RESULT_TYPE.VEHICLE.type));
export const isSearchBarFocus = createSelector(getSearchState, searchState => _.result(searchState, 'isFocus'));
