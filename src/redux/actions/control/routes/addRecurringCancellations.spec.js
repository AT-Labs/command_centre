import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import * as TRIP_MGT_API from '../../../../utils/transmitters/trip-mgt-api';
import { CONFIRMATION_MESSAGE_TYPE } from '../../../../types/message-types';
import { saveRecurringCancellationInDatabase } from './addRecurringCancellations';
import ACTION_TYPE from '../../../action-types';

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

const mockResponse = {
    id: 1,
    routeVariantId: '30901',
    startTime: '12:13:00',
    cancelFrom: '2022-08-25T16:00:00.000Z',
    dayPattern: '[4]',
    cancelTo: '2022-08-25T16:00:00.000Z',
    agencyId: 'GBT',
    routeShortName: '309',
};

describe('Add recurring cancellation', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    const mockData = {
        routeVariantId: '30901',
        startTime: '12:13:00',
        cancelFrom: '2022-08-25T16:00:00.000Z',
        dayPattern: '[4]',
        cancelTo: '2022-08-25T16:00:00.000Z',
        agencyId: 'GBT',
        routeShortName: '309',
    };

    it('Update message and loading state', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_IS_LOADING,
                payload: {
                    isLoading: true,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_IS_LOADING,
                payload: {
                    isLoading: false,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_MESSAGE,
                payload: {
                    recurringCancellationId: mockResponse.id,
                    resultStatus: CONFIRMATION_MESSAGE_TYPE,
                    resultMessage: 'Recurring cancellation successfully saved',
                },
            },
        ];

        const fakeUpdateTripStatus = sandbox.fake.resolves(mockResponse);
        sandbox.stub(TRIP_MGT_API, 'recurringUpdateTripStatus').callsFake(fakeUpdateTripStatus);

        await store.dispatch(saveRecurringCancellationInDatabase(mockData));
        expect(store.getActions()).toEqual(expectedActions);
    });
});
