import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { toString, omit, some, isEmpty, uniqBy, uniqWith } from 'lodash-es';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { BsArrowRepeat } from 'react-icons/bs';
import Flatpickr from 'react-flatpickr';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../Common/ActivePeriods/ActivePeriods';
import { STATUSES, SEVERITIES } from '../../../../types/disruptions-types';
import { useAlertCauses, useAlertEffects } from '../../../../utils/control/alert-cause-effect';
import {
    DATE_FORMAT,
    HEADER_MAX_LENGTH,
    LABEL_CAUSE,
    LABEL_CREATED_BY,
    LABEL_CUSTOMER_IMPACT,
    LABEL_END_DATE,
    LABEL_END_TIME,
    LABEL_HEADER,
    LABEL_LAST_UPDATED_BY,
    LABEL_MODE,
    LABEL_START_DATE,
    LABEL_START_TIME,
    LABEL_STATUS,
    LABEL_URL,
    TIME_FORMAT,
    URL_MAX_LENGTH,
    LABEL_DURATION_HOURS,
    LABEL_DISRUPTION_NOTES,
    DESCRIPTION_NOTE_MAX_LENGTH,
    LABEL_LAST_NOTE,
    LABEL_SEVERITY,
} from '../../../../constants/disruptions';
import {
    getRoutesByShortName,
    openCreateDisruption,
    openCopyDisruption,
    updateAffectedRoutesState,
    updateAffectedStopsState,
    updateEditMode,
    updateDisruptionToEdit,
    uploadDisruptionFiles,
    deleteDisruptionFile,
    updateDisruption,
} from '../../../../redux/actions/control/disruptions';
import {
    getShapes,
    getDisruptionsLoadingState,
    getRouteColors,
    getAffectedRoutes,
    getAffectedStops,
    getBoundsToFit,
    getDisruptionAction,
} from '../../../../redux/selectors/control/disruptions';
import DetailLoader from '../../../Common/Loader/DetailLoader';
import { DisruptionDetailSelect } from '../DisruptionDetail/DisruptionDetailSelect';
import DisruptionLabelAndText from '../DisruptionDetail/DisruptionLabelAndText';
import { isUrlValid } from '../../../../utils/helpers';
import {
    formatCreatedUpdatedTime,
    isEndDateValid,
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
    momentFromDateTime,
    isDurationValid,
    getRecurrenceDates,
    recurrenceRadioOptions,
    getStatusOptions,
    itemToEntityTransformers,
} from '../../../../utils/control/disruptions';
import { calculateActivePeriods, getRecurrenceText, parseRecurrencePattern, fetchEndDateFromRecurrence } from '../../../../utils/recurrence';
import DisruptionSummaryModal from '../DisruptionDetail/DisruptionSummaryModal';
import { Map } from '../../../Common/Map/Map';
import DiversionUpload from '../DisruptionDetail/DiversionUpload';
import AffectedEntities from '../AffectedEntities';
import WeekdayPicker from '../../Common/WeekdayPicker/WeekdayPicker';
import RadioButtons from '../../../Common/RadioButtons/RadioButtons';
import EDIT_TYPE from '../../../../types/edit-types';
import { getDatePickerOptions } from '../../../../utils/dateUtils';
import ConfirmationModal from '../../Common/ConfirmationModal/ConfirmationModal';
import { confirmationModalTypes } from '../types';
import { ViewWorkaroundsModal } from '../DisruptionDetail/ViewWorkaroundsModal';
import { LastNoteView } from '../DisruptionDetail/LastNoteView';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { ShapeLayer } from '../../../Common/Map/ShapeLayer/ShapeLayer';
import { SelectedStopsMarker } from '../../../Common/Map/StopsLayer/SelectedStopsMarker';
import { DisruptionPassengerImpactGridModal } from '../DisruptionDetail/DisruptionPassengerImpactGridModal';
import { usePassengerImpact } from '../../../../redux/selectors/appSettings';
import { updateActiveControlEntityId } from '../../../../redux/actions/navigation';
import { shareToEmail } from '../../../../utils/control/disruption-sharing';

import '../DisruptionDetail/styles.scss';

const { STOP } = SEARCH_RESULT_TYPE;

