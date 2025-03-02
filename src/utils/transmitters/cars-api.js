import { jsonResponseHandling } from '../fetch';
import { setCache, getCache } from '../browser-cache';

const { REACT_APP_AT_CARS_INTEGRATION_URL } = process.env;
const CACHE_EXPIRY_MS = 15 * 60 * 1000;
const SESSION_KEY = 'carsDataTimestamp';

// Or consider if showRoadworkLayer on toggle to true will force a fetch
export const getAllFeatures = async (forceFetch = false) => {
    const api = `${REACT_APP_AT_CARS_INTEGRATION_URL}/feature`;

    // Check sessionStorage for expiration
    const lastFetch = sessionStorage.getItem(SESSION_KEY);
    const isCacheExprired = (Date.now() - lastFetch) >= CACHE_EXPIRY_MS;
    if (!forceFetch && lastFetch && !isCacheExprired) {
        const cachedData = await getCache(api);
        if (cachedData) {
            return cachedData;
        }
    }

    // Fetch new data from API
    const response = await fetch(api, { method: 'GET' });
    const json = await jsonResponseHandling(response);

    // Remap polygon coordinates (lon,lat → lat,lon)
    const updatedFeatures = json
        .sort((a, b) => b.properties.Shape__Area - a.properties.Shape__Area)
        .map((feature) => {
            const newCoordinates = feature.geometry.coordinates.map(coordinate => coordinate.map(([lon, lat]) => [lat, lon]));

            return {
                ...feature,
                geometry: {
                    ...feature.geometry,
                    coordinates: newCoordinates,
                },
            };
        });

    // Store the fetched data in the cache
    await setCache(updatedFeatures, api);

    // Update sessionStorage with the current timestamp
    sessionStorage.setItem(SESSION_KEY, Date.now());

    return updatedFeatures;
};
