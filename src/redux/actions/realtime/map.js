import ACTION_TYPE from '../../action-types';

export const recenterMap = shouldMapBeRecentered => ({
    type: ACTION_TYPE.RECENTER_MAP,
    payload: {
        shouldMapBeRecentered,
    },
});
