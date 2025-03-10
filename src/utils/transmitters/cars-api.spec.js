import { getAllFeatures } from './cars-api';

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
