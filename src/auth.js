import * as Sentry from '@sentry/react';
import { PublicClientApplication } from '@azure/msal-browser';

export const IS_LOGIN_NOT_REQUIRED = process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN === 'true';
const AD_CLIENT_ID = process.env.REACT_APP_ACTIVE_DIRECTORY_CLIENT_ID || 'client-id';
const AD_TENANT = process.env.REACT_APP_ACTIVE_DIRECTORY_TENANT || 'tenant-name';
const AD_AUTHORITY = `https://login.microsoftonline.com/${AD_TENANT}`;

const msalConfig = {
    auth: {
        clientId: AD_CLIENT_ID,
        authority: AD_AUTHORITY,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: true,
    },
};

const msalInstance = new PublicClientApplication(msalConfig);
const loginRequest = {
    scopes: ['User.Read'],
};
const guestUserName = 'Guest User';

export const getMsalInstance = () => msalInstance;

export const fetchWithAuthHeader = async (url, options) => {
    if (IS_LOGIN_NOT_REQUIRED) {
        return fetch(url, options);
    }

    await msalInstance.initialize();
    const allAccounts = msalInstance.getAllAccounts();
    const account = allAccounts[0];
    try {
        const tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account,
        });
        const optionsWithToken = {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${tokenResponse.idToken}`,
            },
        };
        return fetch(url, optionsWithToken);
    } catch (error) {
        return Sentry.captureException(error);
    }
};

export const getAuthUser = () => {
    if (IS_LOGIN_NOT_REQUIRED) { return { profile: { name: guestUserName } }; }
    const account = msalInstance.getAllAccounts()[0];
    Sentry.setUser({
        username: account ? account.username : guestUserName,
    });

    return account;
};

export const getAuthToken = async () => {
    if (IS_LOGIN_NOT_REQUIRED) { return ''; }

    const account = msalInstance.getAllAccounts()[0];
    if (!account) {
        throw new Error('No user account found');
    }
    const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
    });
    return response.idToken;
};

export const logout = () => {
    const account = msalInstance.getAllAccounts()[0];
    msalInstance.logoutRedirect({ account });
    Sentry.setUser(null);
};
