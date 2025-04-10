import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box } from '@mui/material';
import { get, map, isEqual } from 'lodash-es';
import moment from 'moment';
import { FaEyeSlash } from 'react-icons/fa';
import { createGridColumns } from './TripDataGridColumns';
import TripView from './TripView';
import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import { isTripCancelPermitted } from '../../../utils/user-permissions';
import { getActiveRoute } from '../../../redux/selectors/control/routes/routes';
import { getActiveRouteVariant } from '../../../redux/selectors/control/routes/routeVariants';
import { getServiceDate } from '../../../redux/selectors/control/serviceDate';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';
import { formatTripDelay, markStopsAsFirstOrLast } from '../../../utils/control/routes';
import { getTripInstanceId, getTripTimeDisplay } from '../../../utils/helpers';
import { mergeDatagridColumns } from '../../../utils/datagrid';
import TripIcon from '../Common/Trip/TripIcon';
import {
    selectSingleTrip, selectTrips, selectAllTrips, filterTripInstances, updateActiveTripInstances,
} from '../../../redux/actions/control/routes/trip-instances';
import { TripSubIconType } from './Types';
import {
    getAllTripInstancesList,
    getSelectedTripsKeys,
    getTotalTripInstancesCount,
    getActiveTripInstance,
} from '../../../redux/selectors/control/routes/trip-instances';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import './TripsDataGrid.scss';
import { getAgencies } from '../../../redux/selectors/control/agencies';
import { getAllStops } from '../../../redux/selectors/static/stops';
import { getAllocations } from '../../../redux/selectors/control/blocks';
import { useAddTrip, useHideTrip, useRoutesTripsFilterCollapse, useRoutesTripsPreferences } from '../../../redux/selectors/appSettings';
import { getUserPreferences } from '../../../utils/transmitters/command-centre-config-api';
import { updateRoutesTripsDatagridConfig, updateDefaultRoutesTripsDatagridConfig } from '../../../redux/actions/datagrid';
import { getRoutesTripsDatagridConfig } from '../../../redux/selectors/datagrid';
import { mergeRouteFilters } from '../../../redux/actions/control/routes/filters';

const isTripCompleted = tripStatus => tripStatus === TRIP_STATUS_TYPES.completed;

