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
    id: uniqueId('effect_'),
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
};

const setupDisruption = () => {
    const now = moment();
    // const disruptionType = isEmpty(this.props.routes) && !isEmpty(this.props.stops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;
    return {
        ...INIT_EFFECT_STATE,
        // affectedEntities: [...this.props.routes, ...this.props.stops],
        startTime: now.format(TIME_FORMAT),
        startDate: now.format(DATE_FORMAT),
        // disruptionType,
    };
};

export const SelectEffects = (props) => {
    const [disruptions, setDisruptions] = useState([setupDisruption()]);
    const [requireMapUpdate, setRequireMapUpdate] = useState(false);
    // const { effectStartDate, effectStartTime, effectEndDate, effectEndTime, impact, createNotification, exemptAffectedTrips, effectSeverity } = props.data;
    const { ROUTE, STOP, STOP_GROUP } = SEARCH_RESULT_TYPE;
    /* const { NONE, CHANGE_DISRUPTION_TYPE, REMOVE_SELECTED_ENTITY, RESET_SELECTED_ENTITIES } = confirmationModalTypes; */
    /* const isRouteType = type => type === ROUTE.type;
    const isStopGroupType = type => type === STOP_GROUP.type;
    const [areEntitiesSelected, setAreEntitiesSelected] = useState(false); // todo index
    const [selectedEntities, setSelectedEntities] = useState([]); // todo index */
    /* const showFooter = () => areEntitiesSelected || selectedEntities.length > 0;
    const isButtonDisabled = () => {
        if (props.useDraftDisruptions) {
            return props.isLoadingStopsByRoute || props.isLoadingRoutesByStop;
        }
        return !showFooter() || props.isLoadingStopsByRoute || props.isLoadingRoutesByStop;
    }; */

    /* const [editedRoutes, setEditedRoutes] = useState([]);
    const [stopCurrentlySearchingFor, setStopCurrentlySearchingFor] = useState(null); */

    /* const [affectedSingleStops, setAffectedSingleStops] = useState([]);// todo index
    const [affectedStopGroups, setAffectedStopGroups] = useState({});// todo index
    const maxNumberOfEntities = 200;
    const [totalEntities, setTotalEntities] = useState(0);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [confirmationModalType, setConfirmationModalType] = useState(NONE); */

    /* const entityPropsWaitToRemoveInitState = { entity: undefined, entityType: undefined };
    const [entityPropsWaitToRemove, setEntityPropsWaitToRemove] = useState(entityPropsWaitToRemoveInitState); */

    const [isEffectDirty, setEffectDirty] = useState([false]);
    const [isSeverityDirty, setSeverityDirty] = useState([false]);
    const [isStartTimeDirty, setIsStartTimeDirty] = useState([false]);
    const [cssStartDateInvalid, setCssStartDateInvalid] = useState(['']);
    const [cssEndDateInvalid, setCssEndDateInvalid] = useState(['']);
    const [modalOpenedTime] = useState(moment().second(0).millisecond(0));
    const effectValid = index => !isEmpty(disruptions[index].impact);

    const isButtonDisabled = () => {
        if (props.useDraftDisruptions) {
            return props.isLoadingStopsByRoute || props.isLoadingRoutesByStop;
        }
        return false; // TODO
    };

    /* const updateAffectedEntitiesState = () => {
        const routes = disruptions.map(disruption => disruption.affectedEntities.affectedRoutes).flat();
        const singleStops = disruptions.map(disruption => disruption.affectedEntities.affectedStops).filter(entity => !entity.groupId).flat();
        const stopGroupStops = disruptions.map(disruption => disruption.affectedEntities.affectedStops).filter(entity => !!entity.groupId).flat();
        console.warn('updateAffectedEntitiesState', routes, singleStops, stopGroupStops);
        props.updateAffectedRoutesState(routes);
        props.updateAffectedStopsState([...singleStops, ...stopGroupStops]);
    }; */

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

    /* useEffect(() => {
        if (requireMapUpdate) {
            const routes = disruptions.map(disruption => disruption.affectedEntities.affectedRoutes).flat();
            const singleStops = disruptions.map(disruption => disruption.affectedEntities.affectedStops).filter(entity => !entity.groupId).flat();
            const stopGroupStops = disruptions.map(disruption => disruption.affectedEntities.affectedStops).filter(entity => !!entity.groupId).flat();
            console.warn('updateAffectedEntitiesState', routes, singleStops, stopGroupStops);
            props.updateAffectedStopsState([...singleStops, ...stopGroupStops]);
            props.updateAffectedRoutesState(routes);
            props.getRoutesByShortName(routes);
            setRequireMapUpdate(false);
        }
    }, [requireMapUpdate, disruptions]); */

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
    /* const ENTITIES_TYPES = {
        SELECTED_ROUTES: 'selectedRoutes',
        SELECTED_STOPS: 'selectedStops',
        SELECTED_ROUTES_BY_STOPS: 'selectedRoutesByStops',
        ROUTE_ID: 'routeId',
        STOP_CODE: 'stopCode',
    }; */

    /* const addKeys = (routes = [], stops = [], stopGroups = null) => {
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
    }; */

    const getOptionalLabel = label => (
        <>
            {label}
            {' '}
            <small className="text-muted">optional</small>
        </>
    );

    const datePickerOptions = getDatePickerOptions();

    const endDateDatePickerOptions = index => getDatePickerOptions(disruptions[index].startDate);

    const severityValid = index => !isEmpty(disruptions[index].severity);

    const startTimeValid = index => isStartTimeValid(disruptions[index].startDate, disruptions[index].startTime, modalOpenedTime);

    const startDateValid = index => isStartDateValid(disruptions[index].startDate, modalOpenedTime);

    const endTimeValid = index => isEndTimeValid(disruptions[index].endDate, disruptions[index].endTime, disruptions[index].startDate, disruptions[index].startTime);

    const endDateValid = index => isEndDateValid(disruptions[index].endDate, disruptions[index].startDate);
    const isDateTimeValid = () => startTimeValid() && startDateValid() && endDateValid();

    /* const saveStopsState = stops => props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));

    const flattenStopGroups = stopGroups => Object.values(stopGroups).flat();

    const fetchStopDetails = (stop) => {
        if (!stopCurrentlySearchingFor) {
            setStopCurrentlySearchingFor(stop.stopCode);
            props.search(stop.stopCode, ['stop']);
        }
    };

    const updateSelectedEntities = (selectedItems) => {
        const stopSelectedOnMap = selectedItems.find(entity => entity.stopCode && !entity.text);
        if (stopSelectedOnMap) {
            fetchStopDetails(stopSelectedOnMap);
        }
        setAreEntitiesSelected(selectedItems.length > 0);

        setSelectedEntities(selectedItems.map((item) => {
            if (isRouteType(item.type) || !item.routeId || isStopGroupType(item.type)) {
                return item;
            }
            return filterOnlyStopParams(item);
        }));
    };

    useEffect(() => {
        const singleStops = props.affectedStops.filter(entity => !entity.groupId);
        const stopGroupStops = props.affectedStops.filter(entity => !!entity.groupId);
        const stopGroups = groupBy(stopGroupStops, 'groupId');

        setAffectedSingleStops(singleStops);
        setAffectedStopGroups(stopGroups);

        const allSingleEntities = addKeys(props.affectedRoutes, singleStops);
        const stopGroupEntities = addKeys([], [], stopGroups);

        props.onDataUpdate('affectedEntities', [...allSingleEntities, ...stopGroupStops]);
        setTotalEntities(allSingleEntities.length + stopGroupStops.length);
        updateSelectedEntities([...allSingleEntities, ...stopGroupEntities]);
    }, [props.affectedRoutes, props.affectedStops]);

    // componentDidMount
    useEffect(() => {
        if (props.isEditMode && props.affectedRoutes.length > 0) {
            setEditedRoutes(addKeys(props.affectedRoutes, []));
        }
    }, []);

    useEffect(() => {
        if (!stopCurrentlySearchingFor
            || !props.searchResults.stop
            || isEmpty(props.searchResults.stop)
            || props.searchResults.stop.findIndex(stop => stop.data.stop_code === stopCurrentlySearchingFor) === -1) {
            return;
        }

        setStopCurrentlySearchingFor(null);

        const foundStop = props.searchResults.stop.find(stop => stop.data.stop_code === stopCurrentlySearchingFor);

        const affectedStopsToUpdate = [...affectedSingleStops, ...flattenStopGroups(affectedStopGroups)];
        const stopToUpdateIdx = affectedStopsToUpdate.findIndex(stop => stop.stopCode === foundStop.data.stop_code);

        if (stopToUpdateIdx >= 0) {
            affectedStopsToUpdate[stopToUpdateIdx].category = foundStop.category;
            affectedStopsToUpdate[stopToUpdateIdx].text = foundStop.text;
            affectedStopsToUpdate[stopToUpdateIdx].icon = foundStop.icon;

            saveStopsState(affectedStopsToUpdate);
        }
    }, [props.searchResults]);

    // footer buttons
    const deselectAllEntities = () => {
        // todo add index
        setAreEntitiesSelected(false);
        setSelectedEntities([]);
        props.deleteAffectedEntities();
    };

    const removeNotFoundFromStopGroups = () => {
        const filterStops = props.affectedStops.filter(stop => stop.stopCode !== 'Not Found');
        if (filterStops.length !== props.affectedStops.length) {
            saveStopsState(filterStops);
        }
    }; */

    /* const onContinue = () => {
        if (totalEntities > maxNumberOfEntities) {
            setIsAlertModalOpen(true);
        } else if (!props.isEditMode) {
            removeNotFoundFromStopGroups();
            props.onUpdateEntitiesValidation(showFooter());
            props.onStepUpdate(2);
            props.updateCurrentStep(3);
        } else {
            props.onStepUpdate(1);
            props.updateCurrentStep(3);
        }
    };

    const onSaveDraft = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(3);
            props.onSubmitDraft();
        } else {
            props.onSubmitUpdate();
        }
    };

    const removeFromList = (items, entities, valueKey) => items.filter(item => !entities.find(entity => entity[valueKey] === item[valueKey]));

    const addRemoveStops = (affectedStops, selectedStops) => {
        // remove stops that have been deselected
        let updatedStops = affectedStops.filter(affectedStop => selectedStops.findIndex(selectedStop => selectedStop.stopCode === affectedStop.stopCode) >= 0);

        // find and add stops that can't be found in the currently selected list
        const stopsToAdd = selectedStops.filter(selectedStop => affectedStops.findIndex(affectedStop => affectedStop.stopCode === selectedStop.stopCode) < 0);

        if (!isEmpty(stopsToAdd)) {
            updatedStops = [...updatedStops, ...stopsToAdd];
        }

        return updatedStops;
    };

    const addRemoveStopsByGroup = (currentStopGroups, selectedStopGroups) => {
        // remove stops that have been deselected
        const updatedStopGroups = omitBy(currentStopGroups, (_value, key) => !selectedStopGroups[key]);

        // find and add stops from stop groups that aren't in currently selected list
        const stopGroupsToAdd = selectedStopGroups ? pickBy(selectedStopGroups, (_value, key) => !currentStopGroups[key]) : {};

        return { ...updatedStopGroups, ...stopGroupsToAdd };
    }; */
    const onSaveDraft = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(3);
            props.onSubmitDraft();
        } else {
            props.onSubmitUpdate();
        }
    };

    const onContinue = () => {
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

    const onChangeEffect = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].impact = selectedItem;
        setDisruptions(updatedDisruptions);

        const isEffectDirtyUpdate = [...isEffectDirty];
        isEffectDirtyUpdate[index] = true;
        setEffectDirty(isEffectDirtyUpdate);
        /* setEffectDirty(true);
        props.onDataUpdate('impact', selectedItem); */
    };

    /* const onChange = (selectedItems) => {
        const stops = filter(selectedItems, { type: 'stop' });
        const routes = filter(selectedItems, { type: 'route' });
        const stopGroups = filter(selectedItems, { type: 'stop-group' });
        const stopGroupsWithFormattedStops = stopGroups?.length > 0 ? formatStopsInStopGroup(stopGroups, props.stops) : {};
        // todo add index
        const allStops = addRemoveStops(affectedSingleStops, stops);
        const allStopGroups = addRemoveStopsByGroup(affectedStopGroups, stopGroupsWithFormattedStops);
        saveStopsState([...addKeys([], allStops), ...flattenStopGroups(allStopGroups)]);

        if (routes.length !== props.affectedRoutes.length) {
            props.updateAffectedRoutesState(routes);
            props.getRoutesByShortName(routes);
        }
    }; */

    const onChangeStartDate = (index, date) => {
        const updatedDisruptions = [...disruptions];
        const startDateInvalid = [...cssStartDateInvalid];
        if (date.length === 0) {
            startDateInvalid[index] = 'is-invalid';
            setCssStartDateInvalid(startDateInvalid);
            updatedDisruptions[index].startDate = '';
            setDisruptions(updatedDisruptions);
        } else {
            startDateInvalid[index] = '';
            setCssStartDateInvalid(startDateInvalid);
            updatedDisruptions[index].startDate = moment(date[0]).format(DATE_FORMAT);
            setDisruptions(updatedDisruptions);
        }
        /* if (date.length === 0) {
            setCssStartDateInvalid('is-invalid');
            props.onDataUpdate('startDate', '');
        } else {
            setCssStartDateInvalid('');
            props.onDataUpdate('startDate', moment(date[0]).format(DATE_FORMAT));
        } */
    };

    const onChangeStartTime = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].startTime = selectedItem;
        setDisruptions(updatedDisruptions);

        const isStartTimeDirtyUpdate = [...isStartTimeDirty];
        isStartTimeDirtyUpdate[index] = true;
        setIsStartTimeDirty(isStartTimeDirtyUpdate);
        /* setIsStartTimeDirty(true);
        props.onDataUpdate('startTime', selectedItem); */
    };

    const onChangeEndTime = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].endTime = selectedItem;
        setDisruptions(updatedDisruptions);
    };

    const onChangeCreateNotification = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].createNotification = selectedItem;
        setDisruptions(updatedDisruptions);
    };

    const onChangeEndDate = (index, date) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].endDate = date.length ? moment(date[0]).format(DATE_FORMAT) : '';
        setDisruptions(updatedDisruptions);

        const cssEndDateInvalidUpdate = [...cssEndDateInvalid];
        cssEndDateInvalidUpdate[index] = '';
        setCssEndDateInvalid(cssEndDateInvalidUpdate);

        /* props.onDataUpdate('endDate', date.length ? moment(date[0]).format(DATE_FORMAT) : '');
        setCssEndDateInvalid(''); */
    };

    const onBlurEndDate = (index, date) => {
        const cssEndDateInvalidUpdate = [...cssEndDateInvalid];
        cssEndDateInvalidUpdate[index] = date.length === 0 ? 'is-invalid' : '';
        setCssEndDateInvalid(cssEndDateInvalidUpdate);
        /* if (isRecurrent) {
            if (date.length === 0 && !props.useDraftDisruptions) {
                setCssEndDateInvalid('is-invalid');
            } else {
                setCssEndDateInvalid('');
            }
        } else {
            setCssEndDateInvalid('');
        } */
    };

    const onChangeSeverity = (index, selectedItem) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].severity = selectedItem;
        setDisruptions(updatedDisruptions);

        const isSeverityDirtyUpdate = [...isSeverityDirty];
        isSeverityDirtyUpdate[index] = true;
        setSeverityDirty(isSeverityDirtyUpdate);
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
        setDisruptions(updatedDisruptions);
        setRequireMapUpdate(true);
    };

    const updateDisruptionData = (index, key, value) => {
        const updatedDisruptions = disruptions.map((disruption, i) => (i === index
            ? {
                ...disruption,
                [key]: value,
            }
            : disruption));
        setDisruptions(updatedDisruptions);
        if (key === 'affectedEntities') {
            setRequireMapUpdate(true);
        }
    };

    const onDisruptionTypeUpdate = (index, disruptionType) => {
        const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].disruptionType = disruptionType;
        setDisruptions(updatedDisruptions);
    };

    const addDisruption = () => {
        setDisruptions(prev => [...prev, setupDisruption()]);
        setEffectDirty(prev => [...prev, false]);
        setSeverityDirty(prev => [...prev, false]);
        setIsStartTimeDirty(prev => [...prev, false]);
        setCssStartDateInvalid(prev => [...prev, '']);
        setCssEndDateInvalid(prev => [...prev, '']);
        /* setAreEntitiesSelected(prev => [...prev, false]); */
    };

    const removeDisruption = (index) => {
        setDisruptions(prev => prev.filter((_, i) => i !== index));
        setEffectDirty(prev => prev.filter((_, i) => i !== index));
        setSeverityDirty(prev => prev.filter((_, i) => i !== index));
        setIsStartTimeDirty(prev => prev.filter((_, i) => i !== index));
        setCssStartDateInvalid(prev => prev.filter((_, i) => i !== index));
        setCssEndDateInvalid(prev => prev.filter((_, i) => i !== index));
        /* setAreEntitiesSelected(prev => prev.filter((_, i) => i !== index)); */
    };

    /* const removeItem = (entity) => {
        let asEntities = [entity];

        if (props.isEditMode && entity.type === undefined) {
            const editedRoute = editedRoutes.find(route => route.routeId === entity.routeId);
            if (editedRoute) {
                asEntities = [editedRoute];
            }
        }

        if (isRouteType(asEntities[0].type)) {
            const updatedRoutes = removeFromList(props.affectedRoutes, asEntities, ENTITIES_TYPES.ROUTE_ID);
            props.updateAffectedRoutesState(updatedRoutes);
            props.getRoutesByShortName(updatedRoutes);
        } else {
            const updatedStops = removeFromList(affectedSingleStops, asEntities, ENTITIES_TYPES.STOP_CODE);
            saveStopsState([...flattenStopGroups(affectedStopGroups), ...updatedStops]);
        }
    }; */

    /* const removeGroup = (groupId) => {
        const updatedStopGroups = { ...affectedStopGroups };
        delete updatedStopGroups[groupId];
        saveStopsState([...affectedSingleStops, ...Object.values(updatedStopGroups).flat()]);
    }; */

    /* const itemsSelectedText = () => {
        let selectedText = '';

        if (props.affectedRoutes.length > 0) {
            selectedText = 'routes';
        }

        if (props.affectedStops.length > 0) {
            if (selectedText.length > 0) {
                selectedText += ' and stops';
            } else {
                selectedText = 'stops';
            }
        }
        return selectedText;
    }; */

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

    const toggleDisruptionType = () => {
        /* const updatedDisruptions = [...disruptions];
        updatedDisruptions[index].disruptionType = disruptions[index].disruptionType === DISRUPTION_TYPE.ROUTES ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;
        setDisruptions(updatedDisruptions); */
        if (props.data.disruptionType === DISRUPTION_TYPE.ROUTES) {
            props.onDataUpdate('disruptionType', DISRUPTION_TYPE.STOPS);
        } else {
            props.onDataUpdate('disruptionType', DISRUPTION_TYPE.ROUTES);
        } 
    };

    const onBack = () => {
        props.onStepUpdate(0);
        props.updateCurrentStep(1);
    };

    /*  const confirmationModalProps = {
        [NONE]: {
            title: '',
            message: '',
            isOpen: false,
            onClose: () => { setConfirmationModalType(NONE); },
            onAction: () => { setConfirmationModalType(NONE); },
        },
        [CHANGE_DISRUPTION_TYPE]: {
            title: 'Change Disruption Type',
            message: 'By making this change, all routes and stops will be removed. Do you wish to continue?',
            isOpen: true,
            onClose: () => { setConfirmationModalType(NONE); },
            onAction: () => {
                toggleDisruptionType();
                deselectAllEntities();
                setConfirmationModalType(NONE);
            },
        },
        [REMOVE_SELECTED_ENTITY]: {
            title: 'Remove selected entity',
            message: 'By removing a stop or route, the workarounds added for it will be lost. Do you wish to continue?',
            isOpen: true,
            onClose: () => { setConfirmationModalType(NONE); },
            onAction: () => {
                const { entity, entityType } = entityPropsWaitToRemove;
                if (entityType === STOP_GROUP) {
                    removeGroup(entity);
                } else {
                    removeItem(entity);
                }
                setEntityPropsWaitToRemove(entityPropsWaitToRemoveInitState);
                setConfirmationModalType(NONE);
            },
        },
        [RESET_SELECTED_ENTITIES]: {
            title: 'Reset all selected entities',
            message: 'By reseting selected entities, all workarounds added for them will be lost. Do you wish to continue?',
            isOpen: true,
            onClose: () => { setConfirmationModalType(NONE); },
            onAction: () => {
                deselectAllEntities();
                setConfirmationModalType(NONE);
            },
        },
    }; */

    /* const removeAction = (entity, entityType) => {
        if (props.data.workarounds && props.data.workarounds.length > 0) {
            setConfirmationModalType(REMOVE_SELECTED_ENTITY);
            setEntityPropsWaitToRemove({ entity, entityType });
        } else {
            removeItem(entity);
        }
    };

    const activeConfirmationModalProps = confirmationModalProps[confirmationModalType]; */

    const impacts = useAlertEffects();

    /* const onSubmitUpdate = async () => {
        const { disruptionData } = this.state;
        const disruptionRequest = buildSubmitBody(this.props.disruptionToEdit, this.props.routes, this.props.stops, disruptionData.workarounds);
        this.props.updateDisruption(disruptionRequest);
        this.props.openCreateDisruption(false);
        this.props.toggleIncidentModals('isConfirmationOpen', true);
    };

    const onUpdateEntitiesValidation = isValid => this.setState({ isSelectEntitiesValid: isValid }); */

    return (
        <div className="select_disruption">
            {disruptions.map((disruption, index) => (
                <Form className="row my-3 p-4">
                    {/* <div className="p4"> */}
                    {/* <button
                        key={ `${disruption.id}_remove_button` }
                        type="button"
                        className="add_new_effect_button"
                        onClick={ removeDisruption(index) }>
                        <AiOutlinePlusCircle key={ `${disruption.id}_remove_icon` } size={ 24 } color="#399CDB" />
                    </button> */}
                    { disruptions.length > 1 && (
                        <div className="col-12">
                            <FormGroup>
                                <button
                                    type="button"
                                    className="disruption-effect-button"
                                    onClick={ () => removeDisruption(index) }>
                                    <AiOutlineMinusCircle key={ `${disruption.id}_remove_icon` } size={ 48 } color="grey" />
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
                            invalid={ isEffectDirty[index] && !effectValid(index) }
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
                                invalid={ isSeverityDirty[index] && !severityValid(index) }
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
                                id="disruption-creation__wizard-select-details__start-date"
                                className={ `font-weight-normal cc-form-control form-control ${cssStartDateInvalid[index]}` }
                                value={ disruption.startDate }
                                options={ datePickerOptions }
                                placeholder="Select date"
                                onChange={ date => onChangeStartDate(index, date) } />
                            {cssStartDateInvalid[index] === '' && (
                                <FaRegCalendarAlt
                                    className="disruption-creation__wizard-select-details__icon position-absolute"
                                    size={ 22 } />
                            )}
                            {cssStartDateInvalid[index] !== '' && (
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
                                id="disruption-creation__wizard-select-details__end-date"
                                className={ `font-weight-normal cc-form-control form-control ${cssEndDateInvalid[index]}` }
                                value={ disruption.endDate }
                                options={ endDateDatePickerOptions(index) }
                                onChange={ date => onChangeEndDate(index, date) }
                                onOpen={ date => onBlurEndDate(index, date) }

                            />
                            {cssEndDateInvalid[index] === '' && (
                                <FaRegCalendarAlt
                                    className="disruption-creation__wizard-select-details__icon position-absolute"
                                    size={ 22 } />
                            )}
                            {cssEndDateInvalid[index] !== '' && (
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
                                invalid={ (props.useDraftDisruptions ? (isStartTimeDirty[index] && !startTimeValid(index)) : !startTimeValid(index)) }
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
                        {/* <FormGroup className="disruption-creation__checkbox">
                            <Input
                                type="checkbox"
                                className="ml-0"
                                onChange={ e => props.onDataUpdate('exemptAffectedTrips', e.currentTarget.checked) }
                                checked={ exemptAffectedTrips }
                            />
                            <span className="pl-2">Exempt Affected Trips</span>
                        </FormGroup> */}
                    </div>
                    {/* </div> */}
                    <div className="disruption-display-block">
                        <SelectEffectEntities
                            key={ disruption.id }
                            index={ index }
                            disruptionId={ disruption.id }
                            affectedEntities={ disruption.affectedEntities }
                            onAffectedEntitiesUpdate={ onAffectedEntitiesUpdate }
                            updateDisruptionData={ updateDisruptionData }
                            disruptionType={ disruption.disruptionType }
                            onDisruptionTypeUpdate={ onDisruptionTypeUpdate } />
                        {/* <RadioButtons
                            title=""
                            formGroupClass="disruption-creation__disruption-type"
                            checkedKey={ props.data.disruptionType === DISRUPTION_TYPE.ROUTES ? '0' : '1' }
                            // checkedKey={ disruption.disruptionType === DISRUPTION_TYPE.ROUTES ? '0' : '1' }
                            itemOptions={ [{ key: '0', value: DISRUPTION_TYPE.ROUTES }, { key: '1', value: DISRUPTION_TYPE.STOPS }] }
                            disabled={ false }
                            onChange={ () => {
                                if (selectedEntities.length > 0) {
                                    setConfirmationModalType(CHANGE_DISRUPTION_TYPE);
                                } else {
                                    toggleDisruptionType();
                                }
                            } }
                        /> */}
                        {/* <PickList
                            isVerticalLayout
                            displayResults={ false }
                            height={ 100 }
                            leftPaneLabel={ disruptionTypeParams[props.data.disruptionType].label }
                            leftPanePlaceholder={ disruptionTypeParams[props.data.disruptionType].placeholder }
                            // leftPaneLabel={ disruptionTypeParams[disruption.disruptionType].label }
                            // leftPanePlaceholder={ disruptionTypeParams[disruption.disruptionType].placeholder }
                            onChange={ selectedItem => onChange(selectedItem) }
                            rightPanelShowSearch={ false }
                            rightPaneLabel="Selected routes and stops:"
                            rightPaneClassName="cc__picklist-pane-bottom pl-4 pr-4"
                            rightPaneShowCheckbox={ false }
                            leftPaneClassName="cc__picklist-pane-vertical"
                            width="w-100"
                            secondPaneHeight="auto"
                            deselectRoutes={ !areEntitiesSelected }
                            selectedValues={ selectedEntities }
                            isLoading={ props.isLoadingStopsByRoute || props.isLoadingRoutesByStop }
                            searchInCategory={ disruptionTypeParams[props.data.disruptionType].searchCategory }
                            // searchInCategory={ disruptionTypeParams[disruption.disruptionType].searchCategory } 
                            entityToItemTransformers={ entityToItemTransformers }
                            itemToEntityTransformers={ itemToEntityTransformers }
                        /> */}
                        {/* { selectedEntities.length > 0 && (
                            <div className="card-header pt-0 pb-3 bg-transparent">
                                <ResetButton
                                    className="search__reset p-0"
                                    onClick={ () => setConfirmationModalType(RESET_SELECTED_ENTITIES) }
                                />
                            </div>
                        )} */}
                        {/* <div className="selection-container">
                            <ul className="p-0">
                                <StopsByRouteMultiSelect
                                    removeAction={ route => removeAction(route, ROUTE) }
                                    className="select-stops-route"
                                />
                                <RoutesByStopMultiSelect
                                    removeAction={ stop => removeAction(stop, STOP) }
                                    className="select-routes-stop"
                                />
                                <StopGroupsMultiSelect
                                    removeAction={ stopGroupStops => removeAction(stopGroupStops[0].groupId, STOP_GROUP) }
                                    className="select-stop-groups"
                                />
                            </ul>
                        </div> */}
                    </div>
                    {/*  <button
                        type="button"
                        onClick={ removeDisruption(index) }
                        className="bg-blue-500 text-white px-4 py-2">
                        Remove {index}
                    </button> */}
                </Form>
            ))}
            <button
                type="button"
                className="disruption-effect-button"
                onClick={ addDisruption }>
                <AiOutlinePlusCircle size={ 48 } color="grey" />
            </button>

            <Footer
                updateCurrentStep={ props.updateCurrentStep }
                onStepUpdate={ props.onStepUpdate }
                toggleDisruptionModals={ props.toggleIncidentModals }
                nextButtonValue="Continue"
                onContinue={ () => onContinue() }
                isSubmitDisabled={ isButtonDisabled() }
                isDraftOrCreateMode={ props.data?.status === STATUSES.DRAFT || !props.isEditMode }
                onSubmitDraft={ () => onSaveDraft() }
                onBack={ !props.isEditMode ? onBack : undefined }
            />
            {/*  <CustomModal
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
                    <p className="font-weight-light text-center mb-0">{`${totalEntities} ${itemsSelectedText()} have been selected.
                    Please reduce the selection to less than the maximum allowed of ${maxNumberOfEntities}`}</p>
                </CustomModal>
                <ConfirmationModal
                    title={ activeConfirmationModalProps.title }
                    message={ activeConfirmationModalProps.message }
                    isOpen={ activeConfirmationModalProps.isOpen }
                    onClose={ activeConfirmationModalProps.onClose }
                    onAction={ activeConfirmationModalProps.onAction } /> */}
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
