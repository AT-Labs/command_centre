import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import moment from 'moment-timezone';

import { parseStartAndDateTime, getNotifications } from './notifications';
import * as notificationsApi from '../../../utils/transmitters/notifications-api';
import DATE_TYPE from '../../../types/date-types';
import ACTION_TYPE from '../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;
const mockNotifications = [
    {
        id: 'MjAxOS0wNy0xMVQxM3wxMzozNTowMHxNaXNzZWR8MTI2MC0yOTUwMi00ODkwMC0yLVpLU2V4TQ==',
        createdAt: '2019-07-11T01:41:00.785Z',
        modifiedAt: '2019-07-11T01:41:00.785Z',
        modifiedBy: 'www-dev-at-trip-alerts-api-01',
        type: 'Missed',
        status: 'Active',
        severity: 'High',
        tripId: '1260-29502-48900-2-ZKSexM',
        routeId: '',
        routeShortName: '295',
        routeVariantId: '29502',
        routeType: 3,
        agencyId: 'NZB',
        tripStartDate: '20190710',
        tripStartTime: '13:13:00',
        message: 'Trip 1260-29502-48900-2-ZKSexM has not started after 5 minutes',
    },
    {
        id: 'MjAxOS0wNy0xMVQxNHwxNDoxNTowMHxNaXNzZWR8MTI4Ny03MzExMi01MTMwMC0yLVp6cmxQZw==',
        createdAt: '2019-07-11T02:21:02.239Z',
        modifiedAt: '2019-07-11T02:21:02.239Z',
        modifiedBy: 'www-dev-at-trip-alerts-api-01',
        type: 'Missed',
        status: 'Active',
        severity: 'High',
        tripId: '1287-73112-51300-2-ZzrlPg',
        routeId: '',
        routeShortName: 'OUT',
        routeVariantId: '73112',
        routeType: 3,
        agencyId: 'NZB',
        tripStartDate: '20190710',
        tripStartTime: '14:15:00',
        message: 'Trip 1287-73112-51300-2-ZzrlPg has not started after 5 minutes',
        customMessage: 'No vehicle has started scheduled trip 73112 - 14:15 for 7 minutes from scheduled departure',
    },
];
const getDiffFromScheduleTimeInMins = (date) => {
    const startDateAndTime = parseStartAndDateTime(date || mockNotifications[0].tripStartDate, mockNotifications[0].tripStartTime);
    return moment.tz(DATE_TYPE.TIME_ZONE).diff(startDateAndTime, 'minutes');
};

describe('Notifications actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    context('parseStartAndDateTime', () => {
        it('should return a properly parsed date', () => {
            const expectedDate = 'Wed Jul 10 2019 13:13:00 GMT+1200';
            const parsedDate = parseStartAndDateTime(mockNotifications[0].tripStartDate, mockNotifications[0].tripStartTime).toString();
            expect(parsedDate).to.eql(expectedDate);
        });
    });

    context('getNotificationMessage', () => {
        it('should return a properly formatted message', () => {
            const expectedMessage = `No vehicle has started scheduled trip 29502 - 13:13 for ${getDiffFromScheduleTimeInMins()} minutes from scheduled departure`;
            const tripStartDateKeptUpToDate = moment.tz(DATE_TYPE.TIME_ZONE).format('YYYYMMDD');
            const expectedResponse = [
                {
                    ...mockNotifications[0],
                    tripStartDate: tripStartDateKeptUpToDate,
                    customMessage: expectedMessage,
                },
            ];
            const fakeGetNotifications = sandbox.fake.resolves(expectedResponse);
            sandbox.stub(notificationsApi, 'getNotifications').callsFake(fakeGetNotifications);
            expect(expectedResponse[0].customMessage).to.eql(expectedMessage);
        });
    });

    context('getNotifications', () => {
        it('should trigger the expected actions and return one notification given just one is within the last 12hs', async () => {
            const tripStartDateKeptUpToDate = moment.tz(DATE_TYPE.TIME_ZONE).format('YYYYMMDD');
            const expectedResponse = [
                {
                    ...mockNotifications[0],
                    tripStartDate: tripStartDateKeptUpToDate,
                    customMessage: `No vehicle has started scheduled trip 29502 - 13:13 for ${getDiffFromScheduleTimeInMins(tripStartDateKeptUpToDate)} minutes from scheduled departure`,
                },
            ];

            const fakeGetNotifications = sandbox.fake.resolves(expectedResponse);
            sandbox.stub(notificationsApi, 'getNotifications').callsFake(fakeGetNotifications);

            const expectedActions = [
                {
                    type: ACTION_TYPE.FETCH_CONTROL_NOTIFICATIONS,
                    payload: {
                        notifications: expectedResponse,
                    },
                },
            ];

            await store.dispatch(getNotifications());
            expect(store.getActions()).deep.equal(expectedActions);
        });
    });
});
