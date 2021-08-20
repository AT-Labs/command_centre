import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { getStops } from './stops';
import * as cache from '../../../utils/cache';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

describe('stops actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('should load stops from server if cache is invalid', async () => {
        const validVersion = 'valid-version';
        const testStop = {
            location_type: 0,
            route_type: 2,
            parent_stop_code: 'stop-code',
            stop_code: 'stop-code',
            stop_id: `stop-code-${validVersion}`,
            stop_name: 'Stop Name',
        };
        const testStopType = {
            route_type: 2,
            stop_code: 'stop-code',
            parent_stop_code: 'stop-code',
        };
        const tokens = ['stop', 'name', 'stop-code'];
        const fakeIsValid = sandbox.fake.resolves({ isValid: false, validVersion });
        const fakeGetAllStops = sandbox.fake.resolves([testStop]);
        const fakeGetAllStopTypes = sandbox.fake.resolves([testStopType]);
        const promiseFake = sandbox.fake.resolves();

        const getAllStops = sandbox.stub(ccStatic, 'getAllStops').callsFake(fakeGetAllStops);
        const getAllStopTypes = sandbox.stub(ccStatic, 'getAllStopTypes').callsFake(fakeGetAllStopTypes);
        const isCacheValid = sandbox.stub(cache, 'isCacheValid').callsFake(fakeIsValid);

        cache.default.stops = {
            bulkAdd: promiseFake,
            clear: promiseFake,
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_STOPS,
                payload: {
                    all: {
                        [testStop.stop_code]: {
                            ...testStop,
                            tokens,
                        },
                    },
                },
            },
        ];

        await store.dispatch(getStops());
        expect(store.getActions()).to.eql(expectedActions);
        expect(fakeIsValid).to.have.callCount(1);
        sandbox.assert.calledOnce(getAllStops);
        sandbox.assert.calledOnce(getAllStopTypes);
        sandbox.assert.calledOnce(isCacheValid);

        ccStatic.getAllStops.restore();
        ccStatic.getAllStopTypes.restore();
        cache.isCacheValid.restore();
    });

    it('should load stops from cache if cache is valid', async () => {
        const fakeIsValid = sandbox.fake.resolves({ isValid: true, validVersion: 'somevalidversion' });

        sandbox.stub(cache, 'isCacheValid').callsFake(fakeIsValid);

        const validVersion = 'valid-version';
        const testStop = {
            stop_code: 'stop-code',
            stop_id: `stop-code-${validVersion}`,
            stop_name: 'Stop Name',
        };
        cache.default.stops = {
            toArray: sandbox.fake.resolves([testStop]),
            clear: sandbox.fake,
        };

        const expectedActions = [
            { type: ACTION_TYPE.FETCH_STOPS, payload: { all: { [testStop.stop_code]: testStop } } },
        ];

        await store.dispatch(getStops());

        expect(store.getActions()).to.eql(expectedActions);
        expect(fakeIsValid).to.have.callCount(1);
    });
});
