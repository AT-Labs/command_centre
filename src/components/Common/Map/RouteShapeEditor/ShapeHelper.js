// Calculate the distance between two points (lat, lng)
export const calculateDistance = ([lat1, lng1], [lat2, lng2]) => {
    const earthRadius = 6371e3; // Earth's radius in meters
    const degToRad = Math.PI / 180;
    const lat1Rad = lat1 * degToRad;
    const lat2Rad = lat2 * degToRad;
    const deltaLatRad = (lat2 - lat1) * degToRad;
    const deltaLngRad = (lng2 - lng1) * degToRad;

    const haversineA = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2)
                     + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                     * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    const angularDistance = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

    return earthRadius * angularDistance; // in meters
};

// Calculate the projection of a point on a line segment
export const projectPointOnSegment = (p, p1, p2) => {
    const A = [p2[0] - p1[0], p2[1] - p1[1]];
    const B = [p[0] - p1[0], p[1] - p1[1]];
    const magA = A[0] ** 2 + A[1] ** 2;
    const magAB = B[0] * A[0] + B[1] * A[1];
    const t = Math.max(0, Math.min(1, magAB / magA));

    return [p1[0] + A[0] * t, p1[1] + A[1] * t];
};

// Find the closest segment and projected point on a polyline
export const findProjectionOnPolyline = (point, polyline) => {
    let minDist = Infinity;
    let projection = null;
    let segmentIndex = -1;
    let distance = -1;

    for (let i = 0; i < polyline.length - 1; i++) {
        const p1 = polyline[i];
        const p2 = polyline[i + 1];
        const projectedPoint = projectPointOnSegment(point, p1, p2);
        const dist = calculateDistance(point, projectedPoint);

        if (dist < minDist) {
            minDist = dist;
            projection = projectedPoint;
            segmentIndex = i;
            distance = dist;
        }
    }

    return { projection, segmentIndex, distance };
};

// Deduplicate consecutive coordinates
export const deduplicateCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length === 0) return [];
    const deduped = [coordinates[0]];
    for (let i = 1; i < coordinates.length; i++) {
        const prev = deduped[deduped.length - 1];
        const curr = coordinates[i];
        if (prev[0] !== curr[0] || prev[1] !== curr[1]) {
            deduped.push(curr);
        }
    }
    return deduped;
};

// Merge the second list into the first list
export const mergeCoordinates = (firstList, secondList) => {
    // Both list should at least have 3 points to ensure a valid merge
    if (!Array.isArray(firstList) || !Array.isArray(secondList) || firstList.length < 3 || secondList.length < 3) {
        return firstList;
    }
    // Step 1: Find the starting connector coordinate (first point of the second list)
    const firstSecondCoord = secondList[0];
    const { segmentIndex: startIndex } = findProjectionOnPolyline(firstSecondCoord, firstList);

    // Step 2: Find the ending connector coordinate (last point of the second list)
    const lastSecondCoord = secondList[secondList.length - 1];
    const { segmentIndex: endIndex } = findProjectionOnPolyline(lastSecondCoord, firstList);

    // Step 3: Merge the second list into the first list, replacing the section between startIndex and endIndex
    const mergedList = [
        ...firstList.slice(0, startIndex + 1),
        ...secondList,
        ...firstList.slice(endIndex + 1),
    ];

    return deduplicateCoordinates(mergedList);
};

export const findDifferences = (original, updated) => {
    const length1 = original.length;
    const length2 = updated.length;

    // Determine the maximum length to avoid index out of bounds
    const maxLength = Math.min(length1, length2);
    let startIndex = 0;
    let endIndex = 0;
    let hasDifferences = false;

    // Find the first point of difference
    for (let i = 0; i < maxLength; i++) {
        const item1 = original[i];
        const item2 = updated[i];

        if (item1[0] !== item2[0] || item1[1] !== item2[1]) {
            startIndex = i;
            hasDifferences = true;
            break;
        }
    }

    // If no differences found, return empty array
    if (!hasDifferences) {
        return [];
    }

    // Find the last point of difference
    const reversedOriginal = original.slice().reverse();
    const reversedUpdated = updated.slice().reverse();

    for (let i = 0; i < maxLength; i++) {
        const item1 = reversedOriginal[i];
        const item2 = reversedUpdated[i];

        if (item1[0] !== item2[0] || item1[1] !== item2[1]) {
            endIndex = length2 - i - 1;
            break;
        }
    }

    // Adjust indices to include one point before and after if possible
    // Special case: the updated route only removed some points without adding new ones,
    // which result the startIndex being exactly one more than endIndex
    if (startIndex <= endIndex || startIndex - endIndex === 1) {
        if (startIndex > 0) {
            startIndex -= 1;
        }
        if (endIndex < length2 - 1) {
            endIndex += 1;
        }
        return updated.slice(startIndex, endIndex + 1);
    }

    return [];
};

