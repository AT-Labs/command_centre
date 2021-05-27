import ACTION_TYPE from '../../action-types';

export const recenterMap = shouldMapBeRecentered => ({
    type: ACTION_TYPE.RECENTER_MAP,
    payload: {
        shouldMapBeRecentered,
    },
});

export const updateHoveredEntityKey = hoveredEntityKey => ({
    type: ACTION_TYPE.UPDATE_HOVERED_ENTITY_KEY,
    payload: {
        hoveredEntityKey,
    },
});
