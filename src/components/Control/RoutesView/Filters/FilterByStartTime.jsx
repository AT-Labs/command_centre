import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { debounce, filter } from 'lodash-es';
import { getTimePickerOptions } from '../../../../utils/helpers';
import { mergeRouteFilters } from '../../../../redux/actions/control/routes/filters';
import { getStartTimeFromFilter, getStartTimeToFilter } from '../../../../redux/selectors/control/routes/filters';
import ControlSearch from '../../Common/ControlSearch/ControlSearch';
import { useRoutesTripsFilterCollapse } from '../../../../redux/selectors/appSettings';

const OPTIONS = getTimePickerOptions(28);

class FilterByStartTime extends React.Component {
    static propTypes = {
        startTimeFrom: PropTypes.string.isRequired,
        startTimeTo: PropTypes.string.isRequired,
        mergeRouteFilters: PropTypes.func.isRequired,
        useRoutesTripsFilterCollapse: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            startTimeFrom: {
                value: props.startTimeFrom,
            },
            startTimeTo: {
                value: props.startTimeTo,
            },
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const res = {};
        if (nextProps.startTimeFrom !== prevState.startTimeFrom.value) {
            res.startTimeFrom = { value: nextProps.startTimeFrom };
        }
        if (nextProps.startTimeTo !== prevState.startTimeTo.value) {
            res.startTimeTo = { value: nextProps.startTimeTo };
        }
        return res;
    }

    debouncedMergeRouteFilters = debounce(this.props.mergeRouteFilters, 350);

    getStartTimeToOptions = () => {
        if (!this.state.startTimeFrom.value) return OPTIONS;
        return filter(OPTIONS, option => option.value > this.state.startTimeFrom.value);
    };

    getStartTimeFromOptions = () => {
        if (!this.state.startTimeTo.value) return OPTIONS;
        return filter(OPTIONS, option => option.value < this.state.startTimeTo.value);
    };

    handleFilterChange = (name, value) => {
        this.debouncedMergeRouteFilters({ [name]: value });
    };

    onInputValueChange = (name, value) => {
        if (!value) {
            this.handleFilterChange(name, '');
        }
    };

    render() {
        return (
            <div className="row no-gutters">
                <div className="col pr-3">
                    <ControlSearch
                        id="control-filters-start-time-from"
                        inputId="control-filters-start-time-from-input"
                        label={ this.props.useRoutesTripsFilterCollapse ? 'Start from' : 'From' }
                        data={ this.getStartTimeFromOptions() }
                        pathToProperty="label"
                        placeholder="Select time"
                        onSelection={ selectedOption => this.handleFilterChange('startTimeFrom', selectedOption.value) }
                        onInputValueChange={ value => this.onInputValueChange('startTimeFrom', value) }
                        value={ this.state.startTimeFrom.value }
                    />
                </div>
                <div className="col">
                    <ControlSearch
                        id="control-filters-start-time-to"
                        inputId="control-filters-start-time-to-input"
                        label={ this.props.useRoutesTripsFilterCollapse ? 'Start to' : 'To' }
                        data={ this.getStartTimeToOptions() }
                        pathToProperty="label"
                        placeholder="Select time"
                        onSelection={ selectedOption => this.handleFilterChange('startTimeTo', selectedOption.value) }
                        onInputValueChange={ value => this.onInputValueChange('startTimeTo', value) }
                        value={ this.state.startTimeTo.value }
                    />
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        startTimeFrom: getStartTimeFromFilter(state),
        startTimeTo: getStartTimeToFilter(state),
        useRoutesTripsFilterCollapse: useRoutesTripsFilterCollapse(state),
    }),
    { mergeRouteFilters },
)(FilterByStartTime);
