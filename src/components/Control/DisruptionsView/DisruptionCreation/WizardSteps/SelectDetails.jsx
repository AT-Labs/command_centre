import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Form, FormGroup, Label, Button, Input, FormFeedback } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import { isUrlValid } from '../../../../../utils/helpers';
import { isStartTimeValid, isStartDateValid, isEndDateValid, isEndTimeValid, getDatePickerOptions } from '../../../../../utils/control/disruptions';
import { DisruptionDetailSelect } from '../../DisruptionDetail/DisruptionDetailSelect';
import {
    CAUSES,
    IMPACTS,
} from '../../../../../types/disruptions-types';
import {
    URL_MAX_LENGTH,
    DESCRIPTION_MAX_LENGTH,
    HEADER_MAX_LENGTH,
    LABEL_START_TIME,
    LABEL_CUSTOMER_IMPACT,
    LABEL_CAUSE,
    LABEL_HEADER,
    LABEL_DESCRIPTION,
    LABEL_URL,
    LABEL_START_DATE,
    DATE_FORMAT,
    LABEL_END_TIME, LABEL_END_DATE,
} from '../../../../../constants/disruptions';

const SelectDetails = (props) => {
    const { startDate, startTime, endDate, endTime, impact, cause, affectedRoutes, header, description, url } = props.data;

    const [modalOpenedTime] = useState(moment().second(0).millisecond(0));

    const startTimeValid = () => isStartTimeValid(startDate, startTime, modalOpenedTime);

    const startDateValid = () => isStartDateValid(startDate, modalOpenedTime);

    const endTimeValid = () => isEndTimeValid(endDate, endTime, startDate, startTime);

    const endDateValid = () => isEndDateValid(endDate, startDate);

    const getOptionalLabel = label => <React.Fragment>{label} <small className="text-muted">optional</small></React.Fragment>;

    const datePickerOptions = getDatePickerOptions('today');

    const endDateDatePickerOptions = getDatePickerOptions(startDate);

    return (
        <div className="disruption-creation__wizard-select-details">
            <div className="row">
                <div className="col">
                    <span className="font-weight-bold d-block">What is affected?</span>
                    { affectedRoutes.map(route => route.route_short_name).join(', ') }
                </div>
            </div>
            <Form className="row my-3">
                <div className="col-4">
                    <FormGroup>
                        <Label for="disruption-creation__wizard-select-details__start-date">
                            <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                        </Label>
                        <Flatpickr
                            id="disruption-creation__wizard-select-details__start-date"
                            className="font-weight-normal cc-form-control form-control"
                            value={ startDate }
                            options={ datePickerOptions }
                            placeholder="Select date"
                            onChange={ date => props.onDataUpdate('startDate', moment(date[0]).format(DATE_FORMAT)) } />
                    </FormGroup>
                    <FormGroup>
                        <Label for="disruption-creation__wizard-select-details__end-date">
                            <span className="font-size-md font-weight-bold">{getOptionalLabel(LABEL_END_DATE)}</span>
                        </Label>
                        <Flatpickr
                            id="disruption-creation__wizard-select-details__end-date"
                            className="font-weight-normal cc-form-control form-control"
                            value={ endDate }
                            options={ endDateDatePickerOptions }
                            onChange={ (date) => {
                                props.onDataUpdate('endDate', date.length ? moment(date[0]).format(DATE_FORMAT) : '');
                                if (date.length === 0) {
                                    props.onDataUpdate('endTime', '');
                                }
                            } } />
                    </FormGroup>

                </div>
                <div className="col-4">
                    <FormGroup>
                        <Label for="disruption-creation__wizard-select-details__start-time">
                            <span className="font-size-md font-weight-bold">{LABEL_START_TIME}</span>
                        </Label>
                        <Input
                            id="disruption-creation__wizard-select-details__start-time"
                            className="border border-dark"
                            value={ startTime }
                            onChange={ event => props.onDataUpdate('startTime', event.target.value) }
                            invalid={ !startTimeValid() }
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="disruption-creation__wizard-select-details__end-time">
                            <span className="font-size-md font-weight-bold">{getOptionalLabel(LABEL_END_TIME)}</span>
                        </Label>
                        <Input
                            id="disruption-creation__wizard-select-details__end-time"
                            className="border border-dark"
                            value={ endTime }
                            onChange={ event => props.onDataUpdate('endTime', event.target.value) }
                            invalid={ !endTimeValid() }
                        />
                    </FormGroup>
                </div>
                <div className="col-4">
                    <DisruptionDetailSelect
                        id="disruption-creation__wizard-select-details__impact"
                        className=""
                        value={ impact }
                        options={ IMPACTS }
                        label={ LABEL_CUSTOMER_IMPACT }
                        onChange={ selectedItem => props.onDataUpdate('impact', selectedItem) } />
                    <DisruptionDetailSelect
                        id="disruption-creation__wizard-select-details__cause"
                        className=""
                        value={ cause }
                        options={ CAUSES }
                        label={ LABEL_CAUSE }
                        onChange={ selectedItem => props.onDataUpdate('cause', selectedItem) } />
                </div>
                <div className="col-12">
                    <FormGroup>
                        <Label for="disruption-creation__wizard-select-details__header">
                            <span className="font-size-md font-weight-bold">{LABEL_HEADER}</span>
                        </Label>
                        <Input
                            id="disruption-creation__wizard-select-details__header"
                            className="w-100 border border-dark"
                            placeholder="Title of the message"
                            maxLength={ HEADER_MAX_LENGTH }
                            onChange={ event => props.onDataUpdate('header', event.target.value) }
                            value={ header }
                        />
                    </FormGroup>
                </div>
                <div className="col-12">
                    <FormGroup>
                        <Label for="disruption-creation__wizard-select-details__description">
                            <span className="font-size-md font-weight-bold">{LABEL_DESCRIPTION}</span>
                        </Label>
                        <Input
                            id="disruption-creation__wizard-select-details__description"
                            className="w-100 border border-dark"
                            placeholder="Description of the message"
                            type="textarea"
                            rows="5"
                            maxLength={ DESCRIPTION_MAX_LENGTH }
                            value={ description }
                            onChange={ event => props.onDataUpdate('description', event.target.value) }
                        />
                    </FormGroup>
                </div>
                <div className="col-12">
                    <FormGroup>
                        <Label for="disruption-creation__wizard-select-details__url">
                            <span className="font-size-md font-weight-bold">{ getOptionalLabel(LABEL_URL) }</span>
                        </Label>
                        <Input
                            id="disruption-creation__wizard-select-details__url"
                            className="w-100 border border-dark"
                            type="url"
                            maxLength={ URL_MAX_LENGTH }
                            value={ url }
                            placeholder="e.g. https://at.govt.nz"
                            onChange={ event => props.onDataUpdate('url', event.target.value) }
                            invalid={ !isUrlValid(url) }
                        />
                        <FormFeedback>Please enter a valid URL (e.g. https://at.govt.nz)</FormFeedback>
                    </FormGroup>
                </div>
            </Form>
            <footer className="row justify-content-between">
                <div className="col-4">
                    <Button
                        className="btn cc-btn-secondary btn-block"
                        onClick={ () => props.onStepUpdate(0) }>
                        Go back
                    </Button>
                </div>
                <div className="col-4">
                    <Button
                        disabled={ props.isSubmitDisabled || !isUrlValid(url) || !startTimeValid() || !startDateValid() || !endTimeValid() || !endDateValid() }
                        className="btn cc-btn-primary btn-block"
                        onClick={ () => {
                            props.onSubmit();
                            props.onStepUpdate(2);
                        } }>
                        Finish logging disruption
                    </Button>
                </div>
            </footer>
        </div>
    );
};

SelectDetails.propTypes = {
    data: PropTypes.object,
    onStepUpdate: PropTypes.func,
    onDataUpdate: PropTypes.func,
    isSubmitDisabled: PropTypes.bool,
    onSubmit: PropTypes.func,
};

SelectDetails.defaultProps = {
    data: {},
    onStepUpdate: () => { },
    onDataUpdate: () => { },
    onSubmit: () => { },
    isSubmitDisabled: false,
};

export default SelectDetails;
