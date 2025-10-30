import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { handleRealTimeUpdate } from './vehicles';
import ACTION_TYPE from '../../action-types';
import VIEW_TYPE from '../../../types/view-types';

chai.use(sinonChai);

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
let store;

const vehicleMockDefault = {
    id: '26186',
    vehicle: {
        vehicle: {
            id: '26186',
            label: 'GB 5274',
        },
        trip: {
            tripId: 'trip-id',
            routeId: 'route-id',
        },
        timestamp: '1536018906',
        position: {
            bearing: 110,
            latitude: -36.61226333333333,
            longitude: 174.677955,
        },
    },
};
const expectedActions = [
    {
        type: ACTION_TYPE.FETCH_VEHICLES_REALTIME,
        payload: {
            shouldUseDiversion: false,
            vehicles: {
                [vehicleMockDefault.vehicle.vehicle.id]: vehicleMockDefault,
            },
        },
    },
];

describe('vehicles actions', () => {
    beforeEach(() => {
        const mockStore = configureMockStore([thunk]);
        store = mockStore({
            navigation: { activeMainView: VIEW_TYPE.MAIN.REAL_TIME },
            static: {
                fleet: {
                    26186: {},
                },
            },
        });
    });

    it('should update vehicles in store if vehicle update is valid', async () => {
        store.dispatch(handleRealTimeUpdate(vehicleMockDefault));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('shouldn\'t update vehicles in store if vehicle\'s timestamp is < than the existing in cache', async () => {
        await sleep(1000);
        store.dispatch(handleRealTimeUpdate(vehicleMockDefault)); // this action will cache the vehicle
        expect(store.getActions()).to.eql(expectedActions);

        store.clearActions();
        const vehicleMockLowerTimestamp = JSON.parse(JSON.stringify(vehicleMockDefault));
        vehicleMockLowerTimestamp.vehicle.timestamp = '1536011901';

        store.dispatch(handleRealTimeUpdate(vehicleMockLowerTimestamp)); // this action won't cache since the timestamp is lower
        expect(store.getActions()).to.eql([]);
    });

    it('shouldn\'t update vehicles in store if vehicle has already been cached', async () => {
        await sleep(1000);
        store.dispatch(handleRealTimeUpdate(vehicleMockDefault)); // this action will cache the vehicle
        expect(store.getActions()).to.eql(expectedActions);

        store.clearActions();

        store.dispatch(handleRealTimeUpdate(vehicleMockDefault)); // this action won't cache since the vehicle already exists
        expect(store.getActions()).to.eql([]);
    });
});
