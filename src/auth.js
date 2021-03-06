import { AuthenticationContext, adalFetch } from 'react-adal';

export const IS_LOGIN_NOT_REQUIRED = process.env.REACT_APP_DISABLE_ACTIVE_DIRECTORY_LOGIN === 'true';
const AD_CLIENT_ID = process.env.REACT_APP_ACTIVE_DIRECTORY_CLIENT_ID || 'client-id';
const AD_TENANT = process.env.REACT_APP_ACTIVE_DIRECTORY_TENANT || 'tenant-name';

const config = {
    tenant: AD_TENANT,
    clientId: AD_CLIENT_ID,
    cacheLocation: 'sessionStorage',
    endpoints: {
        api: AD_CLIENT_ID,
    },
};

const authContext = new AuthenticationContext(config);

export const getAuthContext = () => authContext;

export const fetchWithAuthHeader = (url, options) => {
    if (IS_LOGIN_NOT_REQUIRED) {
        return fetch(url, options);
    }
    return adalFetch(authContext, config.endpoints.api, fetch, url, options);
};

export const getAuthUser = () => {
    if (IS_LOGIN_NOT_REQUIRED) { return { profile: { name: 'Guest User' } }; }
    return authContext.getCachedUser();
};

export const getAuthToken = () => authContext.getCachedToken(AD_CLIENT_ID);

export const logout = () => authContext.logOut();
