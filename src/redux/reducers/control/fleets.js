import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    fleets: [],
    fleetsDatagridConfig: {
        columns: [],
        page: 0,
        pageSize: 15,
        sortModel: [
            { field: 'type', sort: 'asc' },
        ],
        density: 'standard',
        routeSelection: '',
        filterModel: { items: [], linkOperator: 'and' },
        pinnedColumns: { },
    },
};

const handleFleetsUpdate = (state, { payload: { fleets } }) => ({ ...state, fleets });

const handleFleetsDatagridConfig = (state, action) => ({ ...state, fleetsDatagridConfig: { ...state.fleetsDatagridConfig, ...action.payload } });

export default handleActions({
    [ACTION_TYPE.FETCH_CONTROL_FLEETS]: handleFleetsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_FLEETS_DATAGRID_CONFIG]: handleFleetsDatagridConfig,
}, INIT_STATE);
