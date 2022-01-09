import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { isUrlValid } from '../../../../../utils/helpers';
import { isStartTimeValid, isStartDateValid, isEndDateValid, isEndTimeValid, getDatePickerOptions } from '../../../../../utils/control/disruptions';
import { toggleDisruptionModals, updateCurrentStep } from '../../../../../redux/actions/control/disruptions';
import { DisruptionDetailSelect } from '../../DisruptionDetail/DisruptionDetailSelect';
import { getAffectedRoutes, getAffectedStops } from '../../../../../redux/selectors/control/disruptions';
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
import Footer from './Footer';
import AffectedEntities from '../../AffectedEntities';

const SelectDetails = (props) => {
    const { startDate, startTime, endDate, endTime, impact, cause, header, description, url, createNotification } = props.data;
    const { routes, stops } = props;

    const [modalOpenedTime] = useState(moment().second(0).millisecond(0));

    const startTimeValid = () => isStartTimeValid(startDate, startTime, modalOpenedTime);

    const startDateValid = () => isStartDateValid(startDate, modalOpenedTime);

    const endTimeValid = () => isEndTimeValid(endDate, endTime, modalOpenedTime, startDate, startTime);

    const endDateValid = () => isEndDateValid(endDate, startDate);

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const datePickerOptions = getDatePickerOptions('today');

    const endDateDatePickerOptions = getDatePickerOptions(startDate);

    const isSubmitEnabled = props.isSubmitDisabled || !isUrlValid(url) || !startTimeValid() || !startDateValid() || !endTimeValid() || !endDateValid();

    const onContinue = () => {
        props.onStepUpdate(2);
        props.updateCurrentStep(1);
        props.onSubmit();
    };

    const onBack = () => {
        props.onStepUpdate(0);
        props.updateCurrentStep(1);
    };

    return (
        <div className="disruption-creation__wizard-select-details">
            <AffectedEntities
                editLabel="Edit"
                editAction={ () => {
                    props.onStepUpdate(0);
                    props.updateCurrentStep(1);
                } }
                affectedEntities={ [...stops, ...routes] }
            />
            <Form className="row my-3 p-4">
                <div className="col-12">
                    <h3>Add disruption details</h3>
                </div>
                <div className="col-6">
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
                        <FaRegCalendarAlt
                            className="disruption-creation__wizard-select-details__icon position-absolute"
                            size={ 22 } />
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
                        <FaRegCalendarAlt
                            className="disruption-creation__wizard-select-details__icon position-absolute"
                            size={ 22 } />
                    </FormGroup>
                    <DisruptionDetailSelect
                        id="disruption-creation__wizard-select-details__cause"
                        className=""
                        value={ cause }
                        options={ CAUSES }
                        label={ LABEL_CAUSE }
                        onChange={ selectedItem => props.onDataUpdate('cause', selectedItem) } />
                </div>
                <div className="col-6">
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
                    <DisruptionDetailSelect
                        id="disruption-creation__wizard-select-details__impact"
                        className=""
                        value={ impact }
                        options={ IMPACTS }
                        label={ LABEL_CUSTOMER_IMPACT }
                        onChange={ selectedItem => props.onDataUpdate('impact', selectedItem) } />
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
                <div className="col-12">
                    <FormGroup id="disruption-creation__wizard-select-details__create-noti">
                        <Label>
                            <Input
                                type="checkbox"
                                className="ml-0"
                                onChange={ e => props.onDataUpdate('createNotification', e.currentTarget.checked) }
                                checked={ createNotification }
                            />
                            <span className="pl-2">Create Notification</span>
                        </Label>
                    </FormGroup>
                </div>
            </Form>
            <Footer
                updateCurrentStep={ props.updateCurrentStep }
                onStepUpdate={ props.onStepUpdate }
                toggleDisruptionModals={ props.toggleDisruptionModals }
                isSubmitEnabled={ isSubmitEnabled }
                nextButtonValue="Finish"
                onContinue={ () => onContinue() }
                onBack={ () => onBack() } />
        </div>
    );
};

SelectDetails.propTypes = {
    data: PropTypes.object,
    onStepUpdate: PropTypes.func,
    onDataUpdate: PropTypes.func,
    isSubmitDisabled: PropTypes.bool,
    onSubmit: PropTypes.func,
    toggleDisruptionModals: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func,
    stops: PropTypes.array,
    routes: PropTypes.array,
};

SelectDetails.defaultProps = {
    data: {},
    onStepUpdate: () => { },
    onDataUpdate: () => { },
    onSubmit: () => { },
    updateCurrentStep: () => { },
    isSubmitDisabled: false,
    stops: [],
    routes: [],
};

export default connect(state => ({
    stops: getAffectedStops(state),
    routes: getAffectedRoutes(state),
}), { toggleDisruptionModals, updateCurrentStep })(SelectDetails);
