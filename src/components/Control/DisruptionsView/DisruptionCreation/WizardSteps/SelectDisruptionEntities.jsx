import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { filter, isEmpty, sortBy, forOwn, omitBy, pickBy, groupBy } from 'lodash-es';
import PropTypes from 'prop-types';
import { IconContext } from 'react-icons';
import { FaExclamationTriangle } from 'react-icons/fa';
import {
    getAffectedRoutes,
    getAffectedStops,
    getDisruptionsLoadingStopsByRouteState,
    getDisruptionsLoadingRoutesByStopState,
    getStopsByRoute as findStopsByRoute,
    isEditEnabled,
    getDisruptionToEdit,
} from '../../../../../redux/selectors/control/disruptions';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';
import { DISRUPTION_TYPE } from '../../../../../types/disruptions-types';
import PickList from '../../../../Common/PickList/PickList';
import {
    deleteAffectedEntities,
    updateCurrentStep,
    getStopsByRoute,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    showAndUpdateAffectedRoutes,
    toggleDisruptionModals,
} from '../../../../../redux/actions/control/disruptions';
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
import StopByRoutesMultiSelect from './MultiSelect/StopByRoutesMultiSelect';
import StopGroupsMultiSelect from './MultiSelect/StopGroupsMultiSelect';
import {
    filterOnlyStopParams,
    formatStopsInStopGroup,
    entityToItemTransformers,
    itemToEntityTransformers,
} from '../../../../../utils/control/disruptions';

