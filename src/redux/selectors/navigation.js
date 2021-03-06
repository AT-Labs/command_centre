import _ from 'lodash-es';
import { createSelector } from 'reselect';
import { getSearchTerms, isSearchBarFocus } from './search';
import VIEW_TYPE from '../../types/view-types';

export const getNavigationState = state => _.result(state, 'navigation');
export const getActiveMainView = createSelector(getNavigationState, navigationState => _.result(navigationState, 'activeMainView'));
export const getActiveSecondaryPanelView = createSelector(getNavigationState,
    navigationState => _.result(navigationState, 'activeSecondaryPanelView'));
export const getActiveRealTimeDetailView = createSelector(getNavigationState,
    navigationState => _.result(navigationState, 'activeRealTimeDetailView'));
export const getActiveControlDetailView = createSelector(getNavigationState,
    navigationState => _.result(navigationState, 'activeControlDetailView'));
export const getRealTimeSidePanelIsOpen = createSelector(getNavigationState, navigationState => _.result(navigationState, 'isSidePanelOpen'));
export const getRealTimeSidePanelIsActive = createSelector(
    getActiveRealTimeDetailView,
    isSearchBarFocus,
    getSearchTerms,
    (
        activeRealTimeDetailView,
        searchBarFocus, searchTerms,
    ) => !!(activeRealTimeDetailView !== VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT || searchBarFocus || searchTerms),
);

export const getShouldShowSearchBox = createSelector(
    getActiveRealTimeDetailView,
    activeRealTimeDetailView => [VIEW_TYPE.REAL_TIME_DETAIL.LIST, VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT, VIEW_TYPE.REAL_TIME_DETAIL.ROUTE].includes(activeRealTimeDetailView),
);
