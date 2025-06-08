import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { isEmpty, sortBy, forOwn, omitBy, pickBy, uniqueId } from 'lodash-es';
import PropTypes from 'prop-types';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import {
    getAffectedRoutes,
    getIncidentsLoadingStopsByRouteState,
    getIncidentsLoadingRoutesByStopState,
    getStopsByRoute as findStopsByRoute,
    isEditEnabled,
    getIncidentToEdit,
} from '../../../../../redux/selectors/control/incidents';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';
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
import { getAllStops } from '../../../../../redux/selectors/static/stops';
import { getStopGroupsIncludingDeleted } from '../../../../../redux/selectors/control/dataManagement/stopGroups';
import { getStopGroupName } from '../../../../../utils/control/dataManagement';
import {
    formatStopsInStopGroup,
    isEndDateValid,
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
} from '../../../../../utils/control/disruptions';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import { DisruptionDetailSelect } from '../../DisruptionDetail/DisruptionDetailSelect';
import {
    LABEL_CUSTOMER_IMPACT,
    LABEL_START_DATE,
    DATE_FORMAT,
    LABEL_END_DATE,
    LABEL_END_TIME,
    LABEL_START_TIME,
    LABEL_SEVERITY,
    TIME_FORMAT } from '../../../../../constants/disruptions';
import { getDatePickerOptions } from '../../../../../utils/dateUtils';

import { useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import SelectEffectEntities from './SelectEffectEntities';

const INIT_EFFECT_STATE = {
    key: '',
    startTime: '',
    isStartTimeDirty: false,
    startDate: '',
    cssStartDateInvalid: '',
    endTime: '',
    endDate: '',
    cssEndDateInvalid: '',
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
};

export const SelectEffects = (props) => {
    const setupDisruption = () => {
        console.warn('setupDisruption');
        const now = moment();
        return {
            ...INIT_EFFECT_STATE,
            startTime: now.format(TIME_FORMAT),
            startDate: now.format(DATE_FORMAT),
            key: uniqueId('DISR'),
        };
    };
    const [disruptions, setDisruptions] = useState(props.data.disruptions.length > 0 ? props.data.disruptions : [setupDisruption()]);
    const [requireMapUpdate, setRequireMapUpdate] = useState(false);
    const { ROUTE, STOP, STOP_GROUP } = SEARCH_RESULT_TYPE;
    const [modalOpenedTime] = useState(moment().second(0).millisecond(0));
    const impactValid = key => !isEmpty(disruptions.find(d => d.key === key).impact);

    // const updateDisruptionsState = effects => props.onDataUpdate('disruptions', effects);
    const updateDisruptionsState = () => {
        props.onDataUpdate('disruptions', disruptions);
    };
    const saveStopsState = stops => props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));

    const addKeys = (routes = [], stops = [], stopGroups = null) => {
        const routesModified = routes.map(route => ({
            ...route,
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: ROUTE.type,
        }));
        const stopsModified = stops.map(stop => ({
            ...stop,
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: STOP.type,
        }));
        const stopGroupsModified = [];
        if (stopGroups) {
            forOwn(stopGroups, (stopGroupStops, groupId) => {
                stopGroupsModified.push({
                    groupId: +groupId,
                    groupName: getStopGroupName(props.stopGroups, groupId),
                    category: {
                        icon: '',
                        label: 'Stop groups',
                        type: STOP_GROUP.type,
                    },
                    valueKey: 'groupId',
                    labelKey: 'groupName',
                    stops: stopGroupStops,
                    type: STOP_GROUP.type,
                });
            });
        }
        return [...routesModified, ...stopsModified, ...stopGroupsModified];
    };

    const addRemoveStopsByGroup = (currentStopGroups, selectedStopGroups) => {
        // remove stops that have been deselected
        const updatedStopGroups = omitBy(currentStopGroups, (_value, key) => !selectedStopGroups[key]);

        // find and add stops from stop groups that aren't in currently selected list
        const stopGroupsToAdd = selectedStopGroups ? pickBy(selectedStopGroups, (_value, key) => !currentStopGroups[key]) : {};

        return { ...updatedStopGroups, ...stopGroupsToAdd };
    };

    const flattenStopGroups = stopGroups => Object.values(stopGroups).flat();
    useEffect(() => {
        console.log('disruptions.length', disruptions.length);
        console.log('disruptions', disruptions);
    }, [disruptions]);

    useEffect(() => {
        if (requireMapUpdate) {
            const routes = disruptions.map(disruption => disruption.affectedEntities.affectedRoutes).flat();
            const singleStops = disruptions.map(disruption => disruption.affectedEntities.affectedStops).filter(entity => !entity.groupId).flat();
            const stopGroups = disruptions.map(disruption => disruption.affectedEntities.affectedStops).filter(entity => !!entity.groupId);

            const stopGroupsWithFormattedStops = stopGroups?.length > 0 ? formatStopsInStopGroup(stopGroups, props.stops) : {};
            const allStopGroups = addRemoveStopsByGroup(stopGroups, stopGroupsWithFormattedStops);

            saveStopsState([...addKeys([], singleStops), ...flattenStopGroups(allStopGroups)]);

            if (routes.length !== props.affectedRoutes.length) {
                props.updateAffectedRoutesState(routes);
                props.getRoutesByShortName(routes);
            }
            setRequireMapUpdate(false);
        }
    }, [requireMapUpdate]);

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

    const startTimeValid = key => isStartTimeValid(disruptions.find(d => d.key === key).startDate, disruptions.find(d => d.key === key).startTime, modalOpenedTime);

    const startDateValid = key => isStartDateValid(disruptions.find(d => d.key === key).startDate, modalOpenedTime);

    const endTimeValid = key => isEndTimeValid( // TODO
        disruptions.find(d => d.key === key).endDate,
        disruptions.find(d => d.key === key).endTime,
        disruptions.find(d => d.key === key).startDate,
        disruptions.find(d => d.key === key).startTime,
    );

    const endDateValid = key => isEndDateValid(disruptions.find(d => d.key === key).endDate, disruptions.find(d => d.key === key).startDate);
    const isDateTimeValid = key => startTimeValid(key) && startDateValid(key) && endDateValid(key);

    /* const checkDisruptions = () => {
        let isValid = true;
        const updated = disruptions.map((d) => {
            const isImpactDirty = !d.impact?.trim();
            const isSeverityDirty = !d.severity?.trim();
            const isStartTimeDirty = !startTimeValid(d.key);
            const cssStartDateInvalid = isStartDateValid(d.key) ? '' : 'is-invalid';
            if (isImpactDirty || isSeverityDirty || isStartTimeDirty || cssStartDateInvalid === 'is-invalid') {
                isValid = false;
            }
            return {
                ...d,
                isImpactDirty,
                isSeverityDirty,
                isStartTimeDirty,
                cssStartDateInvalid,
            };
        });

        setDisruptions(updated);
        console.log('checkDisruptions', isValid);
        return isValid;
    }; */

    const isButtonDisabled = () => {
        if (props.useDraftDisruptions) {
            return props.isLoadingStopsByRoute || props.isLoadingRoutesByStop;
        }
        return /* !checkDisruptions() ||  */props.isLoadingStopsByRoute || props.isLoadingRoutesByStop;
    };

    const onSaveDraft = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(3);
            props.onSubmitDraft();
        } else {
            props.onSubmitUpdate();
        }
    };

    const onContinue = () => { // TODO update state
        updateDisruptionsState();
        if (!props.isEditMode) {
            // removeNotFoundFromStopGroups();
            props.onUpdateEntitiesValidation(true); // TODO hardcoded true
            props.onStepUpdate(2);
            props.updateCurrentStep(3);
        } else {
            props.onStepUpdate(1);
            props.updateCurrentStep(3);
        }
    };

    const updateDisruption = (key, updatedFields) => {
        setDisruptions(prev => prev.map(d => (d.key === key ? { ...d, ...updatedFields } : d)));
    };

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

    const resetAffectedEntities = (disruptionKey) => {
        setDisruptions(prev => prev.map(d => (d.key === disruptionKey ? { ...d,
            affectedEntities: {
                affectedRoutes: [],
                affectedStops: [],
            },
        } : d)));
        setRequireMapUpdate(true);
    };

    const onDisruptionTypeUpdate = (index, disruptionType) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].disruptionType = disruptionType;
        updateDisruptionsState(updatedDisruptions);
    };

    const addDisruption = () => {
        setDisruptions(prev => [...prev, setupDisruption()]);
    };

    const removeDisruption = (key) => {
        setDisruptions(prev => prev.filter(d => d.key !== key));
        setRequireMapUpdate(true);
    };

    const disruptionTypeParams = {
        Routes: {
            label: 'Search routes or draw in the map',
            placeholder: 'Enter a route',
            searchCategory: [ROUTE.type],
        },
        Stops: {
            label: 'Search stop or draw in the maps',
            placeholder: 'Enter a stop or stop group',
            searchCategory: [STOP.type, STOP_GROUP.type],
        },
    };

    const onBack = () => { // TODO update state
        updateDisruptionsState();
        props.onStepUpdate(0);
        props.updateCurrentStep(1);
    };

    const impacts = useAlertEffects();

    return (
        <div className="select_disruption">
            {disruptions.map((disruption, index) => (
                <Form key={ `${disruption.key}_form` } className="row my-3 p-4">
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
                                className={ `font-weight-normal cc-form-control form-control ${disruption.cssStartDateInvalid}` }
                                value={ disruption.startDate }
                                options={ datePickerOptions }
                                placeholder="Select date"
                                onChange={ date => updateDisruption(disruption.key, date.length === 0
                                    ? { startDate: '', cssStartDateInvalid: 'is-invalid' }
                                    : { startDate: moment(date[0]).format(DATE_FORMAT), cssStartDateInvalid: '' }) } />
                            {disruption.cssStartDateInvalid === '' && (
                                <FaRegCalendarAlt
                                    className="disruption-creation__wizard-select-details__icon position-absolute"
                                    size={ 22 } />
                            )}
                            {disruption.cssStartDateInvalid !== '' && (
                                <div className="disruption-recurrance-invalid">Please select start date</div>
                            )}
                        </FormGroup>
                        <FormGroup className="position-relative">
                            <Label for="disruption-creation__wizard-select-details__end-date">
                                <span className="font-size-md font-weight-bold">
                                    {getOptionalLabel(LABEL_END_DATE)}
                                </span>
                            </Label>
                            <Flatpickr
                                key={ `${disruption.key}_end-date` }
                                id="disruption-creation__wizard-select-details__end-date"
                                className={ `font-weight-normal cc-form-control form-control ${disruption.cssEndDateInvalid}` }
                                value={ disruption.endDate }
                                options={ endDateDatePickerOptions(disruption.key) }
                                onChange={ date => updateDisruption(disruption.key, { endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '', cssEndDateInvalid: '' }) }
                                onOpen={ date => updateDisruption(disruption.key, { cssEndDateInvalid: date.length === 0 ? 'is-invalid' : '' }) }

                            />
                            {disruption.cssEndDateInvalid === '' && (
                                <FaRegCalendarAlt
                                    className="disruption-creation__wizard-select-details__icon position-absolute"
                                    size={ 22 } />
                            )}
                            {disruption.cssEndDateInvalid !== '' && (
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
                                value={ disruption.startTime }
                                onChange={ event => updateDisruption(disruption.key, { startTime: event.target.value, isStartTimeDirty: false }) }
                                invalid={ (props.useDraftDisruptions ? (!disruption.isStartTimeDirty && !startTimeValid(disruption.key)) : !startTimeValid(disruption.key)) }
                            />
                            <FormFeedback>Not valid values</FormFeedback>
                        </FormGroup>
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
                    </div>
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
                            index={ index }
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
                isSubmitDisabled={ isButtonDisabled() }
                isDraftOrCreateMode={ props.data?.status === STATUSES.DRAFT || !props.isEditMode }
                onSubmitDraft={ () => onSaveDraft() }
                onBack={ !props.isEditMode ? onBack : undefined }
            />
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
    affectedRoutes: PropTypes.array.isRequired,
    isLoadingStopsByRoute: PropTypes.bool,
    isLoadingRoutesByStop: PropTypes.bool,
    isEditMode: PropTypes.bool,
    toggleIncidentModals: PropTypes.func.isRequired,
    stops: PropTypes.object.isRequired,
    stopGroups: PropTypes.object.isRequired,
    data: PropTypes.object,
    onUpdateEntitiesValidation: PropTypes.func,
    useDraftDisruptions: PropTypes.bool,
};

SelectEffects.defaultProps = {
    onSubmitDraft: () => { },
    onSubmitUpdate: () => { },
    onUpdateEntitiesValidation: () => { },
    isLoadingStopsByRoute: false,
    isLoadingRoutesByStop: false,
    isEditMode: false,
    useDraftDisruptions: false,
    data: {},
};

export default connect(state => ({
    affectedRoutes: getAffectedRoutes(state),
    isLoadingStopsByRoute: getIncidentsLoadingStopsByRouteState(state),
    isLoadingRoutesByStop: getIncidentsLoadingRoutesByStopState(state),
    findStopsByRoute: findStopsByRoute(state),
    isEditMode: isEditEnabled(state),
    disruptionToEdit: getIncidentToEdit(state),
    searchResults: getSearchResults(state),
    stops: getAllStops(state),
    stopGroups: getStopGroupsIncludingDeleted(state),
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
