import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Box, IconButton } from '@mui/material';
import { getGridSingleSelectOperators, getGridStringOperators, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro';
import { lowerCase, get, words, upperFirst, map, isEqual } from 'lodash-es';
import { FaCheckCircle, FaEyeSlash } from 'react-icons/fa';
import { GiDetour } from 'react-icons/gi';

import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import { isTripCancelPermitted } from '../../../utils/user-permissions';
import { getActiveRoute } from '../../../redux/selectors/control/routes/routes';
import { getActiveRouteVariant } from '../../../redux/selectors/control/routes/routeVariants';
import { getServiceDate } from '../../../redux/selectors/control/serviceDate';
import { formatTripDelay, isTripAdded, dateOperators, markStopsAsFirstOrLast, IsOnHoldTrip } from '../../../utils/control/routes';
import { getTripInstanceId, getTripTimeDisplay, getTimePickerOptions } from '../../../utils/helpers';
import { mergeDatagridColumns } from '../../../utils/datagrid';
import { selectSingleTrip, selectTrips, selectAllTrips, filterTripInstances, updateActiveTripInstances } from '../../../redux/actions/control/routes/trip-instances';
import { TripSubIconType } from './Types';
import { getAllTripInstancesList, getSelectedTripsKeys, getTotalTripInstancesCount, getActiveTripInstance } from '../../../redux/selectors/control/routes/trip-instances';
import { getAgencies } from '../../../redux/selectors/control/agencies';
import { CustomSelectionHeader } from './CustomSelectionHeader';
import { getAllStops } from '../../../redux/selectors/static/stops';
import { StopSearchDataGridOperators } from '../Common/DataGrid/OmniSearchDataGridOperator';
import { getAllocations, getVehicleAllocationLabelByTrip } from '../../../redux/selectors/control/blocks';
import {
    useDiversion, useAddTrip, useHideTrip, useRoutesTripsFilterCollapse, useRoutesTripsPreferences,
    useHoldTrip, useTripOperationNotes, useTripCancellationCause, useParentChildIncident,
} from '../../../redux/selectors/appSettings';
import { getUserPreferences } from '../../../utils/transmitters/command-centre-config-api';
import { updateRoutesTripsDatagridConfig, updateDefaultRoutesTripsDatagridConfig } from '../../../redux/actions/datagrid';
import { getRoutesTripsDatagridConfig } from '../../../redux/selectors/datagrid';
import { mergeRouteFilters } from '../../../redux/actions/control/routes/filters';
import { LABEL_DISRUPTION } from '../../../constants/disruptions';
import { transformIncidentNo } from '../../../utils/control/disruptions';
import { sourceIdDataGridOperator } from '../Notifications/sourceIdDataGridOperator';
import { useAlertCauses } from '../../../utils/control/alert-cause-effect';
import { DIRECTIONS } from '../DisruptionsView/types';
import { setIncidentToUpdate, updateEditMode, getDisruptionsAndIncidents } from '../../../redux/actions/control/incidents';
import { getAllIncidents } from '../../../redux/selectors/control/incidents';
import { updateControlDetailView, updateMainView } from '../../../redux/actions/navigation';

import VIEW_TYPE from '../../../types/view-types';
import EDIT_TYPE from '../../../types/edit-types';
import RenderCellExpand from '../Alerts/RenderCellExpand/RenderCellExpand';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';
import TripView from './TripView';
import TripIcon from '../Common/Trip/TripIcon';
import TripDelay from '../Common/Trip/TripDelay';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';

import './TripsDataGrid.scss';

export const renderDisruptionIdCell = ({ row }) => {
    const formattedDisruptionId = transformIncidentNo(row.disruptionId);
    if (formattedDisruptionId) {
        return (
            <a href={ `/control-main-view/control-disruptions/${row.disruptionId.toString()}` }>{formattedDisruptionId}</a>
        );
    }
    return undefined;
};

const isTripCompleted = tripStatus => tripStatus === TRIP_STATUS_TYPES.completed;

const formatSourceColumn = row => (isTripAdded(row) ? <FaCheckCircle className="icon-blue-check" size={ 18 } /> : '');

const formatOnHoldColumn = tripInstance => (IsOnHoldTrip(tripInstance) ? 'Y' : 'N');

const formatHideColumn = (row) => {
    const display = get(row.tripInstance, 'display');
    return display === false ? <FaCheckCircle className="icon-red-check" size={ 18 } /> : '';
};

const getTripSourceOptions = () => [
    { value: 'manual', label: 'Yes' },
    { value: 'gtfs', label: 'No' },
];

const getTripOnHoldOptions = () => [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
];

const getHideOptions = () => [
    { value: 'true', label: 'No' },
    { value: 'false', label: 'Yes' },
];

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

export const TripsDataGrid = (props) => {
    const isDateServiceTodayOrTomorrow = () => moment(props.serviceDate).isBetween(moment(), moment().add(1, 'd'), 'd', '[]');
    const [isSavedDatagridConfigReady, setIsSavedDatagridConfigReady] = useState(false);
    const isSavedDatagridConfigReadyRef = useRef(isSavedDatagridConfigReady);
    const getAgenciesRef = useRef(() => props.agencies);
    const causes = useAlertCauses();

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

    const allIncidentsRef = useRef(props.allIncidents);

    useEffect(() => {
        allIncidentsRef.current = props.allIncidents;
    }, [props.allIncidents]);

    const renderParentIncidentCell = ({ row }) => {
        const formattedDisruptionId = transformIncidentNo(row.disruptionId);
        if (formattedDisruptionId) {
            return (
                <IconButton disableRipple
                    color="primary"
                    onClick={ () => {
                        const incident = allIncidentsRef.current.find(inc => inc.disruptions?.includes(row.disruptionId));
                        if (incident) {
                            props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                            props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.INCIDENTS);
                            props.setIncidentToUpdate(incident.incidentId, formattedDisruptionId);
                            props.updateEditMode(EDIT_TYPE.EDIT);
                        }
                    } }>
                    <span className="font-size-md">{formattedDisruptionId}</span>
                </IconButton>
            );
        }
        return undefined;
    };

    const GRID_COLUMNS = [
        {
            ...GRID_CHECKBOX_SELECTION_COL_DEF,
            width: 100,
            cellClassName: 'selectCell',
            headerAlign: 'center',
            align: 'left',
            type: 'string',
            renderHeader: () => (
                <CustomSelectionHeader
                    serviceDate={ props.serviceDate }
                    selectAllTrips={ props.selectAllTrips }
                />
            ),
            renderCell: params => renderIconColumnContent(params),
        },

        ...(props.useDiversion) ? [{
            field: 'routeVariantId',
            headerName: 'Route Variant',
            width: 150,
            type: 'string',
            filterable: false,
            renderCell: params => (
                <span>
                    <span>{params.value}</span>
                    {params.row?.type === 'Detoured' && (
                        <span>
                            <GiDetour size="24px" />
                        </span>
                    )}
                </span>
            ),
        }] : [{
            field: 'routeVariantId',
            headerName: 'Route Variant',
            width: 150,
            type: 'string',
            filterable: false,
        }],
        ...(props.useAddTrip && !props.useDiversion) ? [{
            field: 'source',
            headerName: 'New',
            width: 100,
            type: 'singleSelect',
            valueOptions: getTripSourceOptions(),
            filterOperators: getGridSingleSelectOperators(true).filter(
                operator => operator.value === 'is',
            ),
            renderCell: params => formatSourceColumn(params.row),
        }] : [],
        ...props.useDiversion ? [
            {
                field: 'type',
                headerName: 'Type',
                width: 200,
                hide: true,
                filterOperators: getGridSingleSelectOperators(true).filter(o => ['is', 'not'].includes(o.value)),
                valueOptions: [
                    { value: 'Detoured', label: 'Detoured' },
                    { value: 'Added', label: 'Added' },
                ],
                sortable: true,
            },
            {
                field: 'disruptionId',
                headerName: LABEL_DISRUPTION,
                width: 200,
                hide: false,
                renderCell: props.useParentChildIncident ? renderParentIncidentCell : renderDisruptionIdCell,
                filterOperators: sourceIdDataGridOperator,
            },

        ] : [],
        ...props.useHoldTrip ? [{
            field: 'onHold',
            headerName: 'On Hold',
            width: 100,
            type: 'singleSelect',
            valueOptions: getTripOnHoldOptions(),
            filterOperators: getGridSingleSelectOperators(true).filter(
                operator => operator.value === 'is',
            ),
            renderCell: params => formatOnHoldColumn(params.row.tripInstance),
        }] : [],
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
            field: 'directionId',
            headerName: 'Direction',
            width: 150,
            type: 'singleSelect',
            valueOptions: Object.entries(DIRECTIONS).map(([value, label]) => ({
                value: Number(value),
                label,
            })),
            filterOperators: getGridSingleSelectOperators(true).filter(
                operator => operator.value === 'is',
            ),
            valueGetter: ({ row }) => {
                const directionId = get(row.tripInstance, 'directionId');
                return directionId;
            },
            renderCell: ({ row }) => {
                const directionId = get(row.tripInstance, 'directionId');
                return DIRECTIONS[directionId] ?? '';
            },
            hide: true,
        },
        {
            field: 'referenceId',
            headerName: 'Ref #',
            width: 100,
            type: 'string',
            filterOperators: isAnyOfStringOperators,
        },
        ...props.useHideTrip ? [{
            field: 'display',
            headerName: 'Hidden',
            width: 100,
            type: 'singleSelect',
            valueOptions: getHideOptions(),
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
            filterable: !props.useRoutesTripsFilterCollapse,
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
        ...(props.useTripOperationNotes
            ? [
                {
                    field: 'operationNotes',
                    headerName: 'operation Notes',
                    width: 150,
                    renderCell: RenderCellExpand,
                    filterable: false,
                    hide: true,
                },
            ]
            : []),
        ...(props.useTripCancellationCause
            ? [
                {
                    field: 'cancellationCause',
                    headerName: 'Cause of cancellation',
                    width: 150,
                    filterable: false,
                    hide: true,
                },
            ]
            : []),
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

    const getTripCancellationCause = (tripInstance, causesList) => {
        if (tripInstance.status === TRIP_STATUS_TYPES.cancelled && tripInstance.cancellationCause) {
            return (causesList.find(cause => cause.value === tripInstance.cancellationCause))?.label || tripInstance.cancellationCause;
        }
        return '';
    };

    const rows = props.tripInstances.map(tripInstance => ({
        routeVariantId: tripInstance.routeVariantId,
        ...(props.useHoldTrip && { onHold: formatOnHoldColumn(tripInstance) }),
        startTime: getTripTimeDisplay(tripInstance.startTime),
        endTime: getTripTimeDisplay(tripInstance.endTime),
        routeType: tripInstance.routeType,
        status: tripInstance.status,
        routeLongName: tripInstance.routeLongName,
        referenceId: tripInstance.referenceId,
        tripId: tripInstance.tripId,
        ...(props.useHideTrip && { display: tripInstance.display }),
        ...(props.useAddTrip && { source: tripInstance.source }),
        type: tripInstance.type,
        disruptionId: tripInstance.disruptionId,
        directionId: tripInstance.directionId,
        tripInstance: {
            ...tripInstance,
            stops: markStopsAsFirstOrLast(tripInstance.stops),
        },
        operationNotes: tripInstance.operationNotes,
        ...(props.useTripCancellationCause ? { cancellationCause: getTripCancellationCause(tripInstance, causes) } : {}),
    }));

    const getDetailPanelContent = React.useCallback(
        ({ row }) => (<Box sx={ { padding: '16px 16px 10px 16px', backgroundColor: '#F3F4F5' } }><TripView tripInstance={ row.tripInstance } /></Box>),
        [],
    );

    const latestActiveTripInstanceId = props.activeTripInstance.length > 0 ? getTripInstanceId(props.activeTripInstance[props.activeTripInstance.length - 1]) : null;

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
        if (props.useDiversion && props.useParentChildIncident) {
            props.getDisruptionsAndIncidents();
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
                autoExpandSubChild={ latestActiveTripInstanceId }
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
    allStops: PropTypes.object.isRequired,
    vehicleAllocations: PropTypes.object.isRequired,
    useAddTrip: PropTypes.bool.isRequired,
    useHideTrip: PropTypes.bool.isRequired,
    useDiversion: PropTypes.bool.isRequired,
    gridClassNames: PropTypes.string,
    useRoutesTripsFilterCollapse: PropTypes.bool.isRequired,
    useRoutesTripsPreferences: PropTypes.bool.isRequired,
    updateDefaultRoutesTripsDatagridConfig: PropTypes.func.isRequired,
    mergeRouteFilters: PropTypes.func.isRequired,
    useHoldTrip: PropTypes.bool.isRequired,
    useTripOperationNotes: PropTypes.bool.isRequired,
    useTripCancellationCause: PropTypes.bool.isRequired,
    useParentChildIncident: PropTypes.bool.isRequired,
    setIncidentToUpdate: PropTypes.func.isRequired,
    updateEditMode: PropTypes.func.isRequired,
    getDisruptionsAndIncidents: PropTypes.func.isRequired,
    allIncidents: PropTypes.array,
    updateMainView: PropTypes.func.isRequired,
    updateControlDetailView: PropTypes.func.isRequired,
};

TripsDataGrid.defaultProps = {
    activeTripInstance: [],
    gridClassNames: 'grid-height',
    allIncidents: [],
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
        useDiversion: useDiversion(state),
        useRoutesTripsFilterCollapse: useRoutesTripsFilterCollapse(state),
        useRoutesTripsPreferences: useRoutesTripsPreferences(state),
        useHoldTrip: useHoldTrip(state),
        useTripOperationNotes: useTripOperationNotes(state),
        useTripCancellationCause: useTripCancellationCause(state),
        useParentChildIncident: useParentChildIncident(state),
        allIncidents: getAllIncidents(state),
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
        setIncidentToUpdate,
        updateEditMode,
        getDisruptionsAndIncidents,
        updateMainView,
        updateControlDetailView,
    },
)(TripsDataGrid);
