import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import ACTION_TYPE from '../../action-types';
import * as notifications from './notifications';
import * as notificationsApi from '../../../utils/transmitters/notifications-api';
import ERROR_TYPE from '../../../types/error-types';

jest.mock('../../../types/error-types', () => ({ fetchNotificationsEnabled: false, fetchNotifications: 'error' }));

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

const defaultNotiStore = {
    datagridConfig: {
        columns: [],
        page: 0,
        pageSize: 15,
        sortModel: [],
        density: 'standard',
        routeSelection: '',
        filterModel: { items: [{
            columnField: 'status',
            operatorValue: 'is',
            value: 'in-progress',
        }],
        linkOperator: 'and' },
        pinnedColumns: { right: ['action'] },
    },
    totalFilterCount: 0,
    lastFilterRequest: null,
};

describe('Notifications actions', () => {
    beforeEach(() => {
        store = mockStore({
            control: {
                notifications: defaultNotiStore,
            },
        });
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    describe('filterNotifications', () => {
        it('Should catch and dispatch banner error', async () => {
            ERROR_TYPE.fetchNotificationsEnabled = true;
            sandbox.stub(notificationsApi, 'getNotifications').rejects();

            const expectedAction = [{
                type: ACTION_TYPE.SET_MODAL_ERROR,
                payload: {
                    error: 'error',
                },
            }];
            await store.dispatch(notifications.filterNotifications(true));
            expect(store.getActions()).toEqual(expectedAction);
        });

        it('Should catch and not dispatch banner error', async () => {
            ERROR_TYPE.fetchNotificationsEnabled = false;
            sandbox.stub(notificationsApi, 'getNotifications').rejects();
            await store.dispatch(notifications.filterNotifications(true));
            expect(store.getActions().length).toEqual(0);
        });
    });
});
