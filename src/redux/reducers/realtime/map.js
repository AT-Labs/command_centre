import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';
import { MAP_DATA } from '../../../types/map-types';

export const INIT_STATE = {
    hoveredEntityKey: '',
    mapCenter: MAP_DATA.centerLocation,
    mapZoomLevel: MAP_DATA.zoomLevel.initial,
};

const handleHoveredEntityKey = (state, { payload: { hoveredEntityKey } }) => ({ ...state, hoveredEntityKey });
const handleUpdateMapDetails = (state, { payload: { mapCenter, mapZoomLevel } }) => ({ ...state, mapCenter, mapZoomLevel });

export default handleActions({
    [ACTION_TYPE.UPDATE_HOVERED_ENTITY_KEY]: handleHoveredEntityKey,
    [ACTION_TYPE.UPDATE_MAP_DETAILS]: handleUpdateMapDetails,
}, INIT_STATE);
