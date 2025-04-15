import { getAllFeatures, getWorksite, getLayout } from './cars-api';

jest.mock('../browser-cache', () => ({
    setCache: jest.fn(),
    getCache: jest.fn(),
}));

describe('getAllFeatures', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });
    beforeEach(() => {
        Object.defineProperty(global, 'sessionStorage', {
            value: {
                getItem: jest.fn().mockReturnValue(null),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn(),
            },
            writable: true,
        });
        jest.spyOn(global.sessionStorage, 'getItem').mockReturnValue(null);
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterAll(() => {
        jest.restoreAllMocks(); // Fully restores original implementations
    });
    it('should fetch and return features with remapped coordinates for polygons', async () => {
        const mockResponse = [
            {
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[174.7633315, -36.8484597], [174.7633315, -36.8484597]]],
                },
                properties: {
                    WorksiteCode: '123',
                    WorksiteName: 'Test Worksite',
                },
            },
        ];

        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const features = await getAllFeatures();

        expect(features).toEqual([
            {
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[-36.8484597, 174.7633315], [-36.8484597, 174.7633315]]],
                },
                properties: {
                    WorksiteCode: '123',
                    WorksiteName: 'Test Worksite',
                },
            },
        ]);
    });

    it('should handle fetch errors gracefully', async () => {
        fetch.mockResolvedValue({
            status: 500,
            ok: false,
            json: jest.fn().mockResolvedValue({ message: 'Internal Server Error' }),
        });

        await expect(getAllFeatures()).rejects.toMatchObject({
            code: 500,
            message: 'Internal Server Error',
        });
    });
});

describe('getWorksite', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and return worksite data', async () => {
        const worksiteCode = '123';
        const mockResponse = { worksiteCode: '123', name: 'Test Worksite' };

        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await getWorksite(worksiteCode, false);

        expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.anything());
        expect(result).toEqual(mockResponse);
    });

    it('should handle 404 error when worksite is not found', async () => {
        const worksiteCode = '123';
        const errorMessage = `No corresponding TMP found for this CAR Number ${worksiteCode}.`;

        fetch.mockResolvedValue({
            ok: false,
            status: 404,
            json: jest.fn().mockResolvedValue({}),
        });

        await expect(getWorksite(worksiteCode, false)).rejects.toThrowError(errorMessage);
    });

    it('should include date filter when filterByYesterdayTodayTomomorrowDate is true', async () => {
        const worksiteCode = '123';
        const mockResponse = { worksiteCode: '123', name: 'Test Worksite' };

        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        await getWorksite(worksiteCode, true);

        expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.anything());
    });
});

describe('getLayout', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and return layout data', async () => {
        const ids = '1,2,3';
        const mockResponse = { layout: 'Test Layout' };

        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await getLayout(ids, false);

        expect(fetch).toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
    });

    it('should handle 404 error when layout is not found', async () => {
        const ids = '1,2,3';
        const errorMessage = 'No layout corresponding to the TMPs of this CAR.';

        fetch.mockResolvedValue({
            ok: false,
            status: 404,
            json: jest.fn().mockResolvedValue({}),
        });

        await expect(getLayout(ids, false)).rejects.toThrowError(errorMessage);
    });

    it('should include date filter when filterByYesterdayTodayTomomorrowDate is true', async () => {
        const ids = '1,2,3';
        const mockResponse = { layout: 'Test Layout' };

        fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        await getLayout(ids, true);

        expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.anything());
    });
});
