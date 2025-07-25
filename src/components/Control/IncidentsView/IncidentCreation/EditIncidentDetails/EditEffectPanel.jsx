import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Paper, Stack } from '@mui/material';
import { isEmpty, sortBy, some, isEqual } from 'lodash-es';
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
import { isEditEffectPanelOpen,
    getDisruptionIncidentNoToEditEffect,
    isWorkaroundPanelOpen,
} from '../../../../../redux/selectors/control/incidents';
import { DisruptionDetailSelect } from '../../../DisruptionsView/DisruptionDetail/DisruptionDetailSelect';
import {
    LABEL_CUSTOMER_IMPACT,
    LABEL_START_DATE,
    DATE_FORMAT,
    TIME_FORMAT,
    LABEL_END_DATE,
    LABEL_END_TIME,
    LABEL_START_TIME,
    LABEL_SEVERITY,
    LABEL_DURATION_HOURS,
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
    momentFromDateTime,
} from '../../../../../utils/control/disruptions';
import {
    generateActivePeriodsFromRecurrencePattern,
    getRecurrenceText,
    parseRecurrencePattern,
    isActivePeriodsValid } from '../../../../../utils/recurrence';
import { DISRUPTION_TYPE, SEVERITIES, DEFAULT_SEVERITY, STATUSES } from '../../../../../types/disruptions-types';
import SelectEffectEntities from '../WizardSteps/SelectEffectEntities';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import {
    toggleEditEffectPanel,
    updateDisruptionIncidentNoToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    updateDisruption as updateDisruptionAction,
    getRoutesByShortName,
    updateAffectedStopsState,
    updateAffectedRoutesState,
    setRequireToUpdateWorkaroundsState,
    setDisruptionForWorkaroundEdit,
} from '../../../../../redux/actions/control/incidents';
import { useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { getDatePickerOptions } from '../../../../../utils/dateUtils';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import HistoryNotesModal from './HistoryNotesModal';
import { shareToEmail } from '../../../../../utils/control/disruption-sharing';
import CustomMuiDialog from '../../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../../Common/ActivePeriods/ActivePeriods';
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
    status: STATUSES.NOT_STARTED,
};

