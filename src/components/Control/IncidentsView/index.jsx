import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { isEqual } from 'lodash-es';

import {
    getDisruptionsAndIncidents,
    openCreateIncident,
    updateEditMode,
    updateAffectedRoutesState,
    updateAffectedStopsState,
} from '../../../redux/actions/control/incidents';
import {
    isIncidentCreationAllowed,
    isIncidentCreationOpen,
    getFilteredDisruptions,
    getFilteredIncidents,
} from '../../../redux/selectors/control/incidents';
import { DISRUPTION_POLLING_INTERVAL } from '../../../constants/disruptions';
import Filters from './Filters/Filters';
import { getStopGroups } from '../../../redux/actions/control/dataManagement';
import EDIT_TYPE from '../../../types/edit-types';
import { PageInfo, Pagination } from '../../Common/Pagination/Pagination';
import './style.scss';
import IncidentsDataGrid from './IncidentsDataGrid';
import { PAGE_SIZE } from './types';
import CreateIncident from './IncidentCreation/CreateIncident/index';

export class IncidentsView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timer: undefined,
            currentPage: 1,
        };
    }

    static defaultProps = {
        filteredDisruptions: [],
        filteredIncidents: [],
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

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.isCreateOpen !== nextProps.isCreateOpen) {
            return true;
        }
        if (this.props.isCreateAllowed !== nextProps.isCreateAllowed) {
            return true;
        }
        if (this.state.currentPage !== nextState.currentPage) {
            return true;
        }
        return !isEqual(this.props.filteredDisruptions, nextProps.filteredDisruptions);
    }

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };

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
                Create a new Disruption
            </Button>
        </div>
    );

    render() {
        const { filteredDisruptions, filteredIncidents, isCreateAllowed, isCreateOpen } = this.props;
        const { currentPage } = this.state;

        // Calculate paginated data
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const paginatedIncidents = filteredIncidents.slice(startIndex, startIndex + PAGE_SIZE);
        return (
            <div className="control-incidents-view">
                {!isCreateOpen
                    && (
                        <div className="ml-4 mr-4">
                            <div className="control-incidents-view__header mt-4">
                                <div>
                                    <h1>Disruptions</h1>
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
                                page={ currentPage }
                                disruptions={ filteredDisruptions }
                                incidents={ paginatedIncidents } />
                            <PageInfo
                                currentPage={ currentPage }
                                itemsPerPage={ PAGE_SIZE }
                                itemsTotal={ filteredIncidents.length }
                            />
                            <Pagination
                                currentPage={ currentPage }
                                itemsTotal={ filteredIncidents.length }
                                itemsPerPage={ PAGE_SIZE }
                                onPageClick={ page => this.handlePageChange(page) }
                            />
                        </div>
                    )}
                {isCreateOpen && isCreateAllowed && <CreateIncident />}
            </div>
        );
    }
}

IncidentsView.propTypes = {
    filteredDisruptions: PropTypes.array,
    filteredIncidents: PropTypes.array,
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
    filteredDisruptions: getFilteredDisruptions(state),
    filteredIncidents: getFilteredIncidents(state),
    isCreateOpen: isIncidentCreationOpen(state),
    isCreateAllowed: isIncidentCreationAllowed(state),
}), { getDisruptionsAndIncidents, openCreateIncident, updateEditMode, updateAffectedRoutesState, updateAffectedStopsState, getStopGroups })(IncidentsView);