const DisruptionDetailView = (props) => {
    const { disruption, isRequesting, resultDisruptionId, isLoading, isReadOnlyMode } = props;
    const { NONE, EDIT, COPY } = confirmationModalTypes;

    const causes = useAlertCauses();
    const impacts = useAlertEffects();

    const formatEndDateFromEndTime = disruption.endTime ? moment(disruption.endTime).format(DATE_FORMAT) : '';
    const fetchEndDate = () => (disruption.recurrent ? fetchEndDateFromRecurrence(disruption.recurrencePattern) : formatEndDateFromEndTime);
    const now = moment().second(0).millisecond(0);

    const [cause, setCause] = useState(disruption.cause);
    const [impact, setImpact] = useState(disruption.impact);
    const [status, setStatus] = useState(disruption.status);
    const [header, setHeader] = useState(disruption.header);
    const [url, setUrl] = useState(disruption.url);
    const [incidentNo, setIncidentNo] = useState(disruption.incidentNo);
    const [mode, setMode] = useState(disruption.mode);
    const [disruptionsDetailsModalOpen, setDisruptionsDetailsModalOpen] = useState(false);
    const [startTime, setStartTime] = useState(moment(disruption.startTime).format(TIME_FORMAT));
    const [startDate, setStartDate] = useState(moment(disruption.startTime).format(DATE_FORMAT));
    const [endTime, setEndTime] = useState(disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : '');
    const [endDate, setEndDate] = useState(fetchEndDate());
    const [createNotification, setCreateNotification] = useState(false);
    const [exemptAffectedTrips, setExemptAffectedTrips] = useState(disruption.exemptAffectedTrips);
    const [recurrent, setRecurrent] = useState(disruption.recurrent);
    const [duration, setDuration] = useState(disruption.duration);
    const [recurrencePattern, setRecurrencePattern] = useState(disruption.recurrencePattern);
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);
    const [activePeriods, setActivePeriods] = useState(disruption.activePeriods);
    const [notes, setNotes] = useState(disruption.notes);
    const [severity, setSeverity] = useState(disruption.severity);
    const [isRecurrenceDirty, setIsRecurrenceDirty] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(NONE);
    const [isViewWorkaroundsModalOpen, setIsViewWorkaroundsModalOpen] = useState(false);
    const [descriptionNote, setDescriptionNote] = useState('');
    const [lastNote, setLastNote] = useState();
    const [isViewPassengerImpactModalOpen, setIsViewPassengerImpactModalOpen] = useState(false);

    const haveRoutesOrStopsChanged = (affectedRoutes, affectedStops) => {
        const uniqRoutes = uniqWith([...affectedRoutes, ...props.routes], (routeA, routeB) => routeA.routeId === routeB.routeId && routeA.stopCode === routeB.stopCode);
        const uniqStops = uniqWith([...affectedStops, ...props.stops], (stopA, stopB) => stopA.stopCode === stopB.stopCode && stopA.routeId === stopB.routeId);

        return uniqRoutes.length !== affectedRoutes.length || uniqStops.length !== affectedStops.length
            || uniqRoutes.length !== props.routes.length || uniqStops.length !== props.stops.length;
    };

    // A temporary solution to render the routes on the map. It will only render the first ten routes coming
    // in the array due to the high possibility of collapsing the static API.
    // This piece of code should be deleted when a better performance solution has been put in place.

    const affectedEntitiesWithoutShape = toString(disruption.affectedEntities.map(entity => omit(entity, ['shapeWkt'])));
    useEffect(() => {
        const affectedStops = disruption.affectedEntities.filter(entity => entity.type === 'stop');
        const affectedRoutes = disruption.affectedEntities.filter(entity => entity.type === 'route' || (entity.routeId && isEmpty(entity.stopCode)));

        if ((isEmpty(props.stops) && isEmpty(props.routes)) || haveRoutesOrStopsChanged(affectedRoutes, affectedStops)) {
            props.actions.updateAffectedStopsState(affectedStops);
            props.actions.updateAffectedRoutesState(affectedRoutes);

            const routesToGet = uniqBy([...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)], item => item.routeId);

            if (routesToGet.length) {
                props.actions.getRoutesByShortName(routesToGet.slice(0, 10));
            }
        }
    }, [affectedEntitiesWithoutShape, disruption.affectedEntities]);

    useEffect(() => {
        const recurrenceDates = getRecurrenceDates(startDate, startTime, endDate);
        setRecurrencePattern({
            ...recurrencePattern,
            ...recurrenceDates,
        });

        const startDateTime = momentFromDateTime(startDate, startTime, now);
        if (startDateTime?.isValid() && status !== STATUSES.RESOLVED) {
            if (startDateTime.isAfter(now) && status === STATUSES.IN_PROGRESS) {
                setStatus(STATUSES.NOT_STARTED);
            } else if (startDateTime.isSameOrBefore(now) && status === STATUSES.NOT_STARTED) {
                setStatus(STATUSES.IN_PROGRESS);
            }
        }
    }, [startDate, startTime, endDate]);

    useEffect(() => {
        setIncidentNo(disruption.incidentNo);
        setHeader(disruption.header);
        setCause(disruption.cause);
        setImpact(disruption.impact);
        setStatus(disruption.status);
        setUrl(disruption.url);
        setMode(disruption.mode);
        setStartTime(moment(disruption.startTime).format(TIME_FORMAT));
        setStartDate(moment(disruption.startTime).format(DATE_FORMAT));
        setEndTime(disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : '');
        setEndDate(fetchEndDate());
        setCreateNotification(disruption.createNotification);
        setExemptAffectedTrips(disruption.exemptAffectedTrips);
        setRecurrent(disruption.recurrent);
        setDuration(disruption.duration);
        setNotes(disruption.notes);
        setLastNote();
    }, [
        disruption.incidentNo,
        disruption.header,
        disruption.cause,
        disruption.impact,
        disruption.status,
        disruption.description,
        disruption.url,
        disruption.mode,
        disruption.startTime,
        disruption.endTime,
        disruption.endDate,
        disruption.createNotification,
        disruption.exemptAffectedTrips,
        disruption.recurrent,
        disruption.duration,
    ]);

    useEffect(() => {
        if (!isRecurrenceDirty) {
            setRecurrencePattern(disruption.recurrencePattern);
            setActivePeriods(disruption.activePeriods);
        }
    }, [disruption.activePeriods]);

    const setDisruption = () => ({
        ...disruption,
        cause,
        impact,
        status,
        header,
        url,
        mode,
        affectedEntities: disruption.affectedEntities,
        startTime: momentFromDateTime(startDate, startTime),
        endTime: momentFromDateTime(endDate, endTime),
        createNotification,
        exemptAffectedTrips,
        recurrent,
        duration,
        recurrencePattern,
        notes: [...notes, { description: descriptionNote }],
        severity,
    });

    useEffect(() => {
        setDescriptionNote('');
        const { notes: disruptionNotes } = disruption;
        if (disruptionNotes.length > 0) {
            setLastNote(disruptionNotes[disruptionNotes.length - 1]);
        }
    }, [disruption.lastUpdatedTime, lastNote]);

    const handleUpdateDisruption = () => props.actions.updateDisruption(setDisruption());

    const handleCopyDisruption = () => {
        props.actions.openCopyDisruption(true, incidentNo);

        props.actions.updateEditMode(EDIT_TYPE.COPY);
        props.actions.updateDisruptionToEdit(setDisruption());
    };

    const setDisruptionStatus = (selectedStatus) => {
        setStatus(selectedStatus);

        if (disruption.status === STATUSES.NOT_STARTED && selectedStatus === STATUSES.RESOLVED) {
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

        setIsRecurrenceDirty(true);
    };

    const isResolved = () => status === STATUSES.RESOLVED;
    const isEndDateTimeDisabled = () => status === STATUSES.RESOLVED;
    const isStartDateTimeDisabled = () => status === STATUSES.RESOLVED || (recurrent && disruption.status !== STATUSES.NOT_STARTED);

    const startTimeValid = () => {
        if (isStartDateTimeDisabled()) {
            return true;
        }
        return isStartTimeValid(startDate, startTime, now, recurrent);
    };

    const endTimeValid = () => {
        if (isEndDateTimeDisabled()) {
            return true;
        }
        return isEndTimeValid(endDate, endTime, startDate, startTime);
    };

    const endDateValid = () => {
        if (isEndDateTimeDisabled()) {
            return true;
        }
        return isEndDateValid(endDate, startDate, recurrent);
    };

    const startDateValid = () => {
        if (isStartDateTimeDisabled()) {
            return true;
        }
        return isStartDateValid(startDate, now, recurrent);
    };

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const causeAndImpactAreValid = causes.find(c => c.value === cause) && impacts.find(i => i.value === impact);

    const durationValid = () => isDurationValid(duration, recurrent);
    const isWeekdayRequiredButEmpty = recurrent && isEmpty(recurrencePattern.byweekday);
    const isPropsEmpty = some([cause, impact, status, header, severity], isEmpty) || isWeekdayRequiredButEmpty;
    const isUpdating = isRequesting && resultDisruptionId === disruption.disruptionId;

    const isViewAllDisabled = isWeekdayRequiredButEmpty || !startTimeValid() || !startDateValid() || !endDateValid() || !durationValid();
    const isSaveDisabled = (
        isUpdating
        || isPropsEmpty
        || !isUrlValid(url) || !startTimeValid() || !startDateValid() || !endTimeValid()
        || !endDateValid() || !durationValid() || !causeAndImpactAreValid);
    const isDiversionUploadDisabled = isUpdating || isPropsEmpty || !isUrlValid(url) || !startTimeValid() || !startDateValid() || !endTimeValid() || !endDateValid();

    const editRoutesAndStops = () => {
        props.actions.updateEditMode(EDIT_TYPE.EDIT);
        props.actions.openCreateDisruption(true);
        props.actions.updateDisruptionToEdit(setDisruption());
        props.actions.updateActiveControlEntityId('');
    };

    const minEndDate = () => {
        if (!recurrent) {
            return startDate;
        }
        return now.isAfter(disruption.startTime, 'day') ? now.format(DATE_FORMAT) : startDate;
    };
    const datePickerOptionsStartDate = getDatePickerOptions(isStartDateTimeDisabled() || !recurrent ? undefined : 'today');
    const datePickerOptionsEndDate = getDatePickerOptions(isEndDateTimeDisabled() ? undefined : minEndDate());

    const displayActivePeriods = () => {
        if (isRecurrenceDirty) {
            setActivePeriods(calculateActivePeriods(recurrencePattern, duration, disruption.activePeriods, isResolved()));
        }
        setActivePeriodsModalOpen(true);
    };

    const confirmationModalProps = {
        [NONE]: {
            title: 'title',
            message: 'message',
            isOpen: false,
            onClose: () => { setIsAlertModalOpen(NONE); },
            onAction: () => { setIsAlertModalOpen(NONE); },
        },
        [EDIT]: {
            title: 'Edit disruption',
            message: 'By confirming this action this disruption will be set as a Stop-based disruption and all routes added previously will be lost.',
            isOpen: true,
            onClose: () => { setIsAlertModalOpen(NONE); },
            onAction: () => {
                setIsAlertModalOpen(NONE);
                props.actions.updateAffectedRoutesState([]);
                editRoutesAndStops();
            },
        },
        [COPY]: {
            title: 'Copy disruption',
            message: 'By confirming this action this disruption will be set as a Stop-based disruption and all routes added previously will be lost.',
            isOpen: true,
            onClose: () => { setIsAlertModalOpen(NONE); },
            onAction: () => {
                setIsAlertModalOpen(NONE);
                props.actions.updateAffectedRoutesState([]);
                handleCopyDisruption();
            },
        },
    };

    const activeConfirmationModalProps = confirmationModalProps[isAlertModalOpen];

    const affectedEntitiesEditActionHandler = () => {
        if (!isEmpty(props.stops) && !isEmpty(props.routes)) {
            setIsAlertModalOpen(EDIT);
        } else {
            editRoutesAndStops();
        }
    };

    const onChangeEndDate = (date) => {
        setEndDate(date.length ? moment(date[0]).format(DATE_FORMAT) : '');
        if (date.length === 0) {
            setEndTime('');
        }
        setIsRecurrenceDirty(true);
    };

    const onUpdateWeekdayPicker = (byweekday) => {
        setRecurrencePattern({ ...recurrencePattern, byweekday });
        setIsRecurrenceDirty(true);
    };

    const onChangeStartTime = (event) => {
        setStartTime(event.target.value);
        setIsRecurrenceDirty(true);
    };

    const onChangeDuration = (event) => {
        setDuration(event.target.value);
        setIsRecurrenceDirty(true);
    };

    const saveAndShareHandler = async () => {
        const result = await handleUpdateDisruption();
        shareToEmail(result || setDisruption());
    };

    return (
        <Form className={ props.className }>
            <div className={ isReadOnlyMode ? 'read-only-container' : '' }>
                <div className={ `row position-relative ${props.className === 'magnify' ? 'mr-0' : ''}` }>
                    <AffectedEntities
                        editLabel="Edit routes, stops and workarounds"
                        editAction={ affectedEntitiesEditActionHandler }
                        isEditDisabled={ isRequesting || isLoading || isResolved() || isReadOnlyMode }
                        affectedEntities={ disruption.affectedEntities }
                        showViewWorkaroundsButton
                        viewWorkaroundsAction={ () => setIsViewWorkaroundsModalOpen(true) }
                        showViewPassengerImpactButton={ props.usePassengerImpact }
                        viewPassengerImpactAction={ () => setIsViewPassengerImpactModalOpen(true) }
                    />
                    <section className="col-6">
                        <div className="row">
                            <section className="col-12">
                                <RadioButtons { ...recurrenceRadioOptions(recurrent) } />
                            </section>
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-6">
                                        <div className="mt-2 position-relative form-group">
                                            <DisruptionLabelAndText id="disruption-detail__mode" label={ LABEL_MODE } text={ mode } />
                                        </div>
                                        <div className="mt-2 position-relative form-group">
                                            <DisruptionDetailSelect
                                                id="disruption-detail__cause"
                                                value={ cause }
                                                options={ causes }
                                                disabled={ isResolved() || isReadOnlyMode }
                                                label={ LABEL_CAUSE }
                                                onChange={ setCause } />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="mt-2 position-relative form-group">
                                            <DisruptionDetailSelect id="disruption-detail__status"
                                                value={ status }
                                                options={ getStatusOptions(startDate, startTime, now) }
                                                label={ LABEL_STATUS }
                                                onChange={ setDisruptionStatus }
                                                disabled={ isReadOnlyMode } />
                                        </div>
                                        <DisruptionDetailSelect
                                            id="disruption-detail__impact"
                                            value={ impact }
                                            options={ impacts }
                                            disabled={ isResolved() || isReadOnlyMode }
                                            label={ LABEL_CUSTOMER_IMPACT }
                                            onChange={ setImpact }
                                        />
                                    </div>
                                    { !causeAndImpactAreValid && (
                                        <div className="col-12 cc-text-orange">
                                            Cause and/or Effect selected for this disruption are no longer valid.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="row">
                                    <section className="col-6">
                                        <FormGroup className="mt-2 position-relative">
                                            <Label for="disruption-detail__start-date">
                                                <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                                            </Label>
                                            <Flatpickr
                                                id="disruption-detail__start-date"
                                                className="font-weight-normal cc-form-control form-control"
                                                value={ startDate }
                                                disabled={ isStartDateTimeDisabled() || isReadOnlyMode }
                                                options={ datePickerOptionsStartDate }
                                                placeholder="Select date"
                                                onChange={ (date) => {
                                                    setStartDate(moment(date[0]).format(DATE_FORMAT));
                                                    setIsRecurrenceDirty(true);
                                                } } />
                                            <FaRegCalendarAlt
                                                className="disruption-creation__wizard-select-details__icon position-absolute"
                                                size={ 22 } />
                                        </FormGroup>
                                        <FormGroup className="position-relative">
                                            <Label for="disruption-detail__end-date">
                                                <span className="font-size-md font-weight-bold">{LABEL_END_DATE}</span>
                                            </Label>
                                            <Flatpickr
                                                id="disruption-detail__end-date"
                                                className="font-weight-normal cc-form-control form-control"
                                                value={ endDate }
                                                disabled={ isEndDateTimeDisabled() || isReadOnlyMode }
                                                options={ datePickerOptionsEndDate }
                                                key={ datePickerOptionsEndDate.minDate }
                                                onChange={ onChangeEndDate } />
                                            <FaRegCalendarAlt
                                                className="disruption-creation__wizard-select-details__icon position-absolute"
                                                size={ 22 } />
                                        </FormGroup>
                                        { recurrent && (
                                            <>
                                                <FormGroup>
                                                    <WeekdayPicker
                                                        selectedWeekdays={ recurrencePattern.byweekday || [] }
                                                        onUpdate={ onUpdateWeekdayPicker }
                                                        disabled={ isResolved() || isReadOnlyMode }
                                                    />
                                                </FormGroup>
                                                { !isEmpty(recurrencePattern.byweekday) && (
                                                    <FormGroup>
                                                        <BsArrowRepeat size={ 22 } />
                                                        <span className="pl-1">{ getRecurrenceText(parseRecurrencePattern(recurrencePattern)) }</span>
                                                    </FormGroup>
                                                )}
                                            </>
                                        )}
                                    </section>
                                    <section className="col-6">
                                        <FormGroup className="mt-2">
                                            <Label for="disruption-detail__start-time">
                                                <span className="font-size-md font-weight-bold">{LABEL_START_TIME}</span>
                                            </Label>
                                            <Input
                                                id="disruption-detail__start-time"
                                                className="border border-dark"
                                                value={ startTime }
                                                disabled={ isStartDateTimeDisabled() || isReadOnlyMode }
                                                onChange={ onChangeStartTime }
                                                invalid={ !startTimeValid() }
                                            />
                                        </FormGroup>
                                        { !recurrent && (
                                            <FormGroup>
                                                <Label for="disruption-detail__end-time">
                                                    <span className="font-size-md font-weight-bold">{LABEL_END_TIME}</span>
                                                </Label>
                                                <Input
                                                    id="disruption-detail__end-time"
                                                    className="border border-dark"
                                                    value={ endTime }
                                                    disabled={ isEndDateTimeDisabled() || isReadOnlyMode }
                                                    onChange={ event => setEndTime(event.target.value) }
                                                    invalid={ !endTimeValid() }
                                                />
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
                                                    onChange={ onChangeDuration }
                                                    invalid={ !durationValid() }
                                                    type="number"
                                                    min="1"
                                                    max="24"
                                                    disabled={ isResolved() || isReadOnlyMode }
                                                />
                                            </FormGroup>
                                        )}
                                        { recurrent && (
                                            <FormGroup>
                                                <Button
                                                    disabled={ !isReadOnlyMode && isViewAllDisabled }
                                                    className="cc-btn-primary btn-block"
                                                    onClick={ () => displayActivePeriods() }
                                                >
                                                    View all
                                                </Button>
                                            </FormGroup>
                                        )}
                                    </section>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="row mt-3">
                    <section className="col-6">
                        <div className="row">
                            <div className="col-6">
                                <FormGroup className="mt-2">
                                    <Label for="disruption-detail__url">
                                        <span className="font-size-md font-weight-bold">{ getOptionalLabel(LABEL_URL) }</span>
                                    </Label>
                                    <Input id="disruption-detail__url"
                                        className="border border-dark"
                                        value={ url }
                                        disabled={ isResolved() || isReadOnlyMode }
                                        onChange={ e => setUrl(e.currentTarget.value) }
                                        placeholder="e.g. https://at.govt.nz"
                                        maxLength={ URL_MAX_LENGTH }
                                        invalid={ !isUrlValid(url) }
                                    />
                                    <FormFeedback>Please enter a valid URL (e.g. https://at.govt.nz)</FormFeedback>
                                </FormGroup>
                            </div>
                            <div className="col-6">
                                <FormGroup className="mt-2">
                                    <DisruptionDetailSelect
                                        id="disruption-detail__severity"
                                        value={ severity }
                                        options={ SEVERITIES }
                                        label={ LABEL_SEVERITY }
                                        onChange={ setSeverity }
                                        disabled={ isResolved() || isReadOnlyMode }
                                    />
                                </FormGroup>
                            </div>
                        </div>
                        <FormGroup className="mt-2">
                            <Label for="disruption-detail__header">
                                <span className="font-size-md font-weight-bold">{LABEL_HEADER}</span>
                            </Label>
                            <Input id="disruption-detail__header"
                                className="border border-dark"
                                value={ header }
                                disabled={ isResolved() || isReadOnlyMode }
                                onChange={ e => setHeader(e.currentTarget.value) }
                                maxLength={ HEADER_MAX_LENGTH } />
                        </FormGroup>
                    </section>
                    { !isReadOnlyMode && (
                        <section className="col-6">
                            <FormGroup>
                                <Label for="disruption-detail__notes">
                                    <span className="font-size-md font-weight-bold">
                                        {LABEL_DISRUPTION_NOTES}
                                        {' '}
                                        <span className="text-muted font-size-sm font-weight-light">Optional. To view all notes, select `Show Summary`</span>
                                    </span>
                                </Label>
                                <Input id="disruption-detail__notes"
                                    className="textarea-no-resize border border-dark"
                                    type="textarea"
                                    value={ descriptionNote }
                                    onChange={ e => setDescriptionNote(e.currentTarget.value) }
                                    maxLength={ DESCRIPTION_NOTE_MAX_LENGTH }
                                    rows={ 5 }
                                    disabled={ isReadOnlyMode } />
                            </FormGroup>
                        </section>
                    ) }
                    <section className="col-6 disruption-detail__contributors">
                        <LastNoteView label={ LABEL_LAST_NOTE } note={ lastNote } id="disruption-detail__last-note-view" />
                        <DisruptionLabelAndText id="disruption-detail__created-by" label={ LABEL_CREATED_BY } text={ `${disruption.createdBy}, ${formatCreatedUpdatedTime(disruption.createdTime)}` } />
                        <DisruptionLabelAndText id="disruption-detail__last-updated" label={ LABEL_LAST_UPDATED_BY } text={ `${disruption.lastUpdatedBy}, ${formatCreatedUpdatedTime(disruption.lastUpdatedTime)}` } />
                    </section>
                    { !isReadOnlyMode && (
                        <section className="col-6">
                            <FormGroup className="pl-0 h-100 d-flex align-items-end justify-content-end">
                                <div className="row">
                                    <div className="offset-4 col-8 pr-2 disruption-detail__checkbox">
                                        <Label className="font-size-md font-weight-bold">
                                            <Input
                                                id="create-notification"
                                                type="checkbox"
                                                className="position-relative"
                                                disabled={ isResolved() || disruption.createNotification }
                                                onChange={ e => setCreateNotification(e.currentTarget.checked) }
                                                checked={ createNotification }
                                            />
                                            <span className="pl-2 align-text-bottom">Draft Stop Message</span>
                                        </Label>
                                    </div>
                                    <div className="offset-4 col-8 pr-2 disruption-detail__checkbox">
                                        <Label className="font-size-md font-weight-bold">
                                            <Input
                                                id="exempt-affected-trips"
                                                className="position-relative"
                                                type="checkbox"
                                                disabled={ isResolved() }
                                                onChange={ e => setExemptAffectedTrips(e.currentTarget.checked) }
                                                checked={ exemptAffectedTrips }
                                            />
                                            <span className="pl-2 align-text-bottom">Exempt Affected Trips</span>
                                        </Label>
                                    </div>
                                </div>
                                <Button
                                    className="control-messaging-view__stop-groups-btn cc-btn-primary ml-1 mb-2"
                                    onClick={ () => setDisruptionsDetailsModalOpen(true) }>
                                    Preview & Share
                                </Button>
                                <Button
                                    className="cc-btn-primary ml-1 mr-1 mb-2"
                                    onClick={ saveAndShareHandler }
                                    disabled={ isSaveDisabled }>
                                    Save & Share
                                </Button>
                                <Button
                                    className="cc-btn-primary ml-1 mr-1 mb-2"
                                    onClick={ handleUpdateDisruption }
                                    disabled={ isSaveDisabled }>
                                    Save
                                </Button>
                                <DisruptionSummaryModal
                                    disruption={ disruption }
                                    isModalOpen={ disruptionsDetailsModalOpen }
                                    onClose={ () => setDisruptionsDetailsModalOpen(false) } />
                                {isUpdating && <DetailLoader />}
                            </FormGroup>
                        </section>
                    ) }
                </div>

                <DiversionUpload
                    disruption={ disruption }
                    disabled={ isDiversionUploadDisabled || isReadOnlyMode }
                    uploadDisruptionFiles={ props.actions.uploadDisruptionFiles }
                    deleteDisruptionFile={ props.actions.deleteDisruptionFile }
                    readonly={ isReadOnlyMode }
                />

                <div className="row">
                    <section className="col-12 mt-4">
                        <section className="position-relative d-flex disruption-detail__map">
                            <Map
                                shouldOffsetForSidePanel
                                boundsToFit={ props.boundsToFit }
                                isLoading={ isLoading }
                            >
                                <ShapeLayer
                                    shapes={ !isLoading ? props.shapes : [] }
                                    routeColors={ !isLoading ? props.routeColors : [] } />
                                <SelectedStopsMarker
                                    stops={
                                        !isLoading
                                            ? disruption.affectedEntities.filter(entity => entity.stopCode).slice(0, 10).map(stop => itemToEntityTransformers[STOP.type](stop).data)
                                            : []
                                    }
                                    size={ 28 }
                                    tooltip
                                    maximumStopsToDisplay={ 200 } />
                            </Map>
                        </section>
                        <span className="map-note">Note: Only a max of ten routes and ten stops will be displayed on the map.</span>
                    </section>
                </div>
                <CustomMuiDialog
                    title="Disruption Active Periods"
                    onClose={ () => setActivePeriodsModalOpen(false) }
                    isOpen={ activePeriodsModalOpen }>
                    <ActivePeriods activePeriods={ activePeriods } />
                </CustomMuiDialog>
                <ConfirmationModal
                    title={ activeConfirmationModalProps.title }
                    message={ activeConfirmationModalProps.message }
                    isOpen={ activeConfirmationModalProps.isOpen }
                    onClose={ activeConfirmationModalProps.onClose }
                    onAction={ activeConfirmationModalProps.onAction } />
                <ViewWorkaroundsModal
                    disruption={ disruption }
                    onClose={ () => setIsViewWorkaroundsModalOpen(false) }
                    isOpen={ isViewWorkaroundsModalOpen }
                />
                { props.usePassengerImpact && (
                    <DisruptionPassengerImpactGridModal
                        disruption={ disruption }
                        onClose={ () => setIsViewPassengerImpactModalOpen(false) }
                        isOpen={ isViewPassengerImpactModalOpen }
                    />
                ) }
            </div>
        </Form>
    );
};

DisruptionDetailView.propTypes = {
    disruption: PropTypes.object.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    resultDisruptionId: PropTypes.number,
    shapes: PropTypes.array,
    isLoading: PropTypes.bool,
    routeColors: PropTypes.array,
    routes: PropTypes.array.isRequired,
    stops: PropTypes.array.isRequired,
    className: PropTypes.string,
    boundsToFit: PropTypes.array.isRequired,
    usePassengerImpact: PropTypes.bool.isRequired,
    isReadOnlyMode: PropTypes.bool,
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
};

DisruptionDetailView.defaultProps = {
    shapes: [],
    isLoading: false,
    resultDisruptionId: null,
    routeColors: [],
    className: 'disruption-details__page',
    isReadOnlyMode: false,
};

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators({
        getRoutesByShortName,
        openCreateDisruption,
        openCopyDisruption,
        updateAffectedRoutesState,
        updateAffectedStopsState,
        updateEditMode,
        updateDisruptionToEdit,
        uploadDisruptionFiles,
        deleteDisruptionFile,
        updateActiveControlEntityId,
        updateDisruption,
    }, dispatch),
});

export default connect(state => ({
    shapes: getShapes(state),
    isLoading: getDisruptionsLoadingState(state),
    routeColors: getRouteColors(state),
    routes: getAffectedRoutes(state),
    stops: getAffectedStops(state),
    boundsToFit: getBoundsToFit(state),
    usePassengerImpact: usePassengerImpact(state),
    isRequesting: getDisruptionAction(state)?.isRequesting,
}), mapDispatchToProps)(DisruptionDetailView);
