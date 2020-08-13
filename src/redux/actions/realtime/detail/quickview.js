/* eslint-disable camelcase */
import { getTripUpdateRealTimeSnapshot } from '../../../../utils/transmitters/gtfs-realtime';
import ACTION_TYPE from '../../../action-types';

export const getTripUpdateSnapshot = tripId => async (dispatch) => {
    const tripUpdates = await getTripUpdateRealTimeSnapshot(tripId);
    const { tripUpdate } = tripUpdates[0] ? tripUpdates[0] : { tripUpdate: null };

    dispatch({
        type: ACTION_TYPE.FETCH_TRIP_UPDATE_SNAPSHOT,
        payload: { tripUpdate },
    });
};
