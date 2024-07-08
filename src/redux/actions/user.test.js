import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { updateUserProfile, fetchRoutesViewPermission, fetchBlocksViewPermission, fetchPreferences } from './user';
import ACTION_TYPE from '../action-types';
import * as tripMgtApi from '../../utils/transmitters/trip-mgt-api';
import * as blockMgtApi from '../../utils/transmitters/block-mgt-api';
import * as ccConfigApi from '../../utils/transmitters/command-centre-config-api';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;
const mockedUser = {
    username: 'test@user.com',
    name: 'Test User',
    idTokenClaims: {
        roles: ['role_1', 'role_2'],
    },
};

describe('Link actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('updates user profile', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_USER_PROFILE,
                payload: {
                    profile: {
                        userName: mockedUser.username,
                        name: mockedUser.name,
                        roles: mockedUser.idTokenClaims.roles,
                    },
                },
            },
        ];

        await store.dispatch(updateUserProfile(mockedUser));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('gets R&T view permission and updates user permissions', async () => {
        const fakeGetViewPermission = sandbox.fake.resolves(true);
        sandbox.stub(tripMgtApi, 'getRoutesViewPermission').callsFake(fakeGetViewPermission);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_USER_PERMISSIONS,
                payload: {
                    permissions: {
                        controlRoutesView: true,
                    },
                },
            },
        ];

        await store.dispatch(fetchRoutesViewPermission());
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('gets blocks view permission and updates user permissions', async () => {
        const fakeGetViewPermission = sandbox.fake.resolves(true);
        sandbox.stub(blockMgtApi, 'getBlocksViewPermission').callsFake(fakeGetViewPermission);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_USER_PERMISSIONS,
                payload: {
                    permissions: {
                        controlBlocksView: true,
                    },
                },
            },
        ];

        await store.dispatch(fetchBlocksViewPermission());
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('gets UserPreferences(routesFilters) and updates R&T filters in redux store', async () => {
        const fakeGetUserPreferences = sandbox.fake.resolves({ routesFilters: { routeType: 3 } });
        sandbox.stub(ccConfigApi, 'getUserPreferences').callsFake(fakeGetUserPreferences);

        const expectedActions = [
            {
                type: ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS,
                payload: {
                    filters: {
                        routeType: 3,
                    },
                },
            },
        ];

        await store.dispatch(fetchPreferences());
        expect(store.getActions()).to.eql(expectedActions);
    });
});
