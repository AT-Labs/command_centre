import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { goToRoutesView, goToBlocksView } from './link';
import ACTION_TYPE from '../../action-types';
import VIEW_TYPE from '../../../types/view-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;
const mockTrip = {
    agencyId: '',
    routeVariantId: '11111',
    routeType: 2,
    routeShortName: 'EAST',
    startTime: '06:00:00',
};

describe('Link actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('when going from Blocks to R&T, updates the link and sets the route filters', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE,
                payload: {
                    activeTripInstanceId: null,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_TRIP_CROSS_LINK,
                payload: {
                    ...mockTrip,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_MAIN_VIEW,
                payload: {
                    activeMainView: VIEW_TYPE.MAIN.CONTROL,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView: VIEW_TYPE.CONTROL_DETAIL.ROUTES,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE,
                payload: {
                    activeRouteShortName: mockTrip.routeShortName,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT,
                payload: {
                    activeRouteVariantId: mockTrip.routeVariantId,
                },
            },
            {
                type: ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS,
                payload: {
                    filters: {
                        agencyId: '',
                        depotIds: [],
                        routeType: mockTrip.routeType,
                        isGroupedByRoute: true,
                        isGroupedByRouteVariant: true,
                        startTimeFrom: '',
                        startTimeTo: '',
                        tripStatus: '',
                        routeShortName: '',
                        routeVariantId: '',
                    },
                },
            },
        ];

        await store.dispatch(goToRoutesView(mockTrip,
            {
                agencyId: mockTrip.agencyId,
                routeType: mockTrip.routeType,
                isGroupedByRoute: true,
                isGroupedByRouteVariant: true,
                startTimeFrom: '',
                startTimeTo: '',
                tripStatus: '',
                routeShortName: '',
                routeVariantId: '',
            }));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('when going from R&T to Blocks, updates the link', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_TRIP_CROSS_LINK,
                payload: {
                    ...mockTrip,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DETAIL_VIEW,
                payload: {
                    activeControlDetailView: VIEW_TYPE.CONTROL_DETAIL.BLOCKS,
                },
            },
        ];

        await store.dispatch(goToBlocksView(mockTrip));
        expect(store.getActions()).to.eql(expectedActions);
    });
});
