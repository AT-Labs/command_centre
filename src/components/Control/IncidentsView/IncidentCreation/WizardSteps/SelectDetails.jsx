import React, { useState, useMemo, useEffect } from 'react';
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
import { isDurationValid,
    isEndDateValid,
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
    recurrenceRadioOptions,
    getStatusOptions } from '../../../../../utils/control/disruptions';
import {
    toggleIncidentModals,
    updateCurrentStep,
    toggleEditEffectPanel,
    updateDisruptionIncidentNoToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit } from '../../../../../redux/actions/control/incidents';
import { DisruptionDetailSelect } from '../../../DisruptionsView/DisruptionDetail/DisruptionDetailSelect';
import { SEVERITIES } from '../../../../../types/disruptions-types';
import {
    DATE_FORMAT,
    HEADER_MAX_LENGTH,
    LABEL_CAUSE,
    LABEL_DURATION_HOURS,
    LABEL_END_DATE,
    LABEL_END_TIME,
    LABEL_HEADER,
    LABEL_SEVERITY,
    LABEL_START_DATE,
    LABEL_START_TIME,
    LABEL_URL,
    URL_MAX_LENGTH,
    LABEL_STATUS,
} from '../../../../../constants/disruptions';
import Footer from './Footer';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import CustomMuiDialog from '../../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../../Common/ActivePeriods/ActivePeriods';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import { generateActivePeriodsFromRecurrencePattern, getRecurrenceText, isActivePeriodsValid, parseRecurrencePattern } from '../../../../../utils/recurrence';
import RadioButtons from '../../../../Common/RadioButtons/RadioButtons';
import { getDatePickerOptions } from '../../../../../utils/dateUtils';
import { useAlertCauses, useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import EDIT_TYPE from '../../../../../types/edit-types';
import { getEditMode, getDisruptionIncidentNoToEditEffect } from '../../../../../redux/selectors/control/incidents';

export const SelectDetails = (props) => {
    const iconContextValue = useMemo(() => ({ className: 'text-warning w-100 m-2' }), []);
    const { startDate, startTime, endDate, endTime, cause, header, url, severity, modalOpenedTime, mode, status, disruptions } = props.data;
    const { recurrent, duration, recurrencePattern } = props.data;
    const [now] = useState(moment().second(0).millisecond(0));
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);
    const [activePeriods, setActivePeriods] = useState([]);
    const [alertDialogMessage, setAlertDialogMessage] = useState(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isTitleDirty, setIsTitleDirty] = useState(false);
    const [isSeverityDirty, setIsSeverityDirty] = useState(false);
    const [isCauseDirty, setIsCauseDirty] = useState(false);
    const [isDurationDirty, setIsDurationDirty] = useState(false);
    const [isRecurrencePatternDirty, setIsRecurrencePatternDirty] = useState(false);
    const [isStartTimeDirty, setIsStartTimeDirty] = useState(false);
    const [isStartDateDirty, setIsStartDateDirty] = useState(false);
    const [isEndDateDirty, setIsEndDateDirty] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filteredDisruptions, setFilteredDisruptions] = useState(disruptions || []);
    const maxActivePeriodsCount = 100;

    const startTimeValid = () => isStartTimeValid(startDate, startTime, modalOpenedTime, recurrent);

    const startDateValid = () => isStartDateValid(startDate, modalOpenedTime, recurrent);

    const endTimeValid = () => isEndTimeValid(endDate, endTime, startDate, startTime);

    const endDateValid = () => isEndDateValid(endDate, startDate, recurrent);

    const durationValid = () => isDurationValid(duration, recurrent);

    const titleValid = () => !isEmpty(header);

    const severityValid = () => !isEmpty(severity);

    const causeValid = () => !isEmpty(cause);

    const activePeriodsValidV2 = () => {
        if (recurrent) {
            return isActivePeriodsValid(recurrencePattern, duration, maxActivePeriodsCount);
        }
        return true;
    };

    const onBlurTitle = () => {
        setIsTitleDirty(true);
    };

    const onBlurDuration = () => {
        setIsDurationDirty(true);
    };

    const onChangeSeverity = (selectedItem) => {
        setIsSeverityDirty(true);
        props.onDataUpdate('severity', selectedItem);
    };

    const onChangeCause = (selectedItem) => {
        setIsCauseDirty(true);
        props.onDataUpdate('cause', selectedItem);
    };

    const onUpdateRecurrencePattern = (byweekday) => {
        setIsRecurrencePatternDirty(true);
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
                    setIsEndDateDirty(false);
                } else {
                    setIsEndDateDirty(true);
                }
            } else {
                props.onDataUpdate('endDate', date.length ? moment(date[0]).format(DATE_FORMAT) : '');
                setIsEndDateDirty(false);
            }
        } else {
            props.onDataUpdate('endDate', date.length ? moment(date[0]).format(DATE_FORMAT) : '');
            setIsEndDateDirty(false);
        }
    };

    const onBlurEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0 && !props.useDraftDisruptions) {
                setIsEndDateDirty(true);
            } else {
                setIsEndDateDirty(false);
            }
        } else {
            setIsEndDateDirty(false);
        }
    };

    const onChangeRecurrent = (checkedButtonKey) => {
        props.onDataUpdate('recurrent', checkedButtonKey === '1');
    };

    const onChangeStartDate = (date) => {
        if (date.length === 0) {
            setIsStartDateDirty(true);
            props.onDataUpdate('startDate', '');
        } else {
            setIsStartDateDirty(false);
            props.onDataUpdate('startDate', moment(date[0]).format(DATE_FORMAT));
        }
    };

    const isRequiredPropsEmpty = () => {
        const isPropsEmpty = some([startTime, startDate, cause, header, severity], isEmpty);
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

    const onContinue = () => {
        if (props.useDraftDisruptions) {
            props.onUpdateDetailsValidation(!isSubmitDisabled && activePeriodsValidV2());
            props.onStepUpdate(1);
            props.updateCurrentStep(2);
        } else if (activePeriodsValid()) {
            props.onStepUpdate(1);
            props.updateCurrentStep(2);
        }
    };

    const onSave = () => {
        props.onSubmitUpdate();
    };

    const onCancel = (modal, isOpen) => {
        props.toggleIncidentModals(modal, isOpen);
        props.toggleWorkaroundPanel(false);
        props.updateDisruptionKeyToWorkaroundEdit('');
        props.toggleEditEffectPanel(false);
        props.updateDisruptionIncidentNoToEditEffect('');
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

    const setDisruptionStatus = (selectedStatus) => {
        props.onDataUpdate('status', selectedStatus);
        /*
        if (status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.RESOLVED) {
            setStartDate(moment().format(DATE_FORMAT));
            setStartTime(moment().format(TIME_FORMAT));
            setEndDate(moment().format(DATE_FORMAT));
            setEndTime(moment().format(TIME_FORMAT));
        } else if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.IN_PROGRESS) {
            setStartDate(moment().format(DATE_FORMAT));
            setStartTime(moment().format(TIME_FORMAT));
        } else if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.NOT_STARTED) {
            setStartDate(moment(disruption.startTime).format(DATE_FORMAT));
            setStartTime(moment(disruption.startTime).format(TIME_FORMAT));
            setEndDate('');
            setEndTime('');
        } else if (disruption.status === STATUSES.IN_PROGRESS && selectedStatus === STATUSES.RESOLVED) {
            setEndDate(moment().format(DATE_FORMAT));
            setEndTime(moment().format(TIME_FORMAT));
        }

        setIsRecurrenceDirty(true); */
    };

    const openEditPanel = (incidentNo) => {
        props.updateDisruptionIncidentNoToEditEffect(incidentNo);
        props.toggleEditEffectPanel(true);
        props.updateDisruptionKeyToWorkaroundEdit(incidentNo);
    };

    const impacts = useAlertEffects();

    const getImpactLabel = (value) => {
        const impact = impacts.find(i => i.value === value);
        return impact ? impact.label : value;
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const term = debouncedSearchTerm.toLowerCase();
        const filtered = disruptions.filter(d => d.impact?.toLowerCase().includes(term)
            || d.affectedEntities?.affectedRoutes.some(entity => entity.routeShortName.toLowerCase().includes(term))
            || d.affectedEntities?.affectedStops.some(entity => entity.text.toLowerCase().includes(term)));
        setFilteredDisruptions(filtered);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (disruptions && disruptions.length !== filteredDisruptions.length) {
            setFilteredDisruptions(disruptions);
        }
    }, [disruptions]);
    const statusOptions = getStatusOptions(startDate, startTime, now, status);

    return (
        <div className="disruption-creation__wizard-select-details">
            <Form className="row my-3 p-4">
                <div className="col-12">
                    <RadioButtons
                        { ...recurrenceRadioOptions(recurrent) }
                        disabled={ props.editMode === EDIT_TYPE.EDIT }
                        onChange={ checkedButtonKey => onChangeRecurrent(checkedButtonKey) }
                    />
                </div>
                { props.editMode === EDIT_TYPE.EDIT && (
                    <div className="col-12">
                        <span className="font-size-md font-weight-bold">Mode:</span>
                        <span className="pl-2">{mode}</span>
                    </div>
                )}
                { props.editMode === EDIT_TYPE.EDIT && (
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
                )}
                { props.editMode === EDIT_TYPE.EDIT && (
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
                )}
                { props.editMode === EDIT_TYPE.EDIT && (
                    <div className="col-6">
                        <DisruptionDetailSelect
                            id="disruption-detail__status"
                            className=""
                            value={ status }
                            options={ statusOptions }
                            label={ LABEL_STATUS }
                            onChange={ setDisruptionStatus } />
                    </div>
                )}
                <div className="col-6">
                    <FormGroup className="position-relative">
                        <Label for="disruption-creation__wizard-select-details__start-date">
                            <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                        </Label>
                        <Flatpickr
                            id="disruption-creation__wizard-select-details__start-date"
                            className={ `font-weight-normal cc-form-control form-control ${isStartDateDirty ? 'is-invalid' : ''}` }
                            value={ startDate }
                            options={ datePickerOptions }
                            placeholder="Select date"
                            onChange={ date => onChangeStartDate(date) } />
                        {!isStartDateDirty && (
                            <FaRegCalendarAlt
                                className="disruption-creation__wizard-select-details__icon position-absolute"
                                size={ 22 } />
                        )}
                        {isStartDateDirty && (
                            <div className="disruption-recurrence-invalid">Please select start date</div>
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
                                className={ `font-weight-normal cc-form-control form-control ${isEndDateDirty ? 'is-invalid' : ''}` }
                                value={ endDate }
                                options={ endDateDatePickerOptions }
                                onChange={ date => onChangeEndDate(date, false) }
                                onOpen={ date => onBlurEndDate(date, false) }

                            />
                        )}
                        { recurrent && (
                            <Flatpickr
                                id="disruption-creation__wizard-select-details__end-date"
                                className={ `font-weight-normal cc-form-control form-control ${isEndDateDirty ? 'is-invalid' : ''}` }
                                value={ endDate }
                                options={ endDateDatePickerOptions }
                                onChange={ date => onChangeEndDate(date, true) }
                                onOpen={ date => onBlurEndDate(date, true) }
                            />
                        )}
                        {!isEndDateDirty && (
                            <FaRegCalendarAlt
                                className="disruption-creation__wizard-select-details__icon position-absolute"
                                size={ 22 } />
                        )}
                        {isEndDateDirty && (
                            <span className="disruption-recurrence-invalid">Please select end date</span>
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
                                <span className="pl-1">{ getRecurrenceText(parseRecurrencePattern(recurrencePattern)) }</span>
                            </div>
                        )}
                        { (props.useDraftDisruptions
                            ? (isRecurrencePatternDirty && (isEmpty(recurrencePattern.byweekday) || !activePeriodsValidV2()))
                            : (isRecurrencePatternDirty && isEmpty(recurrencePattern.byweekday))) && (
                            <div className="col-12 mb-3">
                                <span className="disruption-recurrence-invalid">Please select recurrence</span>
                            </div>
                        )}
                    </>
                )}
                { props.editMode !== EDIT_TYPE.EDIT && (
                    <div className="col-12">
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
                )}
                <div className={ props.editMode !== EDIT_TYPE.EDIT ? 'col-12' : 'col-6' }>
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
                { props.editMode !== EDIT_TYPE.EDIT && (
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
                )}
                <div className="col-12 d-none">
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
            { props.editMode === EDIT_TYPE.EDIT && (
                <div className="ml-4 mr-4 ">
                    <ul className="pl-0 disruption-workarounds-effects">
                        <div>
                            <Label for="disruption-creation__wizard-select-details__header" className="p-lr12-tb6">
                                <span className="font-size-md font-weight-bold">Effects</span>
                            </Label>
                            <Input
                                id="disruption-creation__wizard-select-details__header"
                                className="w-100 workaround-search-input p-lr12-tb6"
                                placeholder="Effects, affected routes and stops"
                                maxLength={ 20 }
                                onChange={ event => setSearchTerm(event.target.value) }
                                value={ searchTerm }
                            />
                        </div>
                        {filteredDisruptions.map(disruption => (
                            <li key={ disruption.key } className={ `disruption-effect-item ${props.disruptionIncidentNoToEdit === disruption.incidentNo ? 'active' : ''}` }>
                                <div>
                                    <Button
                                        className="btn cc-btn-link p-lr12-tb6 m-0"
                                        onClick={ () => openEditPanel(disruption.incidentNo) }>
                                        <strong>{disruption.incidentNo}</strong>
                                    </Button>
                                    <p className="p-lr12-tb6 m-0">
                                        {getImpactLabel(disruption.impact)}
                                    </p>
                                </div>
                                {disruption.affectedEntities.affectedRoutes && disruption.affectedEntities.affectedRoutes.length > 0 && (
                                    disruption.affectedEntities.affectedRoutes.filter((item, index, self) => index
                                    === self.findIndex(i => i.routeShortName === item.routeShortName))
                                        .map(route => (
                                            <p className="p-lr12-tb6 m-0 disruption-effect-item-route" key={ `${disruption.key}_${route.routeId}` }>
                                                Route -
                                                {' '}
                                                {route.routeShortName}
                                            </p>
                                        ))
                                )}
                                {disruption.affectedEntities.affectedStops && disruption.affectedEntities.affectedStops.length > 0 && (
                                    disruption.affectedEntities.affectedStops.filter((item, index, self) => index === self.findIndex(i => i.stopId === item.stopId))
                                        .map(stop => (
                                            <p className="p-lr12-tb6 m-0 disruption-effect-item-stop" key={ `${disruption.key}_${stop.stopId}` }>
                                                Stop -
                                                {' '}
                                                {stop.text}
                                            </p>
                                        ))
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            { props.editMode !== EDIT_TYPE.EDIT && (
                <Footer
                    updateCurrentStep={ props.updateCurrentStep }
                    onStepUpdate={ props.onStepUpdate }
                    toggleIncidentModals={ props.toggleIncidentModals }
                    isSubmitDisabled={ props.useDraftDisruptions ? isDraftSubmitDisabled : isSubmitDisabled }
                    isDraftSubmitDisabled={ isDraftSubmitDisabled }
                    nextButtonValue="Continue"
                    onContinue={ () => onContinue() }
                    onSubmitDraft={ () => onSaveDraft() }
                />
            )}
            { props.editMode === EDIT_TYPE.EDIT && (
                <Footer
                    isDraftOrCreateMode={ false }
                    toggleIncidentModals={ onCancel }
                    isSubmitDisabled={ isSubmitDisabled }
                    nextButtonValue="Save"
                    onContinue={ () => onSave() }
                />
            )}
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
                <IconContext.Provider value={ iconContextValue }>
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
    toggleIncidentModals: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func,
    useDraftDisruptions: PropTypes.bool,
    onUpdateDetailsValidation: PropTypes.func,
    editMode: PropTypes.string,
    toggleEditEffectPanel: PropTypes.func.isRequired,
    updateDisruptionIncidentNoToEditEffect: PropTypes.func.isRequired,
    disruptionIncidentNoToEdit: PropTypes.string,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
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
    editMode: EDIT_TYPE.CREATE,
    disruptionIncidentNoToEdit: '',
};

export default connect(state => ({
    useDraftDisruptions: useDraftDisruptions(state),
    editMode: getEditMode(state),
    disruptionIncidentNoToEdit: getDisruptionIncidentNoToEditEffect(state),
}), { toggleIncidentModals,
    updateCurrentStep,
    toggleEditEffectPanel,
    updateDisruptionIncidentNoToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
})(SelectDetails);
