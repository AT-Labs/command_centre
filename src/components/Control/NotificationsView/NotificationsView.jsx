/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment-timezone';
import { DataGridPro, GridToolbar, getGridStringOperators } from '@mui/x-data-grid-pro';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Map from '@mui/icons-material/Map';
import Stack from '@mui/material/Stack';

import { parseTime } from '../../../utils/helpers';
import { updateNotificationsFilters, dismissNotification } from '../../../redux/actions/control/notifications';
import { getAllNotifications, getNotificationsFilters } from '../../../redux/selectors/control/notifications';
import { getAgencies } from '../../../redux/selectors/control/agencies';
import VEHICLE_TYPE from '../../../types/vehicle-types';
import { goToRoutesView } from '../../../redux/actions/control/link';
import { RenderCellExpand } from './renderCellExpand';
import FilterByOperator from '../Common/Filters/FilterByOperator';
import FilterByRoute from '../Common/Filters/FitlerByRoute/FilterByRoute';
import DropdownInputValue from './DropdownInputValue/DropdownInputValue';

import './Notifications.scss';

const INIT_STATE = {
    page: 1,
    operator: '',
    route: '',
    pageSize: 10,
};

export class NotificationsView extends React.Component {
    static propTypes = {
        updateNotificationsFilters: PropTypes.func.isRequired,
        dismissNotification: PropTypes.func.isRequired,
        goToRoutesView: PropTypes.func.isRequired,
        notifications: PropTypes.array,
        filters: PropTypes.object.isRequired,
        operators: PropTypes.array.isRequired,
    };

    static defaultProps = {
        notifications: [],
    };

    constructor(props) {
        super(props);

        this.state = INIT_STATE;

        this.NOTIFICATIONS_COLUMNS = [
            { field: 'route', headerName: 'Route', width: 200 },
            { field: 'trip_date_start_time', headerName: 'Trip Date + Start Time', width: 200, type: 'dateTime' },
            { field: 'mode', headerName: 'Mode', width: 150 },
            { field: 'type', headerName: 'Type', width: 150 },
            { field: 'operator', headerName: 'Operator', width: 230 },
            { field: 'description', headerName: 'Description', width: 200, renderCell: RenderCellExpand },
            { field: 'severity', headerName: 'Severity', width: 120 },
            { field: 'status', headerName: 'Status', width: 100 },
            { field: 'date_created', headerName: 'Date Created', width: 200, type: 'dateTime' },
            { field: 'action', headerName: 'Action', width: 200, renderCell: this.getActionsButtons },
        ];
    }

    getActionsButtons = params => (
        <React.Fragment>
            <IconButton color="error" aria-label="delete" onClick={ () => this.props.dismissNotification(params.row.id) }>
                <DeleteIcon />
            </IconButton>
            <Button size="small" variant="contained" endIcon={ <Map /> } onClick={ () => this.props.goToRoutesView(params.row.allData, {}) }>View Trip</Button>
        </React.Fragment>
    );

    getPageData = () => {
        const all = this.enrichNotifications().map(notification => ({
            id: notification.id,
            route: notification.routeShortName,
            mode: VEHICLE_TYPE[notification.routeType].type,
            type: notification.type,
            operator: notification.operator,
            description: notification.message,
            trip_date_start_time: parseTime(notification.tripStartTime, notification.tripStartDate).format('MM/DD/YYYY HH:mm a'),
            severity: notification.severity,
            status: notification.status,
            date_created: moment(notification.createdAt).format('MM/DD/YYYY HH:mm a'),
            goToRoutesView: this.props.goToRoutesView,
            dismissNotifictation: this.props.dismissNotification,
            allData: notification,
        }));
        return all;
    };

    enrichNotifications = () => {
        const { notifications, operators } = this.props;
        return operators.length ? notifications.map(notification => ({
            ...notification,
            operator: _.filter(operators, operator => operator.agencyId === notification.agencyId)[0].agencyName,
        })) : notifications;
    };

