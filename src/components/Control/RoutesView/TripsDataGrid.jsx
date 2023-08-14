import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box } from '@mui/material';
import { getGridSingleSelectOperators, getGridStringOperators, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro';
import { lowerCase, get, words, upperFirst, map } from 'lodash-es';
import moment from 'moment';

import TripView from './TripView';
import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import { isTripCancelPermitted } from '../../../utils/user-permissions';
import { getRouteFilters } from '../../../redux/selectors/control/routes/filters';
import { getActiveRoute } from '../../../redux/selectors/control/routes/routes';
import { getActiveRouteVariant } from '../../../redux/selectors/control/routes/routeVariants';
import { getServiceDate } from '../../../redux/selectors/control/serviceDate';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';
import { formatTripDelay } from '../../../utils/control/routes';
import { getTripInstanceId, getTripTimeDisplay, getTimePickerOptions } from '../../../utils/helpers';
import TripIcon from '../Common/Trip/TripIcon';
import TripDelay from '../Common/Trip/TripDelay';
import {
    selectSingleTrip, selectTrips, selectAllTrips, updateTripsDatagridConfig, filterTripInstances, updateActiveTripInstances,
} from '../../../redux/actions/control/routes/trip-instances';
import { TripSubIconType } from './Types';
import {
    getAllTripInstancesList,
    getSelectedTripsKeys,
    getTripsDatagridConfig,
    getTotalTripInstancesCount,
    getActiveTripInstance,
} from '../../../redux/selectors/control/routes/trip-instances';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import './TripsDataGrid.scss';
import { getAgencies } from '../../../redux/selectors/control/agencies';
import { CustomSelectionHeader } from './CustomSelectionHeader';
import { getAllStops } from '../../../redux/selectors/static/stops';
import { StopSearchDataGridOperators } from '../Common/DataGrid/OmniSearchDataGridOperator';
import { getAllocations, getVehicleAllocationLabelByTrip } from '../../../redux/selectors/control/blocks';

const isTripCompleted = tripStatus => tripStatus === TRIP_STATUS_TYPES.completed;

const formatStatusColumn = (row) => {
    const lowerCaseStatus = lowerCase(row.status);
    return row.status === TRIP_STATUS_TYPES.cancelled ? <span className="text-danger">{lowerCaseStatus}</span> : lowerCaseStatus;
};

const formatDelayColumn = (row) => {
    const trip = row.tripInstance || row;
    return <TripDelay delayInSeconds={ get(trip, 'delay', 0) } noDelayText="-" status={ get(trip, 'status', '') } />;
};

const isAnyOfStringOperators = getGridStringOperators(true).filter(
    operator => operator.value === 'isAnyOf',
);

const dateOperators = [
    { label: 'is on or after', value: 'onOrAfter' },
    { label: 'is on or before', value: 'onOrBefore' },
].map((filterOperator) => {
    const selectOperator = getGridSingleSelectOperators(true).find(
        operator => operator.value === 'is',
    );
    return {
        ...selectOperator,
        ...filterOperator,
    };
});

export const TripsDataGrid = (props) => {
    const isDateServiceTodayOrTomorrow = () => moment(props.serviceDate).isBetween(moment(), moment().add(1, 'd'), 'd', '[]');

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
            </>
        );
    };

    const GRID_COLUMNS = [
        {
            ...GRID_CHECKBOX_SELECTION_COL_DEF,
            type: 'string',
            width: 80,
            renderHeader: () => (
                <CustomSelectionHeader
                    serviceDate={ props.serviceDate }
                    selectAllTrips={ props.selectAllTrips }
                />
            ),
            renderCell: params => renderIconColumnContent(params),
        },
        {
            field: 'routeVariantId',
            headerName: 'Route Variant',
            width: 150,
            type: 'string',
            filterable: false,
        },
        {
            field: 'vehicleLabel',
            headerName: 'Vehicle Label',
            width: 150,
            valueGetter: ({ row }) => getVehicleAllocationLabelByTrip(row.tripInstance, props.vehicleAllocations) || get(row.tripInstance, 'vehicleLabel'),
            filterable: false,
        },
        {
            field: 'agencyId',
            headerName: 'Operator',
            width: 250,
            type: 'singleSelect',
            valueGetter: ({ row }) => {
                const agencyName = props.agencies.find(agency => agency.agencyId === get(row.tripInstance, 'agencyId'))?.agencyName;
                return agencyName || '';
            },
            valueOptions: props.agencies.map(agency => ({ value: agency.agencyId, label: agency.agencyName })),
            filterOperators: getGridSingleSelectOperators(true).filter(
                operator => operator.value === 'is',
            ),
            hide: true,
            sortable: false,
            filterable: false,
        },
        {
            field: 'depotIds',
            headerName: 'Depot',
            width: 250,
            valueGetter: ({ row }) => {
                const depots = props.agencies.map(agency => agency.depots).flat();
                const depotName = depots.find(depot => depot.depotId === get(row.tripInstance, 'depotId'))?.depotName;
                return depotName || '';
            },
            valueOptions: props.agencies.map(agency => agency.depots).flat().map(depot => ({ value: depot.depotId, label: depot.depotName })),
            filterOperators: getGridSingleSelectOperators(true).filter(
                operator => operator.value === 'isAnyOf',
            ),
            hide: true,
            sortable: false,
            filterable: false,
        },
        {
            field: 'tripId',
            headerName: 'Trip ID',
            width: 250,
            type: 'string',
            filterOperators: isAnyOfStringOperators,
            hide: true,
        },
        {
            field: 'referenceId',
            headerName: 'Ref #',
            width: 100,
            type: 'string',
            filterOperators: isAnyOfStringOperators,
        },
        {
            field: 'blockId',
            headerName: 'Block',
            width: 100,
            valueGetter: ({ row }) => get(row.tripInstance, 'blockId'),
            hide: true,
            filterable: false,
            sortable: false,
        },
        {
            field: 'startTime',
            headerName: 'Start Time',
            width: 150,
            type: 'singleSelect',
            valueOptions: getTimePickerOptions(28),
            filterOperators: dateOperators,
        },
        {
            field: 'endTime',
            headerName: 'End Time',
            width: 150,
            type: 'singleSelect',
            valueOptions: getTimePickerOptions(28),
            filterOperators: dateOperators,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 100,
            type: 'singleSelect',
            valueOptions: Object.values(TRIP_STATUS_TYPES).map(value => ({
                value,
                label: words(lowerCase(value)).map(word => upperFirst(word)).join(' '),
            })),
            filterOperators: getGridSingleSelectOperators(true).filter(
                operator => operator.value === 'is',
            ),
            renderCell: params => formatStatusColumn(params.row),
            filterable: false,
        },
        {
            field: 'delay',
            headerName: 'Delay / Early',
            width: 200,
            renderCell: params => formatDelayColumn(params.row),
            filterable: false,
        },
        {
            field: 'routeShortName',
            headerName: 'Route Variant Name',
            width: 500,
            valueGetter: ({ row }) => {
                const routeLongName = get(row.tripInstance, 'routeLongName');
                const routeShortName = get(row.tripInstance, 'routeShortName');
                return `${routeShortName} ${routeLongName}`;
            },
            filterable: false,
        },
        {
            field: 'trackingStatus',
            headerName: 'Tracking Status',
            width: 150,
            type: 'singleSelect',
            valueOptions: ['TRACKING', 'STOPPED', 'LOST_TRACKING', 'NOT_TRACKING'].map(value => ({
                value,
                label: words(lowerCase(value)).map(word => upperFirst(word)).join(' '),
            })),
            filterOperators: getGridSingleSelectOperators(true).filter(
                operator => operator.value === 'isAnyOf',
            ),
            valueGetter: ({ row }) => get(row.tripInstance, 'trackingStatus'),
            hide: true,
        },
        {
            field: 'firstStopCode',
            headerName: 'First Stop',
            width: 200,
            type: 'string',
            filterOperators: StopSearchDataGridOperators,
            valueGetter: ({ row }) => {
                const stop = props.allStops[get(row.tripInstance, 'firstStopCode')];
                return stop?.stop_name || '';
            },
            hide: true,
        },
        {
            field: 'lastStopCode',
            headerName: 'Last Stop',
            width: 200,
            type: 'string',
            filterOperators: StopSearchDataGridOperators,
            valueGetter: ({ row }) => {
                const stop = props.allStops[get(row.tripInstance, 'lastStopCode')];
                return stop?.stop_name || '';
            },
            hide: true,
        },
    ];

    const rows = props.tripInstances.map(tripInstance => ({
        routeVariantId: tripInstance.routeVariantId,
        startTime: getTripTimeDisplay(tripInstance.startTime),
        endTime: getTripTimeDisplay(tripInstance.endTime),
        routeType: tripInstance.routeType,
        status: tripInstance.status,
        routeLongName: tripInstance.routeLongName,
        referenceId: tripInstance.referenceId,
        tripId: tripInstance.tripId,
        tripInstance,
    }));

    const getDetailPanelContent = React.useCallback(
        ({ row }) => (<Box sx={ { padding: '16px 16px 10px 16px', backgroundColor: '#F3F4F5' } }><TripView tripInstance={ row.tripInstance } /></Box>),
        [],
    );

    const getRowClassName = ({ row: { tripInstance } }) => {
        const status = get(tripInstance, 'status', null);
        if (isTripCompleted(status) || status === TRIP_STATUS_TYPES.notStarted) {
            return 'bg-at-ocean-tint-5 text-muted';
        }
        if (status === TRIP_STATUS_TYPES.cancelled) {
            return 'bg-at-ocean-tint-5';
        }
        if (status === TRIP_STATUS_TYPES.missed) {
            return 'bg-at-magenta-tint-5';
        }
        return '';
    };

    const handleRowExpanded = ids => props.updateActiveTripInstances(ids);

    return (
        <>
            <div className="trips-data-grid flex-grow-1">
                <CustomDataGrid
                    columns={ GRID_COLUMNS }
                    datagridConfig={ props.datagridConfig }
                    dataSource={ rows }
                    updateDatagridConfig={ config => props.updateTripsDatagridConfig(config) }
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
        </>
    );
};

