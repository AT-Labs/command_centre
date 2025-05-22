import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { isEqual } from 'lodash-es';

import { getDisruptionsAndIncidents, openCreateIncident, updateEditMode, updateAffectedRoutesState, updateAffectedStopsState } from '../../../redux/actions/control/incidents';
import {
    isIncidentCreationAllowed,
    isIncidentCreationOpen,
    getFilteredIncidents,
    getGroupedIncidents,
} from '../../../redux/selectors/control/incidents';
import { DISRUPTION_POLLING_INTERVAL } from '../../../constants/incidents';
import Filters from '../DisruptionsView/Filters/Filters';
import { getStopGroups } from '../../../redux/actions/control/dataManagement';
import EDIT_TYPE from '../../../types/edit-types';

import './style.scss';
import IncidentsDataGrid from './IncidentsDataGrid';

export class IncidentsView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timer: undefined,
        };
    }

    static defaultProps = {
        filteredDisruptions: [],
        groupedIncidents: [],
        isCreateOpen: false,
    };

    componentDidMount() {
        this.getDisruptionsAndIncidents();
        this.props.getStopGroups();
    }

    getDisruptionsAndIncidents = () => {
        if (!this.props.isCreateOpen) {
            this.props.getDisruptionsAndIncidents();
        }
        const timer = setTimeout(() => {
            this.getDisruptionsAndIncidents();
        }, DISRUPTION_POLLING_INTERVAL);
        this.setState({
            timer,
        });
    };

    componentWillUnmount() {
        clearTimeout(this.state.timer);
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.isCreateOpen !== nextProps.isCreateOpen) {
            return true;
        }
        if (this.props.isCreateAllowed !== nextProps.isCreateAllowed) {
            return true;
        }
        return !isEqual(this.props.filteredDisruptions, nextProps.filteredDisruptions);
    }

    createIncidentButton = () => (
        <div className="incident-creation">
            <Button
                className="cc-btn-primary incident-creation__create"
                onClick={ () => {
                    this.props.openCreateIncident(true);
                    this.props.updateEditMode(EDIT_TYPE.CREATE);
                    this.props.updateAffectedRoutesState([]);
                    this.props.updateAffectedStopsState([]);
                } }>
                Create a new Cause
            </Button>
        </div>
    );

    render() {
        const { filteredDisruptions, groupedIncidents, isCreateAllowed, isCreateOpen } = this.props;
        return (
            <div className="control-incidents-view">
                {!isCreateOpen
                    && (
                        <div className="ml-4 mr-4">
                            <div className="control-incidents-view__header mt-4">
                                <div>
                                    <h1>Causes</h1>
                                </div>
                                <div className="d-flex justify-content-end align-items-center">
                                    { isCreateAllowed && this.createIncidentButton() }
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <Filters />
                                </div>
                            </div>
                            <IncidentsDataGrid
                                disruptions={ filteredDisruptions }
                                incidents={ groupedIncidents } />
                        </div>
                    )}
            </div>
        );
    }
}

IncidentsView.propTypes = {
    filteredDisruptions: PropTypes.array,
    groupedIncidents: PropTypes.array,
    getDisruptionsAndIncidents: PropTypes.func.isRequired,
    isCreateAllowed: PropTypes.bool.isRequired,
    isCreateOpen: PropTypes.bool,
    openCreateIncident: PropTypes.func.isRequired,
    updateEditMode: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    getStopGroups: PropTypes.func.isRequired,
};

export default connect(state => ({
    filteredDisruptions: getFilteredIncidents(state),
    groupedIncidents: getGroupedIncidents(state),
    isCreateOpen: isIncidentCreationOpen(state),
    isCreateAllowed: isIncidentCreationAllowed(state),
}), { getDisruptionsAndIncidents, openCreateIncident, updateEditMode, updateAffectedRoutesState, updateAffectedStopsState, getStopGroups })(IncidentsView);
