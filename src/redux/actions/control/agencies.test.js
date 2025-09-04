import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';


import ACTION_TYPE from '../../action-types';
import * as agencies from './agencies';
import * as TRIP_MGT_API from '../../../utils/transmitters/trip-mgt-api';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Agencies actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('Should dispatch agencies fetch action', async () => {
        const fakeAgencies = [
            {
                agencyId: 'PC',
                agencyName: 'Pavlovich Transport Solutions',
            },
            {
                agencyId: 'SLPH',
                agencyName: 'SeaLink Pine Harbour',
            },
        ];
        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_CONTROL_AGENCIES,
                payload: {
                    agencies: fakeAgencies,
                },
            },
        ];
        const getAgencies = sandbox.stub(TRIP_MGT_API, 'getAgencies').resolves(fakeAgencies);
        await store.dispatch(agencies.retrieveAgencies());
        sandbox.assert.calledOnce(getAgencies);
        expect(store.getActions()).to.eql(expectedActions);
    });
});
