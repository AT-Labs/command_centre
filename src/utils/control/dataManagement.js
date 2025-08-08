export const getStopGroupName = (stopGroups, id) => {
    if (!stopGroups || !id) {
        return `Missing Group Name - ${id}`;
    }
    
    const stopGroup = stopGroups[id];

    return stopGroup ? stopGroup.title : `Missing Group Name - ${id}`;
};
