import { jsonResponseHandling } from './fetch';

describe('jsonResponseHandling', () => {
    const testCases = [
        { code: 403, payload: { code: 403, error: 'forbidden' }, expectedKey: 'error' },
        { code: 401, payload: { code: 401, message: 'unauthorized' }, expectedKey: 'message' },
        { code: 400, payload: { error: 'bad request' }, expectedKey: 'error' },
        { code: 403, payload: { message: 'forbidden' }, expectedKey: 'message' },
        { code: 401, payload: { code: 401, error: 'unauthorized error', message: 'unauthorized message' }, expectedKey: 'error' },
        { code: 400, payload: { }, expectedKey: 'undefined' },
        { code: 400, payload: { code: null, error: null }, expectedKey: 'undefined' },
        { code: 400, payload: { code: null, message: null }, expectedKey: 'message' },
    ];
    it.each(testCases)('throws error with appropriate values args=%p', async ({ code, payload, expectedKey }) => {
        const response = {
            ok: code >= 200 && code <= 299,
            status: code,
            json: async () => payload,
        };

        let execeptionThrown = false;
        try {
            await jsonResponseHandling(response);
        } catch (e) {
            execeptionThrown = true;
            expect(e.code).toBe(code);
            expect(e.message).toBe(payload[expectedKey]);
        }
        expect(execeptionThrown).toBe(true);
    });

    it('throws error if response throws error', async () => {
        const response = {
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            json: async () => { throw Object.create({}); },
        };

        let execeptionThrown = false;
        try {
            await jsonResponseHandling(response);
        } catch (e) {
            execeptionThrown = true;
            expect(e.code).toBe(400);
            expect(e.message).toBe('Bad Request');
        }
        expect(execeptionThrown).toBe(true);
    });

    it('returns json body if 200', async () => {
        const response = {
            ok: true,
            status: 200,
            json: async () => ({ value: 'ok' }),
        };

        const result = await jsonResponseHandling(response);
        expect(result.value).toBe('ok');
    });

    it('returns response if 204', async () => {
        const response = {
            ok: true,
            status: 204,
        };

        const result = await jsonResponseHandling(response);
        expect(result).toBe(response);
    });
});
