import React, { } from 'react';
import { getGridSingleSelectOperators, getGridStringOperators, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro';
import { lowerCase, get, words, upperFirst } from 'lodash-es';
import { FaCheckCircle } from 'react-icons/fa';
import { isTripAdded, dateOperators } from '../../../utils/control/routes';
import { getTimePickerOptions } from '../../../utils/helpers';
import TripDelay from '../Common/Trip/TripDelay';
import { StopSearchDataGridOperators } from '../Common/DataGrid/OmniSearchDataGridOperator';
import { getVehicleAllocationLabelByTrip } from '../../../redux/selectors/control/blocks';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';
import { CustomSelectionHeader } from './CustomSelectionHeader';

const formatSourceColumn = row => (isTripAdded(row) ? <FaCheckCircle className="icon-blue-check" size={ 18 } /> : '');

const formatHideColumn = (row) => {
    const display = get(row.tripInstance, 'display');
    return display === false ? <FaCheckCircle className="icon-red-check" size={ 18 } /> : '';
};

// const getTripSourceOptions = () => ;

// const getHideOptions = () => ;

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

// This function are use to define Grid Columns.
export function createGridColumns({
    useHideTrip, serviceDate, selectAllTrips, useAddTrip, useRoutesTripsFilterCollapse, vehicleAllocations, allStops }, renderIconColumnContent, getAgenciesRef) {
    const renderHeader = () => (
        <CustomSelectionHeader
            serviceDate={ serviceDate }
            selectAllTrips={ selectAllTrips }
        />
    );

    const GRID_COLUMNS = [
        {
            ...GRID_CHECKBOX_SELECTION_COL_DEF,
            width: 100,
            cellClassName: 'selectCell',
            headerAlign: 'center',
            align: 'left',
            type: 'string',
            renderHeader,
            // renderHeader: () => (
            //     <CustomSelectionHeader
            //         serviceDate={props.serviceDate}
            //         selectAllTrips={props.selectAllTrips}
            //     />
            // ),
            renderCell: params => renderIconColumnContent(params),
        },
        {
            field: 'routeVariantId',
            headerName: 'Route Variant',
            width: 150,
            type: 'string',
            filterable: false,
        },

        // TODO: LCJ:BEGIN ############# Probably need to change this
        ...useAddTrip ? [{
            field: 'source',
            headerName: 'New',
            width: 100,
            type: 'singleSelect',
            valueOptions: [
                { value: 'manual', label: 'Yes' },
                { value: 'gtfs', label: 'No' },
            ],
            filterOperators: getGridSingleSelectOperators(true).filter(
                operator => operator.value === 'is',
            ),
            renderCell: params => formatSourceColumn(params.row),
        }] : [],
        // TODO: LCJ:END ############# Probably need to change this

        // New Columns:BEGIN
        {
            field: 'type',
            headerName: 'Type',
            width: 100,
            hide: true,
            filterOperators: getGridSingleSelectOperators(true)
                .map(o => { console.log(o.value); return o; })
                .filter(o => ['isAnyOf'].includes(o.value)),
            valueOptions: [
                { value: 'Replacement', label: 'Replacement' },
                { value: 'Replaced', label: 'Replaced' },
                { value: 'Add', label: 'Add' },
                { value: null, label: 'Empty' },
            ],
            sortable: true,
        },
        {
            field: 'disruptionId',
            headerName: 'Disruption',
            width: 100,
            hide: true,
            sortable: true,
        },

        // New Columns:END

        {
            field: 'vehicleLabel',
            headerName: 'Vehicle Label',
            width: 150,
            valueGetter: ({ row }) => getVehicleAllocationLabelByTrip(row.tripInstance, vehicleAllocations) || get(row.tripInstance, 'vehicleLabel'),
            filterable: false,
        },
        {
            field: 'agencyId',
            headerName: 'Operator',
            width: 250,
            type: 'singleSelect',
            valueGetter: ({ row }) => {
                const agencyName = getAgenciesRef.current().find(agency => agency.agencyId === get(row.tripInstance, 'agencyId'))?.agencyName;
                return agencyName || '';
            },
            valueOptions: getAgenciesRef.current().map(agency => ({ value: agency.agencyId, label: agency.agencyName })),
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
                const depots = getAgenciesRef.current().map(agency => agency.depots).flat();
                const depotName = depots.find(depot => depot.depotId === get(row.tripInstance, 'depotId'))?.depotName;
                return depotName || '';
            },
            valueOptions: getAgenciesRef.current().map(agency => agency.depots).flat().map(depot => ({ value: depot.depotId, label: depot.depotName })),
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
        ...useHideTrip ? [{
            field: 'display',
            headerName: 'Hidden',
            width: 100,
            type: 'singleSelect',
            valueOptions: [
                { value: 'true', label: 'No' },
                { value: 'false', label: 'Yes' },
            ],
            filterOperators: getGridSingleSelectOperators(true).filter(
                operator => operator.value === 'is',
            ),
            renderCell: params => formatHideColumn(params.row),
        }] : [],
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
            filterable: !useRoutesTripsFilterCollapse,
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
                const stop = allStops[get(row.tripInstance, 'firstStopCode')];
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
                const stop = allStops[get(row.tripInstance, 'lastStopCode')];
                return stop?.stop_name || '';
            },
            hide: true,
        },
    ];

    return GRID_COLUMNS;
}
