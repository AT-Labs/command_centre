import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    shouldMapBeRecentered: false,
    hoveredEntityKey: '',
};

const handleResetMap = (state, { payload: { shouldMapBeRecentered } }) => ({ ...state, shouldMapBeRecentered });
const handleHoveredEntityKey = (state, { payload: { hoveredEntityKey } }) => ({ ...state, hoveredEntityKey });

export default handleActions({
    [ACTION_TYPE.RECENTER_MAP]: handleResetMap,
    [ACTION_TYPE.UPDATE_HOVERED_ENTITY_KEY]: handleHoveredEntityKey,
}, INIT_STATE);