export const TripsDataGrid = (props) => {
    const isDateServiceTodayOrTomorrow = () => moment(props.serviceDate).isBetween(moment(), moment().add(1, 'd'), 'd', '[]');
    const [isSavedDatagridConfigReady, setIsSavedDatagridConfigReady] = useState(false);
    const isSavedDatagridConfigReadyRef = useRef(isSavedDatagridConfigReady);
    const getAgenciesRef = useRef(() => props.agencies);

    useEffect(() => {
        getAgenciesRef.current = () => props.agencies;
    }, [props.agencies]);

    const renderIconColumnContent = ({ row, api }) => {
        let iconColor = '';
        let subIcon = null;
        const tripKey = getTripInstanceId(row.tripInstance);
        const isCompleted = isTripCompleted(row.tripInstance.status);
        const isTripSelected = api.getSelectedRows().has(tripKey);
        const isDelayed = formatTripDelay(get(row.tripInstance, 'delay')) > 0;
        const isCancelPermitted = IS_LOGIN_NOT_REQUIRED || isTripCancelPermitted(row.tripInstance);
        const shouldCheckboxBeDisabled = !isCancelPermitted || isCompleted || !isDateServiceTodayOrTomorrow();

        if (row.status === TRIP_STATUS_TYPES.cancelled) {
            iconColor = 'text-danger';
        } else if (row.status === TRIP_STATUS_TYPES.missed) {
            iconColor = 'text-at-magenta';
        } else if (isTripCompleted(row.status)) {
            subIcon = isDelayed ? TripSubIconType.delayed : TripSubIconType.onTime;
        } else if (row.status === TRIP_STATUS_TYPES.inProgress) {
            iconColor = isDelayed ? 'text-at-orange' : 'text-success';
        }

        const shouldCheckboxBeChecked = isTripSelected && !isCompleted;
        const shouldCheckboxBeRemoved = isTripSelected && isCompleted;
        if (shouldCheckboxBeRemoved) api.selectRow(tripKey, false);

        const display = get(row.tripInstance, 'display');

        return (
            <>
                <input
                    type="checkbox"
                    key={ tripKey }
                    name={ tripKey }
                    checked={ shouldCheckboxBeChecked }
                    disabled={ shouldCheckboxBeDisabled }
                    className={ `select-trip-checkbox mr-2 select-trip-checkbox__${row.status.toLowerCase()}` }
                    onChange={ event => props.selectSingleTrip({ [event.target.name]: row.tripInstance }) } />
                <TripIcon
                    type={ row.routeType }
                    className={ iconColor }
                    subIcon={ subIcon } />
                { props.useHideTrip && !display && <FaEyeSlash className="icon-black-invisible" size={ 18 } />}
            </>
        );
    };

    const GRID_COLUMNS = createGridColumns(props, renderIconColumnContent, getAgenciesRef);

    const rows = props.tripInstances.map(tripInstance => ({
        routeVariantId: tripInstance.routeVariantId,
        startTime: getTripTimeDisplay(tripInstance.startTime),
        endTime: getTripTimeDisplay(tripInstance.endTime),
        routeType: tripInstance.routeType,
        status: tripInstance.status,
        routeLongName: tripInstance.routeLongName,
        referenceId: tripInstance.referenceId,
        tripId: tripInstance.tripId,
        ...(props.useHideTrip && { display: tripInstance.display }),
        ...(props.useAddTrip && { source: tripInstance.source }),
        // TODO: Feature flag BEGIN
        type: tripInstance.type,
        disruptionId: tripInstance.disruptionId,
        // TODO: Feature flag END
        tripInstance: {
            ...tripInstance,
            stops: markStopsAsFirstOrLast(tripInstance.stops),
        },
    }));

    const getDetailPanelContent = React.useCallback(
        ({ row }) => (<Box sx={ { padding: '16px 16px 10px 16px', backgroundColor: '#F3F4F5' } }><TripView tripInstance={ row.tripInstance } /></Box>),
        [],
    );

    const getRowClassName = ({ row: { tripInstance } }) => {
        const status = get(tripInstance, 'status', null);
        if (isTripCompleted(status)) {
            return 'text-muted trips-data-grid__row--completed';
        }
        if (status === TRIP_STATUS_TYPES.notStarted) {
            return 'text-muted trips-data-grid__row--not-started';
        }
        if (status === TRIP_STATUS_TYPES.cancelled) {
            return 'trips-data-grid__row--cancelled';
        }
        if (status === TRIP_STATUS_TYPES.missed) {
            return 'trips-data-grid__row--missed';
        }
        if (status === TRIP_STATUS_TYPES.inProgress) {
            return 'trips-data-grid__row--in-progress';
        }
        return '';
    };

    const handleRowExpanded = ids => props.updateActiveTripInstances(ids);

    useEffect(() => {
        isSavedDatagridConfigReadyRef.current = isSavedDatagridConfigReady;
    }, [isSavedDatagridConfigReady]);

    useEffect(() => {
        if (props.useRoutesTripsPreferences) {
            props.updateDefaultRoutesTripsDatagridConfig({ columns: GRID_COLUMNS });
            getUserPreferences()
                .then((preferences) => {
                    const { routesTripsDatagrid, routesFilters } = preferences;
                    if (routesTripsDatagrid) {
                        const { columns, density, ...rest } = routesTripsDatagrid;
                        const updatedColumns = mergeDatagridColumns(GRID_COLUMNS, columns);
                        if (density) props.updateRoutesTripsDatagridConfig({ density }, false);
                        props.updateRoutesTripsDatagridConfig({ ...rest, ...(updatedColumns ? { columns: updatedColumns } : undefined) }, false);
                    }
                    if (routesFilters) {
                        props.mergeRouteFilters({ ...routesFilters }, false, true);
                    }
                    setIsSavedDatagridConfigReady(true);
                });
        }
    }, []);

    const updateDatagridConfigHandler = (config) => {
        if (isEqual(config, { filterModel: { items: [], linkOperator: 'and' } }) && isSavedDatagridConfigReadyRef.current) {
            props.updateRoutesTripsDatagridConfig(config, props.useRoutesTripsPreferences);
        } else {
            props.updateRoutesTripsDatagridConfig(config, props.useRoutesTripsPreferences && isSavedDatagridConfigReadyRef.current);
        }
    };

    return (
        <div className="trips-data-grid flex-grow-1">
            <CustomDataGrid
                columns={ GRID_COLUMNS }
                datagridConfig={ props.routesTripsDatagridConfig }
                dataSource={ rows }
                updateDatagridConfig={ updateDatagridConfigHandler }
                getDetailPanelContent={ getDetailPanelContent }
                getRowId={ row => getTripInstanceId(row.tripInstance) }
                getRowClassName={ getRowClassName }
                calculateDetailPanelHeight={ () => 'auto' }
                gridClassNames={ props.gridClassNames }
                rowCount={ props.rowCount }
                serverSideData
                multipleDetailPanelOpen
                expandedDetailPanels={ map(props.activeTripInstance, getTripInstanceId) }
                onRowExpanded={ ids => handleRowExpanded(ids) }
                checkboxSelection
                selectionModel={ props.selectedTrips }
                onChangeSelectedData={ x => props.selectTrips(x) }
                keepNonExistentRowsSelected
                classes={ {
                    panelContent: 'custom-panel-content',
                    filterFormValueInput: 'custom-filter-value-input',
                } }
            />
        </div>
    );
};

