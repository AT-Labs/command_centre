import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Collapse, Form, FormGroup, Label, Button, Input, FormFeedback } from 'reactstrap';
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
import TripIcon from '../../../Common/Trip/TripIcon';
import Icon from '../../../../Common/Icon/Icon';
import Footer from './Footer';

const SelectDetails = (props) => {
    const { startDate, startTime, endDate, endTime, impact, cause, header, description, url } = props.data;
    const { routes, stops } = props;

    const [modalOpenedTime] = useState(moment().second(0).millisecond(0));
    const [collapse, setCollapse] = useState(false);

    const toggle = () => setCollapse(!collapse);

    const startTimeValid = () => isStartTimeValid(startDate, startTime, modalOpenedTime);

    const startDateValid = () => isStartDateValid(startDate, modalOpenedTime);

    const endTimeValid = () => isEndTimeValid(endDate, endTime, modalOpenedTime, startDate, startTime);

    const endDateValid = () => isEndDateValid(endDate, startDate);

    const getOptionalLabel = label => <React.Fragment>{label} <small className="text-muted">optional</small></React.Fragment>;

    const datePickerOptions = getDatePickerOptions('today');

    const endDateDatePickerOptions = getDatePickerOptions(startDate);

    const isSubmitEnabled = props.isSubmitDisabled || !isUrlValid(url) || !startTimeValid() || !startDateValid() || !endTimeValid() || !endDateValid();

    const onContinue = () => {
        props.onStepUpdate(3);
        props.updateCurrentStep(1);
        props.onSubmit();
    };

    const onBack = () => {
        props.onStepUpdate(1);
        props.updateCurrentStep(2);
    };

    const showViewMoreLessButton = routes.length + stops.length > 4;

    return (
        <div className="disruption-creation__wizard-select-details">
            <div className="disruption-creation__wizard-select-details__selected-dates row p-4">
                <div className="col">
                    <span className="font-weight-bold mb-4">Affected Routes</span>
                    <span className="float-right">
                        <Button
                            className="btn cc-btn-link p-0"
                            onClick={ () => {
                                props.onStepUpdate(0);
                                props.updateCurrentStep(1);
                            } }>
                            Edit
                        </Button>
                    </span>
                    <Collapse isOpen={ collapse } className="w-100">
                        <ul className="disruption-creation__wizard-select-details__selected-routes p-0 mt-3">
                            { routes.map(route => (
                                <li key={ route.route_id }>
                                    <TripIcon type={ route.route_type } className="disruption-creation__wizard-select-details__vehicle-icon" />
                                    { route.route_short_name }
                                </li>
                            ))}
                            { stops.map(stop => (
                                <li key={ stop.stop_id }>
                                    <div className="trip-icon">
                                        <Icon icon="bus-stop" className="disruption-creation__wizard-select-details__vehicle-icon" />
                                    </div>
                                    { stop.stop_code }
                                </li>
                            ))}
                        </ul>
                    </Collapse>
                    {showViewMoreLessButton
                        && (
                            <div>
                                <Button
                                    className="btn cc-btn-link p-0"
                                    onClick={ toggle }>
                                    {collapse ? 'View Less' : 'View More'}
                                </Button>
                            </div>
                        )
                    }
                </div>
            </div>
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
