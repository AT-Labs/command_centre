const cacheKey = 'cc-browser-cache';

export const setCache = (data, path) => caches.open(cacheKey)
    .then((cache) => {
        if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return null;
        }

        const strData = JSON.stringify(data);
        const response = new Response(strData, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': strData.length,
            },
        });
        cache.put(path, response);
        return data;
    })
    .then(result => result);

export const getCache = path => caches.match(path)
    .then(cache => cache.json())
    .catch(() => null);
