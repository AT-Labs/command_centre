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
