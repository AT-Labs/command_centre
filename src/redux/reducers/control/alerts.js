import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    alerts: [],
    alertsDatagridConfig: {
        columns: [],
        page: 0,
        pageSize: 15,
        sortModel: [
            { field: 'date_created', sort: 'desc' },
            { field: 'status', sort: 'asc' },
        ],
        density: 'standard',
        routeSelection: '',
        filterModel: { items: [], linkOperator: 'and' },
        pinnedColumns: { right: ['action'] },
    },
};

const handleAlertsUpdate = (state, { payload: { alerts } }) => ({ ...state, alerts });

const handleAlertsDatagridConfig = (state, action) => ({ ...state, alertsDatagridConfig: { ...state.alertsDatagridConfig, ...action.payload } });

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_ALERTS]: handleAlertsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_ALERTS_DATAGRID_CONFIG]: handleAlertsDatagridConfig,
}, INIT_STATE);
