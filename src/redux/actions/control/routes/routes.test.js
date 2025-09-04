import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { fetchRoutes, clearRoutes, updateActiveRoute, clearActiveRoute } from './routes';
import * as tripMgtApi from '../../../../utils/transmitters/trip-mgt-api';
import ACTION_TYPE from '../../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

const mockRoutes = {
    count: 2,
    routes: [{
        routeShortName: '1',
        routeType: 3,
        routeVariants: [{
            routeVariantId: '00001',
            routeLongName: 'variant1',
            agencyName: 'Waiheke Bus Company',
        }, {
            routeVariantId: '00002',
            routeLongName: 'variant2',
            agencyName: 'Waiheke Bus Company',
        }],
        agencyId: 'WBC',
        agencyName: 'Waiheke Bus Company',
    }, {
        routeShortName: '2',
        routeType: 3,
        routeVariants: [{
            routeVariantId: '00003',
            routeLongName: 'variant3',
            agencyName: 'Waiheke Bus Company',
        }, {
            routeVariantId: '00004',
            routeLongName: 'variant4',
            agencyName: 'Waiheke Bus Company',
        }],
        agencyId: 'WBC',
        agencyName: 'Waiheke Bus Company',
    }],
};

const mockStoreRoutes = [
    {
        routeShortName: '1',
        routeType: 3,
        routeVariants: [{
            routeVariantId: '00001',
            routeLongName: 'variant1',
            agencyName: 'Waiheke Bus Company',
        }, {
            routeVariantId: '00002',
            routeLongName: 'variant2',
            agencyName: 'Waiheke Bus Company',
        }],
        agencyId: 'WBC',
        agencyName: 'Waiheke Bus Company',
        description: 'variant1',
    },
    {
        routeShortName: '2',
        routeType: 3,
        routeVariants: [{
            routeVariantId: '00003',
            routeLongName: 'variant3',
            agencyName: 'Waiheke Bus Company',
        }, {
            routeVariantId: '00004',
            routeLongName: 'variant4',
            agencyName: 'Waiheke Bus Company',
        }],
        agencyId: 'WBC',
        agencyName: 'Waiheke Bus Company',
        description: 'variant3',
    },
];

const mockStoreRouteVariants = {
    '00001': {
        agencyName: 'Waiheke Bus Company',
        routeLongName: 'variant1',
        routeVariantId: '00001',
    },
    '00002': {
        agencyName: 'Waiheke Bus Company',
        routeLongName: 'variant2',
        routeVariantId: '00002',
    },
    '00003': {
        agencyName: 'Waiheke Bus Company',
        routeLongName: 'variant3',
        routeVariantId: '00003',
    },
    '00004': {
        agencyName: 'Waiheke Bus Company',
        routeLongName: 'variant4',
        routeVariantId: '00004',
    },
};

describe('Routes actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('gets all routes and key by routeShortName; update routes and route variants', async () => {
        const fakeGetRoutes = sandbox.fake.resolves(mockRoutes);
        sandbox.stub(tripMgtApi, 'getRoutes').callsFake(fakeGetRoutes);

        const variables = {
            routeType: 3,
            serviceDate: '20190322',
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ROUTES_LOADING,
                payload: {
                    isLoading: true,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS_LOADING,
                payload: {
                    isLoading: true,
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
                type: ACTION_TYPE.CLEAR_CONTROL_ROUTES,
                payload: { },
            },
            {
                type: ACTION_TYPE.CLEAR_CONTROL_ROUTE_VARIANTS,
                payload: {},
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_ROUTES,
                payload: {
                    routes: mockStoreRoutes,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS,
                payload: {
                    routeVariants: mockStoreRouteVariants,
                },
            },
        ];

        await store.dispatch(fetchRoutes(variables));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('gets all routes and also set active route and route variant when link is available', async () => {
        const fakeGetRoutes = sandbox.fake.resolves(mockRoutes);
        sandbox.stub(tripMgtApi, 'getRoutes').callsFake(fakeGetRoutes);

        const variables = {
            routeType: 3,
            serviceDate: '20190322',
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ROUTES_LOADING,
                payload: {
                    isLoading: true,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS_LOADING,
                payload: {
                    isLoading: true,
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
                type: ACTION_TYPE.CLEAR_CONTROL_ROUTES,
                payload: { },
            },
            {
                type: ACTION_TYPE.CLEAR_CONTROL_ROUTE_VARIANTS,
                payload: {},
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_ROUTES,
                payload: {
                    routes: mockStoreRoutes,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ROUTE_VARIANTS,
                payload: {
                    routeVariants: mockStoreRouteVariants,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE,
                payload: {
                    activeRouteShortName: '1',
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT,
                payload: {
                    activeRouteVariantId: null,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT,
                payload: {
                    activeRouteVariantId: '00001',
                },
            },
        ];

        const storeWithLink = mockStore({
            control: {
                link: {
                    routeVariantId: '00001',
                    routeType: 3,
                    tripId: '123',
                    routeShortName: '1',
                },
            },
        });

        await storeWithLink.dispatch(fetchRoutes(variables));
        expect(storeWithLink.getActions()).to.eql(expectedActions);
    });

    it('clears all routes and route variants', async () => {
        const fakeGetRoutes = sandbox.fake.resolves(mockRoutes);
        sandbox.stub(tripMgtApi, 'getRoutes').callsFake(fakeGetRoutes);

        const expectedActions = [
            {
                type: ACTION_TYPE.CLEAR_CONTROL_ROUTES,
                payload: { },
            },
            {
                type: ACTION_TYPE.CLEAR_CONTROL_ROUTE_VARIANTS,
                payload: {},
            },
        ];

        await store.dispatch(clearRoutes());
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('sets active route and clears active route variant', async () => {
        const fakeGetRoutes = sandbox.fake.resolves(mockRoutes);
        sandbox.stub(tripMgtApi, 'getRoutes').callsFake(fakeGetRoutes);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE,
                payload: {
                    activeRouteShortName: '1',
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT,
                payload: {
                    activeRouteVariantId: null,
                },
            },
        ];

        await store.dispatch(updateActiveRoute('1'));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('clears active route and active route variant', async () => {
        const fakeGetRoutes = sandbox.fake.resolves(mockRoutes);
        sandbox.stub(tripMgtApi, 'getRoutes').callsFake(fakeGetRoutes);

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
        ];

        await store.dispatch(clearActiveRoute());
        expect(store.getActions()).to.eql(expectedActions);
    });
});
