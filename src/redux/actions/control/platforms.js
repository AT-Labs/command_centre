import { keyBy } from 'lodash-es';

import ACTION_TYPE from '../../action-types';
import ERROR_TYPE from '../../../types/error-types';
import * as TRIP_MGT_API from '../../../utils/transmitters/trip-mgt-api';
import { setBannerError } from '../activity';

const updatePlatforms = platforms => ({
    type: ACTION_TYPE.UPDATE_PLATFORMS,
    payload: {
        platforms: keyBy(platforms, 'stopId'),
    },
});

export const fetchPlatforms = () => (dispatch) => {
    TRIP_MGT_API.getPlatforms()
        .then((platforms) => {
            dispatch(updatePlatforms(platforms));
        }).catch(() => {
            if (ERROR_TYPE.fetchPlatforms) {
                dispatch(setBannerError(ERROR_TYPE.fetchPlatforms));
            }
        });
};
