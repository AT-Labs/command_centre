import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import ACTION_TYPE from '../../../action-types';
import { clearDetail } from './common';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Common detail actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    context('clearDetail()', () => {
        it('Should clear the detail', () => {
            const expectedActions = [
                {
                    type: ACTION_TYPE.MERGE_VEHICLE_FILTERS,
                    payload: { filters: { predicate: null } },
                },
                {
                    type: ACTION_TYPE.UPDATE_VISIBLE_STOPS,
                    payload: { visible: null },
                },
                {
                    type: ACTION_TYPE.CLEAR_DETAIL,
                    payload: { isReplace: false },
                },
            ];

            store.dispatch(clearDetail());

            expect(store.getActions()).to.eql(expectedActions);
        });
    });
});
