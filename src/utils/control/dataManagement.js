export const getStopGroupName = (stopGroups, id) => {
    const stopGroup = stopGroups[id];

    return stopGroup ? stopGroup.title : `Missing Group Name - ${id}`;
};
