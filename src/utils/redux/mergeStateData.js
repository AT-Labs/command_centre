export const mergeStateData = (state, dataKey, newData, loadingKey) => {
    const mergedData = { ...state[dataKey], ...newData };
    return { ...state, [dataKey]: mergedData, [loadingKey]: false };
};
