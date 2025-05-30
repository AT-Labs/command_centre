import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaPaperclip } from 'react-icons/fa';
import { RiMailCheckLine, RiDraftLine } from 'react-icons/ri';
import { BsArrowRepeat, BsAlarm, BsFillChatTextFill, BsPencilSquare } from 'react-icons/bs';
import moment from 'moment';
import { GoAlert } from 'react-icons/go';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { uniqueId } from 'lodash-es';
import { Box, IconButton, Tooltip } from '@mui/material';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import DisruptionDetail from './DisruptionDetail';
import MinimizeDisruptionDetail from './DisruptionDetailView/MinimizeDisruptionDetail';
import {
    LABEL_AFFECTED_ROUTES, LABEL_AFFECTED_STOPS,
    LABEL_CAUSE, LABEL_CREATED_AT, LABEL_CREATED_BY, LABEL_CUSTOMER_IMPACT, LABEL_DESCRIPTION, LABEL_DISRUPTION, LABEL_END_TIME,
    LABEL_HEADER,
    LABEL_LAST_UPDATED_AT,
    LABEL_MODE, LABEL_START_TIME, LABEL_STATUS, LABEL_WORKAROUNDS, LABEL_DISRUPTION_NOTES, LABEL_SEVERITY, LABEL_PASSENGER_IMPACT,
} from '../../../constants/disruptions';
import { dateTimeFormat } from '../../../utils/dateUtils';
import { SEVERITIES, DEFAULT_SEVERITY, STATUSES, PASSENGER_IMPACT_RANGE } from '../../../types/disruptions-types';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../types/disruption-cause-and-effect';
import { getActiveDisruptionId, getDisruptionsDatagridConfig } from '../../../redux/selectors/control/disruptions';
import { updateDisruptionsDatagridConfig, updateActiveDisruptionId, updateCopyDisruptionState } from '../../../redux/actions/control/disruptions';
import { sourceIdDataGridOperator } from '../Notifications/sourceIdDataGridOperator';

import './DisruptionsDataGrid.scss';
import RenderCellExpand from '../Alerts/RenderCellExpand/RenderCellExpand';
import { getDeduplcatedAffectedRoutes, getDeduplcatedAffectedStops, getPassengerCountRange } from '../../../utils/control/disruptions';
import { getWorkaroundsAsText } from '../../../utils/control/disruption-workarounds';
import { usePassengerImpact, useDisruptionsNotificationsDirectLink, useViewDisruptionDetailsPage } from '../../../redux/selectors/appSettings';
import { goToNotificationsView } from '../../../redux/actions/control/link';
import { useAlertCauses, useAlertEffects } from '../../../utils/control/alert-cause-effect';

const getDisruptionLabel = (disruption) => {
    const { uploadedFiles, incidentNo, createNotification, recurrent } = disruption;

    return (
        <span>
            { incidentNo }
            { uploadedFiles && uploadedFiles.length > 0 && <FaPaperclip size={ 12 } className="ml-1" />}
            {' '}
            { createNotification && <RiMailCheckLine size={ 14 } className="ml-1" /> }
            {' '}
            { recurrent && <BsArrowRepeat size={ 14 } className="ml-1" /> }
            {' '}
        </span>
    );
};

const getStatusIcon = (value) => {
    if (value === STATUSES.IN_PROGRESS) {
        return <GoAlert className="icon-in-progress mr-1" />;
    }
    if (value === STATUSES.NOT_STARTED) {
        return <BsAlarm className="icon-not-started mr-1" />;
    }
    if (value === STATUSES.DRAFT) {
        return <RiDraftLine className="icon-draft mr-1" />;
    }

    return <HiOutlineCheckCircle className="mr-1" />;
};

const getViewNotificationButtons = (row, source, callback = () => {}) => {
    const { disruptionId, version, status } = row;

    return (
        [
            <Tooltip title="View notification" placement="top-end" key={ uniqueId(disruptionId) }>
                <span>
                    <IconButton
                        aria-label="view-notification"
                        onClick={ () => { callback({ disruptionId, version, source }); } }
                        disabled={ status === STATUSES.DRAFT }
                    >
                        <BsFillChatTextFill />
                    </IconButton>
                </span>
            </Tooltip>,
        ]
    );
};

