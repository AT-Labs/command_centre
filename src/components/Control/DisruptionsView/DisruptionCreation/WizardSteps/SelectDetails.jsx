import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isEmpty, some } from 'lodash-es';
import moment from 'moment';
import { Form, FormGroup, Label, Input, FormFeedback, Button } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import { BsArrowRepeat } from 'react-icons/bs';
import { FaRegCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { isUrlValid } from '../../../../../utils/helpers';
import { isStartTimeValid, isStartDateValid, isEndDateValid, isEndTimeValid, getDatePickerOptions, isDurationValid, recurrenceRadioOptions }
    from '../../../../../utils/control/disruptions';
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
    LABEL_DURATION,
} from '../../../../../constants/disruptions';
import Footer from './Footer';
import AffectedEntities from '../../AffectedEntities';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import CustomMuiDialog from '../../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../../Common/ActivePeriods/ActivePeriods';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import { generateActivePeriodsFromRecurrencePattern, getRecurrenceText } from '../../../../../utils/recurrence';
import { useDisruptionRecurrence } from '../../../../../redux/selectors/appSettings';
import RadioButtons from '../../../../Common/RadioButtons/RadioButtons';

export const SelectDetails = (props) => {
    const { startDate, startTime, endDate, endTime, impact, cause, header, description, url, createNotification } = props.data;
    const { recurrent, duration, recurrencePattern } = props.data;
    const { routes, stops } = props;

    const [modalOpenedTime] = useState(moment().second(0).millisecond(0));
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);
    const [activePeriods, setActivePeriods] = useState([]);
    const [alertDialogMessage, setAlertDialogMessage] = useState(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const maxActivePeriodsCount = 100;
    const startTimeValid = () => isStartTimeValid(startDate, startTime, modalOpenedTime);

    const startDateValid = () => isStartDateValid(startDate, modalOpenedTime);

    const endTimeValid = () => isEndTimeValid(endDate, endTime, modalOpenedTime, startDate, startTime);

    const endDateValid = () => isEndDateValid(endDate, startDate, recurrent);

    const durationValid = () => isDurationValid(duration, recurrent);

    const isRequiredPropsEmpty = () => {
        const isEntitiesEmpty = isEmpty([...routes, ...stops]);
        const isPropsEmpty = some([startTime, startDate, impact, cause, header, description], isEmpty);
        const isEndTimeRequiredAndEmpty = !recurrent && !isEmpty(endDate) && isEmpty(endTime);
        const isWeekdayRequiredAndEmpty = recurrent && isEmpty(recurrencePattern.byweekday);
        return isEntitiesEmpty || isPropsEmpty || isEndTimeRequiredAndEmpty || isWeekdayRequiredAndEmpty;
    };

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const datePickerOptions = getDatePickerOptions('today');

    const endDateDatePickerOptions = getDatePickerOptions(startDate);

    const isDateTimeValid = () => startTimeValid() && startDateValid() && endDateValid() && durationValid();
    const isViewAllDisabled = !isDateTimeValid() || isEmpty(recurrencePattern.byweekday);
    const isSubmitDisabled = isRequiredPropsEmpty() || !isUrlValid(url) || !startTimeValid() || !startDateValid() || !endTimeValid() || !endDateValid() || !durationValid();

    const activePeriodsValid = () => {
        if (recurrent) {
            let errorMessage;
            const activePeriodsCount = generateActivePeriodsFromRecurrencePattern(recurrencePattern, duration).length;

            if (activePeriodsCount === 0) {
                errorMessage = 'No active periods will be created. Please check the recurrence selection.';
            } else if (activePeriodsCount > maxActivePeriodsCount) {
                errorMessage = `Number of active periods is larger than the maximum allowed of ${maxActivePeriodsCount}. Please change the recurrence selection to reduce this.`;
            }

            if (errorMessage) {
                setAlertDialogMessage(errorMessage);
                setIsAlertModalOpen(true);
                return false;
            }
        }
        return true;
    };

    const onContinue = () => {
        if (activePeriodsValid()) {
            props.onStepUpdate(2);
            props.updateCurrentStep(1);
            props.onSubmit();
        }
    };

    const onBack = () => {
        props.onStepUpdate(0);
        props.updateCurrentStep(1);
    };

    const displayActivePeriods = () => {
        setActivePeriods(generateActivePeriodsFromRecurrencePattern(recurrencePattern, duration));
        setActivePeriodsModalOpen(true);
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
                { props.isRecurrenceOn && (
                    <div className="col-12">
                        <RadioButtons
                            { ...recurrenceRadioOptions(recurrent) }
                            disabled={ false }
                            onChange={ checkedButtonKey => props.onDataUpdate('recurrent', checkedButtonKey === '1') }
                        />
                    </div>
                )}
                <div className="col-6">
                    <FormGroup className="position-relative">
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
                    <FormGroup className="position-relative">
                        <Label for="disruption-creation__wizard-select-details__end-date">
                            <span className="font-size-md font-weight-bold">
                                {!recurrent ? getOptionalLabel(LABEL_END_DATE) : LABEL_END_DATE}
                            </span>
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
                    { !recurrent && (
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
                    )}
                    { recurrent && (
                        <FormGroup>
                            <Label for="disruption-creation__wizard-select-details__duration">
                                <span className="font-size-md font-weight-bold">{LABEL_DURATION}</span>
                            </Label>
                            <Input
                                id="disruption-creation__wizard-select-details__duration"
                                className="border border-dark"
                                value={ duration }
                                onChange={ event => props.onDataUpdate('duration', event.target.value) }
                                invalid={ !durationValid() }
                                type="number"
                                min="1"
                                max="24"
                            />
                        </FormGroup>
                    )}
                </div>
                { recurrent && (
                    <>
                        <div className="col-6 text-center">
                            <WeekdayPicker
                                selectedWeekdays={ recurrencePattern.byweekday || [] }
                                onUpdate={ byweekday => props.onDataUpdate('recurrencePattern', { ...recurrencePattern, byweekday }) }
                            />
                        </div>
                        <div className="col-6 pb-3 text-center">
                            <Button disabled={ isViewAllDisabled } className="showActivePeriods btn btn-secondary lh-1" onClick={ () => displayActivePeriods() }>
                                View All
                            </Button>
                        </div>
                        { !isEmpty(recurrencePattern.byweekday) && (
                            <div className="col-12 mb-3">
                                <BsArrowRepeat size={ 22 } />
                                <span className="pl-1">{ getRecurrenceText(recurrencePattern) }</span>
                            </div>
                        )}
                    </>
                )}
                <div className="col-6">
                    <DisruptionDetailSelect
                        id="disruption-creation__wizard-select-details__cause"
                        className=""
                        value={ cause }
                        options={ CAUSES }
                        label={ LABEL_CAUSE }
                        onChange={ selectedItem => props.onDataUpdate('cause', selectedItem) } />
                </div>
                <div className="col-6">
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
                    <FormGroup className="disruption-creation__checkbox">
                        <Label>
                            <Input
                                type="checkbox"
                                className="ml-0"
                                onChange={ e => props.onDataUpdate('createNotification', e.currentTarget.checked) }
                                checked={ createNotification }
                            />
                            <span className="pl-2">Draft Stop Message</span>
                        </Label>
                    </FormGroup>
                    {/* <FormGroup className="disruption-creation__checkbox">
                        <Label>
                            <Input
                                type="checkbox"
                                className="ml-0"
                                onChange={ e => props.onDataUpdate('exemptAffectedTrips', e.currentTarget.checked) }
                                checked={ exemptAffectedTrips }
                            />
                            <span className="pl-2">Exempt Affected Trips</span>
                        </Label>
                    </FormGroup> */}
                </div>
            </Form>
            <Footer
                updateCurrentStep={ props.updateCurrentStep }
                onStepUpdate={ props.onStepUpdate }
                toggleDisruptionModals={ props.toggleDisruptionModals }
                isSubmitDisabled={ isSubmitDisabled }
                nextButtonValue="Finish"
                onContinue={ () => onContinue() }
                onBack={ () => onBack() } />
            <CustomMuiDialog
                title="Disruption Active Periods"
                onClose={ () => setActivePeriodsModalOpen(false) }
                isOpen={ activePeriodsModalOpen }>
                <ActivePeriods activePeriods={ activePeriods } />
            </CustomMuiDialog>
            <CustomModal
                title="Log a Disruption"
                okButton={ {
                    label: 'OK',
                    onClick: () => setIsAlertModalOpen(false),
                    isDisabled: false,
                    className: 'test',
                } }
                onClose={ () => setIsAlertModalOpen(false) }
                isModalOpen={ isAlertModalOpen }>
                <IconContext.Provider value={ { className: 'text-warning w-100 m-2' } }>
                    <FaExclamationTriangle size={ 40 } />
                </IconContext.Provider>
                <p className="font-weight-light text-center mb-0">{ alertDialogMessage }</p>
            </CustomModal>
        </div>
    );
};

SelectDetails.propTypes = {
    data: PropTypes.object,
    onStepUpdate: PropTypes.func,
    onDataUpdate: PropTypes.func,
    onSubmit: PropTypes.func,
    toggleDisruptionModals: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func,
    stops: PropTypes.array,
    routes: PropTypes.array,
    isRecurrenceOn: PropTypes.bool.isRequired,
};

SelectDetails.defaultProps = {
    data: {},
    onStepUpdate: () => { },
    onDataUpdate: () => { },
    onSubmit: () => { },
    updateCurrentStep: () => { },
    stops: [],
    routes: [],
};

export default connect(state => ({
    stops: getAffectedStops(state),
    routes: getAffectedRoutes(state),
    isRecurrenceOn: useDisruptionRecurrence(state),
}), { toggleDisruptionModals, updateCurrentStep })(SelectDetails);
