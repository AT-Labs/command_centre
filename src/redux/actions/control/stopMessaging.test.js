import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import moment from 'moment';

import { updateStopMessage } from './stopMessaging';
import * as stopMessagingApi from '../../../utils/transmitters/stop-messaging-api';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

/* eslint-disable no-param-reassign */
const WEEK_DAYS = moment.weekdays(true).reduce((weekdays, day, index) => {
    weekdays[day] = index;
    return weekdays;
}, {});
/* eslint-enable no-param-reassign */

describe('stop messaging actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('updateStopMessage should call api once', async () => {
        // given
        const fakeApi = sandbox.fake.resolves();
        const fakeMethod = sandbox.stub(stopMessagingApi, 'updateStopMessage').callsFake(fakeApi);
        const payload = {
            startTime: moment(),
            endTime: moment(),
        };

        // when
        await store.dispatch(updateStopMessage(payload, '123', null));

        // then
        sandbox.assert.calledOnce(fakeMethod);
    });

    it('when recurrence updateStopMessage should call api once per day', async () => {
        // given
        const fakeApi = sandbox.fake.resolves();
        const fakeMethod = sandbox.stub(stopMessagingApi, 'updateStopMessage').callsFake(fakeApi);
        const startTime = moment().add(2, 'w').weekday(0);
        const payload = {
            startTime,
            endTime: startTime.clone(),
        };
        const days = [WEEK_DAYS.Wednesday, WEEK_DAYS.Friday];
        const recurrence = {
            weeks: 1,
            days,
        };

        // when
        await store.dispatch(updateStopMessage(payload, '123', recurrence));

        // then
        sandbox.assert.callCount(fakeMethod, days.length);
    });

    it('when recurrence updateStopMessage should send different dates for each day', async () => {
        // given
        const fakeApi = sandbox.fake.resolves();
        const fakeMethod = sandbox.stub(stopMessagingApi, 'updateStopMessage').callsFake(fakeApi);
        const date = moment().add(2, 'w').weekday(0);
        const payload = {
            startTime: date,
            endTime: date.clone(),
        };
        const days = [WEEK_DAYS.Monday, WEEK_DAYS.Wednesday, WEEK_DAYS.Thursday, WEEK_DAYS.Saturday];
        const recurrence = {
            weeks: 1,
            days,
        };

        // when
        await store.dispatch(updateStopMessage(payload, '123', recurrence));

        // then
        days.forEach((day, index) => {
            const expectedDate = date.clone().weekday(day);
            const callArguments = fakeMethod.getCall(index).args[0];
            expect(callArguments.startTime.toJSON()).to.eql(expectedDate.toJSON());
            expect(callArguments.endTime.toJSON()).to.eql(expectedDate.toJSON());
        });
    });

    it('when recurrence updateStopMessage should call api once per day per week', async () => {
        // given
        const fakeApi = sandbox.fake.resolves();
        const fakeMethod = sandbox.stub(stopMessagingApi, 'updateStopMessage').callsFake(fakeApi);
        const date = moment().add(2, 'w').weekday(0);
        const payload = {
            startTime: date,
            endTime: date.clone(),
        };
        const weeks = 3;
        const days = [WEEK_DAYS.Tuesday, WEEK_DAYS.Thursday];
        const recurrence = {
            weeks,
            days,
        };

        // when
        await store.dispatch(updateStopMessage(payload, '123', recurrence));

        // then
        sandbox.assert.callCount(fakeMethod, weeks * days.length);
    });

    it('when recurrence updateStopMessage should send different dates for each day of each week', async () => {
        // given
        const fakeApi = sandbox.fake.resolves();
        const fakeMethod = sandbox.stub(stopMessagingApi, 'updateStopMessage').callsFake(fakeApi);
        const date = moment().add(2, 'w').weekday(0);
        const payload = {
            startTime: date,
            endTime: date,
        };
        const weeks = 3;
        const days = [WEEK_DAYS.Monday, WEEK_DAYS.Wednesday, WEEK_DAYS.Thursday, WEEK_DAYS.Saturday];
        const recurrence = {
            weeks,
            days,
        };

        // when
        await store.dispatch(updateStopMessage(payload, '123', recurrence));

        // then
        for (let i = 1; i < weeks; i++) {
            const week = i - 1;
            const expectedDate = date.clone().add(week, 'w');
            days.forEach((day, index) => {
                expectedDate.weekday(day);
                const callArguments = fakeMethod.getCall(index + (week * days.length)).args[0];
                expect(callArguments.startTime.toJSON()).to.eql(expectedDate.toJSON());
                expect(callArguments.endTime.toJSON()).to.eql(expectedDate.toJSON());
            });
        }
    });

    it('when recurrence updateStopMessage should skip dates that are before the event start date', async () => {
        // given
        const fakeApi = sandbox.fake.resolves();
        const fakeMethod = sandbox.stub(stopMessagingApi, 'updateStopMessage').callsFake(fakeApi);
        const date = moment().add(2, 'w').weekday(4);
        const payload = {
            startTime: date,
            endTime: date,
        };
        const weeks = 1;
        const days = [WEEK_DAYS.Monday, WEEK_DAYS.Wednesday, WEEK_DAYS.Thursday, WEEK_DAYS.Saturday];
        const recurrence = {
            weeks,
            days,
        };

        // when
        await store.dispatch(updateStopMessage(payload, '123', recurrence));

        // then
        sandbox.assert.callCount(fakeMethod, 1);

        const expectedDate = date.clone().weekday(5);
        const callArguments = fakeMethod.getCall(0).args[0];
        expect(callArguments.startTime.toJSON()).to.eql(expectedDate.toJSON());
        expect(callArguments.endTime.toJSON()).to.eql(expectedDate.toJSON());
    });
});
