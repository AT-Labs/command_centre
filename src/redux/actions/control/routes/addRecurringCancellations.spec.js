import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import * as TRIP_MGT_API from '../../../../utils/transmitters/trip-mgt-api';
import { CONFIRMATION_MESSAGE_TYPE } from '../../../../types/message-types';
import { saveRecurringCancellationInDatabase, deleteRecurringCancellationInDatabase } from './addRecurringCancellations';
import ACTION_TYPE from '../../../action-types';

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

const mockResponseForAdd = {
    id: 1,
    routeVariantId: '30901',
    startTime: '12:13:00',
    cancelFrom: '2022-08-25T16:00:00.000Z',
    dayPattern: '[4]',
    cancelTo: '2022-08-25T16:00:00.000Z',
    agencyId: 'GBT',
    routeShortName: '309',
};

const mockResponseForDelete = {
    affected: 1,
};

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
];

const expectedMessage = {
    type: ACTION_TYPE.UPDATE_CONTROL_RECURRING_CANCELLATIONS_MESSAGE,
    payload: {
        recurringCancellationId: '',
        resultStatus: CONFIRMATION_MESSAGE_TYPE,
    },
};

const mockApiCall = (action, mockResponse) => {
    const fakeUpdateTripStatus = sandbox.fake.resolves(mockResponse);
    sandbox.stub(TRIP_MGT_API, action).callsFake(fakeUpdateTripStatus);
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

    const addRecurringExpectedActions = [...expectedActions];
    addRecurringExpectedActions.push({
        ...expectedMessage,
        payload: {
            ...expectedMessage.payload,
            resultMessage: 'Recurring cancellation successfully saved',
        },
    });

    it('Update message and loading state when add', async () => {
        mockApiCall('recurringUpdateTripStatus', mockResponseForAdd);

        await store.dispatch(saveRecurringCancellationInDatabase(mockData));
        expect(store.getActions()).toEqual(addRecurringExpectedActions);
    });
});

describe('Delete recurring cancellation', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    const mockData = {
        id: 1,
    };

    const deleteRecurringExpectedActions = [...expectedActions];
    deleteRecurringExpectedActions.push({
        ...expectedMessage,
        payload: {
            ...expectedMessage.payload,
            resultMessage: 'Recurring cancellation 1/1 successfully deleted in database',
        },
    });

    it('Update message and loading state when delete', async () => {
        mockApiCall('recurringDeleteTripStatus', mockResponseForDelete);

        await store.dispatch(deleteRecurringCancellationInDatabase(mockData.id));
        expect(store.getActions()).toEqual(deleteRecurringExpectedActions);
    });
});

describe('Delete multiple recurring cancellation', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    const mockData = [123];

    const deleteRecurringExpectedActions = [...expectedActions];
    deleteRecurringExpectedActions.push({
        ...expectedMessage,
        payload: {
            ...expectedMessage.payload,
            resultMessage: 'Recurring cancellation 1/1 successfully deleted in database',
        },
    });

    it('Update message and loading state when delete', async () => {
        mockApiCall('recurringDeleteTripStatus', mockResponseForDelete);

        await store.dispatch(deleteRecurringCancellationInDatabase(mockData));
        expect(store.getActions()).toEqual(deleteRecurringExpectedActions);
    });
});
