export const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
    const toRadian = angle => (Math.PI / 180) * angle;
    const distance = (a, b) => (Math.PI / 180) * (a - b);
    const RADIUS_OF_EARTH_IN_KM = 6371; // Earth radius in kilometers

    const dLat = distance(lat2, lat1);
    const dLon = distance(lon2, lon1);

    const rlat1 = toRadian(lat1);
    const rlat2 = toRadian(lat2);

    // Haversine Formula
    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(rlat1) * Math.cos(rlat2);
    const c = 2 * Math.asin(Math.sqrt(a));

    return RADIUS_OF_EARTH_IN_KM * c;
};
