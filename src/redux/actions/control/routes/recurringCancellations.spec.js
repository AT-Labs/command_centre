import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import ACTION_TYPE from '../../../action-types';
import { retrieveRecurringCancellations } from './recurringCancellations';
import * as tripMgtApi from '../../../../utils/transmitters/trip-mgt-api';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Recurring cancellations actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('Should dispatch recurring cancellations fetch action', async () => {
        const mockRecurringCancellationsData = {
            recurringCancellations: [
                {
                    routeVariantId: '86501',
                    startTime: '13:30:00',
                    cancelFrom: '2022-05-18T00:00:00.000Z',
                    cancelTo: null,
                    dayPattern: '[0,1,2,3,4,5,6]',
                    agencyId: null,
                    routeShortName: null,
                },
                {
                    routeVariantId: '810105',
                    startTime: '14:01:00',
                    cancelFrom: '2022-05-18T00:00:00.000Z',
                    cancelTo: null,
                    dayPattern: '[0,1,2,3,4,5,6]',
                    agencyId: null,
                    routeShortName: null,
                },
                {
                    routeVariantId: '820164',
                    startTime: '14:32:00',
                    cancelFrom: '2022-05-18T00:00:00.000Z',
                    cancelTo: null,
                    dayPattern: '[0,1,2,3,4,5,6]',
                    agencyId: null,
                    routeShortName: null,
                },
            ],
            _links: {
                permissions: [
                    {
                        _rel: 'cancel',
                    },
                    {
                        _rel: 'view',
                    },
                    {
                        _rel: 'recurrent_cancel',
                    },
                ],
            },
        };

        const { recurringCancellations, _links: { permissions } } = mockRecurringCancellationsData;

        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_RECURRING_CANCELLATIONS,
                payload: {
                    recurringCancellations,
                },
            },
            {
                type: ACTION_TYPE.FETCH_RECURRING_CANCELLATIONS_PERMISSIONS,
                payload: {
                    permissions,
                },
            },
        ];
        const getRecurringCancellations = sandbox.stub(tripMgtApi, 'getRecurringCancellations').resolves(mockRecurringCancellationsData);
        await store.dispatch(retrieveRecurringCancellations());
        sandbox.assert.calledOnce(getRecurringCancellations);
        expect(store.getActions()).toEqual(expectedActions);
    });
});
