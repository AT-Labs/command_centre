import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment-timezone';
import {
    DataGridPro, GridToolbarExport, useGridApiRef, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton,
    GridToolbarDensitySelector,
} from '@mui/x-data-grid-pro';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ReadMore from '@mui/icons-material/ReadMore';

import { parseTime, getClosestTimeValueForFilter } from '../../../utils/helpers';
import {
    dismissNotification,
    updateNotificationsDatagridConfig,
} from '../../../redux/actions/control/notifications';
import { getAllNotifications, getNotificationsDatagridConfig } from '../../../redux/selectors/control/notifications';
import { getAgencies } from '../../../redux/selectors/control/agencies';
import { retrieveAgencies } from '../../../redux/actions/control/agencies';
import VEHICLE_TYPE from '../../../types/vehicle-types';
import { goToRoutesView } from '../../../redux/actions/control/link';
import RenderCellExpand from './RenderCellExpand/RenderCellExpand';
import Overlay from './Overlay/Overlay';

import './Notifications.scss';

export const NotificationsView = (props) => {
    const apiRef = useGridApiRef();
    const dateFormat = 'DD/MM/YY HH:mm a';

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
                        onClick={ () => props.dismissNotification(params.row.id) }
                    >
                        <DeleteIcon />
                    </IconButton>
                )}
            </>
        );
    };

    const NOTIFICATIONS_COLUMNS = [
        { field: 'route', headerName: 'ROUTE', width: 150 },
        {
            field: 'trip_date_start_time',
            headerName: 'TRIP TIME',
            width: 250,
            type: 'dateTime',
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
            valueOptions: ['Missed Trip', 'Incorrect Trip Sign On'],
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
        props.updateNotificationsDatagridConfig(data);
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
            if (props.notificationsDatagridConfig.density !== apiRef.current.state.density.value) {
                dataGridSave(apiRef.current);
            }
        });

        return () => {
            stateChangeEvent();
        };
    });

    const parseNotificationType = (type) => {
        if (type === 'Missed') return 'Missed Trip';
        if (type === 'Signon') return 'Incorrect Trip Sign On';
        return null;
    };

    const enrichNotifications = () => {
        const { notifications, operators } = props;
        return operators.length
            ? notifications.map(notification => ({
                ...notification,
                operator: _.filter(
                    operators,
                    ope => ope.agencyId === notification.agencyId,
                )[0].agencyName,
            }))
            : notifications;
    };

    const getPageData = () => enrichNotifications().map(notification => ({
        id: notification.id,
        route: notification.routeShortName,
        mode: VEHICLE_TYPE[notification.routeType].type,
        type: parseNotificationType(notification.type),
        operator: notification.operator,
        description: notification.message,
        trip_date_start_time: parseTime(
            notification.tripStartTime,
            notification.tripStartDate,
        ).format(dateFormat),
        severity: notification.severity,
        status: notification.status,
        date_created: moment(notification.createdAt).format(dateFormat),
        goToRoutesView: props.goToRoutesView,
        dismissNotifictation: props.dismissNotification,
        allData: notification,
    }));

    const getColumns = () => {
        if (props.notificationsDatagridConfig.columns.length > 0) return props.notificationsDatagridConfig.columns;

        const operatorColumn = NOTIFICATIONS_COLUMNS.find(
            column => column.field === 'operator',
        );

        const operatorColIndex = NOTIFICATIONS_COLUMNS.findIndex(
            col => col.field === 'operator',
        );

        NOTIFICATIONS_COLUMNS[operatorColIndex] = {
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

        return NOTIFICATIONS_COLUMNS;
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
        <div className="control-notifications-view">
            <div className="mb-3">
                <h1>Alerts</h1>
            </div>
            <div>
                <DataGridPro
                    components={ {
                        Toolbar: CustomToolbar,
                        NoRowsOverlay: getNoRowsOverlay,
                        NoResultsOverlay: getNoResultsOverlay,
                    } }
                    apiRef={ apiRef }
                    page={ props.notificationsDatagridConfig.page }
                    pageSize={ props.notificationsDatagridConfig.pageSize }
                    rowsPerPageOptions={ [15, 25, 50, 100] }
                    onPageSizeChange={ newPageSize => props.updateNotificationsDatagridConfig({ pageSize: newPageSize }) }
                    rows={ getPageData() }
                    columns={ getColumns() }
                    sortModel={ props.notificationsDatagridConfig.sortModel }
                    onSortModelChange={ model => props.updateNotificationsDatagridConfig({ sortModel: model }) }
                    filterModel={ props.notificationsDatagridConfig.filterModel }
                    onFilterModelChange={ model => props.updateNotificationsDatagridConfig({ filterModel: model }) }
                    density={ props.notificationsDatagridConfig.density }
                    onPinnedColumnsChange={ model => props.updateNotificationsDatagridConfig({ pinnedColumns: model }) }
                    pinnedColumns={ props.notificationsDatagridConfig.pinnedColumns }
                    onPageChange={ page => props.updateNotificationsDatagridConfig({ page }) }
                    pagination
                    autoHeight
                />
            </div>
        </div>
    );
};

NotificationsView.propTypes = {
    dismissNotification: PropTypes.func.isRequired,
    goToRoutesView: PropTypes.func.isRequired,
    notifications: PropTypes.array,
    operators: PropTypes.array.isRequired,
    retrieveAgencies: PropTypes.func.isRequired,
    notificationsDatagridConfig: PropTypes.object.isRequired,
    updateNotificationsDatagridConfig: PropTypes.func.isRequired,
};

NotificationsView.defaultProps = {
    notifications: [],
};

export default connect(
    state => ({
        notifications: getAllNotifications(state),
        operators: getAgencies(state),
        notificationsDatagridConfig: getNotificationsDatagridConfig(state),
    }),
    {
        dismissNotification,
        goToRoutesView,
        retrieveAgencies,
        updateNotificationsDatagridConfig,
    },
)(NotificationsView);
