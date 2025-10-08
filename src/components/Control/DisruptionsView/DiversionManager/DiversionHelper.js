import moment from 'moment-timezone';
import dateTypes from '../../../../types/date-types';
import { parseWKT, projectPointOnSegment, findProjectionOnPolyline, calculateDistance, mergeCoordinates, toWKT } from '../../../Common/Map/RouteShapeEditor/ShapeHelper';

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

// Returns true if the diversion has been modified in editing mode
export function hasDiversionModified({
    isEditingMode,
    diversionShapeWkt,
    originalDiversionShapeWkt,
    selectedOtherRouteVariants,
    editingDiversions,
}) {
    if (!isEditingMode) return false;
    if (diversionShapeWkt !== originalDiversionShapeWkt) {
        return true;
    }
    if (selectedOtherRouteVariants.length !== editingDiversions.length - 1) {
        // -1 because the base route variant is not included in selectedOtherRouteVariants
        return true;
    }
    return selectedOtherRouteVariants.some((variant) => {
        const originalVariant = editingDiversions.find(ed => ed.routeVariantId === variant.routeVariantId);
        if (!originalVariant) return true; // New variant added
        return variant.shapeWkt !== originalVariant.shapeWkt;
    });
}

// Returns an array of unique stop IDs from affectedStops
export function getUniqueAffectedStopIds(affectedStops) {
    return [...new Set(affectedStops.map(stop => stop.stopId))];
}

export function mergeDiversionToRouteVariant(
    routeVariant,
    originalShapeWkt,
    diversionShapeWkt,
) {
    const originalCoordinates = parseWKT(originalShapeWkt);
    const mergedCoordinates = mergeCoordinates(originalCoordinates, parseWKT(diversionShapeWkt));
    return {
        ...routeVariant,
        shapeWkt: toWKT(mergedCoordinates),
        color: generateUniqueColor(routeVariant.routeVariantId),
        visible: true,
    };
}

// Function to remove duplicate points from a WKT based on the rule:
// If duplicate points are at indices x and x+k (1 <= k <= n), remove points at x+1 through x+k
// This is to improve the UX of the shape editor as those duplicate points create dot handlers (remove or add) around the bus stops
export function removeDuplicatePoints(wkt, n = 3) {
    // Validate n: ensure it's a positive integer
    if (!Number.isInteger(n) || n < 1) {
        return wkt; // Return original WKT if n is invalid
    }

    // Parse WKT LINESTRING into an array of coordinate pairs
    const coordsString = wkt.replace('LINESTRING(', '').replace(')', '');
    const coords = coordsString.split(',').map((point, index) => {
        const [lon, lat] = point.trim().split(' ').map(Number);
        return { lon, lat, index };
    });

    // Array to track indices to keep (true = keep, false = remove)
    const keepIndices = new Array(coords.length).fill(true);

    // Iterate through each point as a potential start of a duplicate pair
    for (let x = 0; x < coords.length; x++) {
        // Skip if this index is already marked for removal
        // eslint-disable-next-line no-continue
        if (!keepIndices[x]) continue;

        const pointX = coords[x];

        // Check for duplicates at x+k (1 <= k <= min(n, remaining length))
        const maxK = Math.min(n, coords.length - x - 1);
        for (let k = 1; k <= maxK; k++) {
            const pointXPlusK = coords[x + k];

            // Check if coordinates at x and x+k are identical
            if (pointX.lon === pointXPlusK.lon && pointX.lat === pointXPlusK.lat) {
                // Mark all points from x+1 to x+k for removal
                for (let i = x + 1; i <= x + k; i++) {
                    keepIndices[i] = false;
                }
                // Break after finding the first duplicate to avoid overlapping removals
                break;
            }
        }
    }

    // Filter coordinates to keep only those marked true
    const filteredCoords = coords.filter((_, index) => keepIndices[index]);

    // Reconstruct the WKT LINESTRING
    const newCoordsString = filteredCoords
        .map(coord => `${coord.lon} ${coord.lat}`)
        .join(',');
    return `LINESTRING(${newCoordsString})`;
}

export function createRouteVariantDateFilters(disruption) {
    const SERVICE_DATE_FORMAT = 'YYYYMMDD';
    const TIME_FORMAT_HHMM = 'HH:mm';
    const start = moment(disruption.startTime).tz(dateTypes.TIME_ZONE);
    const startDate = start.format(SERVICE_DATE_FORMAT);
    const startTime = start.format(TIME_FORMAT_HHMM);

    let end = null;
    let endDate = null;
    let endTime = null;
    if (disruption.endTime) {
        end = moment(disruption.endTime).tz(dateTypes.TIME_ZONE);
        endDate = end.format(SERVICE_DATE_FORMAT);
        endTime = end.format(TIME_FORMAT_HHMM);
    }

    return {
        ...(startDate !== null && { serviceDateFrom: startDate }),
        ...(startTime !== null && { startTime }),
        ...(endDate !== null && { serviceDateTo: endDate }),
        ...(endTime !== null && { endTime }),
    };
}