TripsDataGrid.propTypes = {
    routesTripsDatagridConfig: PropTypes.object.isRequired,
    tripInstances: PropTypes.array.isRequired,
    updateRoutesTripsDatagridConfig: PropTypes.func.isRequired,
    selectSingleTrip: PropTypes.func.isRequired,
    selectTrips: PropTypes.func.isRequired,
    selectedTrips: PropTypes.array.isRequired,
    serviceDate: PropTypes.string.isRequired,
    // eslint-disable-next-line
    selectAllTrips: PropTypes.func.isRequired,
    agencies: PropTypes.array.isRequired,
    rowCount: PropTypes.number.isRequired,
    updateActiveTripInstances: PropTypes.func.isRequired,
    activeTripInstance: PropTypes.array,
    // eslint-disable-next-line react/no-unused-prop-types
    allStops: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    vehicleAllocations: PropTypes.object.isRequired,
    useAddTrip: PropTypes.bool.isRequired,
    useHideTrip: PropTypes.bool.isRequired,
    gridClassNames: PropTypes.string,
    // eslint-disable-next-line react/no-unused-prop-types
    useRoutesTripsFilterCollapse: PropTypes.bool.isRequired,
    useRoutesTripsPreferences: PropTypes.bool.isRequired,
    updateDefaultRoutesTripsDatagridConfig: PropTypes.func.isRequired,
    mergeRouteFilters: PropTypes.func.isRequired,
};

TripsDataGrid.defaultProps = {
    activeTripInstance: [],
    gridClassNames: 'grid-height',
};

export default connect(
    state => ({
        routesTripsDatagridConfig: getRoutesTripsDatagridConfig(state),
        tripInstances: getAllTripInstancesList(state),
        activeRoute: getActiveRoute(state),
        activeRouteVariant: getActiveRouteVariant(state),
        selectedTrips: getSelectedTripsKeys(state),
        serviceDate: getServiceDate(state),
        agencies: getAgencies(state),
        rowCount: getTotalTripInstancesCount(state),
        activeTripInstance: getActiveTripInstance(state),
        allStops: getAllStops(state),
        vehicleAllocations: getAllocations(state),
        useAddTrip: useAddTrip(state),
        useHideTrip: useHideTrip(state),
        useRoutesTripsFilterCollapse: useRoutesTripsFilterCollapse(state),
        useRoutesTripsPreferences: useRoutesTripsPreferences(state),
    }),
    {
        selectSingleTrip,
        selectTrips,
        selectAllTrips,
        filterTripInstances,
        updateActiveTripInstances,
        updateRoutesTripsDatagridConfig,
        updateDefaultRoutesTripsDatagridConfig,
        mergeRouteFilters,
    },
)(TripsDataGrid);
