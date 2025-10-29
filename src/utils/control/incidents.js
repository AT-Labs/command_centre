import { isEmpty, uniqBy, flatMap, forEach } from 'lodash-es';
import { getJSONFromWKT } from '../helpers';

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