// Function to parse WKT LINESTRING into an array of coordinates
export const parseWKT = (wkt) => {
    if (!wkt || typeof wkt !== 'string' || !wkt.startsWith('LINESTRING')) {
        return [];
    }
    const coords = wkt
        .replace('LINESTRING(', '')
        .replace(')', '')
        .split(',')
        .map(pair => pair.trim().split(' ').map(Number).reverse());
    return deduplicateCoordinates(coords);
};

// Function to convert coordinates back into WKT format
export const toWKT = (coordinates) => {
    const deduped = deduplicateCoordinates(coordinates);
    const wktCoords = deduped.map(latlng => `${latlng[1]} ${latlng[0]}`).join(',');
    return `LINESTRING(${wktCoords})`;
};

// Convert leaflet LatLng objects to coordinates array
export const toCoordinates = latlngs => latlngs.map(item => [item.lat, item.lng]);

// Ramer–Douglas–Peucker_algorithm to thin WKT points
// This implementation is a modified version to avoid removing points that are far apart (Keep the long motorway segments unchanged)
// This implementation removes points that create a height less than the threshold and always keeps points that are far apart (>20 meters)
// This helps to reduce the number of points in a route shape while preserving its overall shape
// Default threshold is set to 0.00002 (~2 meters in lat/lon degrees) to keep the shape around the roundabouts and curves
// This can also be used to reduce the number of points in the TomTom diversion shapes
export function thinCoordinates(points, heightThreshold = 0.00002, distanceThreshold = 20) {
    // Basic validation
    if (!Array.isArray(points) || points.length < 3) {
        return points; // Need at least 3 points to form a triangle and perform thinning
    }

    const thinnedCoords = [points[0]]; // Always keep the first point

    // Helper function to extract lat/lon from the [lat, lon] array format
    // For calculation, we treat LAT as Y and LON as X.
    const getCoords = point => ({ lat: point[0], lon: point[1] });

    for (let i = 1; i < points.length - 1; i++) {
        // Get the last kept point, current point, and the next point
        const lastKeptPoint = getCoords(thinnedCoords[thinnedCoords.length - 1]);
        const curr = getCoords(points[i]);
        const next = getCoords(points[i + 1]);

        // Calculate the area of the triangle formed by lastKeptPoint, curr, next
        // Formula: 0.5 * |x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)|
        const area = Math.abs(
            (lastKeptPoint.lon * (curr.lat - next.lat)
             + curr.lon * (next.lat - lastKeptPoint.lat)
             + next.lon * (lastKeptPoint.lat - curr.lat)) / 2,
        );

        // Calculate the base length (distance between lastKeptPoint and next)
        const baseLength = Math.sqrt(
            (next.lon - lastKeptPoint.lon) ** 2 + (next.lat - lastKeptPoint.lat) ** 2,
        );

        // Calculate the height (perpendicular distance from curr to the segment)
        // Formula: Height = 2 * Area / Base Length
        const height = (baseLength === 0) ? 0 : (2 * area) / baseLength;

        // If height is greater than threshold, keep the point
        // If the distance to the previous point is more than threshold, also keep the point to avoid large gaps for motorway segments
        if (height > heightThreshold || calculateDistance(
            [lastKeptPoint.lat, lastKeptPoint.lon],
            [curr.lat, curr.lon],
        ) > distanceThreshold) {
            thinnedCoords.push(points[i]);
        }
    }

    // Always keep the last point
    const lastOriginalPoint = points[points.length - 1];

    // Check if the last point is already included (only happens if it was the lastKeptPoint)
    const isLastPointIncluded = thinnedCoords.length > 0
        && thinnedCoords[thinnedCoords.length - 1][0] === lastOriginalPoint[0]
        && thinnedCoords[thinnedCoords.length - 1][1] === lastOriginalPoint[1];

    if (!isLastPointIncluded) {
        thinnedCoords.push(lastOriginalPoint);
    }

    return thinnedCoords;
}

export function thinWKTPoints(wkt, threshold = 0.00002) {
    const coords = parseWKT(wkt);

    if (coords.length <= 2) {
        return wkt; // No thinning needed for 2 or fewer points
    }

    const thinnedCoords = thinCoordinates(coords, threshold);
    return toWKT(thinnedCoords);
}
