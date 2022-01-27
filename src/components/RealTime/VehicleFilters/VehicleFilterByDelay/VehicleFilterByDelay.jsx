import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';
import debounce from 'lodash-es/debounce';
import isEqual from 'lodash-es/isEqual';

import DelayOptions from './DelayOptions';
import { mergeVehicleFilters } from '../../../../redux/actions/realtime/vehicles';
import {
    getVehiclesFilterIsShowingNIS,
    getVehiclesFilterShowingDelay,
} from '../../../../redux/selectors/realtime/vehicles';

const SHOWING_DELAY = {
    EARLY: 'early',
    LATE: 'late',
};

class VehicleFilterByDelay extends React.PureComponent {
    static propTypes = {
        isShowingNIS: PropTypes.bool.isRequired,
        mergeVehicleFilters: PropTypes.func.isRequired,
        showingDelay: PropTypes.object.isRequired,
    };

    state = {
        showingDelay: {
            early: null,
            late: null,
        },
    };

    componentDidUpdate(prevProps) {
        const { showingDelay } = this.props;
        if (!isEqual(prevProps.showingDelay, showingDelay) && !isEqual(showingDelay, this.state.showingDelay)) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ showingDelay });
        }
    }

    handleShowingNISChange = (event) => {
        this.props.mergeVehicleFilters({ isShowingNIS: event.target.checked });
    };

    updateLocalShowingDelay = (name, value, callback) => {
        this.setState(prevState => ({
            showingDelay: {
                ...prevState.showingDelay,
                [name]: value,
            },
        }), callback);
    };

    handleShowingDelayChange = (name, value, shouldDebounce) => {
        const updateFiltersCallback = shouldDebounce ? this.debouncedUpdateVehicleFilters : this.updateVehicleFilters;
        this.updateLocalShowingDelay(name, value, updateFiltersCallback);
    };

    updateVehicleFilters = () => {
        const { showingDelay } = this.state;
        this.props.mergeVehicleFilters({ showingDelay });
    };

    debouncedUpdateVehicleFilters = debounce(this.updateVehicleFilters, 800);

    render() {
        const { showingDelay } = this.state;
        return (
            <>
                <div className="mt-3 mb-1">Status</div>
                <DelayOptions range={ showingDelay.early } type={ SHOWING_DELAY.EARLY } onChange={ this.handleShowingDelayChange } />
                <DelayOptions range={ showingDelay.late } type={ SHOWING_DELAY.LATE } onChange={ this.handleShowingDelayChange } />
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            checked={ this.props.isShowingNIS }
                            onChange={ this.handleShowingNISChange }
                            className="vehicle-filter-by-status__checkbox"
                        />
                        <span className="font-weight-light">Not In Service</span>
                    </Label>
                </FormGroup>
            </>
        );
    }
}

export default connect(
    state => ({
        showingDelay: getVehiclesFilterShowingDelay(state),
        isShowingNIS: getVehiclesFilterIsShowingNIS(state),
    }),
    { mergeVehicleFilters },
)(VehicleFilterByDelay);
