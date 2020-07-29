import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { fetchPlatforms } from './platforms';
import * as tripMgtApi from '../../../utils/transmitters/trip-mgt-api';
import ACTION_TYPE from '../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

const mockPlatforms = [{
    stopId: '1-1',
    children: [{
        stopId: '2-1',
        stopName: 'Test21',
        stopCode: '21',
    }, {
        stopId: '2-2',
        stopName: 'Test22',
        stopCode: '22',
    }],
}, {
    stopId: '1-2',
    children: [{
        stopId: '3-1',
        stopName: 'Test31',
        stopCode: '31',
    }, {
        stopId: '3-2',
        stopName: 'Test32',
        stopCode: '32',
    }],
}];
const mockKeyedByStopIdPlatforms = {
    '1-1': {
        stopId: '1-1',
        children: [{
            stopId: '2-1',
            stopName: 'Test21',
            stopCode: '21',
        }, {
            stopId: '2-2',
            stopName: 'Test22',
            stopCode: '22',
        }],
    },
    '1-2': {
        stopId: '1-2',
        children: [{
            stopId: '3-1',
            stopName: 'Test31',
            stopCode: '31',
        }, {
            stopId: '3-2',
            stopName: 'Test32',
            stopCode: '32',
        }],
    },
};

describe('Platforms actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('get all platforms and key by stop ID', async () => {
        const fakeGetPlatforms = sandbox.fake.resolves(mockPlatforms);
        sandbox.stub(tripMgtApi, 'getPlatforms').callsFake(fakeGetPlatforms);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_PLATFORMS,
                payload: {
                    platforms: mockKeyedByStopIdPlatforms,
                },
            },
        ];

        await store.dispatch(fetchPlatforms());
        expect(store.getActions()).to.eql(expectedActions);
    });
});
