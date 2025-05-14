import { getDisruptionsByFilters } from './disruption-mgt-api';
import * as auth from '../../auth';
import { buildDisruptionsQuery } from '../control/disruptions';
import { jsonResponseHandling } from '../fetch';

jest.mock('../../auth', () => ({
    fetchWithAuthHeader: jest.fn(),
}));

jest.mock('../control/disruptions', () => ({
    buildDisruptionsQuery: jest.fn(),
}));

jest.mock('../fetch', () => ({
    jsonResponseHandling: jest.fn(),
}));

describe('getDisruptionsByFilters', () => {
    const mockFilters = { status: 'active', mode: 'bus' };
    const mockQuery = '?status=active&mode=bus';
    const mockResponse = [{ id: 1, name: 'Disruption 1' }];

    beforeEach(() => {
        buildDisruptionsQuery.mockReturnValue(mockQuery);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch disruptions with valid filters', async () => {
        auth.fetchWithAuthHeader.mockResolvedValue({ ok: true });
        jsonResponseHandling.mockResolvedValue(mockResponse);

        const result = await getDisruptionsByFilters(mockFilters);

        expect(buildDisruptionsQuery).toHaveBeenCalledWith(mockFilters);
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledWith(
            `${process.env.REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions${mockQuery}`,
            { method: 'GET' },
        );
        expect(jsonResponseHandling).toHaveBeenCalledWith({ ok: true });
        expect(result).toEqual(mockResponse);
    });

    it('should fetch disruptions with empty filters', async () => {
        buildDisruptionsQuery.mockReturnValue('');
        auth.fetchWithAuthHeader.mockResolvedValue({ ok: true });
        jsonResponseHandling.mockResolvedValue(mockResponse);

        const result = await getDisruptionsByFilters({});

        expect(buildDisruptionsQuery).toHaveBeenCalledWith({});
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledWith(
            `${process.env.REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions`,
            { method: 'GET' },
        );
        expect(jsonResponseHandling).toHaveBeenCalledWith({ ok: true });
        expect(result).toEqual(mockResponse);
    });

    it('should handle fetch errors gracefully', async () => {
        const mockErrorResponse = { ok: false, status: 500 };
        auth.fetchWithAuthHeader.mockResolvedValue(mockErrorResponse);
        jsonResponseHandling.mockRejectedValue({ code: 500, message: 'Internal Server Error' });

        await expect(getDisruptionsByFilters(mockFilters)).rejects.toMatchObject({
            code: 500,
            message: 'Internal Server Error',
        });

        expect(buildDisruptionsQuery).toHaveBeenCalledWith(mockFilters);
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledWith(
            `${process.env.REACT_APP_DISRUPTION_MGT_QUERY_URL}/disruptions${mockQuery}`,
            { method: 'GET' },
        );
        expect(jsonResponseHandling).toHaveBeenCalledWith(mockErrorResponse);
    });
});
