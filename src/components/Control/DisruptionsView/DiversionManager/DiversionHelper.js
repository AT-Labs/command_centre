import { parseWKT, projectPointOnSegment, findProjectionOnPolyline, calculateDistance } from '../../../Common/Map/RouteShapeEditor/ShapeHelper';

export const AffectedStopDistanceThreshold = 20;
export const MergeDistanceThreshold = 20;

export const generateUniqueColor = (number) => {
    // Convert to string and normalize to 3 digits
    const numStr = String(number).padEnd(3, '0').slice(-3);

    // Create a simple hash-like value to amplify differences
    const num = parseInt(numStr, 10);
    const seed = (num * 9301 + 49297) % 233280; // Simple linear congruential generator constants
    const rand = seed / 233280; // Normalize to 0-1

    // Extract three parts for RGB with randomization
    let r = (parseInt(numStr[0], 10) + Math.floor(rand * 10)) % 8; // 0-7
    let g = (parseInt(numStr[1], 10) + Math.floor(rand * 20)) % 8; // 0-7
    let b = (parseInt(numStr[2], 10) + Math.floor(rand * 30)) % 8; // 0-7

    // Map to color range (0-7 to 0-200 for broader but visible colors)
    r = Math.floor(r * 25).toString(16).padStart(2, '0');
    g = Math.floor(g * 25).toString(16).padStart(2, '0');
    b = Math.floor(b * 25).toString(16).padStart(2, '0');

    // Prevent colors too close to white (all channels > 200)
    if (parseInt(r, 16) > 200 && parseInt(g, 16) > 200 && parseInt(b, 16) > 200) {
        r = '99'; // Reduce one channel to ensure visibility
    }

    return `#${r}${g}${b}`.toUpperCase();
};

export const getMinDistanceToPolyline = (stopLatLng, wkt) => {
    // Project [lat, lng] to [x, y] using Mercator projection
    const project = (lat, lng) => {
        const phi = lat * (Math.PI / 180); // Convert latitude to radians
        const y = Math.log(Math.tan(Math.PI / 4 + phi / 2));
        return [lng, y]; // x = longitude, y = Mercator projection
    };

    // Unproject [x, y] back to [lat, lng]
    const unproject = (x, y) => {
        const lat = ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;
        const lng = x;
        return [lat, lng];
    };

    // Parse WKT to get array of [lat, lng] coordinates
    const polylineLatLngs = parseWKT(wkt);

    // Project the stop point
    const projectedStop = project(...stopLatLng);

    // Project all polyline points
    const projectedPolyline = polylineLatLngs.map(([lat, lng]) => project(lat, lng));

    let minDistance = Infinity;

    // Iterate over each segment of the polyline
    for (let i = 0; i < projectedPolyline.length - 1; i++) {
        const p1 = projectedPolyline[i];
        const p2 = projectedPolyline[i + 1];
        // Find the closest point on the segment in projected space
        const closestPoint = projectPointOnSegment(projectedStop, p1, p2);
        // Convert back to LatLng
        const closestLatLng = unproject(...closestPoint);
        // Calculate geodesic distance
        const distance = calculateDistance(stopLatLng, closestLatLng);
        if (distance < minDistance) {
            minDistance = distance;
        }
    }

    return minDistance;
};

export const canMerge = (originalWKT, diversionWKT) => {
    const originalPoints = parseWKT(originalWKT);
    const diversionPoints = parseWKT(diversionWKT);

    // Find the starting connector coordinate
    const firstSecondCoord = diversionPoints[0];
    const { distance: distanceA } = findProjectionOnPolyline(firstSecondCoord, originalPoints);

    if (distanceA > MergeDistanceThreshold) return false;

    // Find the ending connector coordinate
    const lastSecondCoord = diversionPoints[diversionPoints.length - 1];
    const { distance: distanceB } = findProjectionOnPolyline(lastSecondCoord, originalPoints);

    return (distanceB <= MergeDistanceThreshold);
};

export const createAffectedStop = (stop, variant) => ({
    routeId: variant.routeId,
    routeShortName: variant.routeShortName,
    routeType: variant.routeType,
    type: 'route',
    directionId: variant.directionId,
    stopId: stop.stopId,
    stopCode: stop.stopCode,
    stopName: stop.stopName,
    stopLat: stop.stopLat,
    stopLon: stop.stopLon,
});

export const createModifiedRouteVariant = (routeVariant, shapeWkt) => ({
    routeVariantId: routeVariant.routeVariantId,
    routeId: routeVariant.routeId,
    routeVariantName: routeVariant.routeLongName,
    directionId: routeVariant.directionId,
    shapeWkt,
});

export const isAffectedStop = (stop, shapeWkt) => {
    const stopLatLng = [stop.stopLat, stop.stopLon];
    const minDistance = getMinDistanceToPolyline(stopLatLng, shapeWkt);
    return minDistance > AffectedStopDistanceThreshold;
};

export const getUniqueStops = (stops) => {
    const seen = new Set();
    return stops.filter((stop) => {
        const key = `${stop.routeId}-${stop.directionId}-${stop.stopId}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};
