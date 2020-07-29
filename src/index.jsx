import { runWithAdal } from 'react-adal';
import { getAuthContext, IS_LOGIN_NOT_REQUIRED } from './auth';

// eslint-disable-next-line global-require
runWithAdal(getAuthContext(), () => require('./indexApp.jsx'), IS_LOGIN_NOT_REQUIRED);
