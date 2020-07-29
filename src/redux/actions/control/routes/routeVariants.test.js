import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { clearRouteVariants, updateActiveRouteVariant, clearActiveRouteVariant } from './routeVariants';
import ACTION_TYPE from '../../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

describe('Route variants actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('clears route variants', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.CLEAR_CONTROL_ROUTE_VARIANTS,
                payload: {},
            },
        ];

        await store.dispatch(clearRouteVariants());
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('clears active route variant', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT,
                payload: {
                    activeRouteVariantId: null,
                },
            },
        ];

        await store.dispatch(clearActiveRouteVariant());
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('updates active route variant', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_ROUTE_VARIANT,
                payload: {
                    activeRouteVariantId: '11111',
                },
            },
        ];

        await store.dispatch(updateActiveRouteVariant('11111'));
        expect(store.getActions()).to.eql(expectedActions);
    });
});
