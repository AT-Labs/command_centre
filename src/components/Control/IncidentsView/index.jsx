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
    getIncidentForEditLoadingState,
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
import EditEffectPanel from './IncidentCreation/EditIncidentDetails/EditEffectPanel';
import { useEditEffectPanel } from '../../../redux/selectors/appSettings';
import { isEditEffectPanelOpen, getDisruptionKeyToEditEffect } from '../../../redux/selectors/control/incidents';
import { toggleEditEffectPanel, updateDisruptionKeyToEditEffect } from '../../../redux/actions/control/incidents';
import LoadingOverlay from '../../Common/Overlay/LoadingOverlay';

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
        useEditEffectPanel: false,
        isIncidentLoading: false,
        isEditEffectPanelOpen: false,
        disruptionIncidentNoToEdit: '',
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

    componentDidUpdate(prevProps) {
        console.log('🔧 IncidentsView componentDidUpdate');
        console.log('🔧 useEditEffectPanel:', this.props.useEditEffectPanel);
        console.log('🔧 isEditEffectPanelOpen:', this.props.isEditEffectPanelOpen);
        console.log('🔧 disruptionIncidentNoToEdit:', this.props.disruptionIncidentNoToEdit);
        console.log('🔧 prevProps.disruptionIncidentNoToEdit:', prevProps.disruptionIncidentNoToEdit);
        console.log('🔧 filteredDisruptions length:', this.props.filteredDisruptions?.length);
        console.log('🔧 activeControlEntityId:', this.props.activeControlEntityId);
        
        // Auto-open Edit Effect Panel when we have a disruption to edit - DISABLED
        // if (this.props.useEditEffectPanel && 
        //     !this.props.isEditEffectPanelOpen && 
        //     this.props.disruptionIncidentNoToEdit && 
        //     this.props.filteredDisruptions && 
        //     this.props.filteredDisruptions.length > 0) {
            
        //     console.log('🔧 IncidentsView: Conditions met for opening EditEffectPanel');
            
        //     // Find the disruption to edit
        //     const disruptionToEdit = this.props.filteredDisruptions.find(
        //         d => d.disruptionId === parseInt(this.props.disruptionIncidentNoToEdit) || 
        //              d.incidentNo === this.props.disruptionIncidentNoToEdit
        //     );
            
        //     console.log('🔧 IncidentsView: Looking for disruption with ID:', this.props.disruptionIncidentNoToEdit);
        //     console.log('🔧 IncidentsView: First few disruptions:', this.props.filteredDisruptions.slice(0, 3).map(d => ({ disruptionId: d.disruptionId, incidentNo: d.incidentNo })));
        //     console.log('🔧 IncidentsView: Found disruption to edit:', disruptionToEdit);
            
        //     if (disruptionToEdit) {
        //         console.log('🔧 IncidentsView: Opening EditEffectPanel');
        //         this.props.updateDisruptionKeyToEditEffect(this.props.disruptionIncidentNoToEdit);
        //         this.props.toggleEditEffectPanel(true);
        //         console.log('🔧 IncidentsView: EditEffectPanel opened');
        //     } else {
        //         console.log('🔧 IncidentsView: Disruption not found in filteredDisruptions');
        //     }
        // } else {
        //     console.log('🔧 IncidentsView: Conditions not met for opening EditEffectPanel');
        //     console.log('🔧 IncidentsView: useEditEffectPanel:', this.props.useEditEffectPanel);
        //     console.log('🔧 IncidentsView: isEditEffectPanelOpen:', this.props.isEditEffectPanelOpen);
        //     console.log('🔧 IncidentsView: disruptionIncidentNoToEdit:', this.props.disruptionIncidentNoToEdit);
        //     console.log('🔧 IncidentsView: filteredDisruptions length:', this.props.filteredDisruptions?.length);
        // }
        
        console.log('🔧 IncidentsView: Auto-opening EditEffectPanel DISABLED');
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
        if (this.props.isIncidentLoading !== nextProps.isIncidentLoading) {
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
        const { filteredDisruptions, filteredIncidents, isCreateAllowed, isCreateOpen, isIncidentLoading } = this.props;
        const { currentPage } = this.state;
        // Calculate paginated data
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const paginatedIncidents = filteredIncidents.slice(startIndex, startIndex + PAGE_SIZE);
        return (
            <div className="control-incidents-view">
                { isIncidentLoading && (
                    <div>
                        <LoadingOverlay />
                        <div className="loader position-fixed incident-loader" aria-label="Loading" />
                    </div>
                ) }
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
                {/* EditEffectPanel moved to CreateIncident to avoid duplication */}
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
    useEditEffectPanel: PropTypes.bool,
    isIncidentLoading: PropTypes.bool,
    isEditEffectPanelOpen: PropTypes.bool,
    disruptionIncidentNoToEdit: PropTypes.string,
    toggleEditEffectPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToEditEffect: PropTypes.func.isRequired,
};

export default connect(state => ({
    filteredDisruptions: getFilteredDisruptions(state),
    filteredIncidents: getFilteredIncidents(state),
    isCreateOpen: isIncidentCreationOpen(state),
    isCreateAllowed: isIncidentCreationAllowed(state),
    useEditEffectPanel: useEditEffectPanel(state),
    isIncidentLoading: getIncidentForEditLoadingState(state),
    isEditEffectPanelOpen: isEditEffectPanelOpen(state),
    disruptionIncidentNoToEdit: getDisruptionKeyToEditEffect(state),
}), { 
    getDisruptionsAndIncidents, 
    openCreateIncident, 
    updateEditMode, 
    updateAffectedRoutesState, 
    updateAffectedStopsState, 
    getStopGroups,
    toggleEditEffectPanel,
    updateDisruptionKeyToEditEffect,
})(IncidentsView);
