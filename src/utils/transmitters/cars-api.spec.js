import { getAllFeatures } from './cars-api';

describe('getAllFeatures', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
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
