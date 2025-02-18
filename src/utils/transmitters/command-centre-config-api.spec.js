import * as Sentry from '@sentry/react';
import { getUserPreferences, updateUserPreferences, getAlertCauses, getAlertEffects } from './command-centre-config-api';
import * as auth from '../../auth';
import * as jsonHandling from '../fetch';

jest.spyOn(Sentry, 'captureException');
jest.spyOn(auth, 'fetchWithAuthHeader');
jest.spyOn(jsonHandling, 'jsonResponseHandling');

describe('Config API tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockApiUrl = process.env.REACT_APP_REALTIME_COMMAND_CENTRE_CONFIG_API_URL;

    it('Should fetch user preferences successfully', async () => {
        const mockResponse = { routesFilters: { routeType: 3 } };
        auth.fetchWithAuthHeader.mockResolvedValue(mockResponse);
        jsonHandling.jsonResponseHandling.mockImplementation(res => res);

        const result = await getUserPreferences();
        expect(result).toEqual(mockResponse);
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledWith(
            `${mockApiUrl}/preferences`,
            expect.objectContaining({ method: 'GET' }),
        );
    });

    it('Should handle error when fetching user preferences', async () => {
        auth.fetchWithAuthHeader.mockRejectedValue(new Error('Network Error'));

        await getUserPreferences();
        expect(Sentry.captureException).toHaveBeenCalledWith(expect.stringContaining('Failed to get user preferences'));
    });

    it('Should update user preferences successfully', async () => {
        const mockFilter = { routesFilters: { routeType: 3 } };
        auth.fetchWithAuthHeader.mockResolvedValue({});

        await updateUserPreferences(mockFilter);
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledWith(
            `${mockApiUrl}/preferences`,
            expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify(mockFilter),
            }),
        );
    });

    it('Should handle error when updating user preferences', async () => {
        auth.fetchWithAuthHeader.mockRejectedValue(new Error('Update failed'));

        await updateUserPreferences({ routesFilters: { routeType: 3 } });
        expect(Sentry.captureException).toHaveBeenCalledWith(expect.stringContaining('Failed to update user preferences'));
    });

    it('Should fetch alert causes successfully', async () => {
        const mockResponse = [{ value: 'BREAKDOWN', label: 'Breakdown' }];
        auth.fetchWithAuthHeader.mockResolvedValue(mockResponse);
        jsonHandling.jsonResponseHandling.mockImplementation(res => res);

        const result = await getAlertCauses();
        expect(result).toEqual(mockResponse);
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledWith(
            `${mockApiUrl}/causes`,
            expect.objectContaining({ method: 'GET' }),
        );
    });

    it('Should handle error when fetching alert causes', async () => {
        auth.fetchWithAuthHeader.mockRejectedValue(new Error('Fetch failed'));

        await getAlertCauses();
        expect(Sentry.captureException).toHaveBeenCalledWith(expect.stringContaining('Failed to get alert causes'));
    });

    it('Should fetch alert effects successfully', async () => {
        const mockResponse = [{ value: 'BUS_REPLACEMENT', label: 'Bus replacement' }];
        auth.fetchWithAuthHeader.mockResolvedValue(mockResponse);
        jsonHandling.jsonResponseHandling.mockImplementation(res => res);

        const result = await getAlertEffects();
        expect(result).toEqual(mockResponse);
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledWith(
            `${mockApiUrl}/effects`,
            expect.objectContaining({ method: 'GET' }),
        );
    });

    it('Should handle error when fetching alert effects', async () => {
        auth.fetchWithAuthHeader.mockRejectedValue(new Error('Fetch failed'));

        await getAlertEffects();
        expect(Sentry.captureException).toHaveBeenCalledWith(expect.stringContaining('Failed to get alert effects'));
    });
});