const getViewDisruptionDetailsButton = row => (
    [
        <Tooltip title="Open & Edit Disruption" placement="top-end" key={ uniqueId(row.disruptionId) }>
            <IconButton aria-label="open-edit-disruption"
                onClick={ () => {
                    window.open(`/control-main-view/control-disruptions/${row.disruptionId.toString()}`, '_blank');
                } }>
                <BsPencilSquare />
            </IconButton>
        </Tooltip>,
    ]
);

export const DisruptionsDataGrid = (props) => {
    const causes = useAlertCauses();
    const impacts = useAlertEffects();

    const GRID_COLUMNS = [
        {
            field: 'incidentNo',
            headerName: LABEL_DISRUPTION,
            width: 200,
            renderCell: params => getDisruptionLabel(params.row),
            filterOperators: sourceIdDataGridOperator,
        },
        {
            field: 'mode',
            headerName: LABEL_MODE,
            width: 200,
            type: 'string',
            hide: true,
        },
        {
            field: 'header',
            headerName: LABEL_HEADER,
            width: 250,
            type: 'string',
            renderCell: RenderCellExpand,
        },
        {
            field: 'affectedRoutes',
            headerName: LABEL_AFFECTED_ROUTES,
            width: 150,
            valueGetter: params => getDeduplcatedAffectedRoutes(params.row.affectedEntities).join(', '),
            renderCell: RenderCellExpand,
            filterable: false,
        },
        {
            field: 'affectedStops',
            headerName: LABEL_AFFECTED_STOPS,
            width: 200,
            valueGetter: params => getDeduplcatedAffectedStops(params.row.affectedEntities).join(', '),
            renderCell: RenderCellExpand,
            filterable: false,
        },
        {
            field: 'impact',
            headerName: LABEL_CUSTOMER_IMPACT,
            width: 200,
            type: 'singleSelect',
            valueGetter: params => (impacts.find(impact => impact.value === params.value) || DEFAULT_IMPACT).label,
            valueOptions: impacts.slice(1, impacts.length).map(impact => impact.label),
        },
        {
            field: 'cause',
            headerName: LABEL_CAUSE,
            width: 200,
            type: 'singleSelect',
            valueGetter: params => (causes.find(cause => cause.value === params.value) || DEFAULT_CAUSE).label,
            valueOptions: causes.slice(1, causes.length).map(cause => cause.label),
        },
        {
            field: 'severity',
            headerName: LABEL_SEVERITY,
            width: 200,
            type: 'singleSelect',
            valueGetter: params => (SEVERITIES.find(severity => severity.value === params.value) || DEFAULT_SEVERITY).label,
            valueOptions: SEVERITIES.slice(1, SEVERITIES.length).map(severity => severity.label),
        },
        {
            field: 'workarounds',
            headerName: LABEL_WORKAROUNDS,
            width: 150,
            valueGetter: params => getWorkaroundsAsText(params.value),
            type: 'string',
            renderCell: RenderCellExpand,
        },
        {
            field: 'startTime',
            headerName: LABEL_START_TIME,
            width: 150,
            valueFormatter: params => (params.value ? moment(params.value).format(dateTimeFormat) : ''),
            type: 'dateTime',
        },
        {
            field: 'endTime',
            headerName: LABEL_END_TIME,
            width: 150,
            valueFormatter: params => (params.value ? moment(params.value).format(dateTimeFormat) : ''),
            type: 'dateTime',
        },
        {
            field: 'status',
            headerName: LABEL_STATUS,
            width: 150,
            renderCell: params => (
                <>
                    {getStatusIcon(params.value)}
                    {params.value}
                </>
            ),
            type: 'singleSelect',
            valueOptions: Object.values(STATUSES),
        },
        {
            field: 'createdTime',
            headerName: LABEL_CREATED_AT,
            width: 150,
            type: 'dateTime',
            valueFormatter: params => (params.value ? moment(params.value).format(dateTimeFormat) : ''),
            hide: true,
        },
        {
            field: 'lastUpdatedTime',
            headerName: LABEL_LAST_UPDATED_AT,
            width: 150,
            type: 'dateTime',
            valueFormatter: params => (params.value ? moment(params.value).format(dateTimeFormat) : ''),
            hide: true,
        },
        {
            field: 'createdBy',
            headerName: LABEL_CREATED_BY,
            width: 250,
            type: 'string',
            hide: true,
        },
        {
            field: 'description',
            headerName: LABEL_DESCRIPTION,
            width: 200,
            type: 'string',
            hide: true,
            renderCell: RenderCellExpand,
        },
        {
            field: 'notes',
            headerName: LABEL_DISRUPTION_NOTES,
            width: 200,
            hide: true,
            valueGetter: params => (params.value ? [...params.value].reverse().map(note => note.description).join('; \n') : ''),
            renderCell: RenderCellExpand,
        },
    ];

    if (props.useDisruptionsNotificationsDirectLink) {
        GRID_COLUMNS.push(
            {
                field: '__go_to_notification__',
                type: 'actions',
                headerName: 'OPEN NOTIFICATION ACTION',
                width: 55,
                renderHeader: () => (<span />),
                renderCell: params => getViewNotificationButtons(params.row, 'DISR', props.goToNotificationsView),
            },
        );
    }

    if (props.usePassengerImpact) {
        GRID_COLUMNS.push(
            {
                field: 'passengerCount',
                headerName: LABEL_PASSENGER_IMPACT,
                width: 200,
                hide: false,
                valueGetter: params => (params.value ? getPassengerCountRange(params.value) : 'No records found'),
                renderCell: RenderCellExpand,
                type: 'singleSelect',
                valueOptions: Object.values(PASSENGER_IMPACT_RANGE),
            },
        );
    }

    if (props.useViewDisruptionDetailsPage) {
        GRID_COLUMNS.push(
            {
                field: '__go_to_disruption_details__',
                headerName: 'OPEN DISRUPTION DETAILS',
                type: 'actions',
                width: 55,
                renderHeader: () => (<span />),
                getActions: params => getViewDisruptionDetailsButton(params.row),
            },
        );
    }

    const getDetailPanelContent = React.useCallback(
        ({ row }) => (
            <Box sx={ { padding: '16px 16px 10px 16px' } }>
                { props.useViewDisruptionDetailsPage ? <MinimizeDisruptionDetail disruption={ row } /> : <DisruptionDetail disruption={ row } /> }
            </Box>
        ),
        [],
    );

    const calculateDetailPanelHeight = row => (row.recurrent ? 1080 : 1000);

    const updateActiveDisruption = (ids) => {
        if (ids && ids.length > 0) {
            props.updateActiveDisruptionId(ids[0]);
        } else {
            props.updateActiveDisruptionId(null);
        }
        props.updateCopyDisruptionState(false);
    };

    return (
        <div>
            <CustomDataGrid
                columns={ GRID_COLUMNS }
                datagridConfig={ props.datagridConfig }
                dataSource={ props.disruptions }
                updateDatagridConfig={ config => props.updateDisruptionsDatagridConfig(config) }
                getDetailPanelContent={ getDetailPanelContent }
                getRowId={ row => row.disruptionId }
                calculateDetailPanelHeight={ props.useViewDisruptionDetailsPage ? () => 400 : calculateDetailPanelHeight }
                expandedDetailPanels={ props.activeDisruptionId ? [props.activeDisruptionId] : null }
                onRowExpanded={ ids => updateActiveDisruption(ids) }
            />
        </div>
    );
};

