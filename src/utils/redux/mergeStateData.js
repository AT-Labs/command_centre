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
