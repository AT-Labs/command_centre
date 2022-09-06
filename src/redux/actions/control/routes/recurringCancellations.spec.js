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
        const mockRecurringCancellationsData = [
            {
                routeVariantId: '810105',
                startTime: '14:41:00',
                cancelFrom: '2022-05-26T12:00:00.000Z',
                cancelTo: '2022-05-25T12:00:00.000Z',
                dayPattern: '[0,1,2,3,4,5,6]',
            },
            {
                routeVariantId: '850076',
                startTime: '14:38:00',
                cancelFrom: '2022-05-26T12:00:00.000Z',
                cancelTo: '2022-05-25T12:00:00.000Z',
                dayPattern: '[0,1,2,3,4,5,6]',
            },
            {
                routeVariantId: '850029',
                startTime: '14:35:00',
                cancelFrom: '2022-05-26T12:00:00.000Z',
                cancelTo: null,
                dayPattern: '[0,1,2,3,4,5,6]',
            },
        ];
        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_RECURRING_CANCELLATIONS,
                payload: {
                    recurringCancellations: mockRecurringCancellationsData,
                },
            },
        ];
        const getRecurringCancellations = sandbox.stub(tripMgtApi, 'getRecurringCancellations').resolves(mockRecurringCancellationsData);
        await store.dispatch(retrieveRecurringCancellations());
        sandbox.assert.calledOnce(getRecurringCancellations);
        expect(store.getActions()).toEqual(expectedActions);
    });
});
