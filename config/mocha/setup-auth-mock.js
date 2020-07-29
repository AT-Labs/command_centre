import sinon from 'sinon';
import * as auth from '../../src/auth';

beforeEach(() => {
    sinon.stub(auth, 'getAuthContext');
    sinon.stub(auth, 'fetchWithAuthHeader');
    sinon.stub(auth, 'getAuthUser');
    sinon.stub(auth, 'getAuthToken');
    sinon.stub(auth, 'logout');
});

afterEach(() => {
    auth.getAuthContext.restore();
    auth.fetchWithAuthHeader.restore();
    auth.getAuthUser.restore();
    auth.getAuthToken.restore();
    auth.logout.restore();
});
