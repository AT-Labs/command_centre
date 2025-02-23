import { jsonResponseHandling } from '../fetch';

const { REACT_APP_AT_CARS_INTEGRATION_URL } = process.env;

export const getAllFeatures = async () => {
    const api = `${REACT_APP_AT_CARS_INTEGRATION_URL}/feature`;
    const features = await fetch(api, { method: 'GET' });
    const json = await jsonResponseHandling(features);

    // Remapping polygon coordinates without mutating the original (original is lon,lat. We need lat,lon)
    const updatedFeatures = json.map((feature) => {
        const newCoordinates = feature.geometry.coordinates.map(coordinate => coordinate.map(([lon, lat]) => [lat, lon]));

        return {
            ...feature,
            geometry: {
                ...feature.geometry,
                coordinates: newCoordinates,
            },
        };
    });

    return updatedFeatures;
};
