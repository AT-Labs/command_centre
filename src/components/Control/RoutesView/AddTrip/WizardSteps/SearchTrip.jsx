import React from 'react';
import PropTypes from 'prop-types';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { Form, FormGroup, Label, Input, FormFeedback, Button } from 'reactstrap';
import { noop, get } from 'lodash-es';
import { connect } from 'react-redux';
import { FaRegCalendarAlt } from 'react-icons/fa';

import SearchFilter from '../../../Common/Filters/SearchFilter/SearchFilter';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';
import RadioButtons from '../../../../Common/RadioButtons/RadioButtons';
import FilterByOperator from '../../../Common/Filters/FilterByOperator';

import { updateEnabledAddTripModal } from '../../../../../redux/actions/control/routes/trip-instances';
import { DATE_FORMAT } from '../../../../../constants/disruptions';
import { TIME_PATTERN } from '../../../../../constants/time';
import { getDatePickerOptions } from '../../../../../utils/dateUtils';
import { modeRadioOptions, directionRadioOptions } from '../../Types';
import { convertTimeToMinutes } from '../../../../../utils/helpers';

export const SearchTrip = (props) => {
    const { route, serviceDateFrom, startTimeFrom, startTimeTo } = props.data;

    const onContinue = () => {
        props.onStepUpdate(1);
    };

    const valuesOnClear = {
        routeId: '',
        routeShortName: '',
    };

    const actionHandlers = {
        selection: {
            [SEARCH_RESULT_TYPE.ROUTE.type]: (selectedOption) => {
                props.onDataUpdate('route', {
                    routeId: get(selectedOption, 'data.route_id'),
                    routeShortName: get(selectedOption, 'data.route_short_name'),
                });
            },
        },
        clear: {
            [SEARCH_RESULT_TYPE.ROUTE.type]: noop,
        },
    };

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const onChangeServiceDateFrom = (date) => {
        if (date.length !== 0) {
            props.onDataUpdate('serviceDateFrom', date.length ? moment(date[0]).format(DATE_FORMAT) : '');
        }
    };

    const onChangeServiceDateTo = (date) => {
        if (date.length !== 0) {
            props.onDataUpdate('serviceDateTo', date.length ? moment(date[0]).format(DATE_FORMAT) : '');
        }
    };

    const serviceDateToPickerOptions = getDatePickerOptions(serviceDateFrom);

    const isStartTimeFromValid = () => (TIME_PATTERN.test(startTimeFrom) && convertTimeToMinutes(startTimeFrom) <= convertTimeToMinutes('28:00')) || startTimeFrom === '';

    const isStartTimeToValid = () => {
        if (startTimeFrom !== '' && TIME_PATTERN.test(startTimeFrom)) {
            return startTimeTo === '' || (TIME_PATTERN.test(startTimeTo) && convertTimeToMinutes(startTimeTo) >= convertTimeToMinutes(startTimeFrom));
        }
        return TIME_PATTERN.test(startTimeTo) || startTimeTo === '';
    };

    return (
        <div className="p-3 search-trips-section">
            { props.header && (
                <div className="m-3">
                    {props.header}
                </div>
            ) }
            <Form className="row m-0">
                <div className="col-12">
                    <FormGroup className="position-relative">
                        <Label for="add-trip__wizard-select-details__search-route">
                            <span className="font-size-md font-weight-bold">Search for a route</span>
                        </Label>
                        <SearchFilter
                            inputId="add-trip__wizard-select-details__search-route"
                            value={ props.data.route.routeShortName }
                            placeholder="Search for a route"
                            searchInCategory={ [SEARCH_RESULT_TYPE.ROUTE.type] }
                            selectionHandlers={ actionHandlers.selection }
                            clearHandlers={ actionHandlers.clear }
                            onClearCallBack={ () => props.onDataUpdate('route', valuesOnClear) } />
                    </FormGroup>
                </div>
                <div className="col-12 mt-2">
                    <RadioButtons
                        { ...modeRadioOptions(props.data.mode, 'add-trip__wizard-mode') }
                        disabled={ false }
                        checkedKey={ props.data.mode }
                        onChange={ checkedButtonKey => props.onDataUpdate('mode', checkedButtonKey) }
                    />
                </div>
                <div className="col-12 mt-2">
                    <FormGroup className="position-relative">
                        <FilterByOperator
                            id="select-operators"
                            selectedOption={ props.data.agency.agencyId }
                            onSelection={ selectedOption => props.onDataUpdate('agency', { agencyId: selectedOption.value, agencyName: selectedOption.name }) }
                            isOptional />
                    </FormGroup>
                </div>
                <div className="col-12 mt-2">
                    <Label for="add-trip__wizard-select-details__date">
                        <span className="font-size-md font-weight-bold">{getOptionalLabel('Date')}</span>
                    </Label>
                </div>
                <div className="col-6">
                    <FormGroup className="position-relative">
                        <Label for="add-trip__wizard-select-details__service-date-from">
                            <span className="font-size-md font-weight-bold">From</span>
                        </Label>
                        <Flatpickr
                            id="add-trip__wizard-select-details__service-date-from"
                            className="font-weight-normal cc-form-control form-control"
                            value={ props.data.serviceDateFrom && moment(props.data.serviceDateFrom, DATE_FORMAT).toDate() }
                            options={ getDatePickerOptions() }
                            placeholder="Select date"
                            onChange={ date => onChangeServiceDateFrom(date) } />
                        <FaRegCalendarAlt
                            className="add-trip__wizard-select-details__icon position-absolute"
                            size={ 22 }
                        />
                    </FormGroup>
                </div>
                <div className="col-6">
                    <FormGroup className="position-relative">
                        <Label for="add-trip__wizard-select-details__serivce-date-to">
                            <span className="font-size-md font-weight-bold">To</span>
                        </Label>
                        <Flatpickr
                            id="add-trip__wizard-select-details__serivce-date-to"
                            className="font-weight-normal cc-form-control form-control"
                            value={ props.data.serviceDateTo && moment(props.data.serviceDateTo, DATE_FORMAT).toDate() }
                            options={ serviceDateToPickerOptions }
                            placeholder="Select date"
                            onChange={ date => onChangeServiceDateTo(date) } />
                        <FaRegCalendarAlt
                            className="add-trip__wizard-select-details__icon position-absolute"
                            size={ 22 }
                        />
                    </FormGroup>
                </div>
                <div className="col-12 mt-2">
                    <Label for="add-trip__wizard-select-details__start-time">
                        <span className="font-size-md font-weight-bold">{getOptionalLabel('Start Time')}</span>
                    </Label>
                </div>
                <div className="col-6">
                    <FormGroup className="position-relative">
                        <Label for="add-trip__wizard-select-details__start-time-from">
                            <span className="font-size-md font-weight-bold">From</span>
                        </Label>
                        <Input
                            id="add-trip__wizard-select-details__start-time-from"
                            className="border border-dark"
                            value={ props.data.startTimeFrom }
                            onChange={ event => props.onDataUpdate('startTimeFrom', event.target.value) }
                            invalid={ !isStartTimeFromValid() }
                        />
                        <FormFeedback>Not valid value</FormFeedback>
                    </FormGroup>
                </div>
                <div className="col-6">
                    <FormGroup className="position-relative">
                        <Label for="add-trip__wizard-select-details__start-time-to">
                            <span className="font-size-md font-weight-bold">To</span>
                        </Label>
                        <Input
                            id="add-trip__wizard-select-details__start-time-to"
                            className="border border-dark"
                            value={ props.data.startTimeTo }
                            onChange={ event => props.onDataUpdate('startTimeTo', event.target.value) }
                            invalid={ !isStartTimeToValid() }
                        />
                        <FormFeedback>Not valid value</FormFeedback>
                    </FormGroup>
                </div>
                <div className="col-12 mt-2">
                    <RadioButtons
                        { ...directionRadioOptions(props.data.directionId, 'add-trip__wizard-direction') }
                        disabled={ false }
                        checkedKey={ props.data.directionId }
                        onChange={ checkedButtonKey => props.onDataUpdate('directionId', checkedButtonKey) }
                    />
                </div>
            </Form>
            <div className="footer-container">
                <div className="row">
                    <div className="col-md-6 offset-md-3">
                        <div className="container">
                            <footer className="row m-0 justify-content-between p-4">
                                <div className="col-4 pl-0">
                                    <Button
                                        className="btn cc-btn-secondary btn-block pl-0"
                                        aria-label="Cancel"
                                        onClick={ props.toggleAddTripModals }>
                                        Cancel
                                    </Button>
                                </div>
                                <div className="col-4">
                                    <Button
                                        disabled={ !route.routeId.length }
                                        className="btn cc-btn-primary btn-block search"
                                        aria-label="Search"
                                        onClick={ onContinue }>
                                        Search
                                    </Button>
                                </div>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

SearchTrip.propTypes = {
    data: PropTypes.object,
    onStepUpdate: PropTypes.func,
    onDataUpdate: PropTypes.func,
    onSubmit: PropTypes.func,
    updateEnabledAddTripModal: PropTypes.func.isRequired,
    header: PropTypes.node,
    toggleAddTripModals: PropTypes.func.isRequired,
};

SearchTrip.defaultProps = {
    data: {},
    onStepUpdate: () => { /**/ },
    onDataUpdate: () => { /**/ },
    onSubmit: () => { /**/ },
    header: null,
};

export default connect(null, { updateEnabledAddTripModal })(SearchTrip);
