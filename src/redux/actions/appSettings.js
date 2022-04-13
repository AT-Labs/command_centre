import ACTION_TYPE from '../action-types';
import { jsonResponseHandling } from '../../utils/fetch';

const fetchAppSettings = settings => ({
    type: ACTION_TYPE.UPDATE_APP_SETTINGS,
    payload: settings,
});

export const getApplicationSettings = () => dispatch => fetch('/app.config.json', { cache: 'no-cache', redirect: 'follow' })
    .then(response => jsonResponseHandling(response))
    .then(settings => dispatch(fetchAppSettings(settings)));