TripsDataGrid.propTypes = {
    datagridConfig: PropTypes.object.isRequired,
    tripInstances: PropTypes.array.isRequired,
    updateTripsDatagridConfig: PropTypes.func.isRequired,
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
    allStops: PropTypes.object.isRequired,
    vehicleAllocations: PropTypes.object.isRequired,
    gridClassNames: PropTypes.string,
};

TripsDataGrid.defaultProps = {
    activeTripInstance: [],
    gridClassNames: 'grid-height',
};

export default connect(
    state => ({
        datagridConfig: getTripsDatagridConfig(state),
        tripInstances: getAllTripInstancesList(state),
        activeRoute: getActiveRoute(state),
        activeRouteVariant: getActiveRouteVariant(state),
        selectedTrips: getSelectedTripsKeys(state),
        serviceDate: getServiceDate(state),
        filters: getRouteFilters(state),
        agencies: getAgencies(state),
        rowCount: getTotalTripInstancesCount(state),
        activeTripInstance: getActiveTripInstance(state),
        allStops: getAllStops(state),
        vehicleAllocations: getAllocations(state),
    }),
    {
        updateTripsDatagridConfig, selectSingleTrip, selectTrips, selectAllTrips, filterTripInstances, updateActiveTripInstances,
    },
)(TripsDataGrid);
