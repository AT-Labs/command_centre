import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { uniqBy, isEmpty, sortBy, groupBy } from 'lodash-es';
import { ExpandableList } from '../../../../../Common/Expandable';
import { EntityCheckbox } from '../EntityCheckbox';
import Loader from '../../../../../Common/Loader/Loader';
import { filterOnlyStopParams } from '../../../../../../utils/control/disruptions';
import { getRoutesByStop as findRoutesByStop } from '../../../../../../redux/selectors/control/disruptions';
import { getRoutesByStop } from '../../../../../../redux/actions/control/disruptions';

export const RoutesByStopMultiSelect = (props) => {
    const { className, removeAction, affectedStops } = props;

    const [expandedStops, setExpandedStops] = useState({});

    const affectedSingleStops = affectedStops.filter(entity => !entity.groupId);
    const stopGroupStops = affectedStops.filter(entity => !!entity.groupId);
    const affectedStopGroups = groupBy(stopGroupStops, 'groupId');

    const isStopActive = stop => !!expandedStops[stop.stopCode];

    const toggleExpandedStop = (stop) => {
        const currentItems = { ...expandedStops };
        if (!expandedStops[stop.stopCode]) {
            currentItems[stop.stopCode] = true;
            setExpandedStops(currentItems);
        } else {
            delete currentItems[stop.stopCode];
            setExpandedStops(currentItems);
        }

        if (!props.findRoutesByStop[stop.stopCode]) {
            props.getRoutesByStop([stop]);
        }
    };

    const saveStopsState = stops => props.updateAffectedStops(sortBy(stops, sortedStop => sortedStop.stopCode));

    const flattenStopGroups = stopGroups => Object.values(stopGroups).flat();

    const createRouteWithStop = (stop, route) => ({ ...stop, ...route });

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

    const toggleAllRoutesByStop = (stop, routesByStop, isChecked) => {
        let updatedStops = affectedStops;
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

    const renderRoutesByStop = (stop) => {
        const routesByStop = props.findRoutesByStop[stop.stopCode];

        if (!routesByStop || routesByStop === 'undefined') {
            return [(<li key="-1"><Loader className="loader-disruptions loader-disruptions-list" /></li>)];
        }

        if (isEmpty(routesByStop)) {
            return [(<li key="-1"><div>Routes not found</div></li>)];
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
                    disabled={ props.isDisabled }
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
                        disabled={ props.isDisabled }
                    />
                </li>
            ),
            routesByStopHTML,
            ];
        }

        return [routesByStopHTML];
    };

    return (
        uniqBy(affectedSingleStops, stop => stop.stopCode).map(stop => (
            <li className="selection-item border-0 card" key={ stop.stopCode }>
                <ExpandableList
                    id={ stop.stopCode }
                    isActive={ isStopActive(stop) }
                    onToggle={ () => toggleExpandedStop(stop) }
                    removeAction={ () => removeAction(stop) }
                    className={ className }
                    label={ `Stop ${stop.text}` }
                    disabled={ props.isDisabled }
                >
                    { renderRoutesByStop(stop) }
                </ExpandableList>
            </li>
        ))
    );
};

RoutesByStopMultiSelect.propTypes = {
    className: PropTypes.string,
    removeAction: PropTypes.func,
    getRoutesByStop: PropTypes.func.isRequired,
    findRoutesByStop: PropTypes.object.isRequired,
    affectedStops: PropTypes.array.isRequired,
    updateAffectedStops: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
};

RoutesByStopMultiSelect.defaultProps = {
    className: '',
    removeAction: null,
    isDisabled: false,
};

export default connect(state => ({
    findRoutesByStop: findRoutesByStop(state),
}), {
    getRoutesByStop,
})(RoutesByStopMultiSelect);
