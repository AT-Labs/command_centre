import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { GoCheck } from 'react-icons/go';
import { Button } from '@mui/material';
import { getGridDateOperators, getGridNumericOperators, getGridStringOperators } from '@mui/x-data-grid-pro';
import { useLocation } from 'react-router-dom';
import { uniqueId } from 'lodash-es';
import DATE_TYPE from '../../../types/date-types';
import { getAllNotifications, getNotificationsDatagridConfig, getNotificationsFilterCount, getSelectedNotification } from '../../../redux/selectors/control/notifications';
import { updateNotificationsDatagridConfig, filterNotifications, updateSelectedNotification } from '../../../redux/actions/control/notifications';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import NotificationsDetailView from './NotificationsDetailView';
import { transformIncidentNo, transformParentSourceIdNo } from '../../../utils/control/disruptions';
import { NOTIFICATION_CONDITION, NOTIFICATION_STATUS } from '../../../types/notification-types';
import { sourceIdDataGridOperator } from './sourceIdDataGridOperator';
import { ParentSourceIdDataGridOperator } from './ParentSourceIdDataGridOperator';
import { dateTimeFormat } from '../../../utils/dateUtils';
import { getStopGroups } from '../../../redux/actions/control/dataManagement';
import { DEFAULT_CAUSE } from '../../../types/disruption-cause-and-effect';
import RenderCellExpand from '../Alerts/RenderCellExpand/RenderCellExpand';
import { buildQueryParams, findNotificationByQuery, flatInformedEntities } from '../../../utils/control/notifications';
import { updateQueryParams } from '../../../redux/actions/navigation';
import Message from '../Common/Message/Message';
import { goToDisruptionsView, goToIncidentsView } from '../../../redux/actions/control/link';
import { ALERT_MESSAGE_TYPE } from '../../../types/message-types';
import { useDisruptionsNotificationsDirectLink, useNotificationEffectColumn } from '../../../redux/selectors/appSettings';
import Loader from '../../Common/Loader/Loader';
import { useAlertCauses } from '../../../utils/control/alert-cause-effect';

import './NotificationsView.scss';

