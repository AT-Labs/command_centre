import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import ACTION_TYPE from '../../../action-types';
import { addressSelected } from './address';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Address detail actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    context('addressSelected()', () => {
        it('Should dispatch the update selected adresss action and update search terms', () => {
            const address = {
                address: '48 Valley Road, Mount Eden↵Auckland 1024',
                category: '',
                lat: -36.878854,
                lng: 174.756821,
            };

            const expectedActions = [{
                type: ACTION_TYPE.UPDATE_SELECTED_ADDRESS,
                payload: {
                    address,
                },
            }, {
                type: ACTION_TYPE.UPDATE_SEARCH_TERMS,
                payload: {
                    searchTerms: address.address,
                },
            }];

            store.dispatch(addressSelected(address));
            expect(store.getActions()).eql(expectedActions);
        });
    });
});
