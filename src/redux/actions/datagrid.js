import { debounce } from 'lodash-es';
import ACTION_TYPE from '../action-types';
import { updateUserPreferences } from '../../utils/transmitters/command-centre-config-api';
import { filterTripInstances } from './control/routes/trip-instances';

const updateUserPreferencesQueryDebounced = debounce(q => updateUserPreferences(q), 700);

export const updateRoutesTripsDatagridConfig = (datagridConfig, saveConfig) => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_ROUTES_TRIPS_DATAGRID_CONFIG,
        payload: datagridConfig,
    });
    dispatch(filterTripInstances());
    if (saveConfig) {
        const { columns, ...rest } = datagridConfig;
        const newColumns = columns?.map(({ align, field, hide, width }) => ({ align, field, hide, width }));
        updateUserPreferencesQueryDebounced({ routesTripsDatagrid: { ...rest, columns: newColumns } });
    }
};

export const updateDefaultRoutesTripsDatagridConfig = datagridConfig => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_DEFAULT_ROUTES_TRIPS_DATAGRID_CONFIG,
        payload: datagridConfig,
    });
};
