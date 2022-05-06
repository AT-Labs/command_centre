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
    getTripReplayEndTimeFilter,
    getTripReplayTimeTypeFilter } from '../../../../redux/selectors/control/tripReplays/filters';
import OmniSearch, { defaultTheme } from '../../../OmniSearch/OmniSearch';
import {
    resetTripReplaySearchTerm,
    updateTripReplaySearchTerm,
    updateTripReplayStartTime,
    updateTripReplayEndTime,
    handleSearchDateChange,
    updateTripReplayTimeType,
    search,
} from '../../../../redux/actions/control/tripReplays/filters';
import ControlSearch from '../../Common/ControlSearch/ControlSearch';
import { getTimePickerOptions } from '../../../../utils/helpers';
import './Filters.scss';
import { TIME_TYPE } from '../../../../constants/tripReplays';

const OPTIONS = getTimePickerOptions(28);

export const formatVehiclesSearchResults = (selectedOption, mode) => {
    let label;
    let id = _.get(selectedOption, 'data.id');

    if (mode.type === SEARCH_RESULT_TYPE.BUS.type) {
        label = _.get(selectedOption, 'data.label');
        const dataRegistration = _.get(selectedOption, 'data.registration');
        if (!_.isEmpty(dataRegistration)) {
            label = `${label} - ${dataRegistration}`;
        }
    } else if (mode.type === SEARCH_RESULT_TYPE.TRAIN.type) {
        label = _.get(selectedOption, 'data.label').replace(/\s+/g, ' ');
    } else if (mode.type === SEARCH_RESULT_TYPE.FERRY.type) {
        label = `${_.get(selectedOption, 'data.label')} - ${id}`;
    } else if (mode.type === SEARCH_RESULT_TYPE.ROUTE.type) {
        label = _.get(selectedOption, 'data.route_short_name');
        id = label;
    } else if (mode.type === SEARCH_RESULT_TYPE.STOP.type) {
        id = _.get(selectedOption, 'data.stop_code');
        const stopName = _.get(selectedOption, 'data.stop_name');
        label = !_.isEmpty(stopName) ? `${id} - ${stopName}` : id;
    }

    return ({
        id,
        label,
        type: mode.type,
    });
};

const isTripId = value => (value.indexOf('-') > 0 && value.indexOf(' ') < 0);

