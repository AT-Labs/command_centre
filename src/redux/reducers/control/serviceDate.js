import moment from 'moment';
import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    date: moment().format(),
};

const handleUpdateServiceDate = (state, { payload }) => ({ ...state, ...payload });

export default handleActions({
    [ACTION_TYPE.UPDATE_SERVICE_DATE]: handleUpdateServiceDate,
}, INIT_STATE);
