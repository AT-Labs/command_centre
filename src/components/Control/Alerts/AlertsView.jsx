import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment-timezone';
import {
    DataGridPro, GridToolbarExport, useGridApiRef, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton,
    GridToolbarDensitySelector,
} from '@mui/x-data-grid-pro';
import DateAdapter from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ReadMore from '@mui/icons-material/ReadMore';

import { parseTime, getClosestTimeValueForFilter } from '../../../utils/helpers';
import {
    dismissAlert,
    updateAlertsDatagridConfig,
} from '../../../redux/actions/control/alerts';
import { getAllAlerts, getAlertsDatagridConfig } from '../../../redux/selectors/control/alerts';
import { getAgencies } from '../../../redux/selectors/control/agencies';
import { retrieveAgencies } from '../../../redux/actions/control/agencies';
import VEHICLE_TYPE from '../../../types/vehicle-types';
import { goToRoutesView } from '../../../redux/actions/control/link';
import RenderCellExpand from './RenderCellExpand/RenderCellExpand';
import Overlay from '../../Common/Overlay/Overlay';

import './Alerts.scss';

export const AlertsView = (props) => {
    const apiRef = useGridApiRef();
    const dateFormat = 'DD/MM/YY hh:mm a';

    const getActionsButtons = (params) => {
        const { row: { allData } } = params;
        const trip = {
            routeVariantId: allData.routeVariantId,
            routeType: allData.routeType,
            startTime: allData.tripStartTime,
            routeShortName: allData.routeShortName,
            agencyId: allData.agencyId,
            tripStartDate: allData.tripStartDate,
            tripStartTime: allData.tripStartTime,
        };

        const filter = {
            routeType: allData.routeType,
            startTimeFrom: getClosestTimeValueForFilter(allData.tripStartTime),
            startTimeTo: '',
            tripStatus: '',
            agencyId: '',
            routeShortName: allData.routeShortName,
            routeVariantId: allData.routeVariantId,
        };

        return (
            <>
                <Button
                    size="small"
                    variant="contained"
                    endIcon={ <ReadMore /> }
                    onClick={ () => props.goToRoutesView(trip, filter) }
                >
                    View Trip
                </Button>
                {params.row.status === 'Active' && (
                    <IconButton
                        color="error"
                        aria-label="delete"
                        onClick={ () => props.dismissAlert(params.row.id) }
                    >
                        <DeleteIcon />
                    </IconButton>
                )}
            </>
        );
    };

    const ALERTS_COLUMNS = [
        { field: 'route', headerName: 'ROUTE', width: 150 },
        {
            field: 'trip_date_start_time',
            headerName: 'TRIP TIME',
            width: 250,
            type: 'dateTime',
            valueFormatter: params => params.value.format(dateFormat),
        },
        {
            field: 'mode',
            headerName: 'MODE',
            width: 150,
            type: 'singleSelect',
            valueOptions: ['Bus', 'Train', 'Ferry'],
        },
        {
            field: 'type',
            headerName: 'TYPE',
            width: 200,
            type: 'singleSelect',
            valueOptions: ['Not Started & Delayed', 'Missed Trip', 'Incorrect Trip Sign On'],
        },
        { field: 'operator', headerName: 'OPERATOR', width: 230 },
        {
            field: 'description',
            headerName: 'DESCRIPTION',
            width: 200,
            renderCell: RenderCellExpand,
        },
        {
            field: 'severity',
            headerName: 'SEVERITY',
            width: 120,
            type: 'singleSelect',
            valueOptions: ['Low', 'Medium', 'High'],
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 150,
            type: 'singleSelect',
            valueOptions: ['Active', 'Expired', 'Dismissed'],
        },
        {
            field: 'date_created',
            headerName: 'DATE CREATED',
            width: 200,
            type: 'dateTime',
            valueFormatter: params => params.value.format(dateFormat),
        },
        {
            field: 'action',
            headerName: 'ACTION',
            width: 200,
            renderCell: getActionsButtons,
        },
    ];

    useEffect(() => {
        if (_.isEmpty(props.operators)) props.retrieveAgencies();
    }, []);

    const dataGridSave = (gridApi) => {
        const data = {
            density: gridApi.state.density.value,
            columns: gridApi.getAllColumns(),
        };
        props.updateAlertsDatagridConfig(data);
    };

    React.useEffect(() => {
        const columnVisChangeEvent = apiRef.current.subscribeEvent('columnVisibilityChange', () => {
            dataGridSave(apiRef.current);
        });

        const colOrderChangeEvent = apiRef.current.subscribeEvent('columnOrderChange', () => {
            dataGridSave(apiRef.current);
        });

        const colResizeStopEvent = apiRef.current.subscribeEvent('columnResizeStop', () => {
            dataGridSave(apiRef.current);
        });

        return () => {
            columnVisChangeEvent();
            colOrderChangeEvent();
            colResizeStopEvent();
        };
    }, [apiRef]);

    React.useEffect(() => {
        const stateChangeEvent = apiRef.current.subscribeEvent('stateChange', () => {
            if (props.alertsDatagridConfig.density !== apiRef.current.state.density.value) {
                dataGridSave(apiRef.current);
            }
        });

        return () => {
            stateChangeEvent();
        };
    });

    const parseAlertType = (type) => {
        if (type === 'Late') return 'Not Started & Delayed';
        if (type === 'Missed') return 'Missed Trip';
        if (type === 'Signon') return 'Incorrect Trip Sign On';
        return null;
    };

    const enrichAlerts = () => {
        const { alerts, operators } = props;
        return operators.length
            ? alerts.map(alert => ({
                ...alert,
                operator: _.filter(
                    operators,
                    ope => ope.agencyId === alert.agencyId,
                )[0].agencyName,
            }))
            : alerts;
    };

    const getPageData = () => enrichAlerts().map(alert => ({
        id: alert.id,
        route: alert.routeShortName,
        mode: VEHICLE_TYPE[alert.routeType].type,
        type: parseAlertType(alert.type),
        operator: alert.operator,
        description: alert.message,
        trip_date_start_time: parseTime(
            alert.tripStartTime,
            alert.tripStartDate,
        ),
        severity: alert.severity,
        status: alert.status,
        date_created: moment(alert.createdAt),
        goToRoutesView: props.goToRoutesView,
        dismissNotifictation: props.dismissAlert,
        allData: alert,
    }));

    const getColumns = () => {
        if (props.alertsDatagridConfig.columns.length > 0) return props.alertsDatagridConfig.columns;

        const operatorColumn = ALERTS_COLUMNS.find(
            column => column.field === 'operator',
        );

        const operatorColIndex = ALERTS_COLUMNS.findIndex(
            col => col.field === 'operator',
        );

        ALERTS_COLUMNS[operatorColIndex] = {
            ...operatorColumn,
            valueOptions: [
                'AT Metro',
                'AT Metro Bus',
                'Bayes Coachlines',
                'Belaire Ferries',
                'Fullers360',
                'Go Bus',
                'Howick and Eastern',
                'New Zealand Bus',
                'Pavlovich Transport Solutions',
                'Ritchies Transport',
                'SeaLink Pine Harbour',
                'Tranzit Group Ltd',
                'Waiheke Bus Company',
                'Waikato Regional Council',
            ],
            type: 'singleSelect',
        };

        return ALERTS_COLUMNS;
    };

    const getNoRowsOverlay = () => <Overlay message="No alerts at this time." />;

    const getNoResultsOverlay = () => (
        <Overlay message="No results found for these criteria." />
    );

    const CustomToolbar = toolbarProps => (
        <GridToolbarContainer { ...toolbarProps }>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport printOptions={ { disableToolbarButton: true } } />
        </GridToolbarContainer>
    );

    return (
        <div className="control-alerts-view">
            <div className="mb-3">
                <h1>Alerts</h1>
            </div>
            <div>
                <LocalizationProvider dateAdapter={ DateAdapter }>
                    <DataGridPro
                        components={ {
                            Toolbar: CustomToolbar,
                            NoRowsOverlay: getNoRowsOverlay,
                            NoResultsOverlay: getNoResultsOverlay,
                        } }
                        apiRef={ apiRef }
                        page={ props.alertsDatagridConfig.page }
                        pageSize={ props.alertsDatagridConfig.pageSize }
                        rowsPerPageOptions={ [15, 25, 50, 100] }
                        onPageSizeChange={ newPageSize => props.updateAlertsDatagridConfig({ pageSize: newPageSize }) }
                        rows={ getPageData() }
                        columns={ getColumns() }
                        sortModel={ props.alertsDatagridConfig.sortModel }
                        onSortModelChange={ model => props.updateAlertsDatagridConfig({ sortModel: model }) }
                        filterModel={ props.alertsDatagridConfig.filterModel }
                        onFilterModelChange={ model => props.updateAlertsDatagridConfig({ filterModel: model }) }
                        density={ props.alertsDatagridConfig.density }
                        onPinnedColumnsChange={ model => props.updateAlertsDatagridConfig({ pinnedColumns: model }) }
                        pinnedColumns={ props.alertsDatagridConfig.pinnedColumns }
                        onPageChange={ page => props.updateAlertsDatagridConfig({ page }) }
                        pagination
                        autoHeight
                    />
                </LocalizationProvider>
            </div>
        </div>
    );
};

AlertsView.propTypes = {
    dismissAlert: PropTypes.func.isRequired,
    goToRoutesView: PropTypes.func.isRequired,
    alerts: PropTypes.array,
    operators: PropTypes.array.isRequired,
    retrieveAgencies: PropTypes.func.isRequired,
    alertsDatagridConfig: PropTypes.object.isRequired,
    updateAlertsDatagridConfig: PropTypes.func.isRequired,
};

AlertsView.defaultProps = {
    alerts: [],
};

export default connect(
    state => ({
        alerts: getAllAlerts(state),
        operators: getAgencies(state),
        alertsDatagridConfig: getAlertsDatagridConfig(state),
    }),
    {
        dismissAlert,
        goToRoutesView,
        retrieveAgencies,
        updateAlertsDatagridConfig,
    },
)(AlertsView);
