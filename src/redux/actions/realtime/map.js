import ACTION_TYPE from '../../action-types';

export const updateHoveredEntityKey = hoveredEntityKey => ({
    type: ACTION_TYPE.UPDATE_HOVERED_ENTITY_KEY,
    payload: {
        hoveredEntityKey,
    },
});

export const updateMapDetails = (mapCenter, mapZoomLevel) => ({
    type: ACTION_TYPE.UPDATE_MAP_DETAILS,
    payload: {
        mapCenter,
        mapZoomLevel,
    },
});
