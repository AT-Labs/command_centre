import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import { getDisruptions, openCreateDisruption, updateEditMode, updateAffectedRoutesState, updateAffectedStopsState } from '../../../redux/actions/control/disruptions';
import { getAllDisruptions, isDisruptionCreationAllowed, isDisruptionCreationOpen } from '../../../redux/selectors/control/disruptions';
import { DISRUPTION_POLLING_INTERVAL } from '../../../constants/disruptions';
import DisruptionsTable from './DisruptionsTable';
import CreateDisruption from './DisruptionCreation/CreateDisruption/index';

export class DisruptionsView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timer: undefined,
        };
    }

    static defaultProps = {
        disruptions: [],
        isCreateOpen: false,
    }

    componentDidMount = () => {
        this.getDisruptions();
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
    }

    componentWillUnmount() {
        clearTimeout(this.state.timer);
    }

    createDisruptionButton = () => (
        <div className="disruption-creation">
            <Button
                className="cc-btn-primary disruption-creation__create"
                onClick={ () => {
                    this.props.openCreateDisruption(true);
                    this.props.updateEditMode(false);
                    this.props.updateAffectedRoutesState([]);
                    this.props.updateAffectedStopsState([]);
                } }>
                Create a new disruption
            </Button>
        </div>
    )

    render() {
        const { disruptions, isCreateAllowed, isCreateOpen } = this.props;
        return (
            <div className="control-disruptions-view">
                {!isCreateOpen
                    && (
                        <div className="ml-4 mr-4">
                            <div className="control-disruptions-view__header mt-4 mb-4">
                                <div>
                                    <h1>Disruptions</h1>
                                </div>
                                <div className="d-flex justify-content-end align-items-center mb-3">
                                    { isCreateAllowed && this.createDisruptionButton() }
                                </div>
                            </div>
                            <DisruptionsTable
                                disruptions={ disruptions } />
                        </div>
                    )
                }
                {isCreateOpen && isCreateAllowed && <CreateDisruption />}
            </div>
        );
    }
}

DisruptionsView.propTypes = {
    disruptions: PropTypes.array,
    getDisruptions: PropTypes.func.isRequired,
    isCreateAllowed: PropTypes.bool.isRequired,
    isCreateOpen: PropTypes.bool,
    openCreateDisruption: PropTypes.func.isRequired,
    updateEditMode: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
};

export default connect(state => ({
    disruptions: getAllDisruptions(state),
    isCreateOpen: isDisruptionCreationOpen(state),
    isCreateAllowed: isDisruptionCreationAllowed(state),
}), { getDisruptions, openCreateDisruption, updateEditMode, updateAffectedRoutesState, updateAffectedStopsState })(DisruptionsView);
