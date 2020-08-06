/* eslint-disable camelcase */
import { getTripUpdateRealTimeSnapshot } from '../../../../utils/transmitters/gtfs-realtime';
import { updateDataLoading } from '../../activity';
import ACTION_TYPE from '../../../action-types';

export const getTripUpdateSnapshot = tripId => async (dispatch) => {
    dispatch(updateDataLoading(true));

    const tripUpdates = await getTripUpdateRealTimeSnapshot(tripId);
    const { tripUpdate } = tripUpdates[0] ? tripUpdates[0] : { tripUpdate: null };

    dispatch({
        type: ACTION_TYPE.FETCH_TRIP_UPDATE_SNAPSHOT,
        payload: { tripUpdate },
    });
    dispatch(updateDataLoading(false));
};
