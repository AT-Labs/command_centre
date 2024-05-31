import sinon from 'sinon';
import * as auth from '../../src/auth';

beforeEach(() => {
    sinon.stub(auth, 'getMsalInstance');
    sinon.stub(auth, 'fetchWithAuthHeader');
    sinon.stub(auth, 'getAuthUser');
    sinon.stub(auth, 'getAuthToken').resolves('auth_token');
    sinon.stub(auth, 'logout');
});

afterEach(() => {
    auth.getMsalInstance.restore();
    auth.fetchWithAuthHeader.restore();
    auth.getAuthUser.restore();
    auth.getAuthToken.restore();
    auth.logout.restore();
});
