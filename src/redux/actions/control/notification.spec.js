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

const mockNotifications = {
    items: [
        {
            notificationContentId: 'cd00a067-1249-4ad9-9ffb-f365937a447b',
            startTime: 1669777740,
            endTime: null,
            condition: 'draft',
            status: 'in-progress',
            source: {
                identifier: 131113,
                type: 'DISR',
                version: 1,
                title: 'New cause (congestion) new effect (lift not working)',
            },
            cause: 'CONGESTION',
            informedEntities: [
                {
                    informedEntityType: 'route',
                    stops: [],
                    routeId: 'NX1-203',
                    routeShortName: 'NX1',
                    routeType: 3,
                },
            ],
            _links: {
                permissions: [
                    {
                        _rel: 'view',
                    },
                    {
                        _rel: 'edit',
                    },
                ],
            },
        },
    ],
    totalResults: 2194,
    _links: {
        permissions: [
            {
                _rel: 'view',
            },
            {
                _rel: 'edit',
            },
        ],
    },
};

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

        it('Should filter notifications by endTime isEmpty', async () => {
            const fakeGetNotifications = sandbox.fake.resolves(mockNotifications);
            sandbox.stub(notificationsApi, 'getNotifications').callsFake(fakeGetNotifications);

            const storeWithFilter = mockStore({
                control: {
                    notifications: {
                        datagridConfig: {
                            columns: [],
                            page: 0,
                            pageSize: 15,
                            sortModel: [],
                            density: 'standard',
                            routeSelection: '',
                            filterModel: { items: [{
                                columnField: 'endTime',
                                operatorValue: 'isEmpty',
                            }],
                            linkOperator: 'and' },
                            pinnedColumns: { right: ['action'] },
                        },
                        totalFilterCount: 0,
                        lastFilterRequest: null,
                    },
                },
            });

            const expectedFilterAction = {
                payload: {
                    lastFilterRequest: {
                        filters: [
                            {
                                field: 'endTime',
                                operator: 'IS',
                                value: 'NULL',
                            },
                        ],
                        limit: 15,
                        offset: 0,
                        sorts: [],
                    },
                },
                type: 'update-control-notifications-last-filter',
            };

            await storeWithFilter.dispatch(notifications.filterNotifications(true));
            const actualActions = storeWithFilter.getActions();
            const actualFilterAction = actualActions.find(a => a.payload.lastFilterRequest);
            expect(actualFilterAction).toEqual(expectedFilterAction);
        });

        it('Should filter notifications by endTime isNotEmpty', async () => {
            const fakeGetNotifications = sandbox.fake.resolves(mockNotifications);
            sandbox.stub(notificationsApi, 'getNotifications').callsFake(fakeGetNotifications);

            const storeWithFilter = mockStore({
                control: {
                    notifications: {
                        datagridConfig: {
                            columns: [],
                            page: 0,
                            pageSize: 15,
                            sortModel: [],
                            density: 'standard',
                            routeSelection: '',
                            filterModel: { items: [{
                                columnField: 'endTime',
                                operatorValue: 'isNotEmpty',
                            }],
                            linkOperator: 'and' },
                            pinnedColumns: { right: ['action'] },
                        },
                        totalFilterCount: 0,
                        lastFilterRequest: null,
                    },
                },
            });

            const expectedFilterAction = {
                payload: {
                    lastFilterRequest: {
                        filters: [
                            {
                                field: 'endTime',
                                operator: 'IS',
                                value: 'NOT NULL',
                            },
                        ],
                        limit: 15,
                        offset: 0,
                        sorts: [],
                    },
                },
                type: 'update-control-notifications-last-filter',
            };

            await storeWithFilter.dispatch(notifications.filterNotifications(true));
            const actualActions = storeWithFilter.getActions();
            const actualFilterAction = actualActions.find(a => a.payload.lastFilterRequest);
            expect(actualFilterAction).toEqual(expectedFilterAction);
        });
    });
});
