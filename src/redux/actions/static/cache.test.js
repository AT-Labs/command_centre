import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { setCache } from './cache';
import * as cache from '../../../utils/cache';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

describe('cache actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('loads routes/stops/route mappings from server if cache is not valid', async () => {
        const validVersion = 'valid-version';
        const testRoute = { route_id: `test-route-${validVersion}`, route_short_name: 'test-route' };
        const testStop = { stop_id: 'test-stop-id', stop_name: 'test-stop-name', stop_code: 'test-stop-id' };
        const testStopType = { stop_code: 'test-stop-id', route_type: 2, parent_stop_code: null };
        const fakeIsValid = sandbox.fake.resolves({ isValid: false, validVersion });

        sandbox.stub(ccStatic, 'getAllRoutes').callsFake(sandbox.fake.resolves([testRoute]));
        sandbox.stub(ccStatic, 'getAllStops').callsFake(sandbox.fake.resolves([testStop]));
        sandbox.stub(ccStatic, 'getAllStopTypes').callsFake(sandbox.fake.resolves([testStopType]));
        sandbox.stub(cache, 'isCacheValid').callsFake(fakeIsValid);

        const cacheFunctions = {
            bulkAdd: sandbox.fake.resolves(),
            clear: sandbox.fake.resolves(),
        };
        cache.default.routes = cacheFunctions;
        cache.default.stops = cacheFunctions;

        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_ROUTES,
                payload: {
                    routes: {
                        [testRoute.route_id]: testRoute,
                    },
                },
            },
            {
                type: ACTION_TYPE.POPULATE_AGENCIES,
                payload: {
                    routes: [testRoute],
                },
            },
            {
                type: ACTION_TYPE.FETCH_STOPS,
                payload: {
                    all: {
                        [testStop.stop_id]: { ...testStop, ...testStopType, tokens: [testStop.stop_name, testStop.stop_id] },
                    },
                },
            },
        ];

        await store.dispatch(setCache());

        expect(store.getActions()).to.eql(expectedActions);
        expect(fakeIsValid).to.have.callCount(1);
    });

    it('loads routes/stops/route mappings from cache if cache is valid', async () => {
        const fakeIsValid = sandbox.fake.resolves({ isValid: true, validVersion: 'somevalidversion' });

        sandbox.stub(cache, 'isCacheValid').callsFake(fakeIsValid);

        const testRoute = { route_id: 'test-route' };
        const testStop = { stop_id: 'test-stop-id', stop_name: 'test-stop-name', stop_code: 'test-stop-id' };
        cache.default.routes = {
            toArray: sandbox.fake.resolves([testRoute]),
            clear: sandbox.fake,
        };
        cache.default.stops = {
            toArray: sandbox.fake.resolves([testStop]),
            clear: sandbox.fake,
        };

        const expectedActions = [
            { type: ACTION_TYPE.FETCH_STOPS, payload: { all: { [testStop.stop_id]: testStop } } },
            { type: ACTION_TYPE.FETCH_ROUTES, payload: { routes: { [testRoute.route_id]: testRoute } } },
            { type: ACTION_TYPE.POPULATE_AGENCIES, payload: { routes: [{ route_id: testRoute.route_id }] } },
        ];

        await store.dispatch(setCache());

        expect(store.getActions()).to.eql(expectedActions);
        expect(fakeIsValid).to.have.callCount(1);
    });
});