export const NotificationsView = (props) => {
    const [showFeedbackMessage, setShowFeedbackMessage] = useState(true);
    const loadingTimerRef = useRef(null);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const NOTIFICATIONS_POLLING_INTERVAL = 10000;
    const isActiveNoti = notification => notification.condition === 'published' && notification.status === 'in-progress';
    const disruptionId = query.get('disruptionId');
    const parentDisruptionId = query.get('incidentId');
    const version = query.get('version');
    const source = query.get('source');
    const isNew = query.get('new') === 'true';

    const isQueryParamsValid = disruptionId && version && source;
    const isQueryIncidentParamsValid = (parentDisruptionId || (disruptionId && version)) && source;

    const causes = useAlertCauses();

    const GRID_COLUMNS = [
        ...(props.useNotificationEffectColumn ? [
            {
                field: 'parentSourceId',
                headerName: '#DISRUPTION',
                flex: 1,
                filterOperators: ParentSourceIdDataGridOperator,
                renderCell: ({ row: { source: { parentIdentifier: parentSourceId } } }) => transformParentSourceIdNo(parentSourceId),
            }, {
                field: 'sourceId',
                headerName: '#EFFECT',
                flex: 1,
                filterOperators: sourceIdDataGridOperator,
                renderCell: ({ row: { source: { identifier: incidentId, parentIdentifier: causeId } } }) => (
                    <Button
                        aria-label="go-to-disruptions-effect"
                        variant="text"
                        onClick={ () => {
                            props.goToIncidentsView({
                                incidentDisruptionNo: causeId,
                                disruptionId: incidentId,
                            }, { setActiveIncident: true });
                        } }>
                        {transformIncidentNo(incidentId)}
                    </Button>
                ),

                valueGetter: ({ row: { source: { identifier: incidentId } } }) => transformIncidentNo(incidentId),
            }] : [
            {
                field: 'sourceId',
                headerName: '#DISRUPTION',
                flex: 1,
                filterOperators: sourceIdDataGridOperator,
                ...(props.useDisruptionsNotificationsDirectLink ? {
                    renderCell: ({ row: { source: { identifier: incidentId } } }) => (
                        <Button
                            aria-label="go-to-disruptions"
                            variant="text"
                            onClick={ () => {
                                props.goToDisruptionsView({ incidentId }, { setActiveDisruption: true });
                            } }>
                            {transformIncidentNo(incidentId)}
                        </Button>
                    ),
                } : {
                    valueGetter: ({ row: { source: { identifier: incidentId } } }) => transformIncidentNo(incidentId),
                }),
            },
        ]),
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
            sortable: false,
        },
        {
            field: 'affectedStops',
            headerName: 'AFFECTED STOPS',
            width: 150,
            type: 'string',
            valueGetter: params => [...new Set(flatInformedEntities(params.row.informedEntities).filter(entity => entity.stopCode).map(({ stopCode }) => stopCode))].join(', '),
            renderCell: RenderCellExpand,
            filterOperators: getGridStringOperators().filter(operator => operator.value === 'equals'),
            sortable: false,
        },
        {
            field: 'cause',
            headerName: 'CAUSE',
            width: 150,
            flex: 1,
            type: 'singleSelect',
            valueGetter: params => (causes.find(cause => cause.value === params.value) || DEFAULT_CAUSE).label,
            valueOptions: causes.slice(1, causes.length).map(cause => cause.label),
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
                operator => operator.value === 'onOrAfter' || operator.value === 'onOrBefore' || operator.value === 'isEmpty' || operator.value === 'isNotEmpty',
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
        loadingTimerRef.current = timer;
    };

    useEffect(() => {
        props.getStopGroups();
        getNotifications();

        return () => {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
            }
            if (props.useDisruptionsNotificationsDirectLink) {
                props.updateQueryParams(null);
                props.updateSelectedNotification(null);
                props.updateNotificationsDatagridConfig({
                    ...props.datagridConfig,
                    filterModel: {
                        ...props.datagridConfig.filterModel,
                        items: [],
                    },
                });
            }
        };
    }, []);

    useEffect(() => {
        if (isQueryParamsValid || (isQueryIncidentParamsValid && props.useNotificationEffectColumn)) {
            props.updateNotificationsDatagridConfig({
                ...props.datagridConfig,
                filterModel: {
                    ...props.datagridConfig.filterModel,
                    items: buildQueryParams({ parentDisruptionId, disruptionId, version, source }, props.useNotificationEffectColumn),
                },
            });
        }
    }, [parentDisruptionId, disruptionId, version, source]);

    useEffect(() => {
        if (isQueryParamsValid || (isQueryIncidentParamsValid && props.useNotificationEffectColumn)) {
            const notification = findNotificationByQuery({ parentDisruptionId, disruptionId, version, source }, props.notifications, props.useNotificationEffectColumn);
            if (notification) {
                props.updateSelectedNotification(notification);
                setShowFeedbackMessage(false);
            }
        }
    }, [props.notifications]);

    const getDetailPanelContent = React.useCallback(
        ({ row }) => <NotificationsDetailView notification={ row } />,
        [],
    );

    const getRowClassName = (params) => {
        const { status, condition, endTime } = params.row;
        if (status === NOTIFICATION_STATUS.overwritten) {
            return 'row-overwritten';
        }
        if (status === NOTIFICATION_STATUS.inProgress && condition === NOTIFICATION_CONDITION.published && endTime === null) {
            return 'row-highlight';
        }
        return '';
    };

    const updateActiveNotification = (ids) => {
        const notification = ids.length > 0 ? props.notifications.find(({ notificationContentId }) => notificationContentId === ids[0]) : null;
        props.updateSelectedNotification(notification);
    };

    const getAlertMessage = () => {
        const isParentIncident = parentDisruptionId != null && props.useNotificationEffectColumn;
        const id = isParentIncident ? parentDisruptionId : disruptionId;
        const transformNo = isParentIncident ? transformParentSourceIdNo : transformIncidentNo;

        return {
            id: uniqueId(id),
            type: ALERT_MESSAGE_TYPE,
            body: `Notification for Disruption ${transformNo(id)} version ${version} is being created...`,
            tripId: undefined,
        };
    };

    return (
        <div className="control-notifications-view">
            <div className="mb-3">
                <h1>Notifications - Service Alerts</h1>
            </div>
            { props.useDisruptionsNotificationsDirectLink
                && (isQueryParamsValid || (isQueryIncidentParamsValid && props.useNotificationEffectColumn)) && isNew && showFeedbackMessage && (
                <>
                    <div className="row mb-3">
                        <div className="col-md-6 offset-md-3">
                            <Message
                                autoDismiss={ false }
                                isDismissible={ false }
                                zIndex={ 1000 }
                                message={ getAlertMessage() } />
                        </div>
                    </div>
                    <div className="notification-page-overlay">
                        <Loader className="position-fixed" />
                    </div>
                </>
            ) }
            <CustomDataGrid
                columns={ GRID_COLUMNS }
                datagridConfig={ props.datagridConfig }
                dataSource={ props.notifications }
                updateDatagridConfig={ config => props.updateNotificationsDatagridConfig(config) }
                getDetailPanelContent={ getDetailPanelContent }
                getRowId={ row => row.notificationContentId }
                rowCount={ props.rowCount }
                getRowClassName={ getRowClassName }
                detailPanelHeight={ 470 }
                expandedDetailPanels={ props.selectedNotification ? [props.selectedNotification.notificationContentId] : null }
                loading={ isQueryParamsValid && !isNew && props.notifications.length === 0 && !props.selectedNotification }
                onRowExpanded={ ids => updateActiveNotification(ids) }
                serverSideData
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
    updateQueryParams: PropTypes.func.isRequired,
    updateSelectedNotification: PropTypes.func.isRequired,
    selectedNotification: PropTypes.object,
    goToDisruptionsView: PropTypes.func.isRequired,
    goToIncidentsView: PropTypes.func.isRequired,
    useDisruptionsNotificationsDirectLink: PropTypes.bool.isRequired,
    useNotificationEffectColumn: PropTypes.bool.isRequired,
};

NotificationsView.defaultProps = {
    selectedNotification: null,
};

export default connect(
    state => ({
        notifications: getAllNotifications(state),
        datagridConfig: getNotificationsDatagridConfig(state),
        rowCount: getNotificationsFilterCount(state),
        selectedNotification: getSelectedNotification(state),
        useDisruptionsNotificationsDirectLink: useDisruptionsNotificationsDirectLink(state),
        useNotificationEffectColumn: useNotificationEffectColumn(state),
    }),
    {
        updateNotificationsDatagridConfig,
        filterNotifications,
        getStopGroups,
        updateQueryParams,
        updateSelectedNotification,
        goToDisruptionsView,
        goToIncidentsView,
    },
)(NotificationsView);
