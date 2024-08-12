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
    getVehiclesFilterIsShowingUnscheduled,
} from '../../../../redux/selectors/realtime/vehicles';
import { useUnscheduledFilter } from '../../../../redux/selectors/appSettings';

const SHOWING_DELAY = {
    EARLY: 'early',
    LATE: 'late',
};

class VehicleFilterByDelay extends React.PureComponent {
    static propTypes = {
        isShowingNIS: PropTypes.bool.isRequired,
        isShowingUnscheduled: PropTypes.bool.isRequired,
        mergeVehicleFilters: PropTypes.func.isRequired,
        showingDelay: PropTypes.object.isRequired,
        useUnscheduledFilter: PropTypes.bool.isRequired,
        className: PropTypes.string,
        titleClassName: PropTypes.string,
    };

    static defaultProps = {
        className: '',
        titleClassName: '',
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

    handleShowingUnscheduledChange = (event) => {
        this.props.mergeVehicleFilters({ isShowingUnscheduled: event.target.checked });
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
                <div className={ `mt-3 mb-1 ${this.props.titleClassName}` }>Status</div>
                <DelayOptions className={ this.props.className } range={ showingDelay.early } type={ SHOWING_DELAY.EARLY } onChange={ this.handleShowingDelayChange } />
                <DelayOptions className={ this.props.className } range={ showingDelay.late } type={ SHOWING_DELAY.LATE } onChange={ this.handleShowingDelayChange } />
                <FormGroup check>
                    <Label className={ this.props.className } check>
                        <Input
                            name="not-in-service"
                            type="checkbox"
                            checked={ this.props.isShowingNIS }
                            onChange={ this.handleShowingNISChange }
                            className="vehicle-filter-by-status__checkbox"
                        />
                        <span className="font-weight-light">Not In Service</span>
                    </Label>
                    { this.props.useUnscheduledFilter && (
                        <Label className={ this.props.className } check style={ { display: 'block' } }>
                            <Input
                                type="checkbox"
                                checked={ this.props.isShowingUnscheduled }
                                onChange={ this.handleShowingUnscheduledChange }
                                className="vehicle-filter-by-status__checkbox"
                            />
                            <span className="font-weight-light">Unscheduled</span>
                        </Label>
                    ) }
                </FormGroup>
            </>
        );
    }
}

export default connect(
    state => ({
        showingDelay: getVehiclesFilterShowingDelay(state),
        isShowingNIS: getVehiclesFilterIsShowingNIS(state),
        isShowingUnscheduled: getVehiclesFilterIsShowingUnscheduled(state),
        useUnscheduledFilter: useUnscheduledFilter(state),
    }),
    { mergeVehicleFilters },
)(VehicleFilterByDelay);
