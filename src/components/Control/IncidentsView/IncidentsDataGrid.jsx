import React from 'react';
import { FaPaperclip } from 'react-icons/fa';
import { RiMailCheckLine, RiDraftLine } from 'react-icons/ri';
import { BsArrowRepeat, BsPencilSquare, BsAlarm } from 'react-icons/bs';
import { GoAlert } from 'react-icons/go';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { IconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { uniqueId } from 'lodash-es';
import moment from 'moment';
import './IncidentsDataGrid.scss';
import { IncidentType } from './types';
import CustomDataGrid from '../../Common/CustomDataGrid/CustomDataGrid';
import { clearActiveIncident,
    updateActiveIncident,
    updateIncidentsSortingParams,
    updateEditMode,
    setIncidentToUpdate,
    setIncidentLoaderState,
    updateIncidentsDatagridConfig } from '../../../redux/actions/control/incidents';
import {
    getActiveIncident,
    getIncidentsLoadingState,
    getIncidentsSortingParams,
    getIncidentsWithDisruptions,
    getIncidentsDatagridConfig,
} from '../../../redux/selectors/control/incidents';
import IncidentsDisruptions from './IncidentsDisruptions';
import { STATUSES } from '../../../types/disruptions-types';
import { dateTimeFormat } from '../../../utils/dateUtils';
import RenderCellExpand from '../Alerts/RenderCellExpand/RenderCellExpand';
import { useViewDisruptionDetailsPage } from '../../../redux/selectors/appSettings';
import { useAlertEffects } from '../../../utils/control/alert-cause-effect';
import EDIT_TYPE from '../../../types/edit-types';
import { sourceIdDataGridOperator } from '../Notifications/sourceIdDataGridOperator';

export const IncidentsDataGrid = (props) => {
    const impacts = useAlertEffects();
    const renderRowBody = activeIncident => (
        <div className="incident-row-body">
            <IncidentsDisruptions disruptions={ props.disruptions.filter(disruption => disruption.incidentId === activeIncident.incidentId) } />
        </div>
    );
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

    const getDeduplcatedAffectedRoutes = affectedEntities => {
        if (affectedEntities && affectedEntities.length > 0) {
            return [...new Set(affectedEntities.filter(entity => entity.routeId).map(({ routeShortName }) => routeShortName))].join(', ');
        }
        return '';
    };

    const getDeduplcatedAffectedStops = affectedEntities => {
        if (affectedEntities && affectedEntities.length > 0) {
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

    const getIncidentsButton = incident => (
        [
            <Tooltip title="Open & Edit Incident" placement="top-end" key={ uniqueId(incident.incidentId) }>
                <IconButton aria-label="open-edit-incident"
                    onClick={ () => {
                        // props.setIncidentLoaderState(true);
                        props.setIncidentToUpdate(incident.incidentId, incident.disruptionId);
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
            field: 'incidentId',
            headerName: '__go_to_disruption_details__',
            width: 200,
            type: 'actions',
            renderHeader: () => (<span />),
            getActions: params => getIncidentsButton(params.row),
            filterable: false,
        },
    ];

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

    return (
        <div>
            <CustomDataGrid
                columns={ INCIDENT_COLUMNS }
                datagridConfig={ props.datagridConfig }
                dataSource={ incidentWithPath }
                getRowId={ getRowId }
                updateDatagridConfig={ config => props.updateIncidentsDatagridConfig(config) }//
                autoHeight
                treeData
                getTreeDataPath={ row => row.path }
                gridClassNames="incidents-custom-data-grid-fit-content"
                groupingColDef={ groupingColDef }
                loading={ props.isLoading }
                getRowClassName={ params => (params.row.disruptionId ? 'incidents-custom-data-grid-child-row' : 'incidents-custom-data-grid-parent-row') }
            />
        </div>
    );
};

IncidentsDataGrid.propTypes = {
    datagridConfig: PropTypes.object.isRequired,
    disruptions: PropTypes.array,
    incidents: PropTypes.array,
    mergedIncidentsAndDisruptions: PropTypes.array,
    activeIncident: IncidentType,
    isLoading: PropTypes.bool.isRequired,
    clearActiveIncident: PropTypes.func.isRequired,
    updateActiveIncident: PropTypes.func.isRequired,
    useViewDisruptionDetailsPage: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    incidentsSortingParams: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    updateIncidentsSortingParams: PropTypes.func.isRequired,
    updateEditMode: PropTypes.func.isRequired,
    setIncidentToUpdate: PropTypes.func.isRequired,
    setIncidentLoaderState: PropTypes.func.isRequired,
    updateIncidentsDatagridConfig: PropTypes.func.isRequired,
};

IncidentsDataGrid.defaultProps = {
    mergedIncidentsAndDisruptions: [],
    disruptions: [],
    incidents: [],
    activeIncident: null,
};

export default connect(
    state => ({
        datagridConfig: getIncidentsDatagridConfig(state),
        activeIncident: getActiveIncident(state),
        incidentsSortingParams: getIncidentsSortingParams(state),
        isLoading: getIncidentsLoadingState(state),
        useViewDisruptionDetailsPage: useViewDisruptionDetailsPage(state),
        mergedIncidentsAndDisruptions: getIncidentsWithDisruptions(state),
    }),
    {
        updateIncidentsDatagridConfig,
        clearActiveIncident,
        updateActiveIncident,
        updateIncidentsSortingParams,
        updateEditMode,
        setIncidentToUpdate,
        setIncidentLoaderState,
    },
)(IncidentsDataGrid);
