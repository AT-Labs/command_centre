import moment from 'moment-timezone';
import DATE_TYPE from '../types/date-types';
import { utcDateFormatWithoutTZ } from './dateUtils';
import { calculateActivePeriods, fetchEndDateFromRecurrence, isActivePeriodsValid, parseRecurrencePattern } from './recurrence';

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
            expect(newActivePeriods.slice(3)[0].startTime).toEqual(moment.unix(activePeriodsOneCompleteAndOneCurrent[2].startTime).tz(DATE_TYPE.TIME_ZONE).add(1, 'd').unix());
            expect(newActivePeriods.slice(3)[0].endTime).toEqual(moment.unix(activePeriodsOneCompleteAndOneCurrent[2].endTime).tz(DATE_TYPE.TIME_ZONE).add(1, 'd').unix());
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

    describe('fetchEndDateFromRecurrence', () => {
        it('Should return endDate from pattern', () => {
            const startDate = moment.utc('2022-03-31T03:00:00.000Z');
            const endDate = moment.utc('2022-04-05T04:00:00.000Z');
            const pattern = setUpPattern(startDate, endDate);

            const result = fetchEndDateFromRecurrence(pattern);

            expect(result).toEqual(endDate.format('DD/MM/YYYY'));
        });

        it('Should return undefined when pattern is not provided', () => {
            const pattern = {
                until: undefined,
            };
            const result = fetchEndDateFromRecurrence(pattern);

            expect(result).toEqual(undefined);
        });

        it('Should return undefined when pattern.until is null', () => {
            const pattern = {
                until: null,
            };
            const result = fetchEndDateFromRecurrence(pattern);

            expect(result).toEqual(undefined);
        });

        it('Should return formatted date when pattern.until is a valid date string', () => {
            const pattern = {
                until: '2023-10-15T00:00:00.000Z',
            };
            const result = fetchEndDateFromRecurrence(pattern);

            expect(result).toEqual('15/10/2023');
        });

        it('Should return undefined when pattern does not have an until property', () => {
            const pattern = {};
            const result = fetchEndDateFromRecurrence(pattern);

            expect(result).toEqual(undefined);
        });
    });

    describe('parseRecurrencePattern', () => {
        it('should parse valid until and dtstart dates', () => {
            const input = { until: '2023-10-15T00:00:00.000Z', dtstart: '2023-10-10T00:00:00.000Z' };
            const expected = { until: moment.utc('2023-10-15T00:00:00.000Z').toDate(), dtstart: moment.utc('2023-10-10T00:00:00.000Z').toDate() };
            const result = parseRecurrencePattern(input);
            expect(result).toEqual(expected);
        });

        it('should return null for invalid until and dtstart dates', () => {
            const input = { until: 'invalid-date', dtstart: 'invalid-date' };
            const expected = { until: null, dtstart: null };
            const result = parseRecurrencePattern(input);
            expect(result).toEqual(expected);
        });

        it('should return null for undefined until and dtstart', () => {
            const input = { until: undefined, dtstart: undefined };
            const expected = { until: null, dtstart: null };
            const result = parseRecurrencePattern(input);
            expect(result).toEqual(expected);
        });

        it('should return null for null until and dtstart', () => {
            const input = { until: null, dtstart: null };
            const expected = { until: null, dtstart: null };
            const result = parseRecurrencePattern(input);
            expect(result).toEqual(expected);
        });

        it('should parse valid until and return null for invalid dtstart', () => {
            const input = { until: '2023-10-15T00:00:00.000Z', dtstart: 'invalid-date' };
            const expected = { until: moment.utc('2023-10-15T00:00:00.000Z').toDate(), dtstart: null };
            const result = parseRecurrencePattern(input);
            expect(result).toEqual(expected);
        });

        it('should parse valid dtstart and return null for invalid until', () => {
            const input = { until: 'invalid-date', dtstart: '2023-10-10T00:00:00.000Z' };
            const expected = { until: null, dtstart: moment.utc('2023-10-10T00:00:00.000Z').toDate() };
            const result = parseRecurrencePattern(input);
            expect(result).toEqual(expected);
        });
    });

    describe('isActivePeriodsValid', () => {
        const createRecurrencePattern = (startDate, endDate) => ({
            dtstart: startDate.toISOString(),
            until: endDate.toISOString(),
            freq: 2,
            byweekday: [0, 2, 4],
        });

        it('should return true when active periods count is within the valid range', () => {
            const startDate = moment().subtract(1, 'days');
            const endDate = moment().add(5, 'days');
            const recurrencePattern = createRecurrencePattern(startDate, endDate);

            const result = isActivePeriodsValid(recurrencePattern, 2, 10);
            expect(result).toEqual(true);
        });

        it('should return false when active periods count is zero', () => {
            const startDate = moment().add(10, 'days');
            const endDate = moment().add(10, 'days');
            const recurrencePattern = createRecurrencePattern(startDate, endDate);

            const result = isActivePeriodsValid(recurrencePattern, 2, 10);
            expect(result).toEqual(false);
        });

        it('should return false when active periods count exceeds the maximum allowed', () => {
            const startDate = moment().subtract(1, 'days');
            const endDate = moment().add(30, 'days');
            const recurrencePattern = createRecurrencePattern(startDate, endDate);

            const result = isActivePeriodsValid(recurrencePattern, 1, 5);
            expect(result).toEqual(false);
        });

        it('should return true when active periods count equals the maximum allowed', () => {
            const startDate = moment().subtract(1, 'days');
            const endDate = moment().add(5, 'days');
            const recurrencePattern = createRecurrencePattern(startDate, endDate);

            const result = isActivePeriodsValid(recurrencePattern, 2, 3);
            expect(result).toEqual(true);
        });

        it('should handle invalid recurrence patterns gracefully', () => {
            const result = isActivePeriodsValid(null, 2, 5);
            expect(result).toEqual(false);
        });
    });
});
