import moment from 'moment-timezone';
import DATE_TYPE from '../types/date-types';
import { utcDateFormatWithoutTZ } from './dateUtils';
import { calculateActivePeriods } from './recurrence';

const activePeriodsNotStarted = [
    { startTime: moment.tz(DATE_TYPE.TIME_ZONE).add(1, 'd').unix(), endTime: moment.tz(DATE_TYPE.TIME_ZONE).add(1, 'd').add(1, 'h').unix() },
    { startTime: moment.tz(DATE_TYPE.TIME_ZONE).add(2, 'd').unix(), endTime: moment.tz(DATE_TYPE.TIME_ZONE).add(2, 'd').add(1, 'h').unix() },
    { startTime: moment.tz(DATE_TYPE.TIME_ZONE).add(3, 'd').unix(), endTime: moment.tz(DATE_TYPE.TIME_ZONE).add(3, 'd').add(1, 'h').unix() },
];

const activePeriodsOneComplete = [
    { startTime: moment.tz(DATE_TYPE.TIME_ZONE).subtract(1, 'd').add(1, 'h').unix(), endTime: moment.tz(DATE_TYPE.TIME_ZONE).subtract(1, 'd').add(2, 'h').unix() },
    { startTime: moment.tz(DATE_TYPE.TIME_ZONE).add(1, 'h').unix(), endTime: moment.tz(DATE_TYPE.TIME_ZONE).add(2, 'h').unix() },
    { startTime: moment.tz(DATE_TYPE.TIME_ZONE).add(1, 'd').add(1, 'h').unix(), endTime: moment.tz(DATE_TYPE.TIME_ZONE).add(1, 'd').add(2, 'h').unix() },
];

const activePeriodsOneCompleteAndOneCurrent = [
    { startTime: moment.tz(DATE_TYPE.TIME_ZONE).subtract(1, 'd').subtract(5, 'm').unix(),
        endTime: moment.tz(DATE_TYPE.TIME_ZONE).subtract(1, 'd').add(2, 'h').subtract(5, 'm')
            .unix() },
    { startTime: moment.tz(DATE_TYPE.TIME_ZONE).subtract(5, 'm').unix(), endTime: moment.tz(DATE_TYPE.TIME_ZONE).add(2, 'h').subtract(5, 'm').unix() },
    { startTime: moment.tz(DATE_TYPE.TIME_ZONE).add(1, 'd').subtract(5, 'm').unix(),
        endTime: moment.tz(DATE_TYPE.TIME_ZONE).add(1, 'd').add(2, 'h').subtract(5, 'm')
            .unix() },
];

const setUpPattern = (startDate, endDate) => ({
    freq: 2,
    until: moment.tz(endDate, DATE_TYPE.TIME_ZONE).utc(true).format(`${utcDateFormatWithoutTZ}.000Z`),
    dtstart: moment.tz(startDate, DATE_TYPE.TIME_ZONE).utc(true).format(`${utcDateFormatWithoutTZ}.000Z`),
    byweekday: [0, 1, 2, 3, 4, 5, 6],
});