const Filters = (props) => {
    const { ROUTE, BUS, TRAIN, FERRY, STOP } = SEARCH_RESULT_TYPE;
    const { searchTerm, searchDate, startTime, endTime, timeType } = props;
    const tripIdStatus = isTripId(searchTerm.label);

    const actionHandlers = {
        selection: {
            [SEARCH_RESULT_TYPE.BUS.type]: selectedOption => props.updateTripReplaySearchTerm(formatVehiclesSearchResults(selectedOption, SEARCH_RESULT_TYPE.BUS)),
            [SEARCH_RESULT_TYPE.ROUTE.type]: selectedOption => props.updateTripReplaySearchTerm(formatVehiclesSearchResults(selectedOption, SEARCH_RESULT_TYPE.ROUTE)),
            [SEARCH_RESULT_TYPE.STOP.type]: selectedOption => props.updateTripReplaySearchTerm(formatVehiclesSearchResults(selectedOption, SEARCH_RESULT_TYPE.STOP)),
            [SEARCH_RESULT_TYPE.TRAIN.type]: selectedOption => props.updateTripReplaySearchTerm(formatVehiclesSearchResults(selectedOption, SEARCH_RESULT_TYPE.TRAIN)),
            [SEARCH_RESULT_TYPE.FERRY.type]: selectedOption => props.updateTripReplaySearchTerm(formatVehiclesSearchResults(selectedOption, SEARCH_RESULT_TYPE.FERRY)),
        },
        clear: {
            [SEARCH_RESULT_TYPE.BUS.type]: _.noop,
            [SEARCH_RESULT_TYPE.ROUTE.type]: _.noop,
            [SEARCH_RESULT_TYPE.STOP.type]: _.noop,
            [SEARCH_RESULT_TYPE.TRAIN.type]: _.noop,
            [SEARCH_RESULT_TYPE.FERRY.type]: _.noop,
            [SEARCH_RESULT_TYPE.TRIP.type]: _.noop,
        },
    };

    const datePickerOptions = {
        enableTime: false,
        maxDate: moment.now(),
        altInput: true,
        altFormat: 'j F Y',
        dateFormat: 'Y-m-d',
    };

    const isTimeSelected = startTime !== '' && endTime !== '';
    const isTimeSelectedValid = isTimeSelected ? startTime < endTime : false;
    const isSubmitButtonDisabled = !searchTerm.label || !searchDate;

    const updateSearchTermForTripId = (text) => {
        const searchTermObj = {
            type: SEARCH_RESULT_TYPE.TRIP.type,
            id: text,
            label: text,
        };
        props.updateTripReplaySearchTerm(searchTermObj);
    };

    const handleOmniSearchTextChange = (text) => {
        if (isTripId) {
            updateSearchTermForTripId(text);
        } else if (searchTerm && searchTerm.label && !_.isEqual(text, searchTerm.label)) {
            props.resetTripReplaySearchTerm();
        }
    };

    const getEndTimeOptions = () => {
        if (!startTime) return OPTIONS;
        return _.filter(OPTIONS, option => option.value > startTime);
    };

    const getStartTimeOptions = () => {
        if (!endTime) return OPTIONS;
        return _.filter(OPTIONS, option => option.value < endTime);
    };

    const setShouldRenderSuggestions = () => !tripIdStatus;

    return (
        <section className="filters">
            <div className="p-4">
                <h3>Historical playback</h3>
                <div>
                    <h3 className="text-muted font-weight-normal">
                        Search for a vehicle, trip, route, or stop/platform/pier&apos;s history within a certain time.
                    </h3>
                </div>
            </div>
            <div className="block">
                <label // eslint-disable-line
                    htmlFor="vehicle-route-id"
                    className="font-size-md font-weight-bold filter-components">
                    Vehicle, Trip, Route, Stop/Platform/Pier
                </label>
                <OmniSearch
                    theme={
                        {
                            ...defaultTheme,
                            input: 'search__input form-control cc-form-control',
                        }
                    }
                    inputId="trip-replay-vehicle-route-stop-id"
                    value={ searchTerm.label }
                    placeholder="Search for Vehicle, Trip, Route, Stop/Platform/Pier"
                    isSelectedValueShown
                    searchInCategory={ [ROUTE.type, STOP.type, BUS.type, TRAIN.type, FERRY.type] }
                    selectionHandlers={ actionHandlers.selection }
                    onInputValueChange={ handleOmniSearchTextChange }
                    onClearCallBack={ props.resetTripReplaySearchTerm }
                    shouldRenderSuggestions={ setShouldRenderSuggestions }
                    clearHandlers={ actionHandlers.clear } />
            </div>
            <div className="block py-3 px-4">
                <FormGroup tag="fieldset">
                    <Label className="font-size-md font-weight-bold">Date</Label>
                    <Flatpickr
                        id="trip-replay-select-date"
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
                            <Label className="font-size-md font-weight-bold">
                                From
                                <span className="text-muted">(optional)</span>
                            </Label>
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
                            <Label className="font-size-md font-weight-bold">
                                To
                                <span className="text-muted">(optional)</span>
                            </Label>
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
            {
                isTimeSelected && !isTimeSelectedValid && (
                    <div className="col mb-4 px-4">
                        <div className="cc-modal-field-alert d-flex align-items-end text-danger">
                            <IoIosWarning size={ 20 } className="mr-1" />
                            <span>
                                Start time must be before end time
                            </span>
                        </div>
                    </div>
                )
            }
            <FormGroup tag="fieldset" className="block ml-1 pb-3 px-4">
                <div className="row no-gutters mb-0">
                    <div className="col-md-6 px-3">
                        <input
                            id="trip-replay-time-type-scheduled"
                            value={ TIME_TYPE.Scheduled }
                            name="trip-replay-time-type"
                            type="radio"
                            className="form-check-input mr-2"
                            checked={ timeType === TIME_TYPE.Scheduled }
                            onChange={ () => props.updateTripReplayTimeType(TIME_TYPE.Scheduled) }
                        />
                        <Label className="font-size-md font-weight-bold form-check-label">Scheduled Time</Label>
                    </div>
                    <div className="col-md-6 px-3">
                        <input
                            id="trip-replay-time-type-actual"
                            value={ TIME_TYPE.Actual }
                            name="trip-replay-time-type"
                            type="radio"
                            className="form-check-input mr-2"
                            checked={ timeType === TIME_TYPE.Actual }
                            onChange={ () => props.updateTripReplayTimeType(TIME_TYPE.Actual) }
                        />
                        <Label className="font-size-md font-weight-bold form-check-label">Actual Time</Label>
                    </div>
                </div>
            </FormGroup>
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
    updateTripReplayTimeType: PropTypes.func.isRequired,
    searchTerm: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    }).isRequired,
    searchDate: PropTypes.string,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    timeType: PropTypes.string.isRequired,
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
    timeType: getTripReplayTimeTypeFilter(state),
}), {
    search,
    updateTripReplaySearchTerm,
    resetTripReplaySearchTerm,
    handleSearchDateChange,
    updateTripReplayStartTime,
    updateTripReplayEndTime,
    updateTripReplayTimeType,
})(Filters);
