import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { filter, isEmpty, uniqBy, uniq, pick, sortBy, forOwn, omitBy, pickBy, groupBy } from 'lodash-es';
import PropTypes from 'prop-types';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { IconContext } from 'react-icons';
import { FaExclamationTriangle } from 'react-icons/fa';
import { EntityCheckbox } from './EntityCheckbox';
import {
    getAffectedRoutes,
    getAffectedStops,
    getDisruptionsLoadingStopsByRouteState,
    getDisruptionsLoadingRoutesByStopState,
    getStopsByRoute as findStopsByRoute,
    getRoutesByStop as findRoutesByStop,
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
import { search } from '../../../../../redux/actions/search';
import { getSearchResults } from '../../../../../redux/selectors/search';
import { getAllStops } from '../../../../../redux/selectors/static/stops';
import { getStopGroupsIncludingDeleted } from '../../../../../redux/selectors/control/dataManagement/stopGroups';
import { useWorkarounds } from '../../../../../redux/selectors/appSettings';
import { getStopGroupName } from '../../../../../utils/control/dataManagement';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import RadioButtons from '../../../../Common/RadioButtons/RadioButtons';
import ConfirmationModal from '../../../Common/ConfirmationModal/ConfirmationModal';
import { DIRECTIONS, confirmationModalTypes } from '../../types';

export const SelectDisruptionEntities = (props) => {
    const { ROUTE, STOP, STOP_GROUP } = SEARCH_RESULT_TYPE;
    const { NONE, CHANGE_DISRUPTION_TYPE, REMOVE_SELECTED_ENTITY, RESET_SELECTED_ENTITIES } = confirmationModalTypes;
    const isRouteType = type => type === ROUTE.type;
    const isStopGroupType = type => type === STOP_GROUP.type;
    const [areEntitiesSelected, setAreEntitiesSelected] = useState(false);
    const [selectedEntities, setSelectedEntities] = useState([]);
    const showFooter = () => areEntitiesSelected || selectedEntities.length > 0;
    const isButtonDisabled = () => !showFooter() || props.isLoadingStopsByRoute || props.isLoadingRoutesByStop;
    const [expandedRoutes, setExpandedRoutes] = useState({});
    const [expandedStops, setExpandedStops] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});
    const [expandedRouteDirections, setExpandedRouteDirections] = useState({});
    const [editedRoutes, setEditedRoutes] = useState([]);
    const [loadedStopsByRoute, setLoadedStopsByRoute] = useState([]);
    const [loadedRoutesByStop, setLoadedRoutesByStop] = useState([]);
    const [isLoadingStopsByRoute, setIsLoadingStopsByRoute] = useState(false);
    const [isLoadingRoutesByStop, setIsLoadingRoutesByStop] = useState(false);
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

    const filterOnlyRouteParams = route => pick(route, ['routeId', 'routeShortName', 'routeType', 'routeColor', 'shapeWkt', 'agencyId', 'agencyName',
        'text', 'category', 'icon', 'valueKey', 'labelKey', 'type']);
    const filterOnlyStopParams = stop => pick(stop, ['stopId', 'stopName', 'stopCode', 'locationType', 'stopLat', 'stopLon', 'parentStation',
        'platformCode', 'text', 'category', 'icon', 'valueKey', 'labelKey', 'type', 'groupId']);

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

    // loadedStopsByRoute are updated when a route is expanded - this triggers a JIT fetch of all stops for the routes
    useEffect(() => {
        props.getStopsByRoute(loadedStopsByRoute);
    }, [loadedStopsByRoute]);

    // after getStopsByRoute has completed and findStopsByRoute has been updated ensure loading render is turned off
    useEffect(() => {
        setIsLoadingStopsByRoute(false);
    }, [props.findStopsByRoute]);

    // loadedRoutesByStop are updated when a stop is expanded - this triggers a JIT fetch of all routes for the stops
    useEffect(() => {
        props.getRoutesByStop(loadedRoutesByStop);
    }, [loadedRoutesByStop]);

    // after getRoutesByStop has completed and findRoutesByStop has been updated ensure loading render is turned off
    useEffect(() => {
        setIsLoadingRoutesByStop(false);
    }, [props.findRoutesByStop]);

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
        setLoadedStopsByRoute([]);
        setLoadedRoutesByStop([]);
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
            props.onStepUpdate(1);
            props.updateCurrentStep(2);
        } else if (props.useWorkarounds) {
            props.onStepUpdate(2);
            props.updateCurrentStep(3);
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
    };

    const formatStop = (stop, text = null, category = null, icon = null) => ({
        stopId: stop.stop_id,
        stopName: stop.stop_name,
        stopCode: stop.stop_code,
        locationType: stop.location_type,
        stopLat: stop.stop_lat,
        stopLon: stop.stop_lon,
        parentStation: stop.parent_station,
        platformCode: stop.platform_code,
        routeType: stop.route_type,
        text: text ?? `${stop.stop_code} - ${stop.stop_name}`,
        category,
        icon,
        valueKey: 'stopCode',
        labelKey: 'stopCode',
        type: STOP.type,
    });

    const formatStopsWithGroup = (stops, groupId) => stops.map(stop => ({
        ...formatStop(stop),
        groupId,
    }));

    const formatStopsInStopGroup = (stopGroups) => {
        const stops = [];
        stopGroups.forEach((group) => {
            if (!group.stops[0].value) {
                stops.push(...group.stops);
            } else {
                const groupStops = group.stops.map((stop) => {
                    let foundStop = props.stops[stop.value];

                    if (!foundStop) {
                        foundStop = {
                            stop_id: `-${stop.value}`,
                            text: `${stop.value}`,
                            stop_name: `${stop.value}`,
                            stop_code: 'Not Found',
                        };
                    }

                    return foundStop;
                });

                stops.push(...formatStopsWithGroup(groupStops, group.groupId));
            }
        });

        return groupBy(stops, 'groupId');
    };

    const onChange = (selectedItems) => {
        const stops = filter(selectedItems, { type: 'stop' });
        const routes = filter(selectedItems, { type: 'route' });
        const stopGroups = filter(selectedItems, { type: 'stop-group' });
        const stopGroupsWithFormattedStops = stopGroups?.length > 0 ? formatStopsInStopGroup(stopGroups) : {};

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

    const toggleExpandedItem = (itemIdToToggle, expandedItems, setExpandedItems) => {
        const currentItems = { ...expandedItems };
        if (!expandedItems[itemIdToToggle]) {
            currentItems[itemIdToToggle] = true;
            setExpandedItems(currentItems);
        } else {
            delete currentItems[itemIdToToggle];
            setExpandedItems(currentItems);
        }
    };

    const toggleExpandedRoute = route => toggleExpandedItem(route.routeId, expandedRoutes, setExpandedRoutes);
    const toggleExpandedStop = stop => toggleExpandedItem(stop.stopCode, expandedStops, setExpandedStops);
    const toggleExpandedGroup = group => toggleExpandedItem(group.groupId, expandedGroups, setExpandedGroups);
    const toggleExpandedRouteDirection = (route, direction) => toggleExpandedItem(`${route.routeId}-${direction}`, expandedRouteDirections, setExpandedRouteDirections);

    const isRouteActive = route => !!expandedRoutes[route.routeId];
    const isStopActive = stop => !!expandedStops[stop.stopCode];
    const isGroupActive = group => !!expandedGroups[group.groupId];
    const isRouteDirectionActive = (route, direction) => !!expandedRouteDirections[`${route.routeId}-${direction}`];

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
        [STOP.type]: entity => formatStop(entity.data, entity.text, entity.category, entity.icon),
        [STOP_GROUP.type]: entity => ({
            groupId: entity.data.id,
            groupName: entity.data.title,
            stops: entity.data.stops,
            valueKey: 'groupId',
            labelKey: 'groupName',
            type: STOP_GROUP.type,
            category: entity.category,
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
        [STOP_GROUP.type]: item => ({
            text: item.groupName,
            data: {
                group_id: item.groupId,
            },
            category: item.category,
            icon: item.icon,
        }),
    };

    const createStopWithRoute = (stop, route) => ({ ...route, ...stop });
    const createRouteWithStop = (stop, route) => ({ ...stop, ...route });

    const toggleStopsByRoute = (route, stop, isChecked) => {
        let updatedRoutes = props.affectedRoutes;
        const routeList = updatedRoutes.filter(updatedRoute => updatedRoute.routeId === route.routeId);

        if (isChecked) {
            // if current route has no stop then use this else create new
            if (routeList.length === 1 && routeList[0].stopCode === undefined) {
                const stopByRoute = createStopWithRoute(stop, route);
                updatedRoutes = updatedRoutes.filter(updatedRoute => updatedRoute.routeId !== route.routeId);
                updatedRoutes = [...updatedRoutes, stopByRoute];
            } else {
                updatedRoutes = [...updatedRoutes, createStopWithRoute(stop, route)];
            }
        } else if (routeList.length === 1) {
            // remove stop info if only one route
            updatedRoutes = updatedRoutes.map((mappedRoute) => {
                if (mappedRoute.routeId === route.routeId) {
                    return filterOnlyRouteParams(mappedRoute);
                }
                return mappedRoute;
            });
        } else {
            const routeToRemoveIdx = updatedRoutes.findIndex(updatedRoute => updatedRoute.stopCode === stop.stopCode && updatedRoute.routeId === route.routeId && `${updatedRoute.directionId}` === `${stop.directionId}`);

            if (routeToRemoveIdx >= 0) {
                updatedRoutes.splice(routeToRemoveIdx, 1);
            }
        }
        props.updateAffectedRoutesState([...updatedRoutes]);
    };

    const toggleRoutesByStop = (stop, route, isChecked) => {
        let updatedStops = affectedSingleStops;
        const stopList = updatedStops.filter(updatedStop => updatedStop.stopCode === stop.stopCode);

        if (isChecked) {
            // if current stop has no route then use this else create new
            if (stopList.length === 1 && stopList[0].routeId === undefined) {
                const routeByStop = createRouteWithStop(stop, route);
                updatedStops = updatedStops.filter(updatedStop => updatedStop.stopCode !== stop.stopCode);
                updatedStops = [...updatedStops, routeByStop];
            } else {
                updatedStops = [...updatedStops, createRouteWithStop(stop, route)];
            }
        } else if (stopList.length === 1) {
            // remove route info if only one stop
            stopList[0].routeId = undefined;
            updatedStops = updatedStops.map((mappedStop) => {
                if (mappedStop.stopCode === stop.stopCode) {
                    return filterOnlyStopParams(mappedStop);
                }
                return mappedStop;
            });
        } else {
            const stopToRemoveIdx = updatedStops.findIndex(updatedStop => updatedStop.stopCode === stop.stopCode && updatedStop.routeId === route.routeId);

            if (stopToRemoveIdx >= 0) {
                updatedStops.splice(stopToRemoveIdx, 1);
            }
        }
        saveStopsState([...flattenStopGroups(affectedStopGroups), ...updatedStops]);
    };

    const toggleAllStopsByRouteDirection = (route, direction, stopsByRouteDirection, isChecked) => {
        let updatedRoutes = props.affectedRoutes;
        const routeList = updatedRoutes.filter(updatedRoute => updatedRoute.routeId === route.routeId);
        const routeWithoutStop = filterOnlyRouteParams(route);

        if (isChecked) {
            const uncheckedStops = stopsByRouteDirection.filter(stop => `${stop.directionId}` === `${direction}` && !routeList.some(routeItem => routeItem.stopCode === stop.stopCode && `${routeItem.directionId}` === `${stop.directionId}`));
            if (!isEmpty(uncheckedStops)) {
                const stopsToAdd = uncheckedStops.map(stop => createStopWithRoute(routeWithoutStop, stop));
                if (routeList.length === 1 && routeList[0].stopCode === undefined) {
                    updatedRoutes = updatedRoutes.filter(updatedRoute => updatedRoute.routeId !== route.routeId);
                }
                updatedRoutes = [...updatedRoutes, ...stopsToAdd];
            }
        } else {
            updatedRoutes = updatedRoutes.filter(updatedRoute => updatedRoute.routeId !== route.routeId || `${updatedRoute.directionId}` !== `${direction}`);

            // add back single route without stop info
            if (!updatedRoutes.some(updatedRoute => updatedRoute.routeId === route.routeId)) {
                updatedRoutes = [...updatedRoutes, routeWithoutStop];
            }
        }

        props.updateAffectedRoutesState(updatedRoutes);
    };

    const toggleAllRoutesByStop = (stop, routesByStop, isChecked) => {
        let updatedStops = props.affectedStops;
        const stopList = updatedStops.filter(updatedStop => updatedStop.stopCode === stop.stopCode);
        const stopWithoutRoute = filterOnlyStopParams(stop);

        if (isChecked) {
            const uncheckedRoutes = routesByStop.filter(route => stopList.findIndex(stopItem => stopItem.routeId === route.routeId) < 0);
            if (!isEmpty(uncheckedRoutes)) {
                const stopsToAdd = uncheckedRoutes.map(route => createRouteWithStop(stopWithoutRoute, route));
                if (stopList.length === 1 && stopList[0].routeId === undefined) {
                    updatedStops = updatedStops.filter(updatedStop => updatedStop.stopCode !== stop.stopCode);
                }
                updatedStops = [...updatedStops, ...stopsToAdd];
            }
        } else {
            updatedStops = updatedStops.filter(updatedStop => updatedStop.stopCode !== stop.stopCode);

            // add back single stop without route info
            updatedStops = [...updatedStops, stopWithoutRoute];
        }

        saveStopsState(sortBy(updatedStops, sortedStop => sortedStop.stopCode));
    };

    const renderStopsCheckboxByRouteDirection = (route, direction) => {
        const stopsByRoute = props.findStopsByRoute[route.routeId];
        const stopsByRouteDirection = stopsByRoute.filter(stop => `${stop.directionId}` === `${direction}`);

        const allSelected = stopsByRouteDirection.every(stop => props.affectedRoutes.some(routes => routes.stopCode === stop.stopCode
            && routes.routeId === route.routeId));

        let stopsByRouteDirectionHTML = stopsByRouteDirection.map(stop => (
            <li key={ `${route.routeId}-${stop.stopCode}-${direction}` } className="select_entities pb-2">
                <EntityCheckbox
                    id={ `stopByRoute-${route.routeId}-${stop.stopCode}-${direction}` }
                    checked={ props.affectedRoutes.some(affectedRoute => (
                        affectedRoute.routeId === route.routeId && affectedRoute.stopCode === stop.stopCode && `${affectedRoute.directionId}` === `${direction}`)) }
                    onChange={ e => toggleStopsByRoute(route, stop, e.target.checked) }
                    label={ `${stop.stopCode} - ${stop.stopName}` }
                />
            </li>
        ));

        if (stopsByRouteDirection.length > 1) {
            stopsByRouteDirectionHTML = [
                (
                    <li key="-1" className="select_entities pb-2">
                        <EntityCheckbox
                            id={ `selectAll-${route.routeId}` }
                            checked={ allSelected }
                            onChange={ e => toggleAllStopsByRouteDirection(route, direction, stopsByRouteDirection, e.target.checked) }
                            label="Select All"
                        />
                    </li>
                ),
                ...stopsByRouteDirectionHTML,
            ];
        }

        return stopsByRouteDirectionHTML;
    };

    const renderStopsByRouteDirection = (route, direction) => {
        const directionText = DIRECTIONS[direction];

        return (
            <Expandable
                id={ `${route.routeId}-${direction}` }
                key={ `${route.routeId}-${direction}` }
                isActive={ isRouteDirectionActive(route, direction) }
                onToggle={ () => toggleExpandedRouteDirection(route, direction) }
                className="border-0">
                <ExpandableSummary
                    expandClassName="selection-item-header card-header d-inline-flex w-100 border-0"
                    displayToggleButton={ false }>
                    <div>
                        <Button
                            className="btn cc-btn-link pt-0 pl-0"
                            onClick={ () => toggleExpandedRouteDirection(route, direction) }>
                            { isRouteDirectionActive(route, direction)
                                ? <IoIosArrowUp className="text-info" size={ 20 } />
                                : <IoIosArrowDown className="text-info" size={ 20 } /> }
                        </Button>
                    </div>
                    <div className="picklist__list-btn w-100 border-0 rounded-0 text-left font-weight-normal">
                        { `Direction: ${directionText}` }
                    </div>
                </ExpandableSummary>
                <ExpandableContent extendClassName="bg-white border-0">
                    {isRouteDirectionActive(route, direction) && (
                        <ul className="selection-item-body card-body bg-white pb-0">
                            { renderStopsCheckboxByRouteDirection(route, direction) }
                        </ul>
                    )}
                </ExpandableContent>
            </Expandable>
        );
    };

    const renderStopsByRoute = (route) => {
        const stopsByRoute = props.findStopsByRoute[route.routeId];

        if (isEmpty(stopsByRoute)) {
            if (isLoadingStopsByRoute) {
                return [(<li key="-1"><Loader className="loader-disruptions loader-disruptions-list" /></li>)];
            }

            if (loadedStopsByRoute.findIndex(loadedRoute => loadedRoute.routeId === route.routeId) >= 0) {
                return [(<li key="-1"><div>Stops not found</div></li>)];
            }

            setIsLoadingStopsByRoute(true);

            setLoadedStopsByRoute(uniq([...loadedStopsByRoute, route]));
            return [(<li key="-1"><Loader className="loader-disruptions loader-disruptions-list" /></li>)];
        }

        return Object.keys(DIRECTIONS)
            .filter(direction => stopsByRoute.some(stop => `${stop.directionId}` === `${direction}`))
            .map(direction => renderStopsByRouteDirection(route, direction));
    };

    const renderRoutesByStop = (stop) => {
        const routesByStop = props.findRoutesByStop[stop.stopCode];

        if (isEmpty(routesByStop)) {
            if (isLoadingRoutesByStop) {
                return [(<li key="-1"><Loader className="loader-disruptions loader-disruptions-list" /></li>)];
            }

            if (loadedRoutesByStop.findIndex(loadedStop => loadedStop.stopCode === stop.stopCode) >= 0) {
                return [(<li key="-1"><div>Routes not found</div></li>)];
            }

            setIsLoadingRoutesByStop(true);
            setLoadedRoutesByStop(uniq([...loadedRoutesByStop, stop]));
            return [(<li key="-1"><Loader className="loader-disruptions loader-disruptions-list" /></li>)];
        }

        const allSelected = routesByStop.every(route => affectedSingleStops.findIndex(stops => stops.stopCode === stop.stopCode
            && stops.routeId === route.routeId) >= 0);

        const routesByStopHTML = routesByStop.map(route => (
            <li key={ `${stop.stopCode}-${route.routeId}` } className="select_entities pb-2">
                <EntityCheckbox
                    id={ `routeByStop-${stop.stopCode}-${route.routeId}` }
                    checked={ affectedSingleStops.findIndex(affectedStop => affectedStop.routeId === route.routeId && affectedStop.stopCode === stop.stopCode) >= 0 }
                    onChange={ e => toggleRoutesByStop(stop, route, e.target.checked) }
                    label={ `Route ${route.routeShortName}` }
                />
            </li>
        ));

        if (routesByStop.length > 1) {
            return [(
                <li key="-1" className="select_entities pb-2">
                    <EntityCheckbox
                        id={ `selectAll-${stop.stopCode}` }
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

    const renderStopGroupStops = stops => stops.map(stop => (
        <li key={ `${stop.groupId}-${stop.stopCode}` } className="select_entities pb-2">
            <EntityCheckbox
                id={ `stopByGroup-${stop.groupId}-${stop.stopCode}` }
                checked
                onChange={ null }
                label={ `Stop ${stop.text}` }
                disabled
            />
        </li>
    ));

    const renderStopGroups = stopGroups => (Object.values(stopGroups).map(stopGroupStops => (
        <li className="selection-item border-0 card" key={ stopGroupStops[0].groupId }>
            <Expandable
                id={ stopGroupStops[0].groupId }
                isActive={ isGroupActive(stopGroupStops[0]) }
                onToggle={ () => toggleExpandedGroup(stopGroupStops[0]) }>
                <ExpandableSummary
                    expandClassName="selection-item-header card-header d-inline-flex w-100"
                    displayToggleButton={ false }>
                    <div>
                        <Button
                            className="btn cc-btn-link pt-0 pl-0"
                            onClick={ () => toggleExpandedGroup(stopGroupStops[0]) }>
                            { isGroupActive(stopGroupStops[0]) ? <IoIosArrowUp className="text-info" size={ 20 } /> : <IoIosArrowDown className="text-info" size={ 20 } />}
                        </Button>
                    </div>
                    <div className="picklist__list-btn w-100 border-0 rounded-0 text-left">
                        <Button
                            className="cc-btn-link selection-item__button float-right p-0"
                            onClick={ () => {
                                if (props.useWorkarounds) {
                                    setConfirmationModalType(REMOVE_SELECTED_ENTITY);
                                    setEntityPropsWaitToRemove({ entity: stopGroupStops[0].groupId, entityType: STOP_GROUP });
                                } else {
                                    removeGroup(stopGroupStops[0].groupId);
                                }
                            } }>
                            Remove
                            <span className="pl-3">X</span>
                        </Button>
                        {`Stop Group - ${getStopGroupName(props.stopGroups, stopGroupStops[0].groupId)} (${stopGroupStops.length})`}
                    </div>
                </ExpandableSummary>
                <ExpandableContent extendClassName="bg-white">
                    {isGroupActive(stopGroupStops[0]) && (
                        <ul className="selection-item-body card-body bg-white pb-0">
                            { renderStopGroupStops(stopGroupStops) }
                        </ul>
                    )}
                </ExpandableContent>
            </Expandable>
        </li>
    )));

    const disruptionTypeParams = {
        Routes: {
            label: 'Search routes',
            placeholder: 'Enter a route',
            searchCategory: [ROUTE.type],
        },
        Stops: {
            label: 'Search stops',
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
                        onClick={ () => (props.useWorkarounds ? setConfirmationModalType(RESET_SELECTED_ENTITIES) : deselectAllEntities()) }
                    />
                </div>
            )}
            <div className="selection-container h-100">
                <ul className="p-0">
                    {!isEmpty(props.affectedRoutes) && (
                        uniqBy(props.affectedRoutes, route => route.routeId).map(route => (
                            <li className="selection-item border-0 card" key={ route.routeId }>
                                <Expandable
                                    id={ route.routeId }
                                    isActive={ isRouteActive(route) }
                                    onToggle={ () => toggleExpandedRoute(route) }>
                                    <ExpandableSummary
                                        expandClassName="selection-item-header card-header d-inline-flex w-100"
                                        displayToggleButton={ false }>
                                        <div>
                                            <Button
                                                className="btn cc-btn-link pt-0 pl-0"
                                                onClick={ () => toggleExpandedRoute(route) }>
                                                { isRouteActive(route) ? <IoIosArrowUp className="text-info" size={ 20 } /> : <IoIosArrowDown className="text-info" size={ 20 } /> }
                                            </Button>
                                        </div>
                                        <div className="picklist__list-btn w-100 border-0 rounded-0 text-left">
                                            <Button
                                                className="cc-btn-link selection-item__button float-right p-0"
                                                onClick={ () => {
                                                    if (props.useWorkarounds) {
                                                        setConfirmationModalType(REMOVE_SELECTED_ENTITY);
                                                        setEntityPropsWaitToRemove({ entity: route, entityType: ROUTE });
                                                    } else {
                                                        removeItem(route);
                                                    }
                                                } }>
                                                Remove
                                                <span className="pl-3">X</span>
                                            </Button>
                                            { `Route ${route.routeShortName}` }
                                        </div>
                                    </ExpandableSummary>
                                    <ExpandableContent extendClassName="bg-white">
                                        {isRouteActive(route) && (
                                            <ul className="selection-item-body card-body bg-white pb-0 pt-0">
                                                { renderStopsByRoute(route) }
                                            </ul>
                                        )}
                                    </ExpandableContent>
                                </Expandable>
                            </li>
                        ))
                    )}

                    {!isEmpty(affectedSingleStops) && (
                        uniqBy(affectedSingleStops, stop => stop.stopCode).map(stop => (
                            <li className="selection-item border-0 card" key={ stop.stopCode }>
                                <Expandable
                                    id={ stop.stopCode }
                                    isActive={ isStopActive(stop) }
                                    onToggle={ () => toggleExpandedStop(stop) }>
                                    <ExpandableSummary
                                        expandClassName="selection-item-header card-header d-inline-flex w-100"
                                        displayToggleButton={ false }>
                                        <div>
                                            <Button
                                                className="btn cc-btn-link pt-0 pl-0"
                                                onClick={ () => toggleExpandedStop(stop) }>
                                                { isStopActive(stop) ? <IoIosArrowUp className="text-info" size={ 20 } /> : <IoIosArrowDown className="text-info" size={ 20 } /> }
                                            </Button>
                                        </div>
                                        <div className="picklist__list-btn w-100 border-0 rounded-0 text-left">
                                            <Button
                                                className="cc-btn-link selection-item__button float-right p-0"
                                                onClick={ () => {
                                                    if (props.useWorkarounds) {
                                                        setConfirmationModalType(REMOVE_SELECTED_ENTITY);
                                                        setEntityPropsWaitToRemove({ entity: stop, entityType: STOP });
                                                    } else {
                                                        removeItem(stop);
                                                    }
                                                } }>
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

                    {!isEmpty(affectedStopGroups) && renderStopGroups(affectedStopGroups) }
                </ul>
            </div>
            { selectedEntities.length > 0 && (
                <Footer
                    updateCurrentStep={ props.updateCurrentStep }
                    onStepUpdate={ props.onStepUpdate }
                    toggleDisruptionModals={ props.toggleDisruptionModals }
                    nextButtonValue={ props.isEditMode && !props.useWorkarounds ? 'Save' : 'Continue' }
                    onContinue={ () => onContinue() }
                    isSubmitDisabled={ isButtonDisabled() } />
            ) }
            { selectedEntities.length === 0 && (
                <footer className="row justify-content-between position-fixed p-4 m-0 disruptions-creation__wizard-footer" />
            )}
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
    getStopsByRoute: PropTypes.func.isRequired,
    findStopsByRoute: PropTypes.object.isRequired,
    getRoutesByStop: PropTypes.func.isRequired,
    findRoutesByStop: PropTypes.object.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    affectedRoutes: PropTypes.array.isRequired,
    affectedStops: PropTypes.array.isRequired,
    isLoadingStopsByRoute: PropTypes.bool,
    isLoadingRoutesByStop: PropTypes.bool,
    isEditMode: PropTypes.bool,
    toggleDisruptionModals: PropTypes.func.isRequired,
    onSubmitUpdate: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired,
    searchResults: PropTypes.object.isRequired,
    stops: PropTypes.object.isRequired,
    stopGroups: PropTypes.object.isRequired,
    data: PropTypes.object,
    useWorkarounds: PropTypes.bool.isRequired,
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
    findRoutesByStop: findRoutesByStop(state),
    isEditMode: isEditEnabled(state),
    disruptionToEdit: getDisruptionToEdit(state),
    searchResults: getSearchResults(state),
    stops: getAllStops(state),
    stopGroups: getStopGroupsIncludingDeleted(state),
    useWorkarounds: useWorkarounds(state),
}), {
    deleteAffectedEntities,
    updateCurrentStep,
    getStopsByRoute,
    getRoutesByStop,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    showAndUpdateAffectedRoutes,
    toggleDisruptionModals,
    search,
})(SelectDisruptionEntities);
