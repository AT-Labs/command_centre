import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import { toString, omit, some, isEmpty, uniqBy, uniqWith } from 'lodash-es';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { BsArrowRepeat } from 'react-icons/bs';
import Flatpickr from 'react-flatpickr';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../Common/ActivePeriods/ActivePeriods';

import { CAUSES, IMPACTS, STATUSES } from '../../../../types/disruptions-types';
import {
    DATE_FORMAT,
    DESCRIPTION_MAX_LENGTH,
    HEADER_MAX_LENGTH,
    LABEL_CAUSE,
    LABEL_CREATED_BY,
    LABEL_CUSTOMER_IMPACT,
    LABEL_DESCRIPTION,
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
    LABEL_DURATION,
} from '../../../../constants/disruptions';
import {
    getRoutesByShortName,
    openCreateDisruption,
    updateAffectedRoutesState,
    updateAffectedStopsState,
    updateEditMode,
    updateDisruptionToEdit,
    uploadDisruptionFiles,
    deleteDisruptionFile,
} from '../../../../redux/actions/control/disruptions';
import { getShapes, getDisruptionsLoadingState, getRouteColors, getAffectedRoutes, getAffectedStops } from '../../../../redux/selectors/control/disruptions';
import DetailLoader from '../../../Common/Loader/DetailLoader';
import { DisruptionDetailSelect } from './DisruptionDetailSelect';
import DisruptionLabelAndText from './DisruptionLabelAndText';
import { isUrlValid } from '../../../../utils/helpers';
import {
    formatCreatedUpdatedTime,
    getDatePickerOptions,
    isEndDateValid,
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
    momentFromDateTime,
    isDurationValid,
    getRecurrenceDates,
    recurrenceRadioOptions,
} from '../../../../utils/control/disruptions';
import { calculateActivePeriods, getRecurrenceText, parseRecurrencePattern, fetchEndDateFromRecurrence } from '../../../../utils/recurrence';
import './styles.scss';
import DisruptionSummaryModal from './DisruptionSummaryModal';
import Map from '../DisruptionCreation/CreateDisruption/Map';
import DiversionUpload from './DiversionUpload';
import AffectedEntities from '../AffectedEntities';
import WeekdayPicker from '../../Common/WeekdayPicker/WeekdayPicker';
import { useDisruptionRecurrence } from '../../../../redux/selectors/appSettings';
import RadioButtons from '../../../Common/RadioButtons/RadioButtons';

