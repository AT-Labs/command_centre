export const mergeStateData = (state, dataKey, newData, loadingKey) => {
    const mergedData = { ...state[dataKey], ...newData };
    return { ...state, [dataKey]: mergedData, [loadingKey]: false };
};

export const updateStateWithMergedData = (dispatch, getState, statePath, dataKey, newData, updateAction) => {
    const currentState = getState();
    const stateObject = statePath.split('.').reduce((obj, key) => obj[key], currentState);
    const allData = { ...stateObject[dataKey], ...newData };
    dispatch(updateAction(allData, false));
};

export const createUpdateHandler = (dataKey, loadingKey) => (state, { payload }) => {
    const data = payload[dataKey];
    return mergeStateData(state, dataKey, data, loadingKey);
};

export const createStopsAndRoutesHandlers = () => ({
    handleUpdateStopsByRoute: createUpdateHandler('stopsByRoute', 'isLoadingStopsByRoute'),
    handleUpdateRoutesByStop: createUpdateHandler('routesByStop', 'isLoadingRoutesByStop'),
});

export const { handleUpdateStopsByRoute, handleUpdateRoutesByStop } = createStopsAndRoutesHandlers();

function createStopsByRouteUpdater(statePath) {
    return (dispatch, getState, stopsByRoute, updateStopsByRoute) => updateStateWithMergedData(dispatch, getState, statePath, 'stopsByRoute', stopsByRoute, updateStopsByRoute);
}

function createRoutesByStopUpdater(statePath) {
    return (dispatch, getState, routesByStop, updateRoutesByStop) => updateStateWithMergedData(dispatch, getState, statePath, 'routesByStop', routesByStop, updateRoutesByStop);
}

export const createStateUpdater = statePath => ({
    updateStopsByRoute: createStopsByRouteUpdater(statePath),
    updateRoutesByStop: createRoutesByStopUpdater(statePath),
});

export const incidentsStateUpdater = createStateUpdater('control.incidents');
