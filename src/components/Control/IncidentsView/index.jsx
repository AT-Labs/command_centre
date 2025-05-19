import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { isEqual } from 'lodash-es';

import { getDisruptions, openCreateDisruption, updateEditMode, updateAffectedRoutesState, updateAffectedStopsState } from '../../../redux/actions/control/disruptions';
import {
    isDisruptionCreationAllowed,
    isDisruptionCreationOpen,
    getFilteredDisruptions,
} from '../../../redux/selectors/control/disruptions';
import { DISRUPTION_POLLING_INTERVAL } from '../../../constants/disruptions';
import CreateDisruption from '../DisruptionsView/DisruptionCreation/CreateDisruption/index';
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
        isCreateOpen: false,
    };

    componentDidMount() {
        this.getDisruptions();
        this.props.getStopGroups();
    }

    getDisruptions = () => {
        if (!this.props.isCreateOpen) {
            this.props.getDisruptions();
        }
        const timer = setTimeout(() => {
            this.getDisruptions();
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
        <div className="disruption-creation">
            <Button
                className="cc-btn-primary disruption-creation__create"
                onClick={ () => {
                    this.props.openCreateDisruption(true);
                    this.props.updateEditMode(EDIT_TYPE.CREATE);
                    this.props.updateAffectedRoutesState([]);
                    this.props.updateAffectedStopsState([]);
                } }>
                Create a new Cause
            </Button>
        </div>
    );

    render() {
        const { filteredDisruptions, isCreateAllowed, isCreateOpen } = this.props;

        return (
            <div className="control-disruptions-view">
                {!isCreateOpen
                    && (
                        <div className="ml-4 mr-4">
                            <div className="control-disruptions-view__header mt-4">
                                <div>
                                    <h1>Cause</h1>
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
                                disruptions={ filteredDisruptions } />
                        </div>
                    )}
                {isCreateOpen && isCreateAllowed && <CreateDisruption />}
            </div>
        );
    }
}

IncidentsView.propTypes = {
    filteredDisruptions: PropTypes.array,
    getDisruptions: PropTypes.func.isRequired,
    isCreateAllowed: PropTypes.bool.isRequired,
    isCreateOpen: PropTypes.bool,
    openCreateDisruption: PropTypes.func.isRequired,
    updateEditMode: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    getStopGroups: PropTypes.func.isRequired,
};

export default connect(state => ({
    filteredDisruptions: getFilteredDisruptions(state),
    isCreateOpen: isDisruptionCreationOpen(state),
    isCreateAllowed: isDisruptionCreationAllowed(state),
}), { getDisruptions, openCreateDisruption, updateEditMode, updateAffectedRoutesState, updateAffectedStopsState, getStopGroups })(IncidentsView);
