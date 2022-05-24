import ACTION_TYPE from '../../action-types';
import ERROR_TYPE from '../../../types/error-types';
import * as fleetsApi from '../../../utils/transmitters/fleets-api';
import { setBannerError } from '../activity';

const loadFleets = fleets => ({
    type: ACTION_TYPE.FETCH_CONTROL_FLEETS,
    payload: {
        fleets,
    },
});

export const getFleets = () => dispatch => fleetsApi.getFleets()
    .then((fleets) => {
        if (fleets.length > 0) {
            dispatch(loadFleets(fleets));
        }
    })
    .catch(() => {
        if (ERROR_TYPE.fetchStopMessages) {
            dispatch(setBannerError(ERROR_TYPE.fetchStopMessages));
        }
    });

export const updateFleetsDatagridConfig = model => ({
    type: ACTION_TYPE.UPDATE_CONTROL_FLEETS_DATAGRID_CONFIG,
    payload: model,
});
