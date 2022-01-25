import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { filter, isEmpty, uniqBy, uniq, pick, sortBy } from 'lodash-es';
import PropTypes from 'prop-types';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { EntityCheckbox } from './EntityCheckbox';
import {
    getAffectedRoutes,
    getAffectedStops,
    getDisruptionsLoadingState,
    getRoutesByStop as findRoutesByStop,
    isEditEnabled,
    getDisruptionToEdit,
} from '../../../../../redux/selectors/control/disruptions';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';
import PickList from '../../../../Common/PickList/PickList';
import {
    deleteAffectedEntities,
    updateCurrentStep,
    getRoutesByStop,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    showAndUpdateAffectedRoutes,
    toggleDisruptionModals,
} from '../../../../../redux/actions/control/disruptions';
import Footer from './Footer';
import ResetButton from '../../../../Common/Search/CustomSelect/ResetButton';
import Loader from '../../../../Common/Loader/Loader';
import { Expandable, ExpandableContent, ExpandableSummary } from '../../../../Common/Expandable';


const SelectDisruptionEntities = (props) => {
    const addKeys = (routes = [], stops = []) => {
        const routesModified = routes.map(route => ({
            ...route,
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: 'route',
        }));
        const stopsModified = stops.map(stop => ({
            ...stop,
            valueKey: 'stopId',
            labelKey: 'stopCode',
            type: 'stop',
        }));
        return [...routesModified, ...stopsModified];
    };

    const isRouteType = type => type === 'route';
    const [areEntitiesSelected, setAreEntitiesSelected] = useState(false);
    const { ROUTE, STOP } = SEARCH_RESULT_TYPE;
    const [selectedEntities, setSelectedEntities] = useState([]);
    const showFooter = () => areEntitiesSelected || selectedEntities.length > 0;
    const isButtonDisabled = () => !showFooter() || props.isLoading;
    const [expandedStops, setExpandedStops] = useState([]);
    const [editedRoutes, setEditedRoutes] = useState([]);
    const [loadedRoutesByStop, setLoadedRoutesByStop] = useState([]);
    const [isLoadingRoutesByStop, setIsLoadingRoutesByStop] = useState(false);

    const ENTITIES_TYPES = {
        SELECTED_ROUTES: 'selectedRoutes',
        SELECTED_STOPS: 'selectedStops',
        SELECTED_ROUTES_BY_STOPS: 'selectedRoutesByStops',
        ROUTE_ID: 'routeId',
        STOP_ID: 'stopId',
    };

    const filterOnlyStopParams = stop => pick(stop, ['stopId', 'stopName', 'stopCode', 'locationType', 'stopLat', 'stopLon', 'parentStation',
        'platformCode', 'text', 'category', 'icon', 'valueKey', 'labelKey', 'type']);

    const saveStopsState = stops => props.updateAffectedStopsState(sortBy(stops, sortedStop => sortedStop.stopId));

    const updateSelectedEntities = (selectedItems) => {
        props.onDataUpdate('affectedEntities', selectedItems);
        setAreEntitiesSelected(selectedItems.length > 0);

        setSelectedEntities(selectedItems.map((item) => {
            if (isRouteType(item.type) || !item.routeId) {
                return item;
            }
            return filterOnlyStopParams(item);
        }));
    };

    useEffect(() => {
        const newEntities = addKeys(props.affectedRoutes, props.affectedStops);
        updateSelectedEntities(newEntities);
    }, [props.affectedRoutes, props.affectedStops]);

    // componentDidMount
    useEffect(() => {
        if (props.isEditMode && props.affectedRoutes.length > 0) {
            setEditedRoutes(addKeys(props.affectedRoutes, []));
        }
    }, []);

    // loadedRoutesByStop are updated when a stop is expanded - this triggers a JIT fetch of all routes for the stops
    useEffect(() => {
        props.getRoutesByStop(loadedRoutesByStop);
    }, [loadedRoutesByStop]);

    // after getRoutesByStop has completed and findRoutesByStop has been updated ensure loading render is turned off
    useEffect(() => {
        setIsLoadingRoutesByStop(false);
    }, [props.findRoutesByStop]);

    // footer buttons
    const deselectAllEntities = () => {
        setAreEntitiesSelected(false);
        setSelectedEntities([]);
        setLoadedRoutesByStop([]);
        props.deleteAffectedEntities();
    };

    const onContinue = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(1);
            props.updateCurrentStep(2);
        } else {
            props.onSubmitUpdate();
        }
    };

    const removeFromList = (items, entities, valueKey) => items.filter(item => !entities.find(entity => entity[valueKey] === item[valueKey]));

    const addRemoveStops = (selectedStops) => {
        // remove stops that have been deselected
        let updatedStops = props.affectedStops.filter(affectedStop => selectedStops.findIndex(selectedStop => selectedStop.stopId === affectedStop.stopId) >= 0);

        // find and add stops that can't be found in the currently selected list
        const stopsToAdd = selectedStops.filter(selectedStop => props.affectedStops.findIndex(affectedStop => affectedStop.stopId === selectedStop.stopId) < 0);

        if (!isEmpty(stopsToAdd)) {
            updatedStops = [...updatedStops, ...stopsToAdd];
        }

        return updatedStops;
    };

    const updateEntities = (selectedItems) => {
        const stops = filter(selectedItems, { type: 'stop' });
        const routes = filter(selectedItems, { type: 'route' });

        const allStops = addRemoveStops(stops);
        saveStopsState(addKeys([], allStops));

        if (routes.length !== props.affectedRoutes.length) {
            props.updateAffectedRoutesState(routes);
            props.getRoutesByShortName(routes);
        }
    };

    const onChange = (selectedItems) => {
        updateEntities(selectedItems);
        props.onDataUpdate('affectedEntities', selectedItems);
        setAreEntitiesSelected(selectedItems.length > 0);
        setSelectedEntities(selectedItems);
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
            const updatedStops = removeFromList(props.affectedStops, asEntities, ENTITIES_TYPES.STOP_ID);
            saveStopsState(updatedStops);
        }
    };

    const toggleStop = (stop) => {
        const expandedStopIdx = expandedStops.findIndex(stopId => stopId === stop.stopId);

        if (expandedStopIdx >= 0) {
            setExpandedStops(expandedStops.filter(stopId => stopId !== stop.stopId));
        } else {
            setExpandedStops([...expandedStops, stop.stopId]);
        }
    };

    const entityToItemTransformers = {
        [ROUTE.type]: entity => ({
            routeId: entity.data.route_id,
            routeType: entity.data.route_type,
            routeShortName: entity.data.route_short_name,
            agencyName: entity.data.agency_name,
            agencyId: entity.data.agency_id,
            text: entity.text,
            category: entity.category,
            icon: entity.icon,
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: ROUTE.type,
        }),
        [STOP.type]: entity => ({
            stopId: entity.data.stop_id,
            stopName: entity.data.stop_name,
            stopCode: entity.data.stop_code,
            locationType: entity.data.location_type,
            stopLat: entity.data.stop_lat,
            stopLon: entity.data.stop_lon,
            parentStation: entity.data.parent_station,
            platformCode: entity.data.platform_code,
            routeType: entity.data.route_type,
            text: entity.text,
            category: entity.category,
            icon: entity.icon,
            valueKey: 'stopId',
            labelKey: 'stopCode',
            type: STOP.type,
        }),
    };

    const itemToEntityTransformers = {
        [ROUTE.type]: item => ({
            text: item.routeShortName,
            data: {
                route_id: item.routeId,
                route_type: item.routeType,
                route_short_name: item.routeShortName,
                agency_name: item.agencyName,
                agency_id: item.agencyId,
            },
            category: item.category,
            icon: item.icon,
        }),
        [STOP.type]: item => ({
            text: item.text,
            data: {
                stop_id: item.stopId,
                stop_name: item.stopName,
                stop_code: item.stopCode,
                location_type: item.locationType,
                stop_lat: item.stopLat,
                stop_lon: item.stopLon,
                parent_station: item.parentStation,
                platform_code: item.platformCode,
                route_type: item.routeType,
            },
            category: item.category,
            icon: item.icon,
        }),
    };

    const createRouteWithStop = (stop, route) => ({ ...stop, ...route });

    const toggleRoutesByStop = (stop, route, isChecked) => {
        let updatedStops = props.affectedStops;
        const stopList = updatedStops.filter(updatedStop => updatedStop.stopId === stop.stopId);

        if (isChecked) {
            // if current stop has no route then use this else create new
            if (stopList.length === 1 && stopList[0].routeId === undefined) {
                const routeByStop = createRouteWithStop(stop, route);
                updatedStops = updatedStops.filter(updatedStop => updatedStop.stopId !== stop.stopId);
                updatedStops = [...updatedStops, routeByStop];
            } else {
                updatedStops = [...updatedStops, createRouteWithStop(stop, route)];
            }
        } else if (stopList.length === 1) {
            // remove route info if only one stop
            stopList[0].routeId = undefined;
            updatedStops = updatedStops.map((mappedStop) => {
                if (mappedStop.stopId === stop.stopId) {
                    return filterOnlyStopParams(mappedStop);
                }
                return mappedStop;
            });
        } else {
            const stopToRemoveIdx = updatedStops.findIndex(updatedStop => updatedStop.stopId === stop.stopId && updatedStop.routeId === route.routeId);

            if (stopToRemoveIdx >= 0) {
                updatedStops.splice(stopToRemoveIdx, 1);
            }
        }
        saveStopsState(updatedStops);
    };

    const toggleAllRoutesByStop = (stop, routesByStop, isChecked) => {
        let updatedStops = props.affectedStops;
        const stopList = updatedStops.filter(updatedStop => updatedStop.stopId === stop.stopId);
        const stopWithoutRoute = filterOnlyStopParams(stop);

        if (isChecked) {
            const uncheckedRoutes = routesByStop.filter(route => stopList.findIndex(stopItem => stopItem.routeId === route.routeId) < 0);
            if (!isEmpty(uncheckedRoutes)) {
                const stopsToAdd = uncheckedRoutes.map(route => createRouteWithStop(stopWithoutRoute, route));
                updatedStops = [...updatedStops, ...stopsToAdd];
            }
        } else {
            updatedStops = updatedStops.filter(updatedStop => updatedStop.stopId !== stop.stopId);

            // add back single stop without route info
            updatedStops = [...updatedStops, stopWithoutRoute];
        }

        saveStopsState(sortBy(updatedStops, sortedStop => sortedStop.stopId));
    };

    const renderRoutesByStop = (stop) => {
        const routesByStop = props.findRoutesByStop[stop.stopId];

        if (isEmpty(routesByStop)) {
            if (isLoadingRoutesByStop) {
                return [(<li key="-1"><Loader className="loader-disruptions loader-disruptions-list" /></li>)];
            }

            if (loadedRoutesByStop.findIndex(loadedStop => loadedStop.stopId === stop.stopId) >= 0) {
                return [(<li key="-1"><div>Routes not found</div></li>)];
            }

            setIsLoadingRoutesByStop(true);

            setLoadedRoutesByStop(uniq([...loadedRoutesByStop, stop]));
            return [(<li key="-1"><Loader className="loader-disruptions loader-disruptions-list" /></li>)];
        }

        const allSelected = routesByStop.every(route => props.affectedStops.findIndex(stops => stops.stopId === stop.stopId
            && stops.routeId === route.routeId) >= 0);

        const routesByStopHTML = routesByStop.map(route => (
            <li key={ `${stop.stopId}-${route.routeId}` } className="select_entities pb-2">
                <EntityCheckbox
                    id={ `routeByStop-${stop.stopId}-${route.routeId}` }
                    checked={ props.affectedStops.findIndex(affectedStop => affectedStop.routeId === route.routeId && affectedStop.stopId === stop.stopId) >= 0 }
                    onChange={ e => toggleRoutesByStop(stop, route, e.target.checked) }
                    label={ `Route ${route.routeShortName}` }
                />
            </li>
        ));

        if (routesByStop.length > 1) {
            return [(
                <li key="-1" className="select_entities pb-2">
                    <EntityCheckbox
                        id={ `selectAll-${stop.stopId}` }
                        checked={ allSelected }
                        onChange={ e => toggleAllRoutesByStop(stop, routesByStop, e.target.checked) }
                        label="Select All"
                    />
                </li>
            ),
            routesByStopHTML,
            ];
        }

        return [routesByStopHTML];
    };

    const isStopActive = stop => expandedStops.findIndex(stopId => stopId === stop.stopId) >= 0;

    return (
        <div className="select_disruption">
            <PickList
                isVerticalLayout
                displayResults={ false }
                height={ 100 }
                leftPaneLabel="Search routes or stops"
                leftPanePlaceholder="Enter a route or stop number"
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
                isLoading={ props.isLoading }
                searchInCategory={ [ROUTE.type, STOP.type] }
                entityToItemTransformers={ entityToItemTransformers }
                itemToEntityTransformers={ itemToEntityTransformers }
            />
            { selectedEntities.length > 0 && (
                <div className="card-header pt-0 pb-3 bg-transparent">
                    <ResetButton className="search__reset p-0" onClick={ deselectAllEntities } />
                </div>
            )}
            <div className="selection-container h-100">
                <ul className="p-0">
                    {!isEmpty(props.affectedRoutes) && (
                        props.affectedRoutes.map(route => (
                            <li className="selection-item border-0 card" key={ route.routeId }>
                                <div className="selection-item-header card-header">
                                    <div className="toggle-button-space" />
                                    { `Route ${route.routeShortName}` }
                                    <Button
                                        className="cc-btn-link selection-item__button float-right p-0"
                                        onClick={ () => removeItem(route) }>
                                        Remove
                                        <span className="pl-3">X</span>
                                    </Button>
                                </div>
                            </li>
                        ))
                    )}

                    {!isEmpty(props.affectedStops) && (
                        uniqBy(props.affectedStops, stop => stop.stopId).map(stop => (
                            <li className="selection-item border-0 card" key={ stop.stopId }>
                                <Expandable
                                    id={ stop.stopId }
                                    isActive={ expandedStops.findIndex(stopId => stopId === stop.stopId) >= 0 }
                                    onToggle={ () => toggleStop(stop) }>
                                    <ExpandableSummary
                                        expandClassName="selection-item-header card-header d-inline-flex w-100"
                                        displayToggleButton={ false }>
                                        <div>
                                            <Button
                                                className="btn cc-btn-link pt-0 pl-0"
                                                onClick={ () => toggleStop(stop) }>
                                                { isStopActive(stop) ? <IoIosArrowUp className="text-info" size={ 20 } /> : <IoIosArrowDown className="text-info" size={ 20 } /> }
                                            </Button>
                                        </div>
                                        <div className="picklist__list-btn w-100 border-0 rounded-0 text-left">
                                            <Button
                                                className="cc-btn-link selection-item__button float-right p-0"
                                                onClick={ () => removeItem(stop) }>
                                                Remove
                                                <span className="pl-3">X</span>
                                            </Button>
                                            { `Stop ${stop.text}` }
                                        </div>
                                    </ExpandableSummary>
                                    <ExpandableContent extendClassName="bg-white">
                                        {isStopActive(stop) && (
                                            <ul className="selection-item-body card-body bg-white pb-0">
                                                { renderRoutesByStop(stop) }
                                            </ul>
                                        )}
                                    </ExpandableContent>
                                </Expandable>
                            </li>
                        ))
                    )}
                </ul>
            </div>
            { selectedEntities.length > 0 && (
                <Footer
                    updateCurrentStep={ props.updateCurrentStep }
                    onStepUpdate={ props.onStepUpdate }
                    toggleDisruptionModals={ props.toggleDisruptionModals }
                    nextButtonValue={ props.isEditMode ? 'Save' : 'Continue' }
                    onContinue={ () => onContinue() }
                    isSubmitEnabled={ isButtonDisabled() } />
            ) }
            { selectedEntities.length === 0 && (
                <footer className="row justify-content-between position-fixed p-4 m-0 disruptions-creation__wizard-footer" />
            )}
        </div>
    );
};

SelectDisruptionEntities.propTypes = {
    onStepUpdate: PropTypes.func.isRequired,
    onDataUpdate: PropTypes.func.isRequired,
    deleteAffectedEntities: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func.isRequired,
    getRoutesByStop: PropTypes.func.isRequired,
    findRoutesByStop: PropTypes.object.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    affectedRoutes: PropTypes.array.isRequired,
    affectedStops: PropTypes.array.isRequired,
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool,
    toggleDisruptionModals: PropTypes.func.isRequired,
    onSubmitUpdate: PropTypes.func.isRequired,
};

SelectDisruptionEntities.defaultProps = {
    isLoading: false,
    isEditMode: false,
};

export default connect(state => ({
    affectedStops: getAffectedStops(state),
    affectedRoutes: getAffectedRoutes(state),
    isLoading: getDisruptionsLoadingState(state),
    findRoutesByStop: findRoutesByStop(state),
    isEditMode: isEditEnabled(state),
    disruptionToEdit: getDisruptionToEdit(state),
}), {
    deleteAffectedEntities,
    updateCurrentStep,
    getRoutesByStop,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    showAndUpdateAffectedRoutes,
    toggleDisruptionModals,
})(SelectDisruptionEntities);
