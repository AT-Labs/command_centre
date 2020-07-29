import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import ACTION_TYPE from '../action-types';
import { updateRealTimeDetailView } from './navigation';
import * as selectorsNavigation from '../selectors/navigation';

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

    context('updateRealTimeDetailView()', () => {
        it('Should display the current detail view and toggle side panel', () => {
            const view = 'vehicle-real-time-view';
            store.dispatch(updateRealTimeDetailView(view));
            const expectedActions = [
                {
                    type: ACTION_TYPE.TOGGLE_RT_SIDE_PANEL,
                },
                {
                    type: ACTION_TYPE.DISPLAY_REAL_TIME_DETAIL,
                    payload: {
                        activeRealTimeDetailView: view,
                    },
                },
            ];
            expect(store.getActions()).eql(expectedActions);
            store.clearActions();
        });

        it('Should display the current detail view and shouldn`t toggle side panel', () => {
            const view = 'vehicle-real-time-view';
            sandbox.stub(selectorsNavigation, 'getRealTimeSidePanelIsOpen').returns(true);

            store.dispatch(updateRealTimeDetailView(view));
            const expectedActions = [
                {
                    type: ACTION_TYPE.DISPLAY_REAL_TIME_DETAIL,
                    payload: {
                        activeRealTimeDetailView: view,
                    },
                },
            ];
            expect(store.getActions()).eql(expectedActions);
            store.clearActions();
        });
    });
});
