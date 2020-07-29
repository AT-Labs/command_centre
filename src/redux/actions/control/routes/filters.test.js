import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { mergeRouteFilters } from './filters';
import ACTION_TYPE from '../../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;
const mockFilters = {
    agencyId: 'NZB',
    depotIds: [],
    routeType: '2',
    isGroupedByRoute: true,
    isGroupedByRouteVariant: false,
    startTimeFrom: '2019-03-21T15:25:39+13:00',
    startTimeTo: '2019-03-22T15:25:39+13:00',
    tripStatus: 'CANCELLED',
};

describe('R&T filters actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('updates filters with cleaning active route, route variant and trip by default', async () => {
        const expectedActions = [
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
            {
                type: ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS,
                payload: {
                    filters: mockFilters,
                },
            },
        ];

        await store.dispatch(mergeRouteFilters(mockFilters));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('updates filters without cleaning active route, route variant and trip', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS,
                payload: {
                    filters: mockFilters,
                },
            },
        ];

        await store.dispatch(mergeRouteFilters(mockFilters, false));
        expect(store.getActions()).to.eql(expectedActions);
    });
});
