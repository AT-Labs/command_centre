import React from 'react';
import { FaPaperclip } from 'react-icons/fa';
import { RiMailCheckLine, RiDraftLine } from 'react-icons/ri';
import { BsArrowRepeat, BsPencilSquare, BsAlarm, BsFillChatTextFill } from 'react-icons/bs';
import { GoAlert } from 'react-icons/go';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { Box, IconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { uniqueId } from 'lodash-es';
import moment from 'moment';
import './IncidentsDataGrid.scss';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import MinimizeDisruptionDetail from '../DisruptionsView/DisruptionDetailView/MinimizeDisruptionDetail';
import { clearActiveIncident,
    updateActiveIncident,
    updateEditMode,
    setIncidentToUpdate,
    setIncidentLoaderState,
    updateIncidentsDatagridConfig,
    updateActiveDisruptionId,
    updateCopyDisruptionState } from '../../../redux/actions/control/incidents';
import {
    getActiveIncident,
    getIncidentsLoadingState,
    getIncidentsWithDisruptions,
    getIncidentsDatagridConfig,
} from '../../../redux/selectors/control/incidents';
import { getActiveDisruptionId } from '../../../redux/selectors/control/disruptions';
import { goToNotificationsView } from '../../../redux/actions/control/link';
import { useViewDisruptionDetailsPage } from '../../../redux/selectors/appSettings';
import { STATUSES } from '../../../types/disruptions-types';
import { dateTimeFormat } from '../../../utils/dateUtils';
import RenderCellExpand from '../Alerts/RenderCellExpand/RenderCellExpand';
import { useAlertEffects } from '../../../utils/control/alert-cause-effect';
import EDIT_TYPE from '../../../types/edit-types';
import { sourceIdDataGridOperator } from '../Notifications/sourceIdDataGridOperator';

export const IncidentsDataGrid = (props) => {
    const impacts = useAlertEffects();

    const getStatusIcon = (value) => {
        if (!value) {
            return '';
        }
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

    const getDisruptionLabel = (disruption) => {
        if (!disruption.incidentNo) {
            return '';
        }
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

    const getDeduplcatedAffectedRoutes = (affectedEntities) => {
        if (affectedEntities?.length > 0) {
            return [...new Set(affectedEntities.filter(entity => entity.routeId).map(({ routeShortName }) => routeShortName))].join(', ');
        }
        return '';
    };

    const getDeduplcatedAffectedStops = (affectedEntities) => {
        if (affectedEntities?.length > 0) {
            return [...new Set(affectedEntities.filter(entity => entity.stopCode).map(({ stopCode }) => stopCode))].join(', ');
        }
        return '';
    };

    const getReadableImpact = (impact) => {
        if (!impact || impact.length === 0) {
            return '';
        }
        const arrImpacts = impact.slice(',');
        const readableImpacts = impacts.filter(imp => arrImpacts.includes(imp.value)).map(imp => imp.label)
            .filter(str => str !== '' && str !== null && str !== undefined);
        return readableImpacts.join(', ');
    };

    const getViewNotificationButtons = (row, source, callback = () => {}) => {
        const { disruptionId, version, status } = row;
        return disruptionId
            ? (
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
                </Tooltip>
            )
            : [];
    };

    const getIncidentsButton = incident => (
        [
            <Tooltip title="Open & Edit Incident" placement="top-end" key={ uniqueId(incident.incidentId) }>
                <IconButton aria-label="open-edit-incident"
                    onClick={ () => {
                        props.setIncidentToUpdate(incident.incidentId, incident.incidentNo);
                        props.updateEditMode(EDIT_TYPE.EDIT);
                    } }>
                    <BsPencilSquare />
                </IconButton>
            </Tooltip>,
        ]
    );

    const INCIDENT_COLUMNS = [
        {
            field: 'incidentDisruptionNo',
            headerName: '#DISRUPTION',
            width: 130,
            type: 'string',
            renderCell: RenderCellExpand,
        },
        {
            field: 'header',
            headerName: 'DISRUPTION TITLE',
            width: 250,
            type: 'string',
            renderCell: RenderCellExpand,
        },
        {
            field: 'incidentNo',
            headerName: '#EFFECT',
            width: 150,
            renderCell: params => getDisruptionLabel(params.row),
            filterOperators: sourceIdDataGridOperator,
        },
        {
            field: 'affectedRoutes',
            headerName: 'ROUTES',
            width: 200,
            valueGetter: params => getDeduplcatedAffectedRoutes(params.row.affectedEntities),
            renderCell: RenderCellExpand,
            filterable: false,
        },
        {
            field: 'affectedStops',
            headerName: 'STOPS',
            width: 200,
            valueGetter: params => getDeduplcatedAffectedStops(params.row.affectedEntities),
            renderCell: RenderCellExpand,
            filterable: false,
        },
        {
            field: 'impact',
            headerName: 'EFFECTS',
            width: 200,
            type: 'singleSelect',
            valueGetter: params => getReadableImpact(params.row.impact),
            valueOptions: impacts.slice(1, impacts.length).map(impact => impact.label),
        },
        {
            field: 'startTime',
            headerName: 'START TIME',
            width: 150,
            valueFormatter: params => (params.value ? moment(params.value).format(dateTimeFormat) : ''),
            type: 'dateTime',
        },
        {
            field: 'endTime',
            headerName: 'END TIME',
            width: 150,
            valueFormatter: params => (params.value ? moment(params.value).format(dateTimeFormat) : ''),
            type: 'dateTime',
        },
        {
            field: 'status',
            headerName: 'STATUS',
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
            field: '__go_to_disruption_details__',
            type: 'actions',
            headerName: 'OPEN DISRUPTION',
            width: 55,
            renderHeader: () => (<span />),
            getActions: params => getIncidentsButton(params.row),
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
            row.disruptionId
                && (
                    <Box sx={ { padding: '10px 10px 10px 10px' } }>
                        <MinimizeDisruptionDetail disruption={ row } />
                    </Box>
                )
        ),
        [],
    );

    const updateActiveDisruption = (ids) => {
        if (ids?.length > 0) {
            props.updateActiveDisruptionId(ids[0]);
        } else {
            props.updateActiveDisruptionId(null);
        }
        props.updateCopyDisruptionState(false);
    };

    const calculateDetailPanelHeight = row => (row.recurrent ? 1080 : 1000);

    const getRowId = incident => (incident.disruptionId ? `${incident.incidentId}${incident.disruptionId}` : incident.incidentId);

    const groupingColDef = {
        headerName: '',
        hideDescendantCount: true,
        valueFormatter: () => '',
        width: 30,
    };

    const addPath = (incidents) => {
        incidents.sort((a, b) => b.incidentId - a.incidentId);
        const res = incidents.map((incident) => {
            if (incident.disruptionId !== null && incident.disruptionId !== undefined) {
                return { ...incident, path: [incident.incidentDisruptionNo ? incident.incidentDisruptionNo : 'No Parent Incident', incident.incidentNo] };
            }
            return { ...incident, path: [incident.incidentDisruptionNo || incident.incidentId] };
        });
        return res;
    };

    const incidentWithPath = addPath(props.mergedIncidentsAndDisruptions);

    const { activeIncident } = props;
    const activeIncidentId = activeIncident ? getRowId(activeIncident) : null;

    const activeDisruptionCompositeId = React.useMemo(() => {
        if (!props.activeDisruptionId) return null;
        const disruptionRow = incidentWithPath.find(row => row.disruptionId === props.activeDisruptionId);
        return disruptionRow ? getRowId(disruptionRow) : null;
    }, [props.activeDisruptionId, incidentWithPath]);

    const initialState = activeIncidentId ? {
        treeData: {
            expansion: {
                [activeIncidentId]: true,
            },
        },
    } : {};

    React.useEffect(() => {
        if (!activeIncidentId || !props.clearActiveIncident) {
            return undefined;
        }

        const timer = setTimeout(() => {
            props.clearActiveIncident();
        }, 500);

        return () => clearTimeout(timer);
    }, [activeIncidentId, props.clearActiveIncident]);

    return (
        <div>
            <CustomDataGrid
                columns={ INCIDENT_COLUMNS }
                datagridConfig={ props.datagridConfig }
                dataSource={ incidentWithPath }
                getDetailPanelContent={ getDetailPanelContent }
                getRowId={ getRowId }
                updateDatagridConfig={ config => props.updateIncidentsDatagridConfig(config) }
                treeData
                getTreeDataPath={ row => row.path }
                groupingColDef={ groupingColDef }
                loading={ props.isLoading }
                getRowClassName={ params => (params.row.disruptionId ? 'incidents-custom-data-grid-child-row' : 'incidents-custom-data-grid-parent-row') }
                calculateDetailPanelHeight={ props.useViewDisruptionDetailsPage ? () => 400 : calculateDetailPanelHeight }
                expandedDetailPanels={ activeDisruptionCompositeId ? [activeDisruptionCompositeId] : null }
                onRowExpanded={ ids => updateActiveDisruption(ids) }
                initialState={ initialState }
                autoExpandActiveIncident={ activeIncidentId }
            />
        </div>
    );
};

IncidentsDataGrid.propTypes = {
    datagridConfig: PropTypes.object.isRequired,
    mergedIncidentsAndDisruptions: PropTypes.array,
    activeDisruptionId: PropTypes.number,
    activeIncident: PropTypes.object,
    updateActiveDisruptionId: PropTypes.func.isRequired,
    updateCopyDisruptionState: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    updateEditMode: PropTypes.func.isRequired,
    setIncidentToUpdate: PropTypes.func.isRequired,
    updateIncidentsDatagridConfig: PropTypes.func.isRequired,
    goToNotificationsView: PropTypes.func.isRequired,
    useViewDisruptionDetailsPage: PropTypes.bool.isRequired,
    clearActiveIncident: PropTypes.func.isRequired,
};

IncidentsDataGrid.defaultProps = {
    mergedIncidentsAndDisruptions: [],
    activeDisruptionId: null,
    activeIncident: null,
};

export default connect(
    state => ({
        datagridConfig: getIncidentsDatagridConfig(state),
        activeIncident: getActiveIncident(state),
        activeDisruptionId: getActiveDisruptionId(state),
        isLoading: getIncidentsLoadingState(state),
        useViewDisruptionDetailsPage: useViewDisruptionDetailsPage(state),
        mergedIncidentsAndDisruptions: getIncidentsWithDisruptions(state),
    }),
    {
        updateActiveDisruptionId,
        updateIncidentsDatagridConfig,
        updateCopyDisruptionState,
        clearActiveIncident,
        updateActiveIncident,
        updateEditMode,
        setIncidentToUpdate,
        setIncidentLoaderState,
        goToNotificationsView,
    },
)(IncidentsDataGrid);
