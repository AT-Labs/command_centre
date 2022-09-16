import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { GoCheck } from 'react-icons/go';
import { getGridDateOperators, getGridNumericOperators, getGridStringOperators } from '@mui/x-data-grid-pro';
import DATE_TYPE from '../../../types/date-types';
import { getAllNotifications, getNotificationsDatagridConfig, getNotificationsFilterCount } from '../../../redux/selectors/control/notifications';
import { updateNotificationsDatagridConfig, filterNotifications } from '../../../redux/actions/control/notifications';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import NotificationsDetailView from './NotificationsDetailView';
import { transformIncidentNo } from '../../../utils/control/disruptions';
import { NOTIFICATION_CONDITION, NOTIFICATION_STATUS } from '../../../types/notification-types';
import { sourceIdDataGridOperator } from './sourceIdDataGridOperator';
import { dateTimeFormat } from '../../../utils/dateUtils';
import { getStopGroups } from '../../../redux/actions/control/dataManagement';
import { CAUSES, DEFAULT_CAUSE } from '../../../types/disruptions-types';
import RenderCellExpand from '../Alerts/RenderCellExpand/RenderCellExpand';
import { flatInformedEntities } from '../../../utils/control/notifications';

import './NotificationsView.scss';

export const NotificationsView = (props) => {
    const [loadingTimer, setLoadingTimer] = useState(null);
    const NOTIFICATIONS_POLLING_INTERVAL = 10000;
    const isActiveNoti = notification => notification.condition === 'published' && notification.status === 'in-progress';

    const GRID_COLUMNS = [
        {
            field: 'sourceId',
            headerName: '#DISRUPTION',
            flex: 1,
            valueGetter: params => transformIncidentNo(params.row?.source?.identifier),
            filterOperators: sourceIdDataGridOperator,
        },
        {
            field: 'sourceVersion',
            headerName: 'VERSION',
            width: 150,
            valueGetter: params => params.row?.source?.version,
            renderCell: params => (
                <div className="notificationCell">
                    { params.row?.source?.version }
                    { isActiveNoti(params.row) && (
                        <GoCheck className="notificationCell-icon text-info" size={ 20 } />
                    )}
                </div>
            ),
            align: 'center',
            headerAlign: 'center',
            type: 'number',
            filterOperators: getGridNumericOperators().filter(operator => operator.value === '='),
        },
        {
            field: 'sourceTitle',
            headerName: 'SOURCE TITLE',
            width: 150,
            type: 'string',
            valueGetter: params => params.row.source.title,
            renderCell: RenderCellExpand,
            filterOperators: getGridStringOperators().filter(
                operator => operator.value === 'equals' || operator.value === 'contains',
            ),
        },
        {
            field: 'affectedRoutes',
            headerName: 'AFFECTED ROUTES',
            width: 150,
            type: 'string',
            valueGetter: params => [
                ...new Set(flatInformedEntities(params.row.informedEntities).filter(entity => entity.routeId).map(({ routeShortName }) => routeShortName))].join(', '),
            renderCell: RenderCellExpand,
            filterOperators: getGridStringOperators().filter(operator => operator.value === 'equals'),
        },
        {
            field: 'affectedStops',
            headerName: 'AFFECTED STOPS',
            width: 150,
            type: 'string',
            valueGetter: params => [...new Set(flatInformedEntities(params.row.informedEntities).filter(entity => entity.stopCode).map(({ stopCode }) => stopCode))].join(', '),
            renderCell: RenderCellExpand,
            filterOperators: getGridStringOperators().filter(operator => operator.value === 'equals'),
        },
        {
            field: 'cause',
            headerName: 'CAUSE',
            width: 150,
            flex: 1,
            type: 'singleSelect',
            valueGetter: params => (CAUSES.find(cause => cause.value === params.value) || DEFAULT_CAUSE).label,
            valueOptions: CAUSES.slice(1, CAUSES.length).map(cause => cause.label),
        },
        {
            field: 'startTime',
            headerName: 'START TIME',
            flex: 1,
            type: 'dateTime',
            valueFormatter: params => moment(params.value).tz(DATE_TYPE.TIME_ZONE).format(dateTimeFormat),
            valueGetter: params => moment.unix(params.value),
            filterOperators: getGridDateOperators(true).filter(
                operator => operator.value === 'onOrAfter' || operator.value === 'onOrBefore',
            ),
        },
        {
            field: 'endTime',
            headerName: 'END TIME',
            flex: 1,
            type: 'dateTime',
            valueFormatter: params => ((params.value && params.value !== 0) ? moment(params.value).tz(DATE_TYPE.TIME_ZONE).format(dateTimeFormat) : null),
            valueGetter: params => ((params.value && params.value !== 0) ? moment.unix(params.value) : null),
            filterOperators: getGridDateOperators(true).filter(
                operator => operator.value === 'onOrAfter' || operator.value === 'onOrBefore',
            ),
        },
        {
            field: 'condition',
            headerName: 'CONDITION',
            flex: 1,
            type: 'singleSelect',
            valueOptions: Object.values(NOTIFICATION_CONDITION),
        },
        {
            field: 'status',
            headerName: 'STATUS',
            flex: 1,
            type: 'singleSelect',
            valueOptions: Object.values(NOTIFICATION_STATUS),
        },
    ];

    const getNotifications = () => {
        props.filterNotifications(true);

        const timer = setTimeout(() => {
            getNotifications();
        }, NOTIFICATIONS_POLLING_INTERVAL);
        setLoadingTimer(timer);
    };

    useEffect(() => {
        props.getStopGroups();
        getNotifications();
    }, [], () => { if (loadingTimer) clearTimeout(loadingTimer); });

    const getDetailPanelContent = React.useCallback(
        ({ row }) => <NotificationsDetailView notification={ row } />,
        [],
    );

    const setOverwrittenClassName = params => (params.row.status === NOTIFICATION_STATUS.overwritten ? 'row-overwritten' : '');

    return (
        <div className="control-notifications-view">
            <div className="mb-3">
                <h1>Notifications - Service Alerts</h1>
            </div>
            <CustomDataGrid
                columns={ GRID_COLUMNS }
                datagridConfig={ props.datagridConfig }
                dataSource={ props.notifications }
                updateDatagridConfig={ config => props.updateNotificationsDatagridConfig(config) }
                getDetailPanelContent={ getDetailPanelContent }
                getRowId={ row => row.notificationContentId }
                rowCount={ props.rowCount }
                serverSideData
                getRowClassName={ setOverwrittenClassName }
                detailPanelHeight={ 470 }
            />
        </div>
    );
};

NotificationsView.propTypes = {
    datagridConfig: PropTypes.object.isRequired,
    updateNotificationsDatagridConfig: PropTypes.func.isRequired,
    filterNotifications: PropTypes.func.isRequired,
    notifications: PropTypes.array.isRequired,
    rowCount: PropTypes.number.isRequired,
    getStopGroups: PropTypes.func.isRequired,
};

NotificationsView.defaultProps = {
};

export default connect(
    state => ({
        notifications: getAllNotifications(state),
        datagridConfig: getNotificationsDatagridConfig(state),
        rowCount: getNotificationsFilterCount(state),
    }),
    {
        updateNotificationsDatagridConfig,
        filterNotifications,
        getStopGroups,
    },
)(NotificationsView);
