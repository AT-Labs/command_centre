import { sortBy } from 'lodash-es';
import ERROR_TYPE from '../../../types/error-types';
import * as TRIP_MGT_API from '../../../utils/transmitters/trip-mgt-api';
import ACTION_TYPE from '../../action-types';
import { setBannerError } from '../activity';

const loadAgencies = agencies => ({
    type: ACTION_TYPE.FETCH_CONTROL_AGENCIES,
    payload: {
        agencies,
    },
});

export const retrieveAgencies = () => (dispatch) => {
    TRIP_MGT_API.getAgencies()
        .then((agencies) => {
            const sortedAgencies = sortBy(agencies, 'agencyName');
            dispatch(loadAgencies(sortedAgencies));
        })
        .catch(() => {
            if (ERROR_TYPE.fetchAgenciesEnabled) {
                dispatch(setBannerError(ERROR_TYPE.fetchAgencies));
            }
        });
};
