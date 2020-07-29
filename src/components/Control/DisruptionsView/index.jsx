import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getDisruptions } from '../../../redux/actions/control/disruptions';
import DisruptionCreation from './DisruptionCreation';
import { getAllDisruptions, isDisruptionCreationAllowed } from '../../../redux/selectors/control/disruptions';
import DisruptionsTable from './DisruptionsTable';
import { DISRUPTION_POLLING_INTERVAL } from '../../../constants/disruptions';

export class DisruptionsView extends React.Component {
    static propTypes = {
        disruptions: PropTypes.array,
        getDisruptions: PropTypes.func.isRequired,
        isCreateEnabled: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            timer: undefined,
        };
    }

    static defaultProps = {
        disruptions: [],
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

    render() {
        const { disruptions, isCreateEnabled } = this.props;
        return (
            <div className="control-disruptions-view">
                <h1>Disruptions</h1>
                <div className="d-flex justify-content-end align-items-center mb-3">
                    { isCreateEnabled && <DisruptionCreation /> }
                </div>
                <DisruptionsTable
                    disruptions={ disruptions } />
            </div>
        );
    }
}

export default connect(state => ({
    isCreateEnabled: isDisruptionCreationAllowed(state),
    disruptions: getAllDisruptions(state),
}), { getDisruptions })(DisruptionsView);
