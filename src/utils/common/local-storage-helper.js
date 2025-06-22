export const CAUSES_CACHE_KEY = 'causesCacheKey';
export const EFFECTS_CACHE_KEY = 'effectsCacheKey';
export const CAUSES_EFFECTS_CACHE_EXPIRY = 1000 * 60 * 30;

const DEFAULT_EXPIRATION_TIME = 1000 * 60 * 30;

export const fetchFromLocalStorage = async (cacheKey, cacheExpirationTime, fetchFromApiFunc) => {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > (cacheExpirationTime ?? DEFAULT_EXPIRATION_TIME);

        if (!isExpired) {
            return data;
        }
    }

    const data = await fetchFromApiFunc();

    if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    }

    return data;
};