export const EditEffectPanel = (props) => {
    const { disruptions, disruptionIncidentNoToEdit, disruptionRecurrent, modalOpenedTime } = props;
    const [disruption, setDisruption] = useState({ ...INIT_EFFECT_STATE });
    const [originalDisruption, setOriginalDisruption] = useState({});
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
    const [requireMapUpdate, setRequireMapUpdate] = useState(false);

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
                if (disruption.status === STATUSES.DRAFT) {
                    updateDisruption({ endDate: '', isEndDateDirty: false });
                } else {
                    updateDisruption({ isEndDateDirty: true });
                    setIsEndDateDirty(true);
                }
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
            if (date.length === 0 && disruption.status !== STATUSES.DRAFT) {
                setIsEndDateDirty(true);
            } else {
                setIsEndDateDirty(false);
            }
        } else {
            setIsEndDateDirty(false);
        }
    };

    const onUpdateRecurrencePattern = (byweekday) => {
        setIsRecurrencePatternDirty(true);
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
        setRequireMapUpdate(true);
        props.setDisruptionForWorkaroundEdit(updatedDisruptions);
        props.setRequireToUpdateWorkaroundsState(true);
    };

    const resetAffectedEntities = () => {
        setDisruption(prev => ({
            ...prev,
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [],
            },
        }));
        setRequireMapUpdate(true);
        props.updateAffectedStopsState([]);
        props.updateAffectedRoutesState([]);
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

        if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.RESOLVED) {
            updateDisruption({
                startDate: moment().format(DATE_FORMAT),
                startTime: moment().format(TIME_FORMAT),
                endDate: moment().format(DATE_FORMAT),
                endTime: moment().format(TIME_FORMAT),
            });
        } else if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.IN_PROGRESS) {
            updateDisruption({
                startDate: moment().format(DATE_FORMAT),
                startTime: moment().format(TIME_FORMAT),
            });
        } else if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.NOT_STARTED) {
            updateDisruption({
                startDate: moment(disruption.startTime).format(DATE_FORMAT),
                startTime: moment(disruption.startTime).format(TIME_FORMAT),
                endDate: '',
                endTime: '',
            });
        } else if (disruption.status === STATUSES.IN_PROGRESS && selectedStatus === STATUSES.RESOLVED) {
            updateDisruption({
                endDate: moment().format(DATE_FORMAT),
                endTime: moment().format(TIME_FORMAT),
            });
        }
    };

    const setDisruptionEntity = () => {
        const startDate = disruption.startDate ? disruption.startDate : moment(disruption.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, disruption.startTime);

        let endTimeMoment;
        if (!isEmpty(disruption.endDate) && !isEmpty(disruption.endTime)) {
            endTimeMoment = momentFromDateTime(disruption.endDate, disruption.endTime);
        }
        return {
            ...disruption,
            notes: [...disruption.notes, ...(disruption.note ? [{ description: disruption.note }] : [])],
            affectedEntities: [...disruption.affectedEntities.affectedRoutes, ...disruption.affectedEntities.affectedStops],
            endTime: endTimeMoment,
            startTime: startTimeMoment,
        };
    };

    const saveAndShareHandler = async () => {
        const disruptionEntity = setDisruptionEntity();
        const result = await props.updateDisruptionAction(disruptionEntity);
        shareToEmail(result || disruptionEntity);
        props.toggleEditEffectPanel(false);
        props.updateDisruptionIncidentNoToEditEffect('');
        updateDisruption({ note: '' });
        props.setDisruptionForWorkaroundEdit({});
    };

    const shareToEmailHandler = async () => {
        const disruptionEntity = setDisruptionEntity();
        shareToEmail(disruptionEntity);
    };

    const activePeriodsValidV2 = () => {
        if (disruption.recurrent) {
            return isActivePeriodsValid(disruption.recurrencePattern, disruption.duration, disruption.maxActivePeriodsCount);
        }
        return true;
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

    const isRequiredPropsEmpty = () => {
        const isPropsEmpty = some([disruption.startTime, disruption.startDate, disruption.impact, disruption.cause, disruption.header, disruption.severity], isEmpty);
        const isEndTimeRequiredAndEmpty = !disruption.recurrent && !isEmpty(disruption.endDate) && isEmpty(disruption.endTime);
        const isWeekdayRequiredAndEmpty = disruption.recurrent && isEmpty(disruption.recurrencePattern.byweekday);
        return isPropsEmpty || isEndTimeRequiredAndEmpty || isWeekdayRequiredAndEmpty;
    };

    const affectedEntitySelected = () => disruption.affectedEntities.affectedRoutes.length > 0 || disruption.affectedEntities.affectedStops.length > 0;
    const isRequiredDraftPropsEmpty = () => some([disruption.header, disruption.cause], isEmpty);

    const isSubmitDisabled = isRequiredPropsEmpty()
        || !startTimeValid()
        || !startDateValid()
        || !endTimeValid()
        || !endDateValid()
        || !durationValid()
        || !affectedEntitySelected();
    const isDraftSubmitDisabled = isRequiredDraftPropsEmpty();

    const impacts = useAlertEffects();

    const onAddNote = () => {
        const startDate = originalDisruption.startDate ? originalDisruption.startDate : moment(originalDisruption.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, originalDisruption.startTime);

        let endTimeMoment;
        if (!isEmpty(originalDisruption.endDate) && !isEmpty(originalDisruption.endTime)) {
            endTimeMoment = momentFromDateTime(originalDisruption.endDate, originalDisruption.endTime);
        }
        const updatedDisruption = {
            ...originalDisruption,
            notes: [...originalDisruption.notes, { description: disruption.note }],
            affectedEntities: [...originalDisruption.affectedEntities.affectedRoutes, ...originalDisruption.affectedEntities.affectedStops],
            endTime: endTimeMoment,
            startTime: startTimeMoment,
        };
        props.updateDisruptionAction(updatedDisruption);
        updateDisruption({ note: '' });
    };

    const onSubmit = () => {
        props.updateDisruptionAction(setDisruptionEntity());

        props.toggleEditEffectPanel(false);
        props.updateDisruptionIncidentNoToEditEffect('');
        updateDisruption({ note: '' });
        props.setDisruptionForWorkaroundEdit({});
    };

    const removeNotFoundFromStopGroupsForAllDisruptions = () => {
        disruptions.forEach((d) => {
            const filterStops = d.affectedEntities.affectedStops.filter(stop => stop.stopCode !== 'Not Found');
            if (filterStops.length !== d.affectedEntities.affectedStops.length) {
                onAffectedEntitiesUpdate(d.key, 'affectedStops', filterStops);
            }
        });
    };

    useEffect(() => {
        if (!props.isEditEffectPanelOpen) {
            removeNotFoundFromStopGroupsForAllDisruptions();
            const routes = disruptions.map(d => d.affectedEntities.affectedRoutes).flat();
            const stops = disruptions.map(d => d.affectedEntities.affectedStops).flat();

            props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));

            if (routes.length > 0) {
                props.updateAffectedRoutesState(routes);
                props.getRoutesByShortName(routes);
            }
        } else {
            setRequireMapUpdate(true);
        }
    }, [props.isEditEffectPanelOpen, props.disruptionIncidentNoToEdit]);

    const removeNotFoundFromStopGroups = () => {
        const filterStops = disruption.affectedEntities.affectedStops.filter(stop => stop.stopCode !== 'Not Found');
        if (filterStops.length !== disruption.affectedEntities.affectedStops.length) {
            onAffectedEntitiesUpdate(disruption.key, 'affectedStops', filterStops);
        }
    };

    useEffect(() => {
        if (requireMapUpdate) {
            removeNotFoundFromStopGroups();
            const routes = (disruption.affectedEntities.affectedRoutes).flat();
            const stops = (disruption.affectedEntities.affectedStops).flat();

            props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));

            if (routes.length > 0) {
                props.updateAffectedRoutesState(routes);
                props.getRoutesByShortName(routes);
            }
            setRequireMapUpdate(false);
        }
    }, [requireMapUpdate]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit) {
            const disruptionToSet = disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit);
            setDisruption(disruptionToSet);
            setOriginalDisruption(disruptionToSet);
            props.setDisruptionForWorkaroundEdit(disruptionToSet);
            props.updateIsNotesRequiresToUpdateState();
        }
    }, [disruptionIncidentNoToEdit]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit && props.isNotesRequiresToUpdate) {
            updateDisruption({ notes: (disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit).notes) });
            setOriginalDisruption(disruptions.find(d => d.incidentNo === disruptionIncidentNoToEdit));
            props.updateIsNotesRequiresToUpdateState();
        }
    }, [props.isNotesRequiresToUpdate]);

    useEffect(() => {
        if (disruptionIncidentNoToEdit && props.isWorkaroundsRequiresToUpdate && props.workaroundsToSync.length > 0) {
            updateDisruption({ workarounds: props.workaroundsToSync });
            props.updateIsWorkaroundsRequiresToUpdateState();
        }
    }, [props.isWorkaroundsRequiresToUpdate]);

    const isValuesChanged = isEqual(disruption, originalDisruption);

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
                                        options={ getStatusOptions(disruption.startDate, disruption.startTime, now, disruption.status) }
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
                                            setIsStartTimeDirty(true);
                                        } }
                                        invalid={ (disruption.status === STATUSES.DRAFT ? (isStartTimeDirty && !startTimeValid(disruption.key)) : !startTimeValid()) }
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
                                    { (disruption.status === STATUSES.DRAFT
                                        ? (!isEmpty(disruption.recurrencePattern.byweekday) && activePeriodsValidV2(disruption.key))
                                        : !isEmpty(disruption.recurrencePattern.byweekday)) && (
                                        <div className="col-12 mb-3">
                                            <BsArrowRepeat size={ 22 } />
                                            <span className="pl-1">{ getRecurrenceText(parseRecurrencePattern(disruption.recurrencePattern)) }</span>
                                        </div>
                                    )}
                                    { (disruption.status === STATUSES.DRAFT
                                        ? (disruption.isRecurrencePatternDirty && (isEmpty(disruption.recurrencePattern.byweekday) || !activePeriodsValidV2(disruption.key)))
                                        : (isRecurrencePatternDirty && isEmpty(disruption.recurrencePattern.byweekday))) && (
                                        <div className="col-12 mb-3">
                                            <span className="disruption-recurrence-invalid">Please select recurrence</span>
                                        </div>
                                    )}
                                </>
                            )}
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
                                        <Button className="add-note-button cc-btn-secondary" onClick={ () => onAddNote() }>Add note</Button>
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
                                    <span className="pl-2 last-note-description pt-2">
                                        {disruption.notes[disruption.notes.length - 1].description}
                                    </span>
                                </div>
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
                    <footer className="row m-0 justify-content-end p-4 position-fixed incident-footer-min-height">
                        <div className="col-4">
                            {!isValuesChanged && (
                                <Button
                                    disabled={ (disruption.status === STATUSES.DRAFT ? isDraftSubmitDisabled : isSubmitDisabled) || props.isWorkaroundPanelOpen }
                                    className="btn cc-btn-primary btn-block save-workaround"
                                    onClick={ () => saveAndShareHandler() }>
                                    Save & Share
                                </Button>
                            )}
                            {isValuesChanged && (
                                <Button
                                    disabled={ (disruption.status === STATUSES.DRAFT ? isDraftSubmitDisabled : isSubmitDisabled) || props.isWorkaroundPanelOpen }
                                    className="btn cc-btn-primary btn-block save-workaround"
                                    onClick={ () => shareToEmailHandler() }>
                                    Share to email
                                </Button>
                            )}
                        </div>
                        <div className="col-4">
                            <Button
                                disabled={ (disruption.status === STATUSES.DRAFT ? isDraftSubmitDisabled : isSubmitDisabled) || props.isWorkaroundPanelOpen }
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
            <CustomMuiDialog
                title="Disruption Active Periods"
                onClose={ () => setActivePeriodsModalOpen(false) }
                isOpen={ activePeriodsModalOpen }>
                <ActivePeriods activePeriods={ activePeriods } />
            </CustomMuiDialog>
        </div>
    );
};

