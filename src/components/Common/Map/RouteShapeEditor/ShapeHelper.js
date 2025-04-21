import L from 'leaflet';

// Calculate the distance between two points (lat, lng)
export const calculateDistance = ([lat1, lng1], [lat2, lng2]) => {
    const R = 6371e3; // Earth's radius in meters
    const rad = Math.PI / 180;
    const φ1 = lat1 * rad; const
        φ2 = lat2 * rad;
    const Δφ = (lat2 - lat1) * rad;
    const Δλ = (lng2 - lng1) * rad;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
              + Math.cos(φ1) * Math.cos(φ2)
              * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
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

    for (let i = 0; i < polyline.length - 1; i++) {
        const p1 = polyline[i];
        const p2 = polyline[i + 1];
        const projectedPoint = projectPointOnSegment(point, p1, p2);
        const dist = calculateDistance(point, projectedPoint);

        if (dist < minDist) {
            minDist = dist;
            projection = projectedPoint;
            segmentIndex = i;
        }
    }

    return { projection, segmentIndex };
};

// Merge the second list into the first list
export const mergeCoordinates = (firstList, secondList) => {
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

    return mergedList;
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
    if (startIndex <= endIndex) {
        if (startIndex > 1) {
            startIndex -= 1;
        }
        if (endIndex < length2 - 1) {
            endIndex += 1;
        }
        return updated.slice(startIndex, endIndex + 1);
    }

    return [];
};

export const getMinDistanceToPolyline = (stopLatLng, polylineLatLngs, map) => {
    let minDistance = Infinity;
    for (let i = 0; i < polylineLatLngs.length - 1; i++) {
        const A = polylineLatLngs[i];
        const B = polylineLatLngs[i + 1];
        const pA = map.latLngToLayerPoint(A);
        const pB = map.latLngToLayerPoint(B);
        const pP = map.latLngToLayerPoint(stopLatLng);
        const closestPoint = L.LineUtil.closestPointOnSegment(pP, pA, pB);
        const closestLatLng = map.layerPointToLatLng(closestPoint);
        const distance = stopLatLng.distanceTo(closestLatLng);
        if (distance < minDistance) {
            minDistance = distance;
        }
    }
    return minDistance;
};

// Function to parse WKT LINESTRING into an array of coordinates
export const parseWKT = (wkt) => {
    const coords = wkt
        .replace('LINESTRING(', '')
        .replace(')', '')
        .split(',')
        .map(pair => pair.trim().split(' ').map(Number).reverse()); // Trim whitespace, then process
    return coords;
};

// Function to convert coordinates back into WKT format
export const toWKT = (coordinates) => {
    const wktCoords = coordinates.map(latlng => `${latlng[1]} ${latlng[0]}`).join(',');
    return `LINESTRING(${wktCoords})`;
};
