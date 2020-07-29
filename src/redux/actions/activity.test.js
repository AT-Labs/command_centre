import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';

import ACTION_TYPE from '../action-types';
import * as activity from './activity';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Activity actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('Should dispatch data loading action', () => {
        const expectedAction = [{
            type: ACTION_TYPE.DATA_LOADING,
            payload: {
                isLoading: true,
            },
        }];
        store.dispatch(activity.updateDataLoading(true));
        expect(store.getActions()).to.eql(expectedAction);
    });

    it('Should dispatch report error action', () => {
        const expectedAction = [{
            type: ACTION_TYPE.DATA_ERROR,
            payload: {
                error: 'Some error',
            },
        }];
        store.dispatch(activity.reportError('Some error'));
        expect(store.getActions()).to.eql(expectedAction);
    });

    it('Should dispatch dismiss error action', () => {
        const expectedAction = [{
            type: ACTION_TYPE.DISMISS_DATA_ERROR,
            payload: {
                errorType: 'Error Type',
            },
        }];
        store.dispatch(activity.dismissError('Error Type'));
        expect(store.getActions()).to.eql(expectedAction);
    });
});
