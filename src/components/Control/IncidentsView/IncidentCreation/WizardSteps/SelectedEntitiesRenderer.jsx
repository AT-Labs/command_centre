import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { groupBy, uniqBy } from 'lodash-es';
import { DIRECTIONS } from '../../types';
import { removeDuplicatesByKey } from '../../../../../utils/control/incidents';

const getStopsUnderRoute = (route, affectedEntities) => {
    const { affectedRoutes = [], affectedStops = [] } = affectedEntities;
    const { routeId, routeShortName } = route;

    const stopsFromRoutes = affectedRoutes.filter(item => (
        item.routeId === routeId
        && item.stopCode
        && item.routeShortName === routeShortName
    ));

    const stopsFromStops = affectedStops.filter(item => (
        item.routeId === routeId
        && item.stopCode
    ));

    return uniqBy(
        [...stopsFromRoutes, ...stopsFromStops],
        item => `${item.stopCode}_${item.directionId || ''}`,
    );
};

const getRoutesUnderStop = (stop, affectedEntities) => {
    const { affectedRoutes = [], affectedStops = [] } = affectedEntities;
    const { stopCode, stopId } = stop;

    const routesFromStops = affectedStops.filter(item => (
        item.stopCode === stopCode
        && item.routeId
        && item.stopId === stopId
    ));

    const routesFromRoutes = affectedRoutes.filter(item => (
        item.stopCode === stopCode
        && item.routeId
    ));

    return uniqBy([...routesFromStops, ...routesFromRoutes], 'routeId');
};

const RouteWithStops = ({ route, disruptionKey, affectedEntities }) => {
    const routeKey = useMemo(() => route.routeId || route.routeShortName, [route]);

    const allStopsUnderRoute = useMemo(
        () => getStopsUnderRoute(route, affectedEntities),
        [route, affectedEntities],
    );

    const stopsByDirection = useMemo(() => {
        const stopsWithDirection = allStopsUnderRoute.filter(stop => stop.directionId !== undefined);
        return groupBy(stopsWithDirection, 'directionId');
    }, [allStopsUnderRoute]);

    const directionIds = useMemo(() => Object.keys(stopsByDirection), [stopsByDirection]);

    const getDirectionContent = useCallback((directionId) => {
        const directionLabel = DIRECTIONS[directionId] || `Direction ${directionId}`;
        const stopCodes = stopsByDirection[directionId].map(stop => stop.stopCode).join(', ');

        return (
            <p
                className="p-lr12-tb6 m-0 disruption-effect-item-stop pl-4 font-size-sm"
                key={ `${disruptionKey}_${routeKey}_${directionId}` }
            >
                Stops
                {' '}
                {directionLabel}
                :
                {' '}
                {stopCodes}
            </p>
        );
    }, [disruptionKey, routeKey, stopsByDirection]);

    return (
        <React.Fragment key={ `${disruptionKey}_${routeKey}` }>
            <p className="p-lr12-tb6 m-0 disruption-effect-item-route">
                Route -
                {' '}
                {route.routeShortName}
            </p>
            {directionIds.length > 0 && directionIds.map(getDirectionContent)}
        </React.Fragment>
    );
};

const StopWithRoutes = ({ stop, disruptionKey, affectedEntities }) => {
    const allRoutesUnderStop = useMemo(
        () => getRoutesUnderStop(stop, affectedEntities),
        [stop, affectedEntities],
    );

    const routeNames = useMemo(
        () => allRoutesUnderStop.map(route => route.routeShortName).join(', '),
        [allRoutesUnderStop],
    );

    return (
        <React.Fragment key={ `${disruptionKey}_${stop.stopId}` }>
            <p className="p-lr12-tb6 m-0 disruption-effect-item-stop">
                Stop -
                {' '}
                {stop.text}
            </p>
            {routeNames && (
                <p
                    className="p-lr12-tb6 m-0 disruption-effect-item-route pl-4 font-size-sm"
                    key={ `${disruptionKey}_${stop.stopId}_routes` }
                >
                    Route:
                    {' '}
                    {routeNames}
                </p>
            )}
        </React.Fragment>
    );
};

export const SelectedEntitiesRenderer = ({ affectedEntities, disruptionKey }) => {
    const uniqueRoutes = useMemo(() => {
        if (!affectedEntities?.affectedRoutes) {
            return [];
        }
        return removeDuplicatesByKey(
            affectedEntities.affectedRoutes,
            item => item.routeShortName,
        );
    }, [affectedEntities]);

    const uniqueStops = useMemo(() => {
        if (!affectedEntities?.affectedStops) {
            return [];
        }
        return removeDuplicatesByKey(
            affectedEntities.affectedStops,
            item => item.stopId,
        );
    }, [affectedEntities]);

    if (!affectedEntities || (uniqueRoutes.length === 0 && uniqueStops.length === 0)) {
        return null;
    }

    return (
        <>
            {uniqueRoutes.length > 0 && uniqueRoutes.map(route => (
                <RouteWithStops
                    key={ `${disruptionKey}_route_${route.routeId || route.routeShortName}` }
                    route={ route }
                    disruptionKey={ disruptionKey }
                    affectedEntities={ affectedEntities }
                />
            ))}
            {uniqueStops.length > 0 && uniqueStops.map(stop => (
                <StopWithRoutes
                    key={ `${disruptionKey}_stop_${stop.stopId}` }
                    stop={ stop }
                    disruptionKey={ disruptionKey }
                    affectedEntities={ affectedEntities }
                />
            ))}
        </>
    );
};

RouteWithStops.propTypes = {
    route: PropTypes.object.isRequired,
    disruptionKey: PropTypes.string.isRequired,
    affectedEntities: PropTypes.object.isRequired,
};

StopWithRoutes.propTypes = {
    stop: PropTypes.object.isRequired,
    disruptionKey: PropTypes.string.isRequired,
    affectedEntities: PropTypes.object.isRequired,
};

SelectedEntitiesRenderer.propTypes = {
    affectedEntities: PropTypes.object,
    disruptionKey: PropTypes.string.isRequired,
};

SelectedEntitiesRenderer.defaultProps = {
    affectedEntities: null,
};
