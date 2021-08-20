import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { getRoutes } from './routes';
import * as cache from '../../../utils/cache';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

describe('routes actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('loads routes from server if cache is invalid and populates agencies', async () => {
        const validVersion = 'valid-version';
        const testRoute = { route_id: `test-route-${validVersion}`, route_short_name: 'test-route' };
        const fakeIsValid = sandbox.fake.resolves({ isValid: false, validVersion });
        const fakeGetAllRoutes = sandbox.fake.resolves([testRoute]);
        const promiseFake = sandbox.fake.resolves();

        sandbox.stub(ccStatic, 'getAllRoutes').callsFake(fakeGetAllRoutes);
        sandbox.stub(cache, 'isCacheValid').callsFake(fakeIsValid);

        cache.default.routes = {
            bulkAdd: promiseFake,
            clear: promiseFake,
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_ROUTES,
                payload: {
                    routes: {
                        [testRoute.route_id]: {
                            ...testRoute,
                            tokens: [testRoute.route_short_name],
                        },
                    },
                },
            },
            {
                type: ACTION_TYPE.POPULATE_AGENCIES,
                payload: {
                    routes: [{ ...testRoute, tokens: [testRoute.route_short_name] }],
                },
            },
        ];

        await store.dispatch(getRoutes());

        expect(store.getActions()).to.eql(expectedActions);
        expect(fakeIsValid).to.have.callCount(1);
    });

    it('loads routes from cache if cache is valid and populates agencies', async () => {
        const fakeIsValid = sandbox.fake.resolves({ isValid: true, validVersion: 'somevalidversion' });

        sandbox.stub(cache, 'isCacheValid').callsFake(fakeIsValid);

        const testRoute = { route_id: 'test-route' };
        cache.default.routes = {
            toArray: sandbox.fake.resolves([testRoute]),
            clear: sandbox.fake,
        };

        const expectedActions = [
            { type: ACTION_TYPE.FETCH_ROUTES, payload: { routes: { [testRoute.route_id]: testRoute } } },
            { type: ACTION_TYPE.POPULATE_AGENCIES, payload: { routes: [{ route_id: testRoute.route_id }] } },
        ];

        await store.dispatch(getRoutes());

        expect(store.getActions()).to.eql(expectedActions);
        expect(fakeIsValid).to.have.callCount(1);
    });
});