const DisruptionDetailView = (props) => {
    const { disruption, updateDisruption, isRequesting, resultDisruptionId, isLoading } = props;

    const formatEndDateFromEndTime = disruption.endTime ? moment(disruption.endTime).format(DATE_FORMAT) : '';
    const fetchEndDate = () => (disruption.recurrent ? fetchEndDateFromRecurrence(disruption.recurrencePattern) : formatEndDateFromEndTime);

    const [now] = useState(moment().second(0).millisecond(0));
    const [cause, setCause] = useState(disruption.cause);
    const [impact, setImpact] = useState(disruption.impact);
    const [status, setStatus] = useState(disruption.status);
    const [description, setDescription] = useState(disruption.description);
    const [header, setHeader] = useState(disruption.header);
    const [url, setUrl] = useState(disruption.url);
    const [mode, setMode] = useState(disruption.mode);
    const [disruptionsDetailsModalOpen, setDisruptionsDetailsModalOpen] = useState(false);
    const [startTime, setStartTime] = useState(moment(disruption.startTime).format(TIME_FORMAT));
    const [startDate, setStartDate] = useState(moment(disruption.startTime).format(DATE_FORMAT));
    const [endTime, setEndTime] = useState(disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : '');
    const [endDate, setEndDate] = useState(fetchEndDate());
    const [disruptionOpenedTime] = useState(moment().second(0).millisecond(0));
    const [createNotification, setCreateNotification] = useState(false);
    const [exemptAffectedTrips, setExemptAffectedTrips] = useState(disruption.exemptAffectedTrips);
    const [recurrent, setRecurrent] = useState(disruption.recurrent);
    const [duration, setDuration] = useState(disruption.duration);
    const [recurrencePattern, setRecurrencePattern] = useState(disruption.recurrencePattern);
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);
    const [activePeriods, setActivePeriods] = useState(disruption.activePeriods);
    const [isRecurrenceDirty, setIsRecurrenceDirty] = useState(false);

    const haveRoutesOrStopsChanged = (affectedRoutes, affectedStops) => {
        const uniqRoutes = uniqBy([...affectedRoutes, ...props.routes], route => route.routeId);
        const uniqStops = uniqWith([...affectedStops, ...props.stops], (stopA, stopB) => stopA.stopId === stopB.stopId && stopA.routeId === stopB.routeId);

        return uniqRoutes.length !== affectedRoutes.length || uniqStops.length !== affectedStops.length
            || uniqRoutes.length !== props.routes.length || uniqStops.length !== props.stops.length;
    };

    // A temporary solution to render the routes on the map. It will only render the first ten routes coming
    // in the array due to the high possibility of collapsing the static API.
    // This piece of code should be deleted when a better performance solution has been put in place.

    const affectedEntitiesWithoutShape = toString(disruption.affectedEntities.map(entity => omit(entity, ['shapeWkt'])));
    useEffect(() => {
        const affectedStops = disruption.affectedEntities.filter(entity => entity.stopId);
        const affectedRoutes = disruption.affectedEntities.filter(entity => entity.routeId && isEmpty(entity.stopId));

        if ((isEmpty(props.stops) && isEmpty(props.routes)) || haveRoutesOrStopsChanged(affectedRoutes, affectedStops)) {
            props.updateAffectedStopsState(affectedStops);
            props.updateAffectedRoutesState(affectedRoutes);

            const routesToGet = uniqBy([...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)], item => item.routeId);

            if (routesToGet.length) {
                props.getRoutesByShortName(routesToGet.slice(0, 10));
            }
        }
    }, [affectedEntitiesWithoutShape, disruption.affectedEntities]);

    useEffect(() => {
        const recurrenceDates = getRecurrenceDates(startDate, startTime, endDate);
        setRecurrencePattern({
            ...recurrencePattern,
            ...recurrenceDates,
        });
    }, [startDate, startTime, endDate]);

    useEffect(() => {
        setHeader(disruption.header);
        setCause(disruption.cause);
        setImpact(disruption.impact);
        setStatus(disruption.status);
        setDescription(disruption.description);
        setUrl(disruption.url);
        setMode(disruption.mode);
        setEndTime(disruption.endTime ? moment(disruption.endTime).format(TIME_FORMAT) : '');
        setEndDate(fetchEndDate());
        setCreateNotification(disruption.createNotification);
        setExemptAffectedTrips(disruption.exemptAffectedTrips);
        setRecurrent(disruption.recurrent);
        setDuration(disruption.duration);
    }, [
        disruption.header,
        disruption.cause,
        disruption.impact,
        disruption.status,
        disruption.description,
        disruption.url,
        disruption.mode,
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
        description,
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
    });

    const handleUpdateDisruption = () => updateDisruption(setDisruption());

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
    const isStartDateTimeDisabled = () => status !== STATUSES.NOT_STARTED;

    const startTimeValid = () => {
        if (isStartDateTimeDisabled()) {
            return true;
        }
        return isStartTimeValid(startDate, startTime, disruptionOpenedTime);
    };

    const endTimeValid = () => {
        if (isEndDateTimeDisabled()) {
            return true;
        }
        return isEndTimeValid(endDate, endTime, now, startDate, startTime);
    };

    const endDateValid = () => {
        if (isEndDateTimeDisabled()) {
            return true;
        }
        return isEndDateValid(endDate, startDate);
    };

    const startDateValid = () => {
        if (isStartDateTimeDisabled()) {
            return true;
        }
        return isStartDateValid(startDate, disruptionOpenedTime);
    };

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const isUpdating = isRequesting && resultDisruptionId === disruption.disruptionId;

    const isSaveDisabled = some([cause, impact, status, description, header], isEmpty)
        || !isUrlValid(url);

    const editRoutesAndStops = () => {
        props.updateEditMode(true);
        props.openCreateDisruption(true);
        props.updateDisruptionToEdit(setDisruption());
    };

    const minEndDate = now.isAfter(disruption.startTime, 'day') ? now.format(DATE_FORMAT) : startDate;
    const datePickerOptionsStartDate = getDatePickerOptions(isStartDateTimeDisabled() ? undefined : 'today');
    const datePickerOptionsEndDate = getDatePickerOptions(isEndDateTimeDisabled() ? undefined : minEndDate);

    const durationValid = () => isDurationValid(duration, recurrent);

    const displayActivePeriods = () => {
        if (isRecurrenceDirty) {
            setActivePeriods(calculateActivePeriods(recurrencePattern, duration, disruption.activePeriods, isResolved()));
        }
        setActivePeriodsModalOpen(true);
    };

    return (
        <Form>
            <div className="row position-relative">
                <AffectedEntities
                    editLabel="Edit routes and stops"
                    editAction={ editRoutesAndStops }
                    isEditDisabled={ isRequesting || isLoading || isResolved() }
                    affectedEntities={ disruption.affectedEntities }
                />
                <section className="position-relative w-50 d-flex disruption-detail__map">
                    <Map shouldOffsetForSidePanel={ false }
                        shapes={ !isLoading ? props.shapes : [] }
                        stops={ !isLoading ? disruption.affectedEntities.filter(entity => entity.stopId).slice(0, 10) : [] }
                        routeColors={ !isLoading ? props.routeColors : [] } />
                </section>
                <span className="map-note">Note: Only a max of ten routes and ten stops will be displayed on the map.</span>
            </div>
            <div className="row mt-3">
                { props.isRecurrenceOn && (
                    <section className="col-12">
                        <RadioButtons { ...recurrenceRadioOptions(recurrent) } />
                    </section>
                )}
                <section className="col-3">
                    <div className="mt-2 position-relative form-group">
                        <DisruptionLabelAndText id="disruption-detail__mode" label={ LABEL_MODE } text={ mode } />
                    </div>
                    <div className="mt-2 position-relative form-group">
                        <DisruptionDetailSelect
                            id="disruption-detail__cause"
                            value={ cause }
                            options={ CAUSES }
                            disabled={ isResolved() }
                            label={ LABEL_CAUSE }
                            onChange={ setCause } />
                    </div>
                    <FormGroup className="mt-2 position-relative">
                        <Label for="disruption-detail__start-date">
                            <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                        </Label>
                        <Flatpickr
                            id="disruption-detail__start-date"
                            className="font-weight-normal cc-form-control form-control"
                            value={ startDate }
                            disabled={ isStartDateTimeDisabled() }
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
                            disabled={ isEndDateTimeDisabled() }
                            options={ datePickerOptionsEndDate }
                            key={ datePickerOptionsEndDate.minDate }
                            onChange={ (date) => {
                                setEndDate(date.length ? moment(date[0]).format(DATE_FORMAT) : '');
                                if (date.length === 0) {
                                    setEndTime('');
                                }
                                setIsRecurrenceDirty(true);
                            } } />
                        <FaRegCalendarAlt
                            className="disruption-creation__wizard-select-details__icon position-absolute"
                            size={ 22 } />
                    </FormGroup>
                    { recurrent && (
                        <>
                            <FormGroup>
                                <WeekdayPicker
                                    selectedWeekdays={ recurrencePattern.byweekday || [] }
                                    onUpdate={ (byweekday) => {
                                        setRecurrencePattern({ ...recurrencePattern, byweekday });
                                        setIsRecurrenceDirty(true);
                                    } }
                                    disabled={ isResolved() }
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
                <section className="col-3">
                    <div className="mt-2 position-relative form-group">
                        <DisruptionDetailSelect id="disruption-detail__status"
                            value={ status }
                            options={ disruption.status === STATUSES.NOT_STARTED ? Object.values(STATUSES) : Object.values(STATUSES).filter(s => s !== STATUSES.NOT_STARTED) }
                            label={ LABEL_STATUS }
                            onChange={ setDisruptionStatus } />
                    </div>
                    <DisruptionDetailSelect
                        id="disruption-detail__impact"
                        value={ impact }
                        options={ IMPACTS }
                        disabled={ isResolved() }
                        label={ LABEL_CUSTOMER_IMPACT }
                        onChange={ setImpact } />
                    <FormGroup className="mt-2">
                        <Label for="disruption-detail__start-time">
                            <span className="font-size-md font-weight-bold">{LABEL_START_TIME}</span>
                        </Label>
                        <Input
                            id="disruption-detail__start-time"
                            className="border border-dark"
                            value={ startTime }
                            disabled={ isStartDateTimeDisabled() }
                            onChange={ (event) => {
                                setStartTime(event.target.value);
                                setIsRecurrenceDirty(true);
                            } }
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
                                disabled={ isEndDateTimeDisabled() }
                                onChange={ event => setEndTime(event.target.value) }
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
                                onChange={ (event) => {
                                    setDuration(event.target.value);
                                    setIsRecurrenceDirty(true);
                                } }
                                invalid={ !durationValid() }
                                type="number"
                                min="1"
                                max="24"
                                disabled={ isResolved() }
                            />
                        </FormGroup>
                    )}
                </section>
                <section className="col-6">
                    <FormGroup className="mt-2">
                        <Label for="disruption-detail__header">
                            <span className="font-size-md font-weight-bold">{LABEL_HEADER}</span>
                        </Label>
                        <Input id="disruption-detail__header"
                            className="border border-dark"
                            value={ header }
                            disabled={ isResolved() }
                            onChange={ e => setHeader(e.currentTarget.value) }
                            maxLength={ HEADER_MAX_LENGTH } />
                    </FormGroup>
                    <FormGroup className="mt-2">
                        <Label for="disruption-detail__url">
                            <span className="font-size-md font-weight-bold">{ getOptionalLabel(LABEL_URL) }</span>
                        </Label>
                        <Input id="disruption-detail__url"
                            className="border border-dark"
                            value={ url }
                            disabled={ isResolved() }
                            onChange={ e => setUrl(e.currentTarget.value) }
                            placeholder="e.g. https://at.govt.nz"
                            maxLength={ URL_MAX_LENGTH }
                            invalid={ !isUrlValid(url) }
                        />
                        <FormFeedback>Please enter a valid URL (e.g. https://at.govt.nz)</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="disruption-detail__description">
                            <span className="font-size-md font-weight-bold">{LABEL_DESCRIPTION}</span>
                        </Label>
                        <Input id="disruption-detail__description"
                            className="textarea-no-resize border border-dark"
                            type="textarea"
                            disabled={ isResolved() }
                            value={ description }
                            onChange={ e => setDescription(e.currentTarget.value) }
                            maxLength={ DESCRIPTION_MAX_LENGTH }
                            rows={ 5 } />
                    </FormGroup>
                    { recurrent && (
                        <FormGroup>
                            <Button className="cc-btn-primary" onClick={ () => displayActivePeriods() }>View all</Button>
                        </FormGroup>
                    )}
                </section>
            </div>

            <DiversionUpload
                disruption={ disruption }
                disabled={ isUpdating || isSaveDisabled || !startTimeValid() || !startDateValid() || !endTimeValid() || !endDateValid() }
                uploadDisruptionFiles={ props.uploadDisruptionFiles }
                deleteDisruptionFile={ props.deleteDisruptionFile }
            />

            <div className="row">
                <div className="col-5 disruption-detail__contributors">
                    <DisruptionLabelAndText id="disruption-detail__created-by" label={ LABEL_CREATED_BY } text={ `${disruption.createdBy}, ${formatCreatedUpdatedTime(disruption.createdTime)}` } />
                    <DisruptionLabelAndText id="disruption-detail__last-updated" label={ LABEL_LAST_UPDATED_BY } text={ `${disruption.lastUpdatedBy}, ${formatCreatedUpdatedTime(disruption.lastUpdatedTime)}` } />
                </div>
                <div className="col-7">
                    <FormGroup className="pl-0 h-100 d-flex align-items-end justify-content-end">
                        {/* <div className="pr-2 disruption-detail__checkbox">
                            <Label className="font-size-md font-weight-bold">
                                <Input
                                    id="create-notification"
                                    className="test"
                                    type="checkbox"
                                    disabled={ isResolved() }
                                    onChange={ e => setExemptAffectedTrips(e.currentTarget.checked) }
                                    checked={ exemptAffectedTrips }
                                />
                                <span className="pl-2">Exempt Affected Trips</span>
                            </Label>
                        </div> */}
                        <div className="pr-2 disruption-detail__checkbox">
                            <Label className="font-size-md font-weight-bold">
                                <Input
                                    id="create-notification"
                                    className="test"
                                    type="checkbox"
                                    disabled={ isResolved() || disruption.createNotification }
                                    onChange={ e => setCreateNotification(e.currentTarget.checked) }
                                    checked={ createNotification }
                                />
                                <span className="pl-2">Draft Stop Message</span>
                            </Label>
                        </div>
                        <Button
                            className="cc-btn-primary ml-3 mr-3"
                            onClick={ handleUpdateDisruption }
                            disabled={ isUpdating || isSaveDisabled || !startTimeValid() || !startDateValid() || !endTimeValid() || !endDateValid() || !durationValid() }>
                            Save Changes
                        </Button>
                        <Button
                            className="control-messaging-view__stop-groups-btn cc-btn-secondary ml-3"
                            onClick={ () => setDisruptionsDetailsModalOpen(true) }>
                            Show Summary
                        </Button>
                        <DisruptionSummaryModal
                            disruption={ disruption }
                            isModalOpen={ disruptionsDetailsModalOpen }
                            onClose={ () => setDisruptionsDetailsModalOpen(false) } />
                        {isUpdating && <DetailLoader />}
                    </FormGroup>
                </div>
            </div>
            <CustomMuiDialog
                title="Disruption Active Periods"
                onClose={ () => setActivePeriodsModalOpen(false) }
                isOpen={ activePeriodsModalOpen }>
                <ActivePeriods activePeriods={ activePeriods } />
            </CustomMuiDialog>
        </Form>
    );
};

