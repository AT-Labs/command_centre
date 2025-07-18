import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button as MuiButton, Paper, Stack, CircularProgress } from '@mui/material';
import { isEmpty, sortBy, forOwn, omitBy, pickBy, uniqueId, some } from 'lodash-es';
import { Form, FormFeedback, FormGroup, Input, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { FaRegCalendarAlt } from 'react-icons/fa';
import Flatpickr from 'react-flatpickr';
import { RRule } from 'rrule';
import moment from 'moment';
import { BsArrowRepeat } from 'react-icons/bs';
import HistoryIcon from '@mui/icons-material/History';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { isEditEffectPanelOpen, getDisruptionIncidentNoToEditEffect, isWorkaroundPanelOpen } from '../../../../../redux/selectors/control/incidents';
import { DisruptionDetailSelect } from '../../../DisruptionsView/DisruptionDetail/DisruptionDetailSelect';
import {
    LABEL_CUSTOMER_IMPACT,
    LABEL_START_DATE,
    DATE_FORMAT,
    LABEL_END_DATE,
    LABEL_END_TIME,
    LABEL_START_TIME,
    LABEL_SEVERITY,
    LABEL_DURATION_HOURS,
    TIME_FORMAT,
    LABEL_HEADER,
    HEADER_MAX_LENGTH,
    LABEL_STATUS,
    LABEL_DISRUPTION_NOTES,
    DESCRIPTION_NOTE_MAX_LENGTH } from '../../../../../constants/disruptions';
import {
    isEndDateValid,
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
    isDurationValid,
    getRecurrenceDates,
    getStatusOptions,
    formatCreatedUpdatedTime,
} from '../../../../../utils/control/disruptions';
import {
    generateActivePeriodsFromRecurrencePattern,
    getRecurrenceText,
    parseRecurrencePattern } from '../../../../../utils/recurrence';
import { DISRUPTION_TYPE, SEVERITIES, DEFAULT_SEVERITY } from '../../../../../types/disruptions-types';
import SelectEffectEntities from '../WizardSteps/SelectEffectEntities';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import {
    toggleEditEffectPanel,
    updateDisruptionIncidentNoToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit } from '../../../../../redux/actions/control/incidents';
import { useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { getDatePickerOptions } from '../../../../../utils/dateUtils';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import HistoryNotesModal from './HistoryNotesModal';
import './EditEffectPanel.scss';

const INIT_EFFECT_STATE = {
    key: '',
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    impact: DEFAULT_IMPACT.value,
    cause: DEFAULT_CAUSE.value,
    affectedEntities: {
        affectedRoutes: [],
        affectedStops: [],
    },
    createNotification: false,
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: DEFAULT_SEVERITY.value,
    recurrent: false,
    duration: '',
    recurrencePattern: { freq: RRule.WEEKLY },
    isRecurrencePatternDirty: false,
    header: '',
    incidentNo: '',
    note: '',
    notes: [],
};

export const EditEffectPanel = (props) => {
    const { disruptions, disruptionIncidentNoToEdit, disruptionRecurrent, modalOpenedTime } = props;
    const [disruption, setDisruption] = useState({ ...INIT_EFFECT_STATE });
    const [now] = useState(moment().second(0).millisecond(0));
    const [activePeriods, setActivePeriods] = useState([]);
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);
    const [isStartTimeDirty, setIsStartTimeDirty] = useState(false);
    const [isTitleDirty, setIsTitleDirty] = useState(false);
    const [isStartDateDirty, setIsStartDateDirty] = useState(false);
    const [isEndDateDirty, setIsEndDateDirty] = useState(false);
    const [isImpactDirty, setIsImpactDirty] = useState(false);
    const [isSeverityDirty, setIsSeverityDirty] = useState(false);
    const [isDurationDirty, setIsDurationDirty] = useState(false);
    const [isRecurrencePatternDirty, setIsRecurrencePatternDirty] = useState(false);
    const [historyNotesModalOpen, setHistoryNotesModalOpen] = useState(false);

    console.warn('disruption', disruption);
    useEffect(() => {
        if (disruptionIncidentNoToEdit) {
            // const disruptionToEdit = disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit);
            setDisruption(disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit));
            /*  const disruptionType = disruptionToEdit.affectedEntities.map(entity => entity.type === 'route').length > 0 ? DISRUPTION_TYPE.ROUTES : DISRUPTION_TYPE.STOPS;
            setDisruption(
                {
                    ...disruptionToEdit,
                    ...(disruptionToEdit.startTime && { startTime: moment(disruptionToEdit.startTime).format(TIME_FORMAT) }),
                    ...(disruptionToEdit.startTime && { startDate: moment(disruptionToEdit.startTime).format(DATE_FORMAT) }),
                    ...(disruptionToEdit.endTime && { endTime: moment(disruptionToEdit.endTime).format(TIME_FORMAT) }),
                    ...(disruptionToEdit.endTime && { endDate: moment(disruptionToEdit.endTime).format(DATE_FORMAT) }),
                    ...(disruptionToEdit.affectedEntities.length > 0 && {
                        affectedEntities: {
                            affectedStops: [...disruptionToEdit.affectedEntities.filter(entity => entity.type === 'stop')],
                            affectedRoutes: [...disruptionToEdit.affectedEntities.filter(entity => entity.type === 'route')],
                        },
                    }),
                    ...disruptionType,
                },
            ); */
        }
    }, [disruptionIncidentNoToEdit]);

    const onSubmit = () => {
        const updatedDisruptions = disruptions.map(d => (d.incidentNo === disruption.incidentNo ? disruption : d));
        props.onDisruptionsUpdate('disruptions', updatedDisruptions);
        props.toggleEditEffectPanel(false);
        props.updateDisruptionIncidentNoToEditEffect('');
    };

    const onClose = () => {
        setDisruption({ ...INIT_EFFECT_STATE });
        props.toggleEditEffectPanel(false);
        props.updateDisruptionIncidentNoToEditEffect('');
    };

    const startTimeValid = () => isStartTimeValid(
        disruption.startDate,
        disruption.startTime,
        moment(modalOpenedTime),
        disruptionRecurrent,
    );

    const impactValid = () => !isEmpty(disruption.impact);
    const severityValid = () => !isEmpty(disruption.severity);

    const durationValid = () => isDurationValid(disruption.duration, disruptionRecurrent);
    const endTimeValid = () => isEndTimeValid(
        disruption.endDate,
        disruption.endTime,
        disruption.startDate,
        disruption.startTime,
    );
    const endDateValid = () => isEndDateValid(disruption.endDate, disruption.startDate, disruptionRecurrent);

    const startDateValid = () => isStartDateValid(disruption.startDate, moment(modalOpenedTime), disruptionRecurrent);

    const isDateTimeValid = () => startTimeValid() && startDateValid() && endDateValid() && durationValid();

    const titleValid = () => !isEmpty(disruption.header);

    const datePickerOptions = getDatePickerOptions();

    const endDateDatePickerOptions = () => getDatePickerOptions(disruption.startDate || moment().second(0).millisecond(0));

    const updateDisruption = (updatedFields) => {
        let recurrenceDates;
        let parsedRecurrencePattern;
        if (updatedFields?.startDate || updatedFields?.startTime || updatedFields?.endDate || updatedFields?.recurrent) {
            recurrenceDates = getRecurrenceDates(
                updatedFields.startDate || disruption.startDate,
                updatedFields.startTime || disruption.startTime,
                updatedFields.endDate || disruption.endDate,
            );
            parsedRecurrencePattern = disruption.recurrent ? parseRecurrencePattern(disruption.recurrencePattern) : { freq: RRule.WEEKLY };
        }
        setDisruption(prev => ({
            ...prev,
            ...updatedFields,
            ...(recurrenceDates && {
                recurrencePattern: {
                    ...prev.recurrencePattern,
                    ...parsedRecurrencePattern,
                    ...recurrenceDates,
                },
            }),
        }));
    };

    const onChangeStartDate = (date) => {
        if (date.length === 0) {
            updateDisruption({ startDate: '' });
            setIsStartDateDirty(true);
        } else {
            updateDisruption({ startDate: moment(date[0]).format(DATE_FORMAT) });
            setIsStartDateDirty(false);
        }
    };

    const onChangeEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0) {
                /* if (props.useDraftDisruptions) {
                    updateDisruption({ endDate: '', isEndDateDirty: false });
                } else { */
                updateDisruption({ isEndDateDirty: true });
                setIsEndDateDirty(true);
                // }
            } else {
                updateDisruption({ endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '' });
                setIsEndDateDirty(false);
            }
        } else {
            updateDisruption({ endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '' });
            setIsEndDateDirty(false);
        }
    };

    const onBlurEndDate = (date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0 /* && !props.useDraftDisruptions */) {
                setIsEndDateDirty(true);
            } else {
                setIsEndDateDirty(false);
            }
        } else {
            setIsEndDateDirty(false);
        }
    };

    const onUpdateRecurrencePattern = (byweekday) => {
        setDisruption(prev => ({
            ...prev,
            recurrencePattern: { ...prev.recurrencePattern, byweekday },
        }));
    };

    const isViewAllDisabled = () => !isDateTimeValid() || isEmpty(disruption.recurrencePattern?.byweekday);

    const displayActivePeriods = () => {
        setActivePeriods(generateActivePeriodsFromRecurrencePattern(
            disruption.recurrencePattern,
            disruption.duration,
        ));
        setActivePeriodsModalOpen(true);
    };

    const onAffectedEntitiesUpdate = (disruptionKey, valueKey, affectedEntities) => {
        const updatedDisruptions = {
            ...disruption,
            affectedEntities: {
                ...disruption.affectedEntities,
                [valueKey]: affectedEntities,
            },
        };
        setDisruption(updatedDisruptions);
        // setRequireMapUpdate(true);
    };

    const resetAffectedEntities = (disruptionKey) => {
        setDisruption(prev => ({
            ...prev,
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [],
            },
        }));
        // setRequireMapUpdate(true);
    };

    const onDisruptionTypeUpdate = (key, disruptionType) => {
        updateDisruption({ disruptionType });
    };

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const setDisruptionStatus = (selectedStatus) => {
        updateDisruption({ status: selectedStatus });
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

    const onBlurTitle = () => {
        setIsTitleDirty(true);
    };

    const closeWorkaroundPanel = () => {
        props.updateDisruptionKeyToWorkaroundEdit('');
        props.toggleWorkaroundPanel(false);
    };

    const openWorkaroundPanel = () => {
        props.updateDisruptionKeyToWorkaroundEdit(props.disruptionIncidentNoToEdit);
        props.toggleWorkaroundPanel(true);
    };

    const impacts = useAlertEffects();

    return (
        <div className={ `edit-effect-panel ${!props.isEditEffectPanelOpen ? 'pointer-event-none' : ''}` }>
            { props.isEditEffectPanelOpen && (
                <Paper component={ Stack } direction="column" justifyContent="center" className="mui-paper">
                    <div className="edit-effect-panel-body">
                        <div className="label-with-icon">
                            <h2 className="pl-4 pr-4 pt-4">{ `Edit details of Effect ${disruption.incidentNo}` }</h2>
                            {' '}
                            { props.isWorkaroundPanelOpen
                                && (
                                    <KeyboardDoubleArrowLeftIcon onClick={ closeWorkaroundPanel }
                                        className="collapse-icon"
                                        style={ { color: '#399CDB', fontSize: '48px' } } />
                                )}
                            { !props.isWorkaroundPanelOpen
                                && (
                                    <KeyboardDoubleArrowRightIcon onClick={ openWorkaroundPanel }
                                        className="collapse-icon"
                                        style={ { color: '#399CDB', fontSize: '48px' } } />
                                )}
                        </div>
                        <Form key="form" className="row my-3 p-4 incident-effect">
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
                                        onChange={ event => updateDisruption({ header: event.target.value }) }
                                        onBlur={ onBlurTitle }
                                        value={ disruption.header }
                                        invalid={ isTitleDirty && !titleValid() }
                                    />
                                    <FormFeedback>Please enter disruption title</FormFeedback>
                                </FormGroup>
                            </div>
                            <div className="col-6">
                                <FormGroup>
                                    <DisruptionDetailSelect
                                        id="disruption-creation__wizard-select-details__impact"
                                        className=""
                                        value={ disruption.impact }
                                        options={ impacts }
                                        label={ LABEL_CUSTOMER_IMPACT }
                                        invalid={ isImpactDirty && !impactValid() }
                                        feedback="Please select effect"
                                        onBlur={ (selectedItem) => {
                                            updateDisruption({ impact: selectedItem });
                                            setIsImpactDirty(true);
                                        } }
                                        onChange={ (selectedItem) => {
                                            updateDisruption({ impact: selectedItem });
                                            setIsImpactDirty(true);
                                        } } />
                                </FormGroup>
                            </div>
                            <div className="col-6">
                                <FormGroup>
                                    <DisruptionDetailSelect
                                        id="disruption-detail__status"
                                        className=""
                                        value={ disruption.status }
                                        options={ getStatusOptions(disruption.startDate, disruption.startTime, now) }
                                        label={ LABEL_STATUS }
                                        onChange={ setDisruptionStatus } />
                                </FormGroup>
                            </div>
                            <div className="col-6">
                                <FormGroup className="position-relative">
                                    <Label for="disruption-creation__wizard-select-details__start-date">
                                        <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                                    </Label>
                                    <Flatpickr
                                        key="start-date"
                                        id="disruption-creation__wizard-select-details__start-date"
                                        className={ `font-weight-normal cc-form-control form-control ${isStartDateDirty ? 'is-invalid' : ''}` }
                                        value={ disruption.startDate }
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
                                            {!disruptionRecurrent ? getOptionalLabel(LABEL_END_DATE) : LABEL_END_DATE}
                                        </span>
                                    </Label>
                                    {!disruptionRecurrent && (
                                        <Flatpickr
                                            key="end-date"
                                            id="disruption-creation__wizard-select-details__end-date"
                                            className={ `font-weight-normal cc-form-control form-control ${isEndDateDirty ? 'is-invalid' : ''}` }
                                            value={ disruption.endDate }
                                            options={ endDateDatePickerOptions() }
                                            onChange={ date => onChangeEndDate(date, false) }
                                            onOpen={ date => onBlurEndDate(date, false) }
                                        />
                                    )}
                                    {disruptionRecurrent && (
                                        <Flatpickr
                                            key="end-date"
                                            id="disruption-creation__wizard-select-details__end-date"
                                            className={ `font-weight-normal cc-form-control form-control ${isEndDateDirty ? 'is-invalid' : ''}` }
                                            value={ disruption.endDate }
                                            options={ endDateDatePickerOptions() }
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
                                        value={ disruption.startTime }
                                        onChange={ (event) => {
                                            updateDisruption({ startTime: event.target.value });
                                            setIsStartTimeDirty(false);
                                        } }
                                        invalid={ (/* props.useDraftDisruptions ? (!disruption.isStartTimeDirty && !startTimeValid(disruption.key)) : */ !startTimeValid()) }
                                    />
                                    <FormFeedback>Not valid values</FormFeedback>
                                </FormGroup>
                                {!disruptionRecurrent && (
                                    <FormGroup>
                                        <Label for="disruption-creation__wizard-select-details__end-time">
                                            <span className="font-size-md font-weight-bold">{getOptionalLabel(LABEL_END_TIME)}</span>
                                        </Label>
                                        <Input
                                            id="disruption-creation__wizard-select-details__end-time"
                                            className="border border-dark"
                                            value={ disruption.endTime }
                                            onChange={ event => updateDisruption({ endTime: event.target.value }) }
                                            invalid={ !endTimeValid() }
                                        />
                                        <FormFeedback>Not valid values</FormFeedback>
                                    </FormGroup>
                                )}
                                { disruptionRecurrent && (
                                    <FormGroup>
                                        <Label for="disruption-creation__wizard-select-details__duration">
                                            <span className="font-size-md font-weight-bold">{LABEL_DURATION_HOURS}</span>
                                        </Label>
                                        <Input
                                            id="disruption-creation__wizard-select-details__duration"
                                            className="border border-dark"
                                            value={ disruption.duration }
                                            onChange={ event => updateDisruption({ duration: event.target.value }) }
                                            invalid={ isDurationDirty && !durationValid() }
                                            onBlur={ () => setIsDurationDirty(true) }
                                            type="number"
                                            min="1"
                                            max="24"
                                        />
                                        <FormFeedback>Not valid duration</FormFeedback>
                                    </FormGroup>
                                )}
                            </div>
                            <div className="col-6">
                                <FormGroup>
                                    <DisruptionDetailSelect
                                        id="disruption-creation__wizard-select-details__severity"
                                        className=""
                                        value={ disruption.severity }
                                        options={ SEVERITIES }
                                        label={ LABEL_SEVERITY }
                                        invalid={ isSeverityDirty && !severityValid() }
                                        feedback="Please select severity"
                                        onBlur={ (selectedItem) => {
                                            updateDisruption({ severity: selectedItem, isSeverityDirty: true });
                                            setIsSeverityDirty(true);
                                        } }
                                        onChange={ (selectedItem) => {
                                            updateDisruption({ severity: selectedItem, isSeverityDirty: true });
                                            setIsSeverityDirty(true);
                                        } }
                                    />
                                </FormGroup>
                            </div>

                            <div className="col-12">
                                <FormGroup>
                                    <div className="label-with-icon">
                                        <Label for="disruption-detail__notes">
                                            <span className="font-size-md font-weight-bold">
                                                {LABEL_DISRUPTION_NOTES}
                                                {' '}
                                            </span>
                                        </Label>
                                        <HistoryIcon style={ { color: '#399CDB', cursor: 'pointer' } } onClick={ () => setHistoryNotesModalOpen(true) } />
                                    </div>
                                    <Input id="disruption-detail__notes"
                                        className="textarea-no-resize border border-dark"
                                        type="textarea"
                                        value={ disruption.note }
                                        onChange={ e => updateDisruption({ note: e.currentTarget.value }) }
                                        maxLength={ DESCRIPTION_NOTE_MAX_LENGTH }
                                        rows={ 5 }
                                        disabled={ false } />
                                    <div className="flex-justify-content-end">
                                        <Button className="add-note-button cc-btn-secondary">Add note</Button>
                                    </div>
                                </FormGroup>
                            </div>
                            { disruption.notes.length > 0 && (
                                <div className="col-12 last-note-grid">
                                    <span className="font-size-md font-weight-bold last-note-label">Last note</span>
                                    <span className="pl-2 last-note-info">
                                        {disruption.notes[disruption.notes.length - 1].createdBy}
                                        {', '}
                                        {formatCreatedUpdatedTime(disruption.notes[disruption.notes.length - 1].createdTime)}
                                    </span>
                                    <span className="pl-2 last-note-description">
                                        {disruption.notes[disruption.notes.length - 1].description}
                                    </span>
                                </div>
                            )}
                            { disruptionRecurrent && (
                                <>
                                    <div className="col-6 text-center">
                                        <WeekdayPicker
                                            selectedWeekdays={ disruption.recurrencePattern.byweekday || [] }
                                            onUpdate={ byweekday => onUpdateRecurrencePattern(byweekday) }
                                        />
                                    </div>
                                    <div className="col-6 pb-3 text-center">
                                        <Button disabled={ isViewAllDisabled() }
                                            className="showActivePeriods btn btn-secondary lh-1"
                                            onClick={ () => displayActivePeriods() }>
                                            View All
                                        </Button>
                                    </div>
                                    { (/* props.useDraftDisruptions
                                        ? (!isEmpty(disruption.recurrencePattern.byweekday) && activePeriodsValidV2(disruption.key))
                                        :  */!isEmpty(disruption.recurrencePattern.byweekday)) && (
                                        <div className="col-12 mb-3">
                                            <BsArrowRepeat size={ 22 } />
                                            <span className="pl-1">{ getRecurrenceText(disruption.recurrencePattern) }</span>
                                        </div>
                                    )}
                                    { (/* props.useDraftDisruptions
                                        ? (disruption.isRecurrencePatternDirty && (isEmpty(disruption.recurrencePattern.byweekday) || !activePeriodsValidV2(disruption.key)))
                                        :  */(isRecurrencePatternDirty && isEmpty(disruption.recurrencePattern.byweekday))) && (
                                        <div className="col-12 mb-3">
                                            <span className="disruption-recurrence-invalid">Please select recurrence</span>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="col-12">
                                <FormGroup className="disruption-creation__checkbox">
                                    <Input
                                        type="checkbox"
                                        className="ml-0"
                                        onChange={ event => updateDisruption({ createNotification: event.currentTarget.checked }) }
                                        checked={ disruption.createNotification }
                                    />
                                    <span className="pl-2">Draft Stop Message</span>
                                </FormGroup>
                            </div>
                            <div className="disruption-display-block">
                                <SelectEffectEntities
                                    disruptionKey={ disruption.key }
                                    affectedEntities={ disruption.affectedEntities }
                                    onAffectedEntitiesUpdate={ onAffectedEntitiesUpdate }
                                    resetAffectedEntities={ resetAffectedEntities }
                                    disruptionType={ disruption.disruptionType }
                                    onDisruptionTypeUpdate={ onDisruptionTypeUpdate } />
                            </div>
                        </Form>
                    </div>
                    <footer className="row m-0 justify-content-between p-4 position-fixed">
                        <div className="col-4">
                            <Button
                                className="btn cc-btn-link btn-block close-workaround"
                                onClick={ () => onClose() }>
                                Close
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button
                                className="btn cc-btn-primary btn-block save-workaround"
                                onClick={ () => onSubmit() }>
                                Save
                            </Button>
                        </div>
                    </footer>
                </Paper>
            )}
            <HistoryNotesModal
                disruption={ disruption }
                isModalOpen={ historyNotesModalOpen }
                onClose={ () => setHistoryNotesModalOpen(false) } />
        </div>
    );
};

EditEffectPanel.propTypes = {
    disruptions: PropTypes.array.isRequired,
    toggleEditEffectPanel: PropTypes.func.isRequired,
    isEditEffectPanelOpen: PropTypes.bool,
    disruptionIncidentNoToEdit: PropTypes.string,
    // onWorkaroundUpdate: PropTypes.func.isRequired,
    updateDisruptionIncidentNoToEditEffect: PropTypes.func.isRequired,
    disruptionRecurrent: PropTypes.bool.isRequired,
    modalOpenedTime: PropTypes.string.isRequired,
    onDisruptionsUpdate: PropTypes.func.isRequired,
    isWorkaroundPanelOpen: PropTypes.bool,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
};

EditEffectPanel.defaultProps = {
    isEditEffectPanelOpen: false,
    disruptionIncidentNoToEdit: '',
    isWorkaroundPanelOpen: false,
};

export default connect(state => ({
    isEditEffectPanelOpen: isEditEffectPanelOpen(state),
    disruptionIncidentNoToEdit: getDisruptionIncidentNoToEditEffect(state),
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
}), {
    toggleEditEffectPanel,
    updateDisruptionIncidentNoToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
})(EditEffectPanel);
