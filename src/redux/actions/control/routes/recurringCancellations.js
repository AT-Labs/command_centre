import ERROR_TYPE from '../../../../types/error-types';
import * as TRIP_MGT_API from '../../../../utils/transmitters/trip-mgt-api';
import ACTION_TYPE from '../../../action-types';
import { setBannerError } from '../../activity';

const loadRecurringCancellations = recurringCancellations => ({
    type: ACTION_TYPE.FETCH_RECURRING_CANCELLATIONS,
    payload: {
        recurringCancellations,
    },
});

const loadRecurringCancellationPermisssions = permissions => ({
    type: ACTION_TYPE.FETCH_RECURRING_CANCELLATIONS_PERMISSIONS,
    payload: {
        permissions,
    },
});

export const retrieveRecurringCancellations = () => (dispatch) => {
    TRIP_MGT_API.getRecurringCancellations()
        .then((response) => {
            const { recurringCancellations, _links: { permissions } } = response;
            dispatch(loadRecurringCancellations(recurringCancellations));
            dispatch(loadRecurringCancellationPermisssions(permissions));
        })
        .catch(() => {
            if (ERROR_TYPE.fetchRecurringCancellations) {
                const errorMessage = ERROR_TYPE.fetchRecurringCancellations;
                dispatch(setBannerError(errorMessage));
            }
        });
};

export const updateRecurringCancellationsDatagridConfig = model => ({
    type: ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_DATAGRID_CONFIG,
    payload: model,
});