DisruptionDetailView.propTypes = {
    disruption: PropTypes.object.isRequired,
    updateDisruption: PropTypes.func.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    resultDisruptionId: PropTypes.number,
    getRoutesByShortName: PropTypes.func.isRequired,
    shapes: PropTypes.array,
    isLoading: PropTypes.bool,
    routeColors: PropTypes.array,
    openCreateDisruption: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    updateEditMode: PropTypes.func.isRequired,
    updateDisruptionToEdit: PropTypes.func.isRequired,
    uploadDisruptionFiles: PropTypes.func.isRequired,
    deleteDisruptionFile: PropTypes.func.isRequired,
    routes: PropTypes.array.isRequired,
    stops: PropTypes.array.isRequired,
    isRecurrenceOn: PropTypes.bool.isRequired,
};

DisruptionDetailView.defaultProps = {
    shapes: [],
    isLoading: false,
    resultDisruptionId: null,
    routeColors: [],
};

export default connect(state => ({
    shapes: getShapes(state),
    isLoading: getDisruptionsLoadingState(state),
    routeColors: getRouteColors(state),
    routes: getAffectedRoutes(state),
    stops: getAffectedStops(state),
    isRecurrenceOn: useDisruptionRecurrence(state),
}), {
    getRoutesByShortName,
    openCreateDisruption,
    updateAffectedRoutesState,
    updateAffectedStopsState,
    updateEditMode,
    updateDisruptionToEdit,
    uploadDisruptionFiles,
    deleteDisruptionFile,
})(DisruptionDetailView);
