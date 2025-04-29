import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isEmpty, some } from 'lodash-es';
import moment from 'moment';
import { Button, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap';

import Flatpickr from 'react-flatpickr';
import { BsArrowRepeat } from 'react-icons/bs';
import { FaExclamationTriangle, FaRegCalendarAlt } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import { isUrlValid } from '../../../../../utils/helpers';
import { isDurationValid, isEndDateValid, isEndTimeValid, isStartDateValid, isStartTimeValid, recurrenceRadioOptions } from '../../../../../utils/control/disruptions';
import { toggleDisruptionModals, updateCurrentStep } from '../../../../../redux/actions/control/disruptions';
import { DisruptionDetailSelect } from '../../DisruptionDetail/DisruptionDetailSelect';
import { SEVERITIES } from '../../../../../types/disruptions-types';
import {
    DATE_FORMAT,
    HEADER_MAX_LENGTH,
    LABEL_CAUSE,
    LABEL_CUSTOMER_IMPACT,
    LABEL_DURATION_HOURS,
    LABEL_END_DATE,
    LABEL_END_TIME,
    LABEL_HEADER,
    LABEL_SEVERITY,
    LABEL_START_DATE,
    LABEL_START_TIME,
    LABEL_URL,
    URL_MAX_LENGTH,
} from '../../../../../constants/disruptions';
import Footer from './Footer';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import CustomMuiDialog from '../../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../../Common/ActivePeriods/ActivePeriods';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import { generateActivePeriodsFromRecurrencePattern, getRecurrenceText, isActivePeriodsValid } from '../../../../../utils/recurrence';
import RadioButtons from '../../../../Common/RadioButtons/RadioButtons';
import { getDatePickerOptions } from '../../../../../utils/dateUtils';
import { useAlertCauses, useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';

export const SelectDetails = (props) => {
    const { startDate, startTime, endDate, endTime, impact, cause, header, url, createNotification, exemptAffectedTrips, severity } = props.data;
    const { recurrent, duration, recurrencePattern } = props.data;

    const [modalOpenedTime] = useState(moment().second(0).millisecond(0));
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);
    const [activePeriods, setActivePeriods] = useState([]);
    const [alertDialogMessage, setAlertDialogMessage] = useState(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isTitleDirty, setTitleDirty] = useState(false);
    const [isSeverityDirty, setSeverityDirty] = useState(false);
    const [isEffectDirty, setEffectDirty] = useState(false);
    const [isCauseDirty, setCauseDirty] = useState(false);
    const [isDurationDirty, setDurationDirty] = useState(false);
    const [isRecurrencePatternDirty, setRecurrencePatternDirty] = useState(false);
    const [isStartTimeDirty, setIsStartTimeDirty] = useState(false);
    const [cssStartDateInvalid, setCssStartDateInvalid] = useState('');
    const [cssEndDateInvalid, setCssEndDateInvalid] = useState('');
    const maxActivePeriodsCount = 100;

    const startTimeValid = () => isStartTimeValid(startDate, startTime, modalOpenedTime, recurrent);

    const startDateValid = () => isStartDateValid(startDate, modalOpenedTime, recurrent);

    const endTimeValid = () => isEndTimeValid(endDate, endTime, startDate, startTime);

    const endDateValid = () => isEndDateValid(endDate, startDate, recurrent);

    const durationValid = () => isDurationValid(duration, recurrent);

    const titleValid = () => !isEmpty(header);

    const severityValid = () => !isEmpty(severity);

    const effectValid = () => !isEmpty(impact);

    const causeValid = () => !isEmpty(cause);

    const activePeriodsValidV2 = () => {
        if (recurrent) {
            return isActivePeriodsValid(recurrencePattern, duration, maxActivePeriodsCount);
        }
        return true;
    };

    const onBlurTitle = () => {
        setTitleDirty(true);
    };

    const onBlurDuration = () => {
        setDurationDirty(true);
    };

    const onChangeSeverity = (selectedItem) => {
        setSeverityDirty(true);
        props.onDataUpdate('severity', selectedItem);
    };

    const onChangeEffect = (selectedItem) => {
        setEffectDirty(true);
        props.onDataUpdate('impact', selectedItem);
    };

    const onChangeCause = (selectedItem) => {
        setCauseDirty(true);
        props.onDataUpdate('cause', selectedItem);
    };

    const onUpdateRecurrencePattern = (byweekday) => {
        setRecurrencePatternDirty(true);
        props.onDataUpdate('recurrencePattern', { ...recurrencePattern, byweekday });
    };

    const onChangeStartTime = (selectedItem) => {
        setIsStartTimeDirty(true);
        props.onDataUpdate('startTime', selectedItem);
    };

    const onChangeEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0) {
                if (props.useDraftDisruptions) {
                    props.onDataUpdate('endDate', '');
                    setCssEndDateInvalid('');
                } else {
                    setCssEndDateInvalid('is-invalid');
                }
            } else {
                props.onDataUpdate('endDate', date.length ? moment(date[0]).format(DATE_FORMAT) : '');
                setCssEndDateInvalid('');
            }
        } else {
            props.onDataUpdate('endDate', date.length ? moment(date[0]).format(DATE_FORMAT) : '');
            setCssEndDateInvalid('');
        }
    };

    const onBlurEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0 && !props.useDraftDisruptions) {
                setCssEndDateInvalid('is-invalid');
            } else {
                setCssEndDateInvalid('');
            }
        } else {
            setCssEndDateInvalid('');
        }
    };

    const onChangeRecurrent = (checkedButtonKey) => {
        props.onDataUpdate('recurrent', checkedButtonKey === '1');
    };

    const onChangeStartDate = (date) => {
        if (date.length === 0) {
            setCssStartDateInvalid('is-invalid');
            props.onDataUpdate('startDate', '');
        } else {
            setCssStartDateInvalid('');
            props.onDataUpdate('startDate', moment(date[0]).format(DATE_FORMAT));
        }
    };

    const isRequiredPropsEmpty = () => {
        const isPropsEmpty = some([startTime, startDate, impact, cause, header, severity], isEmpty);
        const isEndTimeRequiredAndEmpty = !recurrent && !isEmpty(endDate) && isEmpty(endTime);
        const isWeekdayRequiredAndEmpty = recurrent && isEmpty(recurrencePattern.byweekday);
        return isPropsEmpty || isEndTimeRequiredAndEmpty || isWeekdayRequiredAndEmpty;
    };

    const isRequiredDraftPropsEmpty = () => some([cause, header], isEmpty);

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const datePickerOptions = recurrent ? getDatePickerOptions('today') : getDatePickerOptions();

    const endDateDatePickerOptions = getDatePickerOptions(startDate);

    const isDateTimeValid = () => startTimeValid() && startDateValid() && endDateValid() && durationValid();
    const isViewAllDisabled = !isDateTimeValid() || isEmpty(recurrencePattern?.byweekday);
    const isSubmitDisabled = isRequiredPropsEmpty() || !isUrlValid(url) || !startTimeValid() || !startDateValid() || !endTimeValid() || !endDateValid() || !durationValid();
    const isDraftSubmitDisabled = isRequiredDraftPropsEmpty();

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

    const isSubmitDisabledV2 = isSubmitDisabled || isEmpty(recurrencePattern.byweekday);

    const onContinue = () => {
        if (props.useDraftDisruptions) {
            props.onUpdateDetailsValidation(!isSubmitDisabledV2 && activePeriodsValidV2());
            props.onStepUpdate(1);
            props.updateCurrentStep(2);
        } else if (activePeriodsValid()) {
            props.onStepUpdate(1);
            props.updateCurrentStep(2);
        }
    };

    const onSaveDraft = () => {
        props.onStepUpdate(3);
        props.onSubmitDraft();
    };

    const displayActivePeriods = () => {
        setActivePeriods(generateActivePeriodsFromRecurrencePattern(recurrencePattern, duration));
        setActivePeriodsModalOpen(true);
    };

    const causes = useAlertCauses();
    const impacts = useAlertEffects();

    return (
        <div className="disruption-creation__wizard-select-details">
            <Form className="row my-3 p-4">
                <div className="col-12">
                    <RadioButtons
                        { ...recurrenceRadioOptions(recurrent) }
                        disabled={ false }
                        onChange={ checkedButtonKey => onChangeRecurrent(checkedButtonKey) }
                    />
                </div>
                <div className="col-6">
                    <FormGroup className="position-relative">
                        <Label for="disruption-creation__wizard-select-details__start-date">
                            <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                        </Label>
                        <Flatpickr
                            id="disruption-creation__wizard-select-details__start-date"
                            className={ `font-weight-normal cc-form-control form-control ${cssStartDateInvalid}` }
                            value={ startDate }
                            options={ datePickerOptions }
                            placeholder="Select date"
                            onChange={ date => onChangeStartDate(date) } />
                        {cssStartDateInvalid === '' && (
                            <FaRegCalendarAlt
                                className="disruption-creation__wizard-select-details__icon position-absolute"
                                size={ 22 } />
                        )}
                        {cssStartDateInvalid !== '' && (
                            <div className="disruption-recurrance-invalid">Please select start date</div>
                        )}
                    </FormGroup>
                    <FormGroup className="position-relative">
                        <Label for="disruption-creation__wizard-select-details__end-date">
                            <span className="font-size-md font-weight-bold">
                                {!recurrent ? getOptionalLabel(LABEL_END_DATE) : LABEL_END_DATE}
                            </span>
                        </Label>
                        { !recurrent && (
                            <Flatpickr
                                id="disruption-creation__wizard-select-details__end-date"
                                className={ `font-weight-normal cc-form-control form-control ${cssEndDateInvalid}` }
                                value={ endDate }
                                options={ endDateDatePickerOptions }
                                onChange={ date => onChangeEndDate(date, false) }
                                onOpen={ date => onBlurEndDate(date, false) }

                            />
                        )}
                        { recurrent && (
                            <Flatpickr
                                id="disruption-creation__wizard-select-details__end-date"
                                className={ `font-weight-normal cc-form-control form-control ${cssEndDateInvalid}` }
                                value={ endDate }
                                options={ endDateDatePickerOptions }
                                onChange={ date => onChangeEndDate(date, true) }
                                onOpen={ date => onBlurEndDate(date, true) }
                            />
                        )}
                        {cssEndDateInvalid === '' && (
                            <FaRegCalendarAlt
                                className="disruption-creation__wizard-select-details__icon position-absolute"
                                size={ 22 } />
                        )}
                        {cssEndDateInvalid !== '' && (
                            <span className="disruption-recurrance-invalid">Please select end date</span>
                        )}
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
                            onChange={ event => onChangeStartTime(event.target.value) }
                            invalid={ (props.useDraftDisruptions ? (isStartTimeDirty && !startTimeValid()) : !startTimeValid()) }
                        />
                        <FormFeedback>Not valid values</FormFeedback>
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
                            <FormFeedback>Not valid values</FormFeedback>
                        </FormGroup>
                    )}
                    { recurrent && (
                        <FormGroup>
                            <Label for="disruption-creation__wizard-select-details__duration">
                                <span className="font-size-md font-weight-bold">{LABEL_DURATION_HOURS}</span>
                            </Label>
                            <Input
                                id="disruption-creation__wizard-select-details__duration"
                                className="border border-dark"
                                value={ duration }
                                onChange={ event => props.onDataUpdate('duration', event.target.value) }
                                invalid={ isDurationDirty && !durationValid() }
                                onBlur={ onBlurDuration }
                                type="number"
                                min="1"
                                max="24"
                            />
                            <FormFeedback>Not valid duration</FormFeedback>
                        </FormGroup>
                    )}
                </div>
                { recurrent && (
                    <>
                        <div className="col-6 text-center">
                            <WeekdayPicker
                                selectedWeekdays={ recurrencePattern.byweekday || [] }
                                onUpdate={ byweekday => onUpdateRecurrencePattern(byweekday) }
                            />
                        </div>
                        <div className="col-6 pb-3 text-center">
                            <Button disabled={ isViewAllDisabled } className="showActivePeriods btn btn-secondary lh-1" onClick={ () => displayActivePeriods() }>
                                View All
                            </Button>
                        </div>
                        { (props.useDraftDisruptions
                            ? (!isEmpty(recurrencePattern.byweekday) && activePeriodsValidV2())
                            : !isEmpty(recurrencePattern.byweekday)) && (
                            <div className="col-12 mb-3">
                                <BsArrowRepeat size={ 22 } />
                                <span className="pl-1">{ getRecurrenceText(recurrencePattern) }</span>
                            </div>
                        )}
                        { (props.useDraftDisruptions
                            ? (isRecurrencePatternDirty && (isEmpty(recurrencePattern.byweekday) || !activePeriodsValidV2()))
                            : (isRecurrencePatternDirty && isEmpty(recurrencePattern.byweekday))) && (
                            <div className="col-12 mb-3">
                                <span className="disruption-recurrance-invalid">Please select recurrence</span>
                            </div>
                        )}
                    </>
                )}
                <div className="col-6">
                    <DisruptionDetailSelect
                        id="disruption-creation__wizard-select-details__cause"
                        className=""
                        value={ cause }
                        options={ causes }
                        label={ LABEL_CAUSE }
                        invalid={ isCauseDirty && !causeValid() }
                        feedback="Please select cause"
                        onBlur={ selectedItem => onChangeCause(selectedItem) }
                        onChange={ selectedItem => onChangeCause(selectedItem) } />
                </div>
                <div className="col-6">
                    <DisruptionDetailSelect
                        id="disruption-creation__wizard-select-details__impact"
                        className=""
                        value={ impact }
                        options={ impacts }
                        label={ LABEL_CUSTOMER_IMPACT }
                        invalid={ isEffectDirty && !effectValid() }
                        feedback="Please select effect"
                        onBlur={ selectedItem => onChangeEffect(selectedItem) }
                        onChange={ selectedItem => onChangeEffect(selectedItem) } />
                </div>
                <div className="col-12">
                    <FormGroup>
                        <DisruptionDetailSelect
                            id="disruption-creation__wizard-select-details__severity"
                            className=""
                            value={ severity }
                            options={ SEVERITIES }
                            label={ LABEL_SEVERITY }
                            invalid={ isSeverityDirty && !severityValid() }
                            feedback="Please select severity"
                            onBlur={ selectedItem => onChangeSeverity(selectedItem) }
                            onChange={ selectedItem => onChangeSeverity(selectedItem) }
                        />
                    </FormGroup>
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
                            onBlur={ onBlurTitle }
                            value={ header }
                            invalid={ isTitleDirty && !titleValid() }
                        />
                        <FormFeedback>Please enter disruption title</FormFeedback>
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
                        <Input
                            type="checkbox"
                            className="ml-0"
                            onChange={ e => props.onDataUpdate('createNotification', e.currentTarget.checked) }
                            checked={ createNotification }
                        />
                        <span className="pl-2">Draft Stop Message</span>
                    </FormGroup>
                    <FormGroup className="disruption-creation__checkbox">
                        <Input
                            type="checkbox"
                            className="ml-0"
                            onChange={ e => props.onDataUpdate('exemptAffectedTrips', e.currentTarget.checked) }
                            checked={ exemptAffectedTrips }
                        />
                        <span className="pl-2">Exempt Affected Trips</span>
                    </FormGroup>
                </div>
            </Form>
            <Footer
                updateCurrentStep={ props.updateCurrentStep }
                onStepUpdate={ props.onStepUpdate }
                toggleDisruptionModals={ props.toggleDisruptionModals }
                isSubmitDisabled={ props.useDraftDisruptions ? isDraftSubmitDisabled : isSubmitDisabled }
                isDraftSubmitDisabled={ isDraftSubmitDisabled }
                nextButtonValue="Continue"
                onContinue={ () => onContinue() }
                onSubmitDraft={ () => onSaveDraft() }
            />
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
    onSubmitUpdate: PropTypes.func,
    onSubmitDraft: PropTypes.func,
    toggleDisruptionModals: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func,
    useDraftDisruptions: PropTypes.bool,
    onUpdateDetailsValidation: PropTypes.func,
};

SelectDetails.defaultProps = {
    data: {},
    onStepUpdate: () => { },
    onDataUpdate: () => { },
    updateCurrentStep: () => { },
    onSubmitUpdate: () => { },
    onSubmitDraft: () => { },
    onUpdateDetailsValidation: () => { },
    useDraftDisruptions: false,
};

export default connect(state => ({ useDraftDisruptions: useDraftDisruptions(state) }), { toggleDisruptionModals, updateCurrentStep })(SelectDetails);
