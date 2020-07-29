import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { updateServiceDate } from './serviceDate';
import ACTION_TYPE from '../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;
const mockDate = '2019-03-21T15:25:39+13:00';

describe('Service date actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('update service date and clean active route, route variant and trip', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_SERVICE_DATE,
                payload: {
                    date: mockDate,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE,
                payload: {
                    activeRouteShortName: null,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT,
                payload: {
                    activeRouteVariantId: null,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE,
                payload: {
                    activeTripInstanceId: null,
                },
            },
        ];

        await store.dispatch(updateServiceDate(mockDate));
        expect(store.getActions()).to.eql(expectedActions);
    });
});
