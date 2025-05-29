import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { filter, isEmpty, sortBy, forOwn, omitBy, pickBy, groupBy, uniqueId } from 'lodash-es';
import PropTypes from 'prop-types';
import { IconContext } from 'react-icons';
import { FaExclamationTriangle, FaRegCalendarAlt, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { Button, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import {
    getAffectedRoutes,
    getAffectedStops,
    getIncidentsLoadingStopsByRouteState,
    getIncidentsLoadingRoutesByStopState,
    getStopsByRoute as findStopsByRoute,
    isEditEnabled,
    getIncidentToEdit,
} from '../../../../../redux/selectors/control/incidents';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';
import { DISRUPTION_TYPE, STATUSES, SEVERITIES, DEFAULT_SEVERITY } from '../../../../../types/disruptions-types';
import PickList from '../../../../Common/PickList/PickList';
import {
    deleteAffectedEntities,
    updateCurrentStep,
    getStopsByRoute,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    showAndUpdateAffectedRoutes,
    toggleIncidentModals,
} from '../../../../../redux/actions/control/incidents';
import Footer from './Footer';
import ResetButton from '../../../../Common/Search/CustomSelect/ResetButton';
import { search } from '../../../../../redux/actions/search';
import { getSearchResults } from '../../../../../redux/selectors/search';
import { getAllStops } from '../../../../../redux/selectors/static/stops';
import { getStopGroupsIncludingDeleted } from '../../../../../redux/selectors/control/dataManagement/stopGroups';
import { getStopGroupName } from '../../../../../utils/control/dataManagement';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import RadioButtons from '../../../../Common/RadioButtons/RadioButtons';
import ConfirmationModal from '../../../Common/ConfirmationModal/ConfirmationModal';
import { confirmationModalTypes } from '../../types';
import RoutesByStopMultiSelect from './MultiSelect/RoutesByStopMultiSelect';
import StopsByRouteMultiSelect from './MultiSelect/StopsByRouteMultiSelect';
import StopGroupsMultiSelect from './MultiSelect/StopGroupsMultiSelect';
import {
    filterOnlyStopParams,
    formatStopsInStopGroup,
    entityToItemTransformers,
    itemToEntityTransformers,
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
        const now = moment();
        return {
            ...INIT_EFFECT_STATE,
            startTime: now.format(TIME_FORMAT),
            startDate: now.format(DATE_FORMAT),
            key: uniqueId('disruption_'),
        };
    };
    const disruptions = props.data.disruptions.length > 0 ? props.data.disruptions : [setupDisruption()];
    const [requireMapUpdate, setRequireMapUpdate] = useState(false);
    const { ROUTE, STOP, STOP_GROUP } = SEARCH_RESULT_TYPE;
    const [modalOpenedTime] = useState(moment().second(0).millisecond(0));
    const impactValid = index => !isEmpty(disruptions[index].impact);

    const isButtonDisabled = () => {
        if (props.useDraftDisruptions) {
            return props.isLoadingStopsByRoute || props.isLoadingRoutesByStop;
        }
        return false; // TODO
    };

    // const updateDisruptionsState = effects => props.onDataUpdate('disruptions', effects);
    const updateDisruptionsState = (effects) => {
        console.warn('updateDisruptionsState', effects);
        props.onDataUpdate('disruptions', effects);
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
    }, [requireMapUpdate, disruptions]);

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const datePickerOptions = getDatePickerOptions();

    const endDateDatePickerOptions = key => getDatePickerOptions(disruptions.find(d => d.key === key).startDate);

    const severityValid = index => !isEmpty(disruptions[index].severity);

    const startTimeValid = index => isStartTimeValid(disruptions[index].startDate, disruptions[index].startTime, modalOpenedTime);

    const startDateValid = index => isStartDateValid(disruptions[index].startDate, modalOpenedTime);

    const endTimeValid = index => isEndTimeValid(disruptions[index].endDate, disruptions[index].endTime, disruptions[index].startDate, disruptions[index].startTime);

    const endDateValid = index => isEndDateValid(disruptions[index].endDate, disruptions[index].startDate);
    const isDateTimeValid = () => startTimeValid() && startDateValid() && endDateValid();

    const onSaveDraft = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(3);
            props.onSubmitDraft();
        } else {
            props.onSubmitUpdate();
        }
    };

    const onContinue = () => { // TODO update state
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

    const onAffectedEntitiesUpdate = (index, key, affectedEntities) => {
        const updatedDisruptions = disruptions.map((disruption, i) => (i === index
            ? {
                ...disruption,
                affectedEntities: {
                    ...disruption.affectedEntities,
                    [key]: affectedEntities,
                },
            }
            : disruption));
        setRequireMapUpdate(true);
        updateDisruptionsState(updatedDisruptions);
    };

    const updateDisruptionData = (index, key, value) => {
        const updatedDisruptions = disruptions.map((disruption, i) => (i === index
            ? {
                ...disruption,
                [key]: value,
            }
            : disruption));

        updateDisruptionsState(updatedDisruptions); // TODO
        if (key === 'affectedEntities') {
            setRequireMapUpdate(true);
        }
    };

    const onChangeEffect = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].impact = selectedItem;
        updatedDisruptions[index].isImpactDirty = true;
        updateDisruptionsState(updatedDisruptions);
        /* updateDisruptionData(index, 'impact', selectedItem);
        updateDisruptionData(index, 'isImpactDirty', true); */
    };

    const onChangeStartDate = (index, date) => {
        const updatedDisruptions = [...disruptions];
        if (date.length === 0) {
            updatedDisruptions[index].cssStartDateInvalid = 'is-invalid';
            updatedDisruptions[index].startDate = '';
        } else {
            updatedDisruptions[index].cssStartDateInvalid = '';
            updatedDisruptions[index].startDate = moment(date[0]).format(DATE_FORMAT);
        }
        updateDisruptionsState(updatedDisruptions);
        /* updateDisruptionData(index, 'cssStartDateInvalid', date.length === 0 ? 'is-invalid' : '');
        updateDisruptionData(index, 'startDate', date.length === 0 ? '' : moment(date[0]).format(DATE_FORMAT)); */
    };

    const onChangeStartTime = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].startTime = selectedItem;
        updatedDisruptions[index].isStartTimeDirty = true;
        updateDisruptionsState(updatedDisruptions);
        /* updateDisruptionData(index, 'startTime', selectedItem);
        updateDisruptionData(index, 'isStartTimeDirty', true); */
    };

    const onChangeEndTime = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].endTime = selectedItem;
        updateDisruptionsState(updatedDisruptions);
        /* updateDisruptionData(index, 'endTime', selectedItem); */
    };

    const onChangeCreateNotification = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].createNotification = selectedItem;
        updateDisruptionsState(updatedDisruptions);
        /*
        updateDisruptionData(index, 'createNotification', selectedItem); */
    };

    const onChangeEndDate = (key, date) => {
        /* console.log('onChangeEndDate', [...disruptions]);
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].endDate = date.length ? moment(date[0]).format(DATE_FORMAT) : '';
        updatedDisruptions[index].cssEndDateInvalid = '';
        props.onDataUpdate('disruptions', updatedDisruptions);

        updateDisruptionsState(updatedDisruptions); */

        /* updateDisruptionData(index, 'endDate', date.length ? moment(date[0]).format(DATE_FORMAT) : '');
        updateDisruptionData(index, 'cssEndDateInvalid', ''); */

        const updatedDisruptions = [...disruptions].map((d) => {
            if (d.key !== key) return d;

            return {
                ...d,
                endDate: date.length ? moment(date[0]).format(DATE_FORMAT) : '',
                cssEndDateInvalid: '',
            };
        });

        updateDisruptionsState(updatedDisruptions);
    };

    const onBlurEndDate = (key, date) => {
        /* console.log('onBlurEndDate', [...disruptions]);
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].cssEndDateInvalid = date.length === 0 ? 'is-invalid' : '';
        updateDisruptionsState(updatedDisruptions); */

        const updatedDisruptions = [...disruptions].map((d) => {
            if (d.key !== key) return d;

            return {
                ...d,
                cssEndDateInvalid: date.length === 0 ? 'is-invalid' : '',
            };
        });

        updateDisruptionsState(updatedDisruptions);
        /* updateDisruptionData(index, 'cssEndDateInvalid', date.length === 0 ? 'is-invalid' : ''); */
    };

    const onChangeSeverity = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].severity = selectedItem;
        updatedDisruptions[index].isSeverityDirty = true;
        updateDisruptionsState(updatedDisruptions);
        /* updateDisruptionData(index, 'severity', selectedItem);
        updateDisruptionData(index, 'isSeverityDirty', true); */
    };

    const onDisruptionTypeUpdate = (index, disruptionType) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].disruptionType = disruptionType;
        updateDisruptionsState(updatedDisruptions);
    };

    const addDisruption = () => {
        updateDisruptionsState([...disruptions, setupDisruption()]);
    };

    const removeDisruption = (index) => {
        const updatedDisruptions = [...disruptions].filter((_, i) => i !== index);
        updateDisruptionsState(updatedDisruptions);
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
                                    onClick={ () => removeDisruption(index) }>
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
                            invalid={ disruption.isImpactDirty && !impactValid(index) }
                            feedback="Please select effect"
                            onBlur={ selectedItem => onChangeEffect(index, selectedItem) }
                            onChange={ selectedItem => onChangeEffect(index, selectedItem) } />
                    </div>
                    <div className="col-6">
                        <FormGroup>
                            <DisruptionDetailSelect
                                id="disruption-creation__wizard-select-details__severity"
                                className=""
                                value={ disruption.severity }
                                options={ SEVERITIES }
                                label={ LABEL_SEVERITY }
                                invalid={ disruption.isSeverityDirty && !severityValid(index) }
                                feedback="Please select severity"
                                onBlur={ selectedItem => onChangeSeverity(index, selectedItem) }
                                onChange={ selectedItem => onChangeSeverity(index, selectedItem) }
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
                                onChange={ date => onChangeStartDate(index, date) } />
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
                                onChange={ date => onChangeEndDate(disruption.key, date) }
                                onOpen={ date => onBlurEndDate(disruption.key, date) }

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
                                onChange={ event => onChangeStartTime(index, event.target.value) }
                                invalid={ (props.useDraftDisruptions ? (disruption.isStartTimeDirty && !startTimeValid(index)) : !startTimeValid(index)) }
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
                                onChange={ event => onChangeEndTime(index, event.target.value) }
                                invalid={ !endTimeValid(index) }
                            />
                            <FormFeedback>Not valid values</FormFeedback>
                        </FormGroup>
                    </div>
                    <div className="col-12">
                        <FormGroup className="disruption-creation__checkbox">
                            <Input
                                type="checkbox"
                                className="ml-0"
                                onChange={ event => onChangeCreateNotification(index, event.currentTarget.checked) }
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
                            updateDisruptionData={ updateDisruptionData }
                            disruptionType={ disruption.disruptionType }
                            onDisruptionTypeUpdate={ onDisruptionTypeUpdate } />
                    </div>
                </Form>
            ))}
            <button
                type="button"
                className="disruption-effect-button"
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
    /* deleteAffectedEntities: PropTypes.func.isRequired, */
    updateCurrentStep: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    affectedRoutes: PropTypes.array.isRequired,
    /* affectedStops: PropTypes.array.isRequired, */
    isLoadingStopsByRoute: PropTypes.bool,
    isLoadingRoutesByStop: PropTypes.bool,
    isEditMode: PropTypes.bool,
    toggleIncidentModals: PropTypes.func.isRequired,
    stops: PropTypes.object.isRequired,
    stopGroups: PropTypes.object.isRequired,
    /* search: PropTypes.func.isRequired,
    searchResults: PropTypes.object.isRequired, */
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
    // affectedStops: getAffectedStops(state),
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
    // deleteAffectedEntities,
    updateCurrentStep,
    getStopsByRoute,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    // showAndUpdateAffectedRoutes,
    toggleIncidentModals,
    search,
})(SelectEffects);