DisruptionsDataGrid.propTypes = {
    datagridConfig: PropTypes.object.isRequired,
    disruptions: PropTypes.array,
    updateDisruptionsDatagridConfig: PropTypes.func.isRequired,
    activeDisruptionId: PropTypes.number,
    updateActiveDisruptionId: PropTypes.func.isRequired,
    updateCopyDisruptionState: PropTypes.func.isRequired,
    usePassengerImpact: PropTypes.bool.isRequired,
    goToNotificationsView: PropTypes.func.isRequired,
    useDisruptionsNotificationsDirectLink: PropTypes.bool.isRequired,
    useViewDisruptionDetailsPage: PropTypes.bool.isRequired,
};

DisruptionsDataGrid.defaultProps = {
    disruptions: [],
    activeDisruptionId: null,
};

export default connect(
    state => ({
        datagridConfig: getDisruptionsDatagridConfig(state),
        activeDisruptionId: getActiveDisruptionId(state),
        usePassengerImpact: usePassengerImpact(state),
        useDisruptionsNotificationsDirectLink: useDisruptionsNotificationsDirectLink(state),
        useViewDisruptionDetailsPage: useViewDisruptionDetailsPage(state),
    }),
    {
        updateDisruptionsDatagridConfig, updateActiveDisruptionId, updateCopyDisruptionState, goToNotificationsView,
    },
)(DisruptionsDataGrid);
