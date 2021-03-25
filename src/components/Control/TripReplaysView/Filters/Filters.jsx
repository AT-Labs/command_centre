import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { Button, FormGroup, Label } from 'reactstrap';
import * as moment from 'moment';
import Flatpickr from 'react-flatpickr';
import { IoIosWarning } from 'react-icons/io';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import {
    getTripReplaySearchTermFilter,
    getTripReplaySearchDateFilter,
    getTripReplayStartTimeFilter,
    getTripReplayEndTimeFilter } from '../../../../redux/selectors/control/tripReplays/filters';
import OmniSearch, { defaultTheme } from '../../../OmniSearch/OmniSearch';
import {
    resetTripReplaySearchTerm,
    updateTripReplaySearchTerm,
    updateTripReplayStartTime,
    updateTripReplayEndTime,
    handleSearchDateChange,
    search,
} from '../../../../redux/actions/control/tripReplays/filters';
import ControlSearch from '../../Common/ControlSearch/ControlSearch';
import { getTimePickerOptions } from '../../../../utils/helpers';
import '../../../../../node_modules/flatpickr/dist/flatpickr.css';
import './Filters.scss';

const OPTIONS = getTimePickerOptions(28);

export const formatVehiclesSearchResults = (selectedOption, mode) => {
    let label;

    if (mode.type === SEARCH_RESULT_TYPE.BUS.type) {
        label = `${_.get(selectedOption, 'data.label')} ${_.get(selectedOption, 'data.registration') ? `- ${_.get(selectedOption, 'data.registration')}` : ''}`;
    } else if (mode.type === SEARCH_RESULT_TYPE.TRAIN.type) {
        label = _.get(selectedOption, 'data.label').replace(/\s+/g, ' ');
    } else if (mode.type === SEARCH_RESULT_TYPE.FERRY.type) {
        label = `${_.get(selectedOption, 'data.label')} - ${_.get(selectedOption, 'data.id')}`;
    } else if (mode.type === SEARCH_RESULT_TYPE.ROUTE.type) {
        label = _.get(selectedOption, 'data.route_short_name');
    }

    const idOut = mode.type === SEARCH_RESULT_TYPE.ROUTE.type ? label : _.get(selectedOption, 'data.id');

    return ({
        id: idOut,
        label,
        type: mode.type,
    });
};