export const SelectDisruptionEntities = (props) => {
    const { ROUTE, STOP, STOP_GROUP } = SEARCH_RESULT_TYPE;
    const { NONE, CHANGE_DISRUPTION_TYPE, REMOVE_SELECTED_ENTITY, RESET_SELECTED_ENTITIES } = confirmationModalTypes;
    const isRouteType = type => type === ROUTE.type;
    const isStopGroupType = type => type === STOP_GROUP.type;
    const [areEntitiesSelected, setAreEntitiesSelected] = useState(false);
    const [selectedEntities, setSelectedEntities] = useState([]);
    const showFooter = () => areEntitiesSelected || selectedEntities.length > 0;
    const isButtonDisabled = () => !showFooter() || props.isLoadingStopsByRoute || props.isLoadingRoutesByStop;
    const [editedRoutes, setEditedRoutes] = useState([]);
    const [stopCurrentlySearchingFor, setStopCurrentlySearchingFor] = useState(null);

    const [affectedSingleStops, setAffectedSingleStops] = useState([]);
    const [affectedStopGroups, setAffectedStopGroups] = useState({});
    const maxNumberOfEntities = 200;
    const [totalEntities, setTotalEntities] = useState(0);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [confirmationModalType, setConfirmationModalType] = useState(NONE);

    const entityPropsWaitToRemoveInitState = { entity: undefined, entityType: undefined };
    const [entityPropsWaitToRemove, setEntityPropsWaitToRemove] = useState(entityPropsWaitToRemoveInitState);

    const ENTITIES_TYPES = {
        SELECTED_ROUTES: 'selectedRoutes',
        SELECTED_STOPS: 'selectedStops',
        SELECTED_ROUTES_BY_STOPS: 'selectedRoutesByStops',
        ROUTE_ID: 'routeId',
        STOP_CODE: 'stopCode',
    };

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

    const saveStopsState = stops => props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopCode));

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
        setAreEntitiesSelected(false);
        setSelectedEntities([]);
        props.deleteAffectedEntities();
    };

    const removeNotFoundFromStopGroups = () => {
        const filterStops = props.affectedStops.filter(stop => stop.stopCode !== 'Not Found');
        if (filterStops.length !== props.affectedStops.length) {
            saveStopsState(filterStops);
        }
    };

    const onContinue = () => {
        if (totalEntities > maxNumberOfEntities) {
            setIsAlertModalOpen(true);
        } else if (!props.isEditMode) {
            removeNotFoundFromStopGroups();
            props.onStepUpdate(2);
            props.updateCurrentStep(3);
        } else {
            props.onStepUpdate(1);
            props.updateCurrentStep(3);
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
    };

    const onChange = (selectedItems) => {
        const stops = filter(selectedItems, { type: 'stop' });
        const routes = filter(selectedItems, { type: 'route' });
        const stopGroups = filter(selectedItems, { type: 'stop-group' });
        const stopGroupsWithFormattedStops = stopGroups?.length > 0 ? formatStopsInStopGroup(stopGroups, props.stops) : {};

        const allStops = addRemoveStops(affectedSingleStops, stops);
        const allStopGroups = addRemoveStopsByGroup(affectedStopGroups, stopGroupsWithFormattedStops);
        saveStopsState([...addKeys([], allStops), ...flattenStopGroups(allStopGroups)]);

        if (routes.length !== props.affectedRoutes.length) {
            props.updateAffectedRoutesState(routes);
            props.getRoutesByShortName(routes);
        }
    };

    const removeItem = (entity) => {
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
    };

    const removeGroup = (groupId) => {
        const updatedStopGroups = { ...affectedStopGroups };
        delete updatedStopGroups[groupId];
        saveStopsState([...affectedSingleStops, ...Object.values(updatedStopGroups).flat()]);
    };

    const itemsSelectedText = () => {
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

    const toggleDisruptionType = () => {
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

    const confirmationModalProps = {
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
    };

    const removeAction = (entity, entityType) => {
        if (props.data.workarounds && props.data.workarounds.length > 0) {
            setConfirmationModalType(REMOVE_SELECTED_ENTITY);
            setEntityPropsWaitToRemove({ entity, entityType });
        } else {
            removeItem(entity);
        }
    };

    const activeConfirmationModalProps = confirmationModalProps[confirmationModalType];

    return (
        <div className="select_disruption">
            <RadioButtons
                title=""
                formGroupClass="disruption-creation__disruption-type"
                checkedKey={ props.data.disruptionType === DISRUPTION_TYPE.ROUTES ? '0' : '1' }
                itemOptions={ [{ key: '0', value: DISRUPTION_TYPE.ROUTES }, { key: '1', value: DISRUPTION_TYPE.STOPS }] }
                disabled={ false }
                onChange={ () => {
                    if (selectedEntities.length > 0) {
                        setConfirmationModalType(CHANGE_DISRUPTION_TYPE);
                    } else {
                        toggleDisruptionType();
                    }
                } }
            />
            <PickList
                isVerticalLayout
                displayResults={ false }
                height={ 100 }
                leftPaneLabel={ disruptionTypeParams[props.data.disruptionType].label }
                leftPanePlaceholder={ disruptionTypeParams[props.data.disruptionType].placeholder }
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
                entityToItemTransformers={ entityToItemTransformers }
                itemToEntityTransformers={ itemToEntityTransformers }
            />
            { selectedEntities.length > 0 && (
                <div className="card-header pt-0 pb-3 bg-transparent">
                    <ResetButton
                        className="search__reset p-0"
                        onClick={ () => setConfirmationModalType(RESET_SELECTED_ENTITIES) }
                    />
                </div>
            )}
            <div className="selection-container h-100">
                <ul className="p-0">
                    <StopByRoutesMultiSelect
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
            </div>
            <Footer
                updateCurrentStep={ props.updateCurrentStep }
                onStepUpdate={ props.onStepUpdate }
                toggleDisruptionModals={ props.toggleDisruptionModals }
                nextButtonValue="Continue"
                onContinue={ () => onContinue() }
                isSubmitDisabled={ isButtonDisabled() }
                onBack={ !props.isEditMode ? onBack : undefined }
            />
            <CustomModal
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
                <p className="font-weight-light text-center mb-0">{`${totalEntities} ${itemsSelectedText()} have been selected. Please reduce the selection to less than the maximum allowed of ${maxNumberOfEntities}`}</p>
            </CustomModal>
            <ConfirmationModal
                title={ activeConfirmationModalProps.title }
                message={ activeConfirmationModalProps.message }
                isOpen={ activeConfirmationModalProps.isOpen }
                onClose={ activeConfirmationModalProps.onClose }
                onAction={ activeConfirmationModalProps.onAction } />
        </div>
    );
};

SelectDisruptionEntities.propTypes = {
    onStepUpdate: PropTypes.func.isRequired,
    onDataUpdate: PropTypes.func.isRequired,
    deleteAffectedEntities: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    affectedRoutes: PropTypes.array.isRequired,
    affectedStops: PropTypes.array.isRequired,
    isLoadingStopsByRoute: PropTypes.bool,
    isLoadingRoutesByStop: PropTypes.bool,
    isEditMode: PropTypes.bool,
    toggleDisruptionModals: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired,
    searchResults: PropTypes.object.isRequired,
    stops: PropTypes.object.isRequired,
    stopGroups: PropTypes.object.isRequired,
    data: PropTypes.object,
};

SelectDisruptionEntities.defaultProps = {
    isLoadingStopsByRoute: false,
    isLoadingRoutesByStop: false,
    isEditMode: false,
    data: {},
};

export default connect(state => ({
    affectedStops: getAffectedStops(state),
    affectedRoutes: getAffectedRoutes(state),
    isLoadingStopsByRoute: getDisruptionsLoadingStopsByRouteState(state),
    isLoadingRoutesByStop: getDisruptionsLoadingRoutesByStopState(state),
    findStopsByRoute: findStopsByRoute(state),
    isEditMode: isEditEnabled(state),
    disruptionToEdit: getDisruptionToEdit(state),
    searchResults: getSearchResults(state),
    stops: getAllStops(state),
    stopGroups: getStopGroupsIncludingDeleted(state),
}), {
    deleteAffectedEntities,
    updateCurrentStep,
    getStopsByRoute,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    showAndUpdateAffectedRoutes,
    toggleDisruptionModals,
    search,
})(SelectDisruptionEntities);
