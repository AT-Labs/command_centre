import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { isEmpty, sortBy, uniqueId, some } from 'lodash-es';
import PropTypes from 'prop-types';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { Form, FormFeedback, FormGroup, Input, Label, Button } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { RRule } from 'rrule';
import { BsArrowRepeat } from 'react-icons/bs';
import {
    getStopsByRoute as findStopsByRoute,
    isEditEnabled,
    getIncidentToEdit,
} from '../../../../../redux/selectors/control/incidents';
import { DISRUPTION_TYPE, STATUSES, SEVERITIES, DEFAULT_SEVERITY } from '../../../../../types/disruptions-types';
import {
    updateCurrentStep,
    getStopsByRoute,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    toggleIncidentModals,
} from '../../../../../redux/actions/control/incidents';
import Footer from './Footer';
import { search } from '../../../../../redux/actions/search';
import { getSearchResults } from '../../../../../redux/selectors/search';
import {
    isEndDateValid,
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
    isDurationValid,
    getRecurrenceDates,
} from '../../../../../utils/control/disruptions';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
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
    TIME_FORMAT } from '../../../../../constants/disruptions';
import { getDatePickerOptions } from '../../../../../utils/dateUtils';

import { useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import SelectEffectEntities from './SelectEffectEntities';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import {
    generateActivePeriodsFromRecurrencePattern,
    getRecurrenceText,
    isActivePeriodsValid,
    parseRecurrencePattern } from '../../../../../utils/recurrence';
import CustomMuiDialog from '../../../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../../../Common/ActivePeriods/ActivePeriods';

const INIT_EFFECT_STATE = {
    key: '',
    startTime: '',
    isStartTimeDirty: false,
    startDate: '',
    isStartDateDirty: false,
    endTime: '',
    endDate: '',
    isEndDateDirty: false,
    impact: DEFAULT_IMPACT.value,
    isImpactDirty: false,
    cause: DEFAULT_CAUSE.value,
    affectedEntities: {
        affectedRoutes: [],
        affectedStops: [],
    },
    createNotification: false,
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: DEFAULT_SEVERITY.value,
    isSeverityDirty: false,
    recurrent: false,
    duration: '',
    isDurationDirty: false,
    recurrencePattern: { freq: RRule.WEEKLY },
    isRecurrencePatternDirty: false,
    header: '',
};

export const SelectEffects = (props) => {
    const {
        recurrent: incidentRecurrent,
        startTime: incidentStartTime,
        startDate: incidentStartDate,
        endTime: incidentEndTime,
        endDate: incidentEndDate,
        severity: incidentSeverity,
        cause: incidentCause,
        header: incidentHeader,
        modalOpenedTime,
    } = props.data;

    const setupDisruption = () => {
        const now = moment();
        let recurrenceDates;
        let recurrencePattern;
        if (incidentRecurrent) {
            recurrenceDates = getRecurrenceDates(incidentStartDate, incidentStartTime, incidentEndDate);
            recurrencePattern = parseRecurrencePattern({ freq: RRule.WEEKLY });
        }
        return {
            ...INIT_EFFECT_STATE,
            startTime: incidentStartTime || now.format(TIME_FORMAT),
            startDate: incidentStartDate || now.format(DATE_FORMAT),
            endTime: incidentEndTime || '',
            endDate: incidentEndDate || '',
            severity: incidentSeverity || DEFAULT_SEVERITY.value,
            cause: incidentCause || DEFAULT_CAUSE.value,
            header: incidentHeader || '',
            key: uniqueId('DISR'),
            recurrent: incidentRecurrent,
            ...(recurrenceDates && {
                recurrencePattern: {
                    ...recurrencePattern,
                    ...recurrenceDates,
                },
            }),
        };
    };
    const maxActivePeriodsCount = 100;
    const [disruptions, setDisruptions] = useState(props.data.disruptions.length > 0 ? props.data.disruptions : [setupDisruption()]);
    const [activePeriods, setActivePeriods] = useState([]);
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);
    const [requireMapUpdate, setRequireMapUpdate] = useState(false);
    const impactValid = key => !isEmpty(disruptions.find(d => d.key === key).impact);

    const getDisruptionByKey = key => disruptions.find(d => d.key === key);
    const updateDisruptionsState = () => props.onDataUpdate('disruptions', disruptions);

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const datePickerOptions = getDatePickerOptions();

    const endDateDatePickerOptions = key => getDatePickerOptions(disruptions.find(d => d.key === key).startDate);

    const severityValid = key => !isEmpty(disruptions.find(d => d.key === key).severity);

    const startTimeValid = (key) => {
        const disruption = getDisruptionByKey(key);
        return isStartTimeValid(
            disruption.startDate,
            disruption.startTime,
            modalOpenedTime,
            incidentRecurrent,
        );
    };

    const startTimeValidForAllDisruptions = () => disruptions.every(disruption => startTimeValid(disruption.key));

    const startDateValid = key => isStartDateValid(disruptions.find(d => d.key === key).startDate, modalOpenedTime, incidentRecurrent);

    const startDateValidForAllDisruptions = () => disruptions.every(disruption => startDateValid(disruption.key));

    const endTimeValid = (key) => {
        const disruption = getDisruptionByKey(key);
        return isEndTimeValid(
            disruption.endDate,
            disruption.endTime,
            disruption.startDate,
            disruption.startTime,
        );
    };

    const endTimeValidForAllDisruptions = () => disruptions.every(disruption => endTimeValid(disruption.key));

    const endDateValid = (key) => {
        const disruption = getDisruptionByKey(key);
        return isEndDateValid(disruption.endDate, disruption.startDate, incidentRecurrent);
    };

    const endDateValidForAllDisruptions = () => disruptions.every(disruption => endDateValid(disruption.key));

    const durationValid = key => isDurationValid(disruptions.find(d => d.key === key).duration, incidentRecurrent);

    const durationValidForAllDisruptions = () => disruptions.every(disruption => durationValid(disruption.key));

    const affectedEntitySelected = (key) => {
        const disruption = getDisruptionByKey(key);
        return disruption.affectedEntities.affectedRoutes.length > 0 || disruption.affectedEntities.affectedStops.length > 0;
    };

    const affectedEntitySelectedForAllDisruptions = () => disruptions.every(disruption => affectedEntitySelected(disruption.key));

    const isDateTimeValid = key => startTimeValid(key) && startDateValid(key) && endDateValid(key) && durationValid(key);

    const activePeriodsValidV2 = (key) => {
        if (incidentRecurrent) {
            const disruption = getDisruptionByKey(key);
            return isActivePeriodsValid(disruption.recurrencePattern, disruption.duration, maxActivePeriodsCount);
        }
        return true;
    };

    const activePeriodsValidForAllDisruptionsV2 = () => {
        if (incidentRecurrent) {
            return disruptions.every(disruption => isActivePeriodsValid(disruption.recurrencePattern, disruption.duration, maxActivePeriodsCount));
        }
        return true;
    };

    const isEndDateAndEndTimeValid = disruption => !isEmpty(disruption.endDate) && isEmpty(disruption.endTime);

    const isRequiredPropsEmpty = () => {
        const isPropsEmpty = disruptions.some(disruption => some([
            disruption.startTime,
            disruption.startDate,
            disruption.impact,
            disruption.cause,
            disruption.severity,
            disruption.header], isEmpty));
        const isEndTimeRequiredAndEmpty = !incidentRecurrent
            && disruptions.some(isEndDateAndEndTimeValid);
        const isWeekdayRequiredAndEmpty = incidentRecurrent
            && disruptions.some(disruption => isEmpty(disruption.recurrencePattern.byweekday));
        return isPropsEmpty || isEndTimeRequiredAndEmpty || isWeekdayRequiredAndEmpty;
    };

    const isRequiredDraftPropsEmpty = () => disruptions.some(disruption => some([disruption.header, disruption.cause], isEmpty));

    const isSubmitDisabled = isRequiredPropsEmpty()
        || !startTimeValidForAllDisruptions()
        || !startDateValidForAllDisruptions()
        || !endTimeValidForAllDisruptions()
        || !endDateValidForAllDisruptions()
        || !durationValidForAllDisruptions()
        || !affectedEntitySelectedForAllDisruptions();
    const isDraftSubmitDisabled = isRequiredDraftPropsEmpty();

    const onAffectedEntitiesUpdate = (disruptionKey, valueKey, affectedEntities) => {
        const updatedDisruptions = disruptions.map(disruption => (disruption.key === disruptionKey
            ? {
                ...disruption,
                affectedEntities: {
                    ...disruption.affectedEntities,
                    [valueKey]: affectedEntities,
                },
            }
            : disruption));
        setDisruptions(updatedDisruptions);
        setRequireMapUpdate(true);
    };

    const removeNotFoundFromStopGroups = () => {
        disruptions.forEach((disruption) => {
            const filterStops = disruption.affectedEntities.affectedStops.filter(stop => stop.stopCode !== 'Not Found');
            if (filterStops.length !== disruption.affectedEntities.affectedStops.length) {
                onAffectedEntitiesUpdate(disruption.key, 'affectedStops', filterStops);
            }
        });
    };

    useEffect(() => {
        if (requireMapUpdate) {
            removeNotFoundFromStopGroups();
            const routes = disruptions.map(disruption => disruption.affectedEntities.affectedRoutes).flat();
            const stops = disruptions.map(disruption => disruption.affectedEntities.affectedStops).flat();
            props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));
            props.updateAffectedRoutesState(routes);
            if (routes.length > 0) {
                props.getRoutesByShortName(routes);
            }
            setRequireMapUpdate(false);
        }
    }, [requireMapUpdate]);

    const onSaveDraft = () => {
        removeNotFoundFromStopGroups();
        updateDisruptionsState();
        setTimeout(() => {
            if (!props.isEditMode) {
                props.onStepUpdate(3);
                props.onSubmitDraft();
            } else {
                props.onSubmitUpdate();
            }
        }, 0); // to run it on next event loop
    };

    const onContinue = () => {
        removeNotFoundFromStopGroups();
        updateDisruptionsState();
        if (!props.isEditMode) {
            props.onUpdateEntitiesValidation(!isSubmitDisabled && activePeriodsValidForAllDisruptionsV2());
            props.onStepUpdate(2);
            props.updateCurrentStep(3);
        } else {
            props.onStepUpdate(1);
            props.updateCurrentStep(3);
        }
    };

    const updateDisruption = (key, updatedFields) => {
        let recurrenceDates;
        let parsedRecurrencePattern;
        if (updatedFields?.startDate || updatedFields?.startTime || updatedFields?.endDate || updatedFields?.recurrent) {
            const disruption = getDisruptionByKey(key);
            recurrenceDates = getRecurrenceDates(
                updatedFields.startDate || disruption.startDate,
                updatedFields.startTime || disruption.startTime,
                updatedFields.endDate || disruption.endDate,
            );
            parsedRecurrencePattern = disruption.recurrent ? parseRecurrencePattern(disruption.recurrencePattern) : { freq: RRule.WEEKLY };
        }
        setDisruptions(prev => prev.map(d => (d.key === key ? {
            ...d,
            ...updatedFields,
            ...(recurrenceDates && {
                recurrencePattern: {
                    ...d.recurrencePattern,
                    ...parsedRecurrencePattern,
                    ...recurrenceDates,
                },
            }),
        } : d)));
    };

    const resetAffectedEntities = (disruptionKey) => {
        setDisruptions(prev => prev.map(d => (d.key === disruptionKey ? { ...d,
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [],
            },
        } : d)));
        setRequireMapUpdate(true);
    };

    const onDisruptionTypeUpdate = (key, disruptionType) => {
        updateDisruption(key, { disruptionType });
    };

    const addDisruption = () => {
        setDisruptions(prev => [...prev, setupDisruption()]);
    };

    const removeDisruption = (key) => {
        setDisruptions(prev => prev.filter(d => d.key !== key));
        setRequireMapUpdate(true);
    };

    const onBack = () => {
        removeNotFoundFromStopGroups();
        updateDisruptionsState();
        props.onStepUpdate(0);
        props.updateCurrentStep(1);
    };

    const onChangeStartDate = (key, date) => {
        if (date.length === 0) {
            updateDisruption(key, { startDate: '', isStartDateDirty: true });
        } else {
            updateDisruption(key, { startDate: moment(date[0]).format(DATE_FORMAT), isStartDateDirty: false });
        }
    };

    const onChangeEndDate = (key, date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0) {
                if (props.useDraftDisruptions) {
                    updateDisruption(key, { endDate: '', isEndDateDirty: false });
                } else {
                    updateDisruption(key, { isEndDateDirty: true });
                }
            } else {
                updateDisruption(key, { endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '', isEndDateDirty: false });
            }
        } else {
            updateDisruption(key, { endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '', isEndDateDirty: false });
        }
    };

    const onBlurEndDate = (key, date, isRecurrent) => {
        if (isRecurrent) {
            if (date.length === 0 && !props.useDraftDisruptions) {
                updateDisruption(key, { isEndDateDirty: true });
            } else {
                updateDisruption(key, { isEndDateDirty: false });
            }
        } else {
            updateDisruption(key, { isEndDateDirty: false });
        }
    };

    const onUpdateRecurrencePattern = (key, byweekday) => {
        setDisruptions(prev => prev.map(d => (d.key === key ? {
            ...d,
            recurrencePattern: { ...d.recurrencePattern, byweekday },
        } : d)));
    };

    const isViewAllDisabled = key => !isDateTimeValid(key) || isEmpty(getDisruptionByKey(key).recurrencePattern?.byweekday);

    const displayActivePeriods = (key) => {
        const disruption = getDisruptionByKey(key);
        setActivePeriods(generateActivePeriodsFromRecurrencePattern(
            disruption.recurrencePattern,
            disruption.duration,
        ));
        setActivePeriodsModalOpen(true);
    };

    const impacts = useAlertEffects();

    return (
        <div className="select_disruption">
            {disruptions.map(disruption => (
                <Form key={ `${disruption.key}_form` } className="row my-3 p-4 incident-effect">
                    { disruptions.length > 1 && (
                        <div className="col-12">
                            <FormGroup>
                                <button
                                    type="button"
                                    className="disruption-effect-button"
                                    onClick={ () => removeDisruption(disruption.key) }>
                                    <AiOutlineMinusCircle size={ 36 } color="grey" />
                                </button>
                            </FormGroup>
                        </div>
                    )}
                    <div className="col-6">
                        <FormGroup>
                            <DisruptionDetailSelect
                                id="disruption-creation__wizard-select-details__impact"
                                className=""
                                value={ disruption.impact }
                                options={ impacts }
                                label={ LABEL_CUSTOMER_IMPACT }
                                invalid={ disruption.isImpactDirty && !impactValid(disruption.key) }
                                feedback="Please select effect"
                                onBlur={ selectedItem => updateDisruption(disruption.key, { impact: selectedItem, isImpactDirty: true }) }
                                onChange={ selectedItem => updateDisruption(disruption.key, { impact: selectedItem, isImpactDirty: true }) } />
                        </FormGroup>
                    </div>
                    <div className="col-6">
                        <FormGroup>
                            <DisruptionDetailSelect
                                id="disruption-creation__wizard-select-details__severity"
                                className=""
                                value={ disruption.severity }
                                options={ SEVERITIES }
                                label={ LABEL_SEVERITY }
                                invalid={ disruption.isSeverityDirty && !severityValid(disruption.key) }
                                feedback="Please select severity"
                                onBlur={ selectedItem => updateDisruption(disruption.key, { severity: selectedItem, isSeverityDirty: true }) }
                                onChange={ selectedItem => updateDisruption(disruption.key, { severity: selectedItem, isSeverityDirty: true }) }
                            />
                        </FormGroup>
                    </div>
                    <div className="col-6">
                        <FormGroup className="position-relative">
                            <Label for="disruption-creation__wizard-select-details__start-date">
                                <span className="font-size-md font-weight-bold">{LABEL_START_DATE}</span>
                            </Label>
                            <Flatpickr
                                key={ `${disruption.key}_start-date` }
                                id="disruption-creation__wizard-select-details__start-date"
                                className={ `font-weight-normal cc-form-control form-control ${disruption.isStartDateDirty ? 'is-invalid' : ''}` }
                                value={ disruption.startDate }
                                options={ datePickerOptions }
                                placeholder="Select date"
                                onChange={ date => onChangeStartDate(disruption.key, date) } />
                            {!disruption.isStartDateDirty && (
                                <FaRegCalendarAlt
                                    className="disruption-creation__wizard-select-details__icon position-absolute"
                                    size={ 22 } />
                            )}
                            {disruption.isStartDateDirty && (
                                <div className="disruption-recurrence-invalid">Please select start date</div>
                            )}
                        </FormGroup>
                        <FormGroup className="position-relative">
                            <Label for="disruption-creation__wizard-select-details__end-date">
                                <span className="font-size-md font-weight-bold">
                                    {!incidentRecurrent ? getOptionalLabel(LABEL_END_DATE) : LABEL_END_DATE}
                                </span>
                            </Label>
                            {!incidentRecurrent && (
                                <Flatpickr
                                    key={ `${disruption.key}_end-date` }
                                    id="disruption-creation__wizard-select-details__end-date"
                                    className={ `font-weight-normal cc-form-control form-control ${disruption.isEndDateDirty ? 'is-invalid' : ''}` }
                                    value={ disruption.endDate }
                                    options={ endDateDatePickerOptions(disruption.key) }
                                    onChange={ date => onChangeEndDate(disruption.key, date, false) }
                                    onOpen={ date => onBlurEndDate(disruption.key, date, false) }
                                />
                            )}
                            {incidentRecurrent && (
                                <Flatpickr
                                    key={ `${disruption.key}_end-date` }
                                    id="disruption-creation__wizard-select-details__end-date"
                                    className={ `font-weight-normal cc-form-control form-control ${disruption.isEndDateDirty ? 'is-invalid' : ''}` }
                                    value={ disruption.endDate }
                                    options={ endDateDatePickerOptions(disruption.key) }
                                    onChange={ date => onChangeEndDate(disruption.key, date, true) }
                                    onOpen={ date => onBlurEndDate(disruption.key, date, true) }
                                />
                            )}
                            {!disruption.isEndDateDirty && (
                                <FaRegCalendarAlt
                                    className="disruption-creation__wizard-select-details__icon position-absolute"
                                    size={ 22 } />
                            )}
                            {disruption.isEndDateDirty && (
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
                                onChange={ event => updateDisruption(disruption.key, { startTime: event.target.value, isStartTimeDirty: false }) }
                                invalid={ (props.useDraftDisruptions ? (!disruption.isStartTimeDirty && !startTimeValid(disruption.key)) : !startTimeValid(disruption.key)) }
                            />
                            <FormFeedback>Not valid values</FormFeedback>
                        </FormGroup>
                        {!incidentRecurrent && (
                            <FormGroup>
                                <Label for="disruption-creation__wizard-select-details__end-time">
                                    <span className="font-size-md font-weight-bold">{getOptionalLabel(LABEL_END_TIME)}</span>
                                </Label>
                                <Input
                                    id="disruption-creation__wizard-select-details__end-time"
                                    className="border border-dark"
                                    value={ disruption.endTime }
                                    onChange={ event => updateDisruption(disruption.key, { endTime: event.target.value }) }
                                    invalid={ !endTimeValid(disruption.key) }
                                />
                                <FormFeedback>Not valid values</FormFeedback>
                            </FormGroup>
                        )}
                        { incidentRecurrent && (
                            <FormGroup>
                                <Label for="disruption-creation__wizard-select-details__duration">
                                    <span className="font-size-md font-weight-bold">{LABEL_DURATION_HOURS}</span>
                                </Label>
                                <Input
                                    id="disruption-creation__wizard-select-details__duration"
                                    className="border border-dark"
                                    value={ disruption.duration }
                                    onChange={ event => updateDisruption(disruption.key, { duration: event.target.value }) }
                                    invalid={ disruption.isDurationDirty && !durationValid(disruption.key) }
                                    onBlur={ () => updateDisruption(disruption.key, { isDurationDirty: true }) }
                                    type="number"
                                    min="1"
                                    max="24"
                                />
                                <FormFeedback>Not valid duration</FormFeedback>
                            </FormGroup>
                        )}
                    </div>
                    { incidentRecurrent && (
                        <>
                            <div className="col-6 text-center">
                                <WeekdayPicker
                                    selectedWeekdays={ disruption.recurrencePattern.byweekday || [] }
                                    onUpdate={ byweekday => onUpdateRecurrencePattern(disruption.key, byweekday) }
                                />
                            </div>
                            <div className="col-6 pb-3 text-center">
                                <Button disabled={ isViewAllDisabled(disruption.key) }
                                    className="showActivePeriods btn btn-secondary lh-1"
                                    onClick={ () => displayActivePeriods(disruption.key) }>
                                    View All
                                </Button>
                            </div>
                            { (props.useDraftDisruptions
                                ? (!isEmpty(disruption.recurrencePattern.byweekday) && activePeriodsValidV2(disruption.key))
                                : !isEmpty(disruption.recurrencePattern.byweekday)) && (
                                <div className="col-12 mb-3">
                                    <BsArrowRepeat size={ 22 } />
                                    <span className="pl-1">{ getRecurrenceText(disruption.recurrencePattern) }</span>
                                </div>
                            )}
                            { (props.useDraftDisruptions
                                ? (disruption.isRecurrencePatternDirty && (isEmpty(disruption.recurrencePattern.byweekday) || !activePeriodsValidV2(disruption.key)))
                                : (disruption.isRecurrencePatternDirty && isEmpty(disruption.recurrencePattern.byweekday))) && (
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
                                onChange={ event => updateDisruption(disruption.key, { createNotification: event.currentTarget.checked }) }
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
            ))}
            <button
                type="button"
                className="disruption-effect-button add-disruption-button"
                onClick={ addDisruption }>
                <AiOutlinePlusCircle size={ 36 } color="grey" />
            </button>

            <Footer
                updateCurrentStep={ props.updateCurrentStep }
                onStepUpdate={ props.onStepUpdate }
                toggleIncidentModals={ props.toggleIncidentModals }
                nextButtonValue="Continue"
                onContinue={ () => onContinue() }
                isSubmitDisabled={ props.useDraftDisruptions ? isDraftSubmitDisabled : isSubmitDisabled }
                isDraftSubmitDisabled={ isDraftSubmitDisabled }
                isDraftOrCreateMode={ props.data?.status === STATUSES.DRAFT || !props.isEditMode }
                onSubmitDraft={ () => onSaveDraft() }
                onBack={ !props.isEditMode ? onBack : undefined }
            />
            <CustomMuiDialog
                title="Disruption Active Periods"
                onClose={ () => setActivePeriodsModalOpen(false) }
                isOpen={ activePeriodsModalOpen }>
                <ActivePeriods activePeriods={ activePeriods } />
            </CustomMuiDialog>
        </div>
    );
};

SelectEffects.propTypes = {
    onStepUpdate: PropTypes.func.isRequired,
    onDataUpdate: PropTypes.func.isRequired,
    onSubmitDraft: PropTypes.func,
    onSubmitUpdate: PropTypes.func,
    updateCurrentStep: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    isEditMode: PropTypes.bool,
    toggleIncidentModals: PropTypes.func.isRequired,
    data: PropTypes.object,
    onUpdateEntitiesValidation: PropTypes.func,
    useDraftDisruptions: PropTypes.bool,
};

SelectEffects.defaultProps = {
    onSubmitDraft: () => { },
    onSubmitUpdate: () => { },
    onUpdateEntitiesValidation: () => { },
    isEditMode: false,
    useDraftDisruptions: false,
    data: {},
};

export default connect(state => ({
    findStopsByRoute: findStopsByRoute(state),
    isEditMode: isEditEnabled(state),
    disruptionToEdit: getIncidentToEdit(state),
    searchResults: getSearchResults(state),
    useDraftDisruptions: useDraftDisruptions(state),
}), {
    updateCurrentStep,
    getStopsByRoute,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    toggleIncidentModals,
    search,
})(SelectEffects);