EditEffectPanel.propTypes = {
    disruptions: PropTypes.array.isRequired,
    toggleEditEffectPanel: PropTypes.func.isRequired,
    isEditEffectPanelOpen: PropTypes.bool,
    disruptionIncidentNoToEdit: PropTypes.string,
    updateDisruptionIncidentNoToEditEffect: PropTypes.func.isRequired,
    disruptionRecurrent: PropTypes.bool.isRequired,
    modalOpenedTime: PropTypes.string.isRequired,
    isWorkaroundPanelOpen: PropTypes.bool,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
    isNotesRequiresToUpdate: PropTypes.bool.isRequired,
    updateIsNotesRequiresToUpdateState: PropTypes.func.isRequired,
    isWorkaroundsRequiresToUpdate: PropTypes.bool.isRequired,
    updateIsWorkaroundsRequiresToUpdateState: PropTypes.func.isRequired,
    updateDisruptionAction: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    setRequireToUpdateWorkaroundsState: PropTypes.func.isRequired,
    setDisruptionForWorkaroundEdit: PropTypes.func.isRequired,
    workaroundsToSync: PropTypes.array,
};

EditEffectPanel.defaultProps = {
    isEditEffectPanelOpen: false,
    disruptionIncidentNoToEdit: '',
    isWorkaroundPanelOpen: false,
    workaroundsToSync: [],
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
    updateDisruptionAction,
    getRoutesByShortName,
    updateAffectedRoutesState,
    updateAffectedStopsState,
    setRequireToUpdateWorkaroundsState,
    setDisruptionForWorkaroundEdit,
})(EditEffectPanel);