const Filters = (props) => {
    const { ROUTE, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;
    const { searchTerm, searchDate, startTime, endTime } = props;
    const actionHandlers = {
        selection: {
            [SEARCH_RESULT_TYPE.BUS.type]: selectedOption => props.updateTripReplaySearchTerm(formatVehiclesSearchResults(selectedOption, SEARCH_RESULT_TYPE.BUS)),
            [SEARCH_RESULT_TYPE.ROUTE.type]: selectedOption => props.updateTripReplaySearchTerm(formatVehiclesSearchResults(selectedOption, SEARCH_RESULT_TYPE.ROUTE)),
            [SEARCH_RESULT_TYPE.TRAIN.type]: selectedOption => props.updateTripReplaySearchTerm(formatVehiclesSearchResults(selectedOption, SEARCH_RESULT_TYPE.TRAIN)),
            [SEARCH_RESULT_TYPE.FERRY.type]: selectedOption => props.updateTripReplaySearchTerm(formatVehiclesSearchResults(selectedOption, SEARCH_RESULT_TYPE.FERRY)),
        },
        clear: {
            [SEARCH_RESULT_TYPE.BUS.type]: _.noop,
            [SEARCH_RESULT_TYPE.ROUTE.type]: _.noop,
            [SEARCH_RESULT_TYPE.TRAIN.type]: _.noop,
            [SEARCH_RESULT_TYPE.FERRY.type]: _.noop,
        },
    };

    const datePickerOptions = {
        enableTime: false,
        maxDate: moment.now(),
        altInput: true,
        altFormat: 'j F Y',
        dateFormat: 'Y-m-d',
    };

    const handleOmniSearchTextChange = (text) => {
        if (searchTerm && searchTerm.label && !_.isEqual(text, searchTerm.label)) {
            props.resetTripReplaySearchTerm();
        }
    };

    const isTimeSelected = startTime !== '' && endTime !== '';
    const isTimeSelectedValid = isTimeSelected ? startTime < endTime : false;
    const isSubmitButtonDisabled = !searchTerm.label || !searchDate;

    const getEndTimeOptions = () => {
        if (!startTime) return OPTIONS;
        return _.filter(OPTIONS, option => option.value > startTime);
    };

    const getStartTimeOptions = () => {
        if (!endTime) return OPTIONS;
        return _.filter(OPTIONS, option => option.value < endTime);
    };

    return (
        <section className="filters">
            <div className="p-4">
                <h3>Historical playback</h3>
                <div>
                    <h3 className="text-muted font-weight-normal">
                        Search for vehicle or route&apos;s history within a certain time.
                    </h3>
                </div>
            </div>
            <div className="block">
                <label // eslint-disable-line
                    htmlFor="vehicle-route-id"
                    className="font-size-md font-weight-bold filter-components">
                    Vehicle or Route ID
                </label>
                <OmniSearch
                    theme={
                        {
                            ...defaultTheme,
                            input: 'search__input form-control cc-form-control',
                        }
                    }
                    inputId="vehicle-route-id"
                    value={ searchTerm.label }
                    placeholder="Search the Routes or Vehicles"
                    isSelectedValueShown
                    searchInCategory={ [ROUTE.type, BUS.type, TRAIN.type, FERRY.type] }
                    selectionHandlers={ actionHandlers.selection }
                    onInputValueChange={ handleOmniSearchTextChange }
                    onClearCallBack={ props.resetTripReplaySearchTerm }
                    clearHandlers={ actionHandlers.clear } />
            </div>
            <div className="block py-3 px-4">
                <FormGroup tag="fieldset">
                    <Label className="font-size-md font-weight-bold">Date</Label>
                    <Flatpickr
                        className="form-control cc-form-control"
                        value={ searchDate }
                        options={ datePickerOptions }
                        onChange={ value => props.handleSearchDateChange(value[0]) }
                        placeholder="Select date" />
                </FormGroup>
            </div>
            <div className="block px-4">
                <FormGroup tag="fieldset">
                    <div className="row no-gutters mb-0">
                        <div className="col-md-6 pr-2">
                            <Label className="font-size-md font-weight-bold">From <span className="text-muted">(optional)</span></Label>
                            <ControlSearch
                                id="trip-replay-time-from"
                                data={ getStartTimeOptions() }
                                pathToProperty="label"
                                placeholder="Select time"
                                onInputValueChange={ value => props.updateTripReplayStartTime(value) }
                                onSelection={ selectedOption => props.updateTripReplayStartTime(selectedOption.value) }
                                value={ startTime }
                                disabled={ !searchDate }
                                updateOnPropsValueChange />
                        </div>
                        <div className="col-md-6">
                            <Label className="font-size-md font-weight-bold">To <span className="text-muted">(optional)</span></Label>
                            <ControlSearch
                                id="trip-replay-time-to"
                                data={ getEndTimeOptions() }
                                pathToProperty="label"
                                placeholder="Select time"
                                onInputValueChange={ value => props.updateTripReplayEndTime(value) }
                                onSelection={ selectedOption => props.updateTripReplayEndTime(selectedOption.value) }
                                value={ endTime }
                                disabled={ !searchDate }
                                updateOnPropsValueChange />
                        </div>
                    </div>
                </FormGroup>
            </div>
            <div className="col mb-4 px-4">
                {
                    isTimeSelected && !isTimeSelectedValid && (
                        <div className="cc-modal-field-alert d-flex align-items-end text-danger">
                            <IoIosWarning size={ 20 } className="mr-1" />
                            <span>
                                Start time must be before end time
                            </span>
                        </div>
                    )
                }
            </div>
            <div className="block px-4 py-2">
                <Button
                    className="cc-btn-primary w-100"
                    onClick={ () => props.search() }
                    disabled={ isSubmitButtonDisabled }>
                    Search
                </Button>
            </div>
        </section>
    );
};

Filters.propTypes = {
    updateTripReplaySearchTerm: PropTypes.func.isRequired,
    resetTripReplaySearchTerm: PropTypes.func.isRequired,
    handleSearchDateChange: PropTypes.func.isRequired,
    updateTripReplayStartTime: PropTypes.func.isRequired,
    updateTripReplayEndTime: PropTypes.func.isRequired,
    searchTerm: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    }).isRequired,
    searchDate: PropTypes.string,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    search: PropTypes.func.isRequired,
};

Filters.defaultProps = {
    searchDate: undefined,
};

export default connect(state => ({
    searchTerm: getTripReplaySearchTermFilter(state),
    searchDate: getTripReplaySearchDateFilter(state),
    startTime: getTripReplayStartTimeFilter(state),
    endTime: getTripReplayEndTimeFilter(state),
}), {
    search,
    updateTripReplaySearchTerm,
    resetTripReplaySearchTerm,
    handleSearchDateChange,
    updateTripReplayStartTime,
    updateTripReplayEndTime,
})(Filters);
