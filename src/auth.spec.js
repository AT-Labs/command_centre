/* eslint-disable global-require */
describe('Environment Configuration', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('should set IS_LOGIN_NOT_REQUIRED correctly when env variable is true', () => {
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'true';
        const { IS_LOGIN_NOT_REQUIRED } = require('./auth');
        expect(IS_LOGIN_NOT_REQUIRED).toBe(true);
    });

    it('should set IS_LOGIN_NOT_REQUIRED correctly when env variable is false', () => {
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'false';
        const { IS_LOGIN_NOT_REQUIRED } = require('./auth');
        expect(IS_LOGIN_NOT_REQUIRED).toBe(false);
    });
});

describe('Authentication Functions', () => {
    const account = { username: 'test-user', idTokenClaims: { exp: 1717638821 } };

    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetchWithAuthHeader should fetch without auth header if login not required', async () => {
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'true';
        global.fetch = jest.fn().mockResolvedValue({ status: 200 });
        const { fetchWithAuthHeader } = require('./auth');

        const response = await fetchWithAuthHeader('http://example.com', {});
        expect(response.status).toBe(200);
    });

    it('fetchWithAuthHeader should fetch with auth header if login is required', async () => {
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'false';
        const { getMsalInstance, fetchWithAuthHeader } = require('./auth');
        const msalInstance = getMsalInstance();
        msalInstance.initialize = jest.fn(() => Promise.resolve());
        msalInstance.getAllAccounts = jest.fn().mockReturnValue([account]);
        msalInstance.getActiveAccount = jest.fn().mockReturnValue(account);
        msalInstance.acquireTokenSilent = jest.fn().mockResolvedValue({ idToken: 'test-token' });
        global.fetch = jest.fn().mockImplementation((url, options) => {
            expect(options.headers.Authorization).toBe('Bearer test-token');
            return Promise.resolve({ status: 200 });
        });

        const response = await fetchWithAuthHeader('http://example.com', { headers: {} });
        expect(response.status).toBe(200);
    });

    it('getAuthUser should return guest user if login not required', () => {
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'true';
        const { getAuthUser } = require('./auth');

        const user = getAuthUser();
        expect(user.profile.name).toBe('Guest User');
    });

    it('getAuthUser should return account user if login is required', () => {
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'false';
        const { getMsalInstance, getAuthUser } = require('./auth');
        const msalInstance = getMsalInstance();
        msalInstance.getAllAccounts = jest.fn().mockReturnValue([account]);
        msalInstance.getActiveAccount = jest.fn().mockReturnValue(account);

        const user = getAuthUser();
        expect(user.username).toBe('test-user');
    });

    it('should throw an error if no active account is found', async () => {
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'false';
        const { getMsalInstance, getAuthToken } = require('./auth');
        global.IS_LOGIN_NOT_REQUIRED = false;
        const msalInstance = getMsalInstance();
        msalInstance.getActiveAccount = jest.fn().mockReturnValue(null);
        await expect(getAuthToken()).rejects.toThrow('No user account found');
    });

    it('getAuthToken should return token if user is logged in', async () => {
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'false';
        const { getMsalInstance, getAuthToken } = require('./auth');
        const msalInstance = getMsalInstance();
        msalInstance.getAllAccounts = jest.fn().mockReturnValue([account]);
        msalInstance.getActiveAccount = jest.fn().mockReturnValue(account);
        msalInstance.acquireTokenSilent = jest.fn().mockResolvedValue({ idToken: 'test-token' });

        const token = await getAuthToken();
        expect(token).toBe('test-token');
    });

    it('should return idToken when popup interaction is required', async () => {
        global.IS_LOGIN_NOT_REQUIRED = false;
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'false';
        const { getMsalInstance, getAuthToken } = require('./auth');
        const msalInstance = getMsalInstance();
        const idToken = 'popupToken';

        msalInstance.getAllAccounts = jest.fn().mockReturnValue([account]);
        msalInstance.getActiveAccount = jest.fn().mockReturnValue(account);
        msalInstance.acquireTokenSilent = jest.fn().mockRejectedValue({ name: 'InteractionRequiredAuthError' });
        msalInstance.acquireTokenPopup = jest.fn().mockResolvedValue({ idToken });

        const token = await getAuthToken();
        expect(msalInstance.acquireTokenPopup).toHaveBeenCalled();
        expect(token).toBe(idToken);
    });

    it('should capture exception and return undefined when silent token acquisition fails', async () => {
        global.IS_LOGIN_NOT_REQUIRED = false;
        process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN = 'false';
        const { getMsalInstance, getAuthToken } = require('./auth');
        const msalInstance = getMsalInstance();

        msalInstance.getAllAccounts = jest.fn().mockReturnValue([account]);
        msalInstance.getActiveAccount = jest.fn().mockReturnValue(account);
        msalInstance.acquireTokenSilent = jest.fn().mockRejectedValue(new Error('Silent token acquisition failed'));
        const token = await getAuthToken();
        expect(token).toBe(undefined);
    });

    it('logout should call msalInstance.logoutRedirect and clear Sentry user', () => {
        const { getMsalInstance, logout } = require('./auth');
        const msalInstance = getMsalInstance();
        msalInstance.getAllAccounts = jest.fn().mockReturnValue([account]);
        msalInstance.getActiveAccount = jest.fn().mockReturnValue(account);
        msalInstance.logoutRedirect = jest.fn();

        logout();
        expect(msalInstance.logoutRedirect).toHaveBeenCalledWith({ account });
    });
});
