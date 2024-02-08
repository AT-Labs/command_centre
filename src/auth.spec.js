import * as adal from 'react-adal';
import * as Sentry from '@sentry/react';
import { fetchWithAuthHeader } from './auth';

global.fetch = jest.fn();

describe('fetchWithAuthHeader', () => {
    it('should call adalFetch with provided url and options when adalFetch throws error call sentry captureException', async () => {
        const url = 'https://test.com';
        const options = { method: 'GET' };

        const captureExceptionSpy = jest.spyOn(Sentry, 'captureException');
        jest.spyOn(global, 'fetch').mockResolvedValue({});
        jest.spyOn(adal, 'adalFetch').mockRejectedValue(new Error('Some error'));

        await fetchWithAuthHeader(url, options);

        expect(captureExceptionSpy).toHaveBeenCalled();
    });
});
