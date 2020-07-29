import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    routeType: null,
    routeVariantId: null,
    tripId: null,
};

const handleUpdateTripCrossLink = (state, { payload }) => ({ ...state, ...payload });
const handleClearTripCrossLink = () => ({ ...INIT_STATE });

export default handleActions({
    [ACTION_TYPE.UPDATE_TRIP_CROSS_LINK]: handleUpdateTripCrossLink,
    [ACTION_TYPE.CLEAR_TRIP_CROSS_LINK]: handleClearTripCrossLink,
    [ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE]: handleClearTripCrossLink,
}, INIT_STATE);
