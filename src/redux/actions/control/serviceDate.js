import ACTION_TYPE from '../../action-types';
import { getStops } from '../static/stops';
import { clearActiveRoute } from './routes/routes';
import { clearActiveTripInstanceId } from './routes/trip-instances';

export const updateServiceDate = date => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_SERVICE_DATE,
        payload: { date },
    });
    dispatch(clearActiveRoute());
    dispatch(clearActiveTripInstanceId());
    dispatch(getStops(date));
};
