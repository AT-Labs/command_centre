import { isEmpty, uniqBy, flatMap, forEach, groupBy } from 'lodash-es';
import React from 'react';
import { getJSONFromWKT } from '../helpers';
import { STATUSES } from '../../types/disruptions-types';
import { DIRECTIONS } from '../../components/Control/IncidentsView/types';

export function getShapes(affectedRoutes, affectedStops) {
    const allAffectedRoutes = uniqBy(
        [...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)],
        route => route.routeId,
    );

    if (!isEmpty(allAffectedRoutes)) {
        const withShapes = [];
        forEach(flatMap(allAffectedRoutes), (r) => {
            if (r.shapeWkt) {
                const shape = getJSONFromWKT(r.shapeWkt);
                const coordinates = shape.coordinates.map(c => c.reverse());
                withShapes.push(coordinates);
            } else {
                withShapes.push(null);
            }
        });

        return withShapes;
    }

    return [];
}

export function getRouteColors(affectedRoutes, affectedStops) {
    const allAffectedRoutes = uniqBy(
        [...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)],
        route => route.routeId,
    );

    if (!isEmpty(allAffectedRoutes)) {
        const withRouteColors = [];
        forEach(flatMap(allAffectedRoutes), (r) => {
            withRouteColors.push(r.routeColor || null);
        });

        return withRouteColors;
    }

    return [];
}

export const getEntityCounts = (disruption) => {
    if (!disruption?.affectedEntities) {
        return { routesCount: 0, stopsCount: 0, entitiesCount: 0 };
    }

    const routesCount = disruption.affectedEntities.affectedRoutes?.length || 0;
    const stopsCount = disruption.affectedEntities.affectedStops?.length || 0;
    const entitiesCount = routesCount + stopsCount;

    return { routesCount, stopsCount, entitiesCount };
};

export const generateSelectedText = (routesCount, stopsCount) => {
    let selectedText = '';
    if (routesCount > 0) {
        selectedText = 'routes';
    }
    if (stopsCount > 0) {
        if (selectedText.length > 0) {
            selectedText += ' and stops';
        } else {
            selectedText = 'stops';
        }
    }
    return selectedText;
};

export const mergeExistingAndDrawnEntities = (existingEntities, drawnEntities) => {
    let newRoutes = drawnEntities?.filter(e => e.type === 'route') || [];
    let newStops = drawnEntities?.filter(e => e.type === 'stop') || [];
    if (Array.isArray(existingEntities.affectedRoutes) && existingEntities.affectedRoutes.length > 0) {
        newRoutes = newRoutes.filter(newRoute => !existingEntities.affectedRoutes.some(existingRoute => existingRoute.routeId === newRoute.routeId));
    }

    if (Array.isArray(existingEntities.affectedStops) && existingEntities.affectedStops.length > 0) {
        newStops = newStops.filter(newStop => !existingEntities.affectedStops.some(existingStop => existingStop.stopId === newStop.stopId));
    }

    const mergedRoutes = [...existingEntities.affectedRoutes, ...newRoutes];
    const mergedStops = [...existingEntities.affectedStops, ...newStops];
    return {
        affectedRoutes: mergedRoutes,
        affectedStops: mergedStops,
    };
};

export const buildPublishPayload = incident => ({
    ...incident,
    status: STATUSES.NOT_STARTED,
    disruptions: (incident.disruptions || []).map(disruption => ({
        ...disruption,
        status: STATUSES.NOT_STARTED,
    })),
});

export const getStopsUnderRoute = (route, affectedEntities) => {
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

export const getRoutesUnderStop = (stop, affectedEntities) => {
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

export const renderRouteWithStops = (route, disruptionKey, affectedEntities) => {
    const allStopsUnderRoute = getStopsUnderRoute(route, affectedEntities);
    const stopsWithDirection = allStopsUnderRoute.filter(stop => stop.directionId !== undefined);
    const stopsByDirection = groupBy(stopsWithDirection, 'directionId');
    const directionIds = Object.keys(stopsByDirection);
    const routeKey = route.routeId || route.routeShortName;

    return (
        <React.Fragment key={ `${disruptionKey}_${routeKey}` }>
            <p className="p-lr12-tb6 m-0 disruption-effect-item-route">
                Route -
                {' '}
                {route.routeShortName}
            </p>
            {directionIds.length > 0 && directionIds.map((directionId) => {
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
            })}
        </React.Fragment>
    );
};

export const renderStopWithRoutes = (stop, disruptionKey, affectedEntities) => {
    const allRoutesUnderStop = getRoutesUnderStop(stop, affectedEntities);
    const routeNames = allRoutesUnderStop.map(route => route.routeShortName).join(', ');

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

export const filterDisruptionsBySearchTerm = (disruptions, searchTerm) => {
    if (!disruptions || !searchTerm) {
        return disruptions || [];
    }

    const term = searchTerm.toLowerCase();

    return disruptions.filter((disruption) => {
        const impactMatches = disruption.impact?.toLowerCase().includes(term);
        const routeMatches = disruption.affectedEntities?.affectedRoutes?.some(
            route => route.routeShortName?.toLowerCase().includes(term),
        );
        const stopMatches = disruption.affectedEntities?.affectedStops?.some(
            stop => stop.text?.toLowerCase().includes(term),
        );

        return impactMatches || routeMatches || stopMatches;
    });
};
