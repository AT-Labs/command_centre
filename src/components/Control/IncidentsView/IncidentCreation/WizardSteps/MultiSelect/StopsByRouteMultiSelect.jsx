import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { uniqBy, isEmpty } from 'lodash-es';
import { ExpandableList } from '../../../../../Common/Expandable';
import { EntityCheckbox } from '../EntityCheckbox';
import Loader from '../../../../../Common/Loader/Loader';
import { DIRECTIONS } from '../../../types';
import { filterOnlyRouteParams, groupStopsByRouteElementByParentStation } from '../../../../../../utils/control/disruptions';
import { getStopsByRoute as findStopsByRoute } from '../../../../../../redux/selectors/control/incidents';
import { getStopsByRoute } from '../../../../../../redux/actions/control/incidents';

export const StopsByRouteMultiSelect = (props) => {
    const { className, removeAction, affectedRoutes } = props;

    const [expandedRoutes, setExpandedRoutes] = useState({});
    const [expandedRouteDirections, setExpandedRouteDirections] = useState({});
    const [loadedStopsByRoute, setLoadedStopsByRoute] = useState([]);

    // loadedStopsByRoute are updated when a route is expanded - this triggers a JIT fetch of all stops for the routes
    useEffect(() => {
        props.getStopsByRoute(loadedStopsByRoute);
    }, [loadedStopsByRoute]);

    const isRouteActive = route => !!expandedRoutes[route.routeId];
    const isRouteDirectionActive = (route, direction) => !!expandedRouteDirections[`${route.routeId}-${direction}`];

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
    const toggleExpandedRoute = (route) => {
        toggleExpandedItem(route.routeId, expandedRoutes, setExpandedRoutes);
        if (!loadedStopsByRoute.find(item => item.routeId === route.routeId)) {
            setLoadedStopsByRoute([...loadedStopsByRoute, route]);
        }
    };
    const toggleExpandedRouteDirection = (route, direction) => toggleExpandedItem(`${route.routeId}-${direction}`, expandedRouteDirections, setExpandedRouteDirections);

    const createStopWithRoute = (stop, route) => ({ ...route, ...stop });

    const toggleStopsByRoute = (route, stop, isChecked) => {
        let updatedRoutes = affectedRoutes;
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
        props.updateAffectedRoutes([...updatedRoutes]);
    };

    const toggleAllStopsByRouteDirection = (route, direction, stopsByRouteDirection, isChecked) => {
        let updatedRoutes = affectedRoutes;
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

        props.updateAffectedRoutes(updatedRoutes);
    };

    const renderStopsCheckboxByRouteDirection = (route, direction) => {
        const stopsByRoute = props.findStopsByRoute[route.routeId];

        const stopsByRouteDirection = stopsByRoute.filter(stop => `${stop.directionId}` === `${direction}`);

        const allSelected = stopsByRouteDirection.every(stop => affectedRoutes.some(routes => routes.stopCode === stop.stopCode
            && routes.routeId === route.routeId));

        const grouped = groupStopsByRouteElementByParentStation(stopsByRouteDirection);

        const isChecked = stop => affectedRoutes.some(affectedRoute => (affectedRoute.routeId === route.routeId && affectedRoute.stopCode === stop.stopCode && `${affectedRoute.directionId}` === `${direction}`));

        let groupedStopsByRouteDirectionHTML = [];

        const parents = [];

        grouped.forEach((value, key) => {
            const childList = value;
            if (!key) {
                childList.forEach((childStop) => {
                    groupedStopsByRouteDirectionHTML.push(
                        <li key={ `${route.routeId}-${childStop.stopCode}-${direction}` } className="select_entities pb-2">
                            <EntityCheckbox
                                id={ `stopByRoute-${route.routeId}-${childStop.stopCode}-${direction}` }
                                checked={ isChecked(childStop) }
                                onChange={ e => toggleStopsByRoute(route, childStop, e.target.checked) }
                                label={ `${childStop.stopCode} - ${childStop.stopName}` }
                                size="small"
                            />
                        </li>,
                    );
                });
            } else {
                const parent = JSON.parse(key);
                parents.push(parent);
                groupedStopsByRouteDirectionHTML.push(
                    <li key={ `${route.routeId}-${parent.stopCode}-${direction}` } className="select_entities pb-2">
                        <EntityCheckbox
                            id={ `stopByRoute-${route.routeId}-${key}-${direction}` }
                            checked={ isChecked(parent) }
                            onChange={ e => toggleStopsByRoute(route, parent, e.target.checked) }
                            label={ `${parent.stopCode} - ${parent.stopName}` }
                            size="small"
                        />
                        <ul className="p-0">
                            { childList.map(childStop => (
                                <li key={ `${route.routeId}-${childStop.stopCode}-${direction}` } className="select_entities pb-2 ml-4">
                                    <EntityCheckbox
                                        id={ `stopByRoute-${route.routeId}-${childStop.stopCode}-${direction}` }
                                        checked={ isChecked(childStop) }
                                        onChange={ e => toggleStopsByRoute(route, childStop, e.target.checked) }
                                        label={ `${childStop.stopCode} - ${childStop.stopName}` }
                                        size="small"
                                    />
                                </li>
                            ))}
                        </ul>
                    </li>,
                );
            }
        });

        if (stopsByRouteDirection.length > 1) {
            groupedStopsByRouteDirectionHTML = [
                (
                    <li key="-1" className="select_entities pb-2">
                        <EntityCheckbox
                            id={ `selectAll-${route.routeId}` }
                            checked={ allSelected }
                            onChange={ e => toggleAllStopsByRouteDirection(route, direction, [...stopsByRouteDirection, ...parents], e.target.checked) }
                            label="Select All"
                            size="small"
                        />
                    </li>
                ),
                ...groupedStopsByRouteDirectionHTML,
            ];
        }

        return groupedStopsByRouteDirectionHTML;
    };

    const renderStopsByRouteDirection = (route, direction) => {
        const directionText = DIRECTIONS[direction];

        return (
            <ExpandableList
                id={ `${route.routeId}-${direction}` }
                key={ `${route.routeId}-${direction}` }
                isActive={ isRouteDirectionActive(route, direction) }
                onToggle={ () => toggleExpandedRouteDirection(route, direction) }
                className="select-stops-route-direction"
                label={ `Direction: ${directionText}` }
            >
                { renderStopsCheckboxByRouteDirection(route, direction) }
            </ExpandableList>
        );
    };

    const renderStopsByRoute = (route) => {
        const stopsByRoute = props.findStopsByRoute[route.routeId];

        if (!stopsByRoute) {
            return [(<li key="-1"><Loader className="loader-disruptions loader-disruptions-list" /></li>)];
        }

        if (isEmpty(stopsByRoute)) {
            return [(<li key="-1"><div>Stops not found</div></li>)];
        }

        return Object.keys(DIRECTIONS)
            .filter(direction => stopsByRoute.some(stop => `${stop.directionId}` === `${direction}`))
            .map(direction => renderStopsByRouteDirection(route, direction));
    };

    return (
        uniqBy(affectedRoutes, route => route.routeId).map(route => (
            <li className="selection-item border-0 card" key={ route.routeId }>
                <ExpandableList
                    id={ route.routeId }
                    isActive={ isRouteActive(route) }
                    onToggle={ () => toggleExpandedRoute(route) }
                    removeAction={ () => removeAction(route) }
                    className={ className }
                    label={ `Route ${route.routeShortName}` }
                >
                    { renderStopsByRoute(route) }
                </ExpandableList>
            </li>
        ))
    );
};

StopsByRouteMultiSelect.propTypes = {
    className: PropTypes.string,
    removeAction: PropTypes.func,
    getStopsByRoute: PropTypes.func.isRequired,
    findStopsByRoute: PropTypes.object.isRequired,
    affectedRoutes: PropTypes.array.isRequired,
    updateAffectedRoutes: PropTypes.func.isRequired,
};

StopsByRouteMultiSelect.defaultProps = {
    className: '',
    removeAction: null,
};

export default connect(state => ({
    findStopsByRoute: findStopsByRoute(state),
}), {
    getStopsByRoute,
})(StopsByRouteMultiSelect);
