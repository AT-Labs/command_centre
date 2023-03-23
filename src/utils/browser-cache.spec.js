import { setCache, getCache } from './browser-cache';

describe('Browser Cache', () => {
    const path = '/stops';
    const data = { stop_id: '1-97' };
    const strData = JSON.stringify(data);
    const cachedData = {
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': strData.length,
        },
        body: strData,
        json: () => data,
    };

    global.caches = {
        open: async () => ({
            put: jest.fn(),
        }),
        match: async () => cachedData,
    };

    global.Response = () => cachedData;

    it('Should be able to cache and retrieve data', async () => {
        await setCache(data, path);
        expect(await getCache(path)).toBe(data);
    });

    it('Should not cache for empty data', async () => {
        expect(await setCache([], path)).toBe(null);
        expect(await setCache({}, path)).toBe(null);
    });
});
