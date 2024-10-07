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
    redirectUri: `${window.location.origin}/blank.html`,
};

const guestUserName = 'Guest User';

export const getMsalInstance = () => msalInstance;

export const getAuthUser = () => {
    if (IS_LOGIN_NOT_REQUIRED) { return { profile: { name: guestUserName } }; }
    const account = msalInstance.getActiveAccount();
    if (!account) {
        msalInstance.loginRedirect();
        return undefined;
    }
    Sentry.setUser({
        username: account ? account.username : guestUserName,
    });

    return account;
};

export const getAuthToken = async () => {
    if (IS_LOGIN_NOT_REQUIRED) { return ''; }

    const account = msalInstance.getActiveAccount();
    if (!account) {
        throw new Error('No user account found');
    }
    const forceRefresh = new Date() >= new Date(account.idTokenClaims.exp * 1000);
    const silentRequest = {
        ...loginRequest,
        account,
        forceRefresh,
    };
    try {
        const response = await msalInstance.acquireTokenSilent(silentRequest);
        return response.idToken;
    } catch (error) {
        if (error.name === 'InteractionRequiredAuthError') {
            const response = await msalInstance.acquireTokenPopup(silentRequest);
            return response.idToken;
        }
        Sentry.captureException(`Failed to get user token silent ${error})`);
        return undefined;
    }
};

export const fetchWithAuthHeader = async (url, options) => {
    if (IS_LOGIN_NOT_REQUIRED) {
        return fetch(url, options);
    }

    try {
        const idToken = await getAuthToken();
        const optionsWithToken = {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${idToken}`,
            },
        };
        return fetch(url, optionsWithToken);
    } catch (error) {
        Sentry.captureException(error);
        return undefined;
    }
};

export const logout = () => {
    const account = msalInstance.getActiveAccount();
    msalInstance.setActiveAccount(null);
    msalInstance.logoutRedirect({ account });
    Sentry.setUser(null);
};