    getColumns = () => {
        const typeColumn = this.NOTIFICATIONS_COLUMNS.find(column => column.field === 'type');
        const typeColIndex = this.NOTIFICATIONS_COLUMNS.findIndex(col => col.field === 'type');

        const severityColumn = this.NOTIFICATIONS_COLUMNS.find(column => column.field === 'severity');
        const severityColIndex = this.NOTIFICATIONS_COLUMNS.findIndex(col => col.field === 'severity');

        const statusColumn = this.NOTIFICATIONS_COLUMNS.find(column => column.field === 'status');
        const statusColIndex = this.NOTIFICATIONS_COLUMNS.findIndex(col => col.field === 'status');

        const modeColumn = this.NOTIFICATIONS_COLUMNS.find(column => column.field === 'mode');
        const modeColIndex = this.NOTIFICATIONS_COLUMNS.findIndex(col => col.field === 'mode');

        const typeFilterOperators = getGridStringOperators().filter(operator => operator.value === 'equals').map(
            operator => ({
                ...operator,
                InputComponent: DropdownInputValue,
                InputComponentProps: {
                    optionList: ['Missed', 'Signon'],
                },
            }),
        );

        const severityFilterOperators = getGridStringOperators().filter(operator => operator.value === 'equals').map(
            operator => ({
                ...operator,
                InputComponent: DropdownInputValue,
                InputComponentProps: {
                    optionList: ['Low', 'Medium', 'High'],
                },
            }),
        );

        const statusFilterOperators = getGridStringOperators().filter(operator => operator.value === 'equals').map(
            operator => ({
                ...operator,
                InputComponent: DropdownInputValue,
                InputComponentProps: {
                    optionList: ['Active', 'Expired'],
                },
            }),
        );

        const modeFilterOperators = getGridStringOperators().filter(operator => operator.value === 'equals').map(
            operator => ({
                ...operator,
                InputComponent: DropdownInputValue,
                InputComponentProps: {
                    optionList: ['Bus', 'Train', 'Ferry'],
                },
            }),
        );

        this.NOTIFICATIONS_COLUMNS[typeColIndex] = {
            ...typeColumn,
            filterOperators: typeFilterOperators,
        };

        this.NOTIFICATIONS_COLUMNS[severityColIndex] = {
            ...severityColumn,
            filterOperators: severityFilterOperators,
        };

        this.NOTIFICATIONS_COLUMNS[statusColIndex] = {
            ...statusColumn,
            filterOperators: statusFilterOperators,
        };

        this.NOTIFICATIONS_COLUMNS[modeColIndex] = {
            ...modeColumn,
            filterOperators: modeFilterOperators,
        };

        return this.NOTIFICATIONS_COLUMNS;
    };

    getNoRowsOverlay = () => (
        <Stack height="100%" alignItems="center" justifyContent="center">
            No Alert Found.
        </Stack>
    )

    getNoResultsOverlay = () => (
        <Stack height="100%" alignItems="center" justifyContent="center">
            No results found.
        </Stack>
    )

    render() {
        return (
            <div className="control-notifications-view">
                <h1>Alerts</h1>
                <div>
                    <section className="search-filters bg-at-ocean-tint-10 border border-at-ocean-tint-20 mb-3">
                        <div className="row justify-content-between pt-3 px-3">
                            <div className="col-md-12 col-xl-9">
                                <div className="row justify-content-between">
                                    <div className="col">
                                        <FilterByRoute
                                            id="control-filters-operators-search"
                                            selectedOption={ this.state.route.value || '' }
                                            onSelection={ selectedOption => this.setState({ route: selectedOption }) } />
                                    </div>
                                    <div className="col">
                                        <FilterByOperator
                                            id="control-filters-operators-search"
                                            selectedOption={ this.state.operator.value || '' }
                                            onSelection={ selectedOption => this.setState({ operator: selectedOption }) } />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <div style={ { height: 500, width: '100%' } }>
                    <DataGridPro
                        components={ {
                            Toolbar: GridToolbar,
                            NoRowsOverlay: this.getNoRowsOverlay,
                            NoResultsOverlay: this.getNoResultsOverlay,
                        } }
                        initialState={ { pinnedColumns: { right: ['action'] } } }
                        pageSize={ this.state.pageSize }
                        rowsPerPageOptions={ [10, 25, 50, 100] }
                        onPageSizeChange={ newPageSize => this.setState({ pageSize: newPageSize }) }
                        // filterModel={ {
                        //     items: [
                        //         // { id: 1020, columnField: 'route', operatorValue: 'contains', value: this.state.route.label },
                        //         // { id: 1022, columnField: 'operator', operatorValue: 'contains', value: this.state.operator.label },
                        //     ],
                        // } }
                        rows={ this.getPageData() }
                        columns={ this.getColumns() }
                        pagination
                        autoHeight
                    />
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        notifications: getAllNotifications(state),
        filters: getNotificationsFilters(state),
        operators: getAgencies(state),
    }),
    {
        updateNotificationsFilters,
        dismissNotification,
        goToRoutesView,
    },
)(NotificationsView);
