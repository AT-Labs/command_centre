import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { BsPencilSquare } from 'react-icons/bs';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { slice, uniqueId } from 'lodash-es';
import './IncidentsDataGrid.scss';
import { PAGE_SIZE } from '../../../utils/control/disruptions';
import { IncidentType } from './types';
import ControlTable from '../Common/ControlTable/ControlTable';
import { clearActiveIncident, updateActiveIncident, updateIncidentsSortingParams } from '../../../redux/actions/control/incidents';
import { getActiveIncident, getIncidentsLoadingState, getIncidentsSortingParams, getSortedIncidents } from '../../../redux/selectors/control/incidents';
import IncidentsDisruptions from './IncidentsDisruptions';
import { useViewDisruptionDetailsPage } from '../../../redux/selectors/appSettings';
import SortButton from '../Common/SortButton/SortButton';

export const IncidentDataGrid = (props) => {
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

    const getIncidentsButton = (incident) => {
        console.log('getIncidentsButton', incident.incidentId);
        return (
            [
                <Tooltip title="Open & Edit Incident" placement="top-end" key={ uniqueId(incident.incidentId + '_button') }>
                    <IconButton aria-label="open-edit-incident"
                    //  key={ uniqueId(incident.incidentId + '_button') }
                        onClick={ () => {
                            console.log('click button');
                            window.open(`/control-main-view/control-incidents/${incident.incidentId.toString()}`, '_blank');
                        } }>
                        <BsPencilSquare />
                    </IconButton>
                </Tooltip>,
            ]
        );
    };

    const INCIDENT_COLUMNS = [
        {
            label: () => (
                <div className="d-flex align-content-center">
                    <SortButton
                        className="mr-1"
                        active={
                            props.incidentsSortingParams && props.incidentsSortingParams.sortBy === 'incidentCauseNo'
                                ? props.incidentsSortingParams.order
                                : null
                        }
                        onClick={ order => props.updateIncidentsSortingParams({
                            sortBy: 'incidentCauseNo',
                            order,
                        }) } />
                    <div>CAUSE</div>
                </div>
            ),
            key: 'incidentCauseNo',
            cols: 'col-1',
        },
        {
            label: () => (
                <div className="d-flex align-content-center">
                    <SortButton
                        className="mr-1"
                        active={
                            props.incidentsSortingParams && props.incidentsSortingParams.sortBy === 'incidentTitle'
                                ? props.incidentsSortingParams.order
                                : null
                        }
                        onClick={ order => props.updateIncidentsSortingParams({
                            sortBy: 'incidentTitle',
                            order,
                        }) } />
                    <div>CAUSE TITLE</div>
                </div>
            ),
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
        },
    ];

    if (props.useViewDisruptionDetailsPage) {
        INCIDENT_COLUMNS.push(
            {
                label: 'ACTIONS',
                key: 'incidentId',
                cols: 'col-1',
                getContent: (incident, key) => getIncidentsButton(incident[key]),
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
    incidentsSortingParams: PropTypes.object.isRequired,
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
