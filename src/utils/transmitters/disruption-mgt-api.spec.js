import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';
import HTTP_TYPES from '../../types/http-types';
import { getDisruptionsByFilters } from './disruption-mgt-api';

jest.mock('../../auth', () => ({
    fetchWithAuthHeader: jest.fn(),
}));

jest.mock('../fetch', () => ({
    jsonResponseHandling: jest.fn(),
}));

global.AbortController = class {
    constructor() {
        this.signal = 'mock-signal';
    }
};

describe('getDisruptionsByFilters', () => {
    const filters = { stopId: '101', includeDrafts: true };
    const mockQuery = '?stopId=101&includeDraft=true';
    const mockResponse = { disruptions: [{ id: 1, name: 'Test' }] };

    beforeEach(() => {
        fetchWithAuthHeader.mockClear();
        jsonResponseHandling.mockClear();
    });

    it('should call fetchWithAuthHeader with correct URL and method', async () => {
        fetchWithAuthHeader.mockResolvedValue({});
        jsonResponseHandling.mockResolvedValue(mockResponse);

        const result = await getDisruptionsByFilters(filters);

        expect(fetchWithAuthHeader).toHaveBeenCalledWith(
            `${process.env.REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions${mockQuery}`,
            { method: HTTP_TYPES.GET, signal: undefined },
        );
        expect(jsonResponseHandling).toHaveBeenCalled();
        expect(result).toEqual(mockResponse);
    });

    it('should pass abort signal if provided', async () => {
        fetchWithAuthHeader.mockResolvedValue({});
        jsonResponseHandling.mockResolvedValue(mockResponse);

        const controller = new AbortController();
        await getDisruptionsByFilters(filters, { signal: controller.signal });

        expect(fetchWithAuthHeader).toHaveBeenCalledWith(
            `${process.env.REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions${mockQuery}`,
            { method: HTTP_TYPES.GET, signal: controller.signal },
        );
    });

    it('should throw if fetchWithAuthHeader rejects', async () => {
        const error = new Error('Network error');
        fetchWithAuthHeader.mockRejectedValue(error);

        await expect(getDisruptionsByFilters(filters)).rejects.toThrow('Network error');
    });
});
