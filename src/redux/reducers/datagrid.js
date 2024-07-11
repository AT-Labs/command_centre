import moment from 'moment';

import { handleActions } from 'redux-actions';
import ACTION_TYPE from '../action-types';
import { getStartTimeFromFilterInitialTime } from '../../utils/control/routes';

export const DEFAULT_ROUTES_TRIPS_DATAGRID_CONFIG = {
    columns: [],
    page: 0,
    pageSize: 100,
    sortModel: [
        {
            field: 'startTime',
            sort: 'asc',
        },
    ],
    density: 'standard',
    routeSelection: '',
    filterModel: {
        items: [
            {
                id: 'startTimeFilter',
                columnField: 'startTime',
                operatorValue: 'onOrAfter',
                value: getStartTimeFromFilterInitialTime(moment()),
            },
        ],
        linkOperator: 'and',
    },
    pinnedColumns: { right: ['__detail_panel_toggle__'] },
};

export const INIT_STATE = {
    routesTripsDatagridConfig: {
        ...DEFAULT_ROUTES_TRIPS_DATAGRID_CONFIG,
    },
    defaultRoutesTripsDatagridConfig: {},
};

const handleRoutesTripsDatagridConfig = (state, action) => ({
    ...state,
    routesTripsDatagridConfig: {
        ...state.routesTripsDatagridConfig,
        ...action.payload,
    },
});

const handleDefaultRoutesTripsDatagridConfig = (state, action) => ({
    ...state,
    defaultRoutesTripsDatagridConfig: { ...action.payload },
});

export default handleActions({
    [ACTION_TYPE.UPDATE_ROUTES_TRIPS_DATAGRID_CONFIG]: handleRoutesTripsDatagridConfig,
    [ACTION_TYPE.UPDATE_DEFAULT_ROUTES_TRIPS_DATAGRID_CONFIG]: handleDefaultRoutesTripsDatagridConfig,
}, INIT_STATE);