describe('recurrence.js', () => {
    describe('daylight savings', () => {
        it('should return correct times when daylight savings changes during the periods selected', () => {
            const startDate = moment.utc('2022-03-31T03:00:00.000Z');
            const endDate = moment.utc('2022-04-05T04:00:00.000Z');
            const pattern = setUpPattern(startDate, endDate);

            const newActivePeriods = calculateActivePeriods(pattern, 1, [], false);

            // ensure all periods have the same start time
            newActivePeriods.forEach((period) => {
                expect(moment.unix(period.startTime).tz(DATE_TYPE.TIME_ZONE).format('HH:mm')).toEqual(startDate.tz(DATE_TYPE.TIME_ZONE).format('HH:mm'));
            });
        });
    });

    describe('recurrence calculate active periods when disruption is not resolved', () => {
        it('Should return all new active periods when there are no existing periods', () => {
            const startDate = moment.tz(DATE_TYPE.TIME_ZONE).add(3, 'd');
            const endDate = moment.tz(DATE_TYPE.TIME_ZONE).add(6, 'd');
            const pattern = setUpPattern(startDate, endDate);

            const newActivePeriods = calculateActivePeriods(pattern, 1, [], false);

            expect(newActivePeriods.length).toEqual(4);
            expect(newActivePeriods[0].startTime).toEqual(startDate.unix());
            expect(newActivePeriods[0].endTime).toEqual(startDate.add(1, 'h').unix());
            expect(newActivePeriods[3].startTime).toEqual(endDate.unix());
            expect(newActivePeriods[3].endTime).toEqual(endDate.add(1, 'h').unix());
        });

        it('Should return all new active periods when no period has started', () => {
            const startDate = moment.tz(DATE_TYPE.TIME_ZONE).add(3, 'd');
            const endDate = moment.tz(DATE_TYPE.TIME_ZONE).add(6, 'd');
            const pattern = setUpPattern(startDate, endDate);

            const newActivePeriods = calculateActivePeriods(pattern, 1, activePeriodsNotStarted, false);

            expect(newActivePeriods.length).toEqual(4);
            expect(newActivePeriods[0].startTime).toEqual(startDate.unix());
            expect(newActivePeriods[0].endTime).toEqual(startDate.add(1, 'h').unix());
            expect(newActivePeriods[3].startTime).toEqual(endDate.unix());
            expect(newActivePeriods[3].endTime).toEqual(endDate.add(1, 'h').unix());
        });

        it('Should return one past active period and 2 new active periods when one period has completed and the duration is extended', () => {
            const startDate = moment.unix(activePeriodsOneComplete[0].startTime);
            const endDate = moment.unix(activePeriodsOneComplete[2].endTime);
            const pattern = setUpPattern(startDate, endDate);

            const newActivePeriods = calculateActivePeriods(pattern, 2, activePeriodsOneComplete, false);

            expect(newActivePeriods.length).toEqual(3);
            expect(newActivePeriods[0]).toEqual(activePeriodsOneComplete[0]);
            expect(newActivePeriods[1].startTime).toEqual(activePeriodsOneComplete[1].startTime);
            expect(newActivePeriods[1].endTime).toEqual(moment.unix(activePeriodsOneComplete[1].startTime).add(2, 'h').unix());
        });

        it(`Should return one past active period and one current period with the endtime changed and one new period 
            when one period has completed, one started and the duration is changed`, () => {
            const startDate = moment.unix(activePeriodsOneCompleteAndOneCurrent[0].startTime);
            const endDate = moment.unix(activePeriodsOneCompleteAndOneCurrent[2].endTime);
            const pattern = setUpPattern(startDate, endDate);

            const newActivePeriods = calculateActivePeriods(pattern, 2, activePeriodsOneCompleteAndOneCurrent, false);

            expect(newActivePeriods.length).toEqual(3);
            expect(newActivePeriods[0]).toEqual(activePeriodsOneCompleteAndOneCurrent[0]);
            expect(newActivePeriods[1].startTime).toEqual(activePeriodsOneCompleteAndOneCurrent[1].startTime);
            expect(newActivePeriods[1].endTime).toEqual(moment.unix(activePeriodsOneCompleteAndOneCurrent[1].startTime).add(2, 'h').unix());
        });

        it('should return one past active period, one current period and 4 new periods when date is extended by one day', () => {
            const startDate = moment.unix(activePeriodsOneCompleteAndOneCurrent[0].startTime);
            const endDate = moment.unix(activePeriodsOneCompleteAndOneCurrent[2].endTime).add(1, 'd');
            const pattern = setUpPattern(startDate, endDate);

            const newActivePeriods = calculateActivePeriods(pattern, 2, activePeriodsOneCompleteAndOneCurrent, false);

            expect(newActivePeriods.length).toEqual(4);
            expect(newActivePeriods.slice(0, 3)).toEqual(activePeriodsOneCompleteAndOneCurrent.slice(0, 3));
            expect(newActivePeriods.slice(3)[0].startTime).toEqual(moment.unix(activePeriodsOneCompleteAndOneCurrent[2].startTime).add(1, 'd').unix());
            expect(newActivePeriods.slice(3)[0].endTime).toEqual(moment.unix(activePeriodsOneCompleteAndOneCurrent[2].endTime).add(1, 'd').unix());
        });

        it('should reinstate the current active period duration if disruption has been resolved whilst current and then reinstated', () => {
            const startDate = moment.unix(activePeriodsOneCompleteAndOneCurrent[0].startTime);
            const endDate = moment.unix(activePeriodsOneCompleteAndOneCurrent[2].endTime);
            const pattern = setUpPattern(startDate, endDate);

            const resolvedActivePeriods = calculateActivePeriods(pattern, 2, activePeriodsOneCompleteAndOneCurrent, true);

            expect(resolvedActivePeriods.length).toEqual(2);
            expect(moment.unix(resolvedActivePeriods[1].endTime ?? 0).isBefore(moment())).toBeTruthy();

            const reinstatedActivePeriods = calculateActivePeriods(pattern, 2, resolvedActivePeriods, false);

            expect(reinstatedActivePeriods.length).toEqual(3);
            expect(reinstatedActivePeriods[1]).toEqual(activePeriodsOneCompleteAndOneCurrent[1]);
        });
    });

    describe('recurrence calculate active periods when disruption is resolved', () => {
        it('Should return one active period with the current date for both start and end times when there are no existing or past periods', () => {
            const startDate = moment.tz(DATE_TYPE.TIME_ZONE).add(3, 'd');
            const endDate = moment.tz(DATE_TYPE.TIME_ZONE).add(6, 'd');
            const pattern = setUpPattern(startDate, endDate);

            const newActivePeriods = calculateActivePeriods(pattern, 1, activePeriodsNotStarted, true);

            expect(newActivePeriods.length).toEqual(1);
            expect(newActivePeriods[0].startTime).toEqual(newActivePeriods[0].endTime);
        });

        it('Should return past active periods only when there are past and no current periods', () => {
            const startDate = moment.unix(activePeriodsOneComplete[0].startTime);
            const endDate = moment.unix(activePeriodsOneComplete[2].endTime);
            const pattern = setUpPattern(startDate, endDate);

            const newActivePeriods = calculateActivePeriods(pattern, 1, activePeriodsOneComplete, true);

            expect(newActivePeriods.length).toEqual(1);
            expect(newActivePeriods[0]).toEqual(activePeriodsOneComplete[0]);
        });

        it('Should return past active periods and set current period to now when resolved', () => {
            const startDate = moment.unix(activePeriodsOneCompleteAndOneCurrent[0].startTime);
            const endDate = moment.unix(activePeriodsOneCompleteAndOneCurrent[2].endTime);
            const pattern = setUpPattern(startDate, endDate);

            const newActivePeriods = calculateActivePeriods(pattern, 2, activePeriodsOneCompleteAndOneCurrent, true);

            expect(newActivePeriods.length).toEqual(2);
            expect(newActivePeriods[0]).toEqual(activePeriodsOneCompleteAndOneCurrent[0]);
            expect(newActivePeriods[1].startTime).toEqual(activePeriodsOneCompleteAndOneCurrent[1].startTime);
            expect(newActivePeriods[1].endTime).toBeTruthy();
            expect(moment.unix(newActivePeriods[1].endTime ?? 0).isBefore(moment())).toBeTruthy();
        });
    });
});
