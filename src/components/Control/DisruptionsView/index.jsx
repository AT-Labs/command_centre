import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import { getDisruptions, openCreateDisruption } from '../../../redux/actions/control/disruptions';
import { getAllDisruptions, isDisruptionCreationAllowed, isDisruptionCreationOpen } from '../../../redux/selectors/control/disruptions';
import DisruptionsTable from './DisruptionsTable';
import { DISRUPTION_POLLING_INTERVAL } from '../../../constants/disruptions';
import CreateDisruption from './DisruptionCreation/CreateDisruption/index';

export class DisruptionsView extends React.Component {
    static propTypes = {
        disruptions: PropTypes.array,
        getDisruptions: PropTypes.func.isRequired,
        isCreateEnabled: PropTypes.bool.isRequired,
        isCreateOpen: PropTypes.bool,
        openCreateDisruption: PropTypes.func.isRequired,
    }

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
        this.props.getDisruptions();
        const timer = setTimeout(() => this.getDisruptions(), DISRUPTION_POLLING_INTERVAL);
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
                className="cc-btn-primary"
                onClick={ () => this.props.openCreateDisruption(true) }>
                Create a new disruption
            </Button>
        </div>
    )

    render() {
        const { disruptions, isCreateEnabled, isCreateOpen } = this.props;
        return (
            <div className="control-disruptions-view">
                {!isCreateOpen
                    && (
                        <React.Fragment>
                            <h1>Disruptions</h1>
                            <div className="d-flex justify-content-end align-items-center mb-3">
                                { isCreateEnabled && this.createDisruptionButton() }
                            </div>
                            <DisruptionsTable
                                disruptions={ disruptions } />
                        </React.Fragment>
                    )
                }
                {isCreateOpen && isCreateEnabled && <CreateDisruption />}
            </div>
        );
    }
}

export default connect(state => ({
    isCreateEnabled: isDisruptionCreationAllowed(state),
    disruptions: getAllDisruptions(state),
    isCreateOpen: isDisruptionCreationOpen(state),
}), { getDisruptions, openCreateDisruption })(DisruptionsView);
