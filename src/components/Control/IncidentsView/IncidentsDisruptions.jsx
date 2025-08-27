import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaPaperclip } from 'react-icons/fa';
import { RiMailCheckLine, RiDraftLine } from 'react-icons/ri';
import { BsArrowRepeat, BsAlarm, BsFillChatTextFill } from 'react-icons/bs';
import moment from 'moment';
import { GoAlert } from 'react-icons/go';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { uniqueId } from 'lodash-es';
import { Box, IconButton, Tooltip } from '@mui/material';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import MinimizeDisruptionDetail from '../DisruptionsView/DisruptionDetailView/MinimizeDisruptionDetail';
import { LABEL_CUSTOMER_IMPACT, LABEL_DESCRIPTION, LABEL_END_TIME, LABEL_START_TIME, LABEL_STATUS, LABEL_DISRUPTION_NOTES,
} from '../../../constants/disruptions';
import { dateTimeFormat } from '../../../utils/dateUtils';
import { STATUSES } from '../../../types/disruptions-types';
import { DEFAULT_IMPACT } from '../../../types/disruption-cause-and-effect';
import { getActiveDisruptionId, getDisruptionsDatagridConfig } from '../../../redux/selectors/control/incidents';
import { updateDisruptionsDatagridConfig, updateActiveDisruptionId, updateCopyDisruptionState } from '../../../redux/actions/control/incidents';
import { sourceIdDataGridOperator } from '../Notifications/sourceIdDataGridOperator';

import './IncidentsDisruptions.scss';
import RenderCellExpand from '../Alerts/RenderCellExpand/RenderCellExpand';
import { getDeduplcatedAffectedRoutes, getDeduplcatedAffectedStops } from '../../../utils/control/disruptions';
import { useViewDisruptionDetailsPage } from '../../../redux/selectors/appSettings';
import { goToNotificationsView } from '../../../redux/actions/control/link';
import { useAlertEffects } from '../../../utils/control/alert-cause-effect';

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

export const IncidentsDisruptions = (props) => {
    const impacts = useAlertEffects();

    const GRID_COLUMNS = [
        {
            field: 'incidentNo',
            headerName: '#EFFECT',
            width: 150,
            renderCell: params => getDisruptionLabel(params.row),
            filterOperators: sourceIdDataGridOperator,
        },
        {
            field: 'header',
            headerName: 'Title',
            width: 250,
            type: 'string',
            renderCell: RenderCellExpand,
        },
        {
            field: 'affectedRoutes',
            headerName: 'ROUTES',
            width: 150,
            valueGetter: params => getDeduplcatedAffectedRoutes(params.row.affectedEntities).join(', '),
            renderCell: RenderCellExpand,
            filterable: false,
        },
        {
            field: 'affectedStops',
            headerName: 'STOPS',
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
            valueGetter: params => (impacts.find(impact => impact.value === params.row.impact) || DEFAULT_IMPACT).label,
            valueOptions: impacts.slice(1, impacts.length).map(impact => impact.label),
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
        {
            field: '__go_to_notification__',
            type: 'actions',
            headerName: 'OPEN NOTIFICATION ACTION',
            width: 55,
            renderHeader: () => (<span />),
            renderCell: params => getViewNotificationButtons(params.row, 'DISR', props.goToNotificationsView),
        },
    ];

    const getDetailPanelContent = React.useCallback(
        ({ row }) => (
            <Box sx={ { padding: '10px 10px 10px 10px' } }>
                <MinimizeDisruptionDetail disruption={ row } />
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
                gridClassNames="vh-50"
                calculateDetailPanelHeight={ props.useViewDisruptionDetailsPage ? () => 400 : calculateDetailPanelHeight }
                expandedDetailPanels={ props.activeDisruptionId ? [props.activeDisruptionId] : null }
                onRowExpanded={ ids => updateActiveDisruption(ids) }
            />
        </div>
    );
};

IncidentsDisruptions.propTypes = {
    datagridConfig: PropTypes.object.isRequired,
    disruptions: PropTypes.array,
    updateDisruptionsDatagridConfig: PropTypes.func.isRequired,
    activeDisruptionId: PropTypes.number,
    updateActiveDisruptionId: PropTypes.func.isRequired,
    updateCopyDisruptionState: PropTypes.func.isRequired,
    goToNotificationsView: PropTypes.func.isRequired,
    useViewDisruptionDetailsPage: PropTypes.bool.isRequired,
};

IncidentsDisruptions.defaultProps = {
    disruptions: [],
    activeDisruptionId: null,
};

export default connect(
    state => ({
        datagridConfig: getDisruptionsDatagridConfig(state),
        activeDisruptionId: getActiveDisruptionId(state),
        useViewDisruptionDetailsPage: useViewDisruptionDetailsPage(state),
    }),
    {
        updateDisruptionsDatagridConfig, updateActiveDisruptionId, updateCopyDisruptionState, goToNotificationsView,
    },
)(IncidentsDisruptions);
