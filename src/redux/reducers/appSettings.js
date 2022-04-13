import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../action-types';

export const INIT_STATE = {};

const handleAppSettingUpdate = (state, { payload: appSettings }) => ({
    ...state,
    ...appSettings,
});

export default handleActions({
    [ACTION_TYPE.UPDATE_APP_SETTINGS]: handleAppSettingUpdate,
}, INIT_STATE);
