import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { BsPencilSquare } from 'react-icons/bs';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { slice, uniqueId } from 'lodash-es';
import './IncidentsDataGrid.scss';
import { IncidentType, PAGE_SIZE } from './types';
import ControlTable from '../Common/ControlTable/ControlTable';
import { clearActiveIncident, updateActiveIncident, updateIncidentsSortingParams } from '../../../redux/actions/control/incidents';
import { getActiveIncident, getIncidentsLoadingState, getIncidentsSortingParams, getSortedIncidents } from '../../../redux/selectors/control/incidents';
import IncidentsDisruptions from './IncidentsDisruptions';
import { useViewDisruptionDetailsPage } from '../../../redux/selectors/appSettings';
import SortButton from '../Common/SortButton/SortButton';
import { useAlertEffects } from '../../../utils/control/alert-cause-effect';

export const IncidentDataGrid = (props) => {
    const impacts = useAlertEffects();
    const filteredIncidents = slice(props.incidents, (props.page - 1) * PAGE_SIZE, props.page * PAGE_SIZE);

    const renderRowBody = activeIncident => (
        <div className="incident-row-body">
            <IncidentsDisruptions disruptions={ props.disruptions.filter(disruption => disruption.incidentId === activeIncident.incidentId) } />
        </div>
    );

    const isRowActive = incident => !!(props.activeIncident && (props.activeIncident.incidentId === incident.incidentId));

    const handleIncidentClick = (incident) => {
        if (isRowActive(incident)) {
            props.clearActiveIncident();
        } else {
            props.clearActiveIncident();
            props.updateActiveIncident(incident.incidentId);
        }
    };

    const getDeduplcatedAffectedRoutes = affectedEntities => [...new Set(affectedEntities.filter(entity => entity.routeId).map(({ routeShortName }) => routeShortName))].join(', ');

    const getDeduplcatedAffectedStops = affectedEntities => [...new Set(affectedEntities.filter(entity => entity.stopCode).map(({ stopCode }) => stopCode))].join(', ');

    const getReadableImpact = (impact) => {
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
                        window.open(`/control-main-view/control-incidents/${incident.incidentId.toString()}`, '_blank');
                    } }>
                    <BsPencilSquare />
                </IconButton>
            </Tooltip>,
        ]
    );

    const getSortButton = (sortBy, title) => (
        [
            <div className="d-flex align-content-center">
                <SortButton
                    className="mr-1"
                    active={
                        props.incidentsSortingParams && props.incidentsSortingParams.sortBy === sortBy
                            ? props.incidentsSortingParams.order
                            : null
                    }
                    onClick={ order => props.updateIncidentsSortingParams({
                        sortBy,
                        order,
                    }) } />
                <div>{title}</div>
            </div>,
        ]
    );

    const INCIDENT_COLUMNS = [
        {
            label: () => getSortButton('incidentDisruptionNo', 'DISRUPTION'),
            key: 'incidentDisruptionNo',
            cols: 'col-1',
        },
        {
            label: () => getSortButton('incidentTitle', 'DISRUPTION TITLE'),
            key: 'incidentTitle',
            cols: 'col-2',
        },
        {
            label: 'AFFECTED ROUTES',
            key: 'affectedEntities',
            cols: 'col-3',
            getContent: (incident, key) => getDeduplcatedAffectedRoutes(incident[key]),
        },
        {
            label: 'AFFECTED STOPS',
            key: 'affectedEntities',
            cols: 'col-3',
            getContent: (incident, key) => getDeduplcatedAffectedStops(incident[key]),
        },
        {
            label: 'EFFECTS',
            key: 'impact',
            cols: 'col-2',
            getContent: (incident, key) => getReadableImpact(incident[key]),
        },
    ];

    if (props.useViewDisruptionDetailsPage) {
        INCIDENT_COLUMNS.push(
            {
                label: 'ACTIONS',
                key: 'incidentId',
                cols: 'col-1',
                getContent: incident => getIncidentsButton(incident),
            },
        );
    }

    const getRowId = incident => incident.incidentId;

    return (
        <ControlTable
            columns={ INCIDENT_COLUMNS }
            data={ filteredIncidents }
            getRowId={ getRowId }
            isLoading={ props.isLoading }
            rowOnClick={ handleIncidentClick }
            rowActive={ isRowActive }
            rowBody={ renderRowBody } />
    );
};

IncidentDataGrid.propTypes = {
    page: PropTypes.number,
    disruptions: PropTypes.array,
    incidents: PropTypes.array,
    activeIncident: IncidentType,
    isLoading: PropTypes.bool.isRequired,
    clearActiveIncident: PropTypes.func.isRequired,
    updateActiveIncident: PropTypes.func.isRequired,
    useViewDisruptionDetailsPage: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    incidentsSortingParams: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    updateIncidentsSortingParams: PropTypes.func.isRequired,
};

IncidentDataGrid.defaultProps = {
    page: 1,
    disruptions: [],
    incidents: [],
    activeIncident: null,
};

export default connect(
    state => ({
        incidents: getSortedIncidents(state),
        activeIncident: getActiveIncident(state),
        incidentsSortingParams: getIncidentsSortingParams(state),
        isLoading: getIncidentsLoadingState(state),
        useViewDisruptionDetailsPage: useViewDisruptionDetailsPage(state),
    }),
    {
        clearActiveIncident,
        updateActiveIncident,
        updateIncidentsSortingParams,
    },
)(IncidentDataGrid);
