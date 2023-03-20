import { expect } from 'chai';
import {
    formatTime,
    formatUnixTime,
    formatUnixDatetime,
    formatTimeForColumn,
    isDelayBetweenRange,
    getStopKey,
    getClosestTimeValueForFilter,
    getExpiredMessageRowClassName,
    generateUniqueID,
} from './helpers';

const time = '2021-11-16 18:43:30.000Z';
const timestamp = 1637088210;
describe('getStopKey', () => {
    it('generate getStopkey using departureTime', () => {
        const stop = {
            stopId: '12',
            stopSequence: 3,
            departureTime: '15:00:00',
        };
        expect(getStopKey(stop)).to.equal('12-3-15:00:00');
    });
    it('generate getStopkey using arrivalTime', () => {
        const stop = {
            stopId: '12',
            stopSequence: 3,
            arrivalTime: '15:00:00',
        };
        expect(getStopKey(stop)).to.equal('12-3-15:00:00');
    });
});
describe('formatTime', () => {
    it('return formatted time with next day indicator', () => {
        const isNextDay = true;
        expect(formatTime(time, isNextDay)).to.contain('(+1)');
    });
    it('return formatted time without next day indicator', () => {
        const isNextDay = false;
        expect(formatTime(time, isNextDay)).to.not.contain('(+1)');
    });
    it('throws exception when null is passed', () => {
        const isNextDay = false;
        expect(() => formatTime(null, isNextDay)).throws(Error);
    });
    it('throws exception even when we set isNextDay to true', () => {
        const isNextDay = true;
        expect(() => formatTime(null, isNextDay)).throws(Error);
    });
});
describe('formatUnixTime', () => {
    const validTimestamp = 1647224431;
    const validTripSignOn = '2022-03-13T09:00:00Z';
    const invalidTimestamp = 'not a timestamp';
    const invalidTripSignOn = 'not a date';

    it('returns formatted timestamp with "(+1)" if timestamp is next day', () => {
        const result = formatUnixTime(validTimestamp, validTripSignOn);
        expect(result).to.contain('(+1)');
    });

    it('returns formatted timestamp without "(+1)" if timestamp is same day', () => {
        const result = formatUnixTime(timestamp, validTripSignOn);
        expect(result).to.not.contain('(+1)');
    });

    it('throws error if timestamp and tripSignOn is invalid', () => {
        expect(() => formatUnixTime(invalidTimestamp, invalidTripSignOn)).to.throw('Invalid date time');
    });
});
describe('formatUnixDatetime', () => {
    it('return formatted date time with next day indicator', () => {
        const isNextDay = true;
        expect(formatUnixDatetime(timestamp, isNextDay)).to.contain('(+1)');
    });
    it('return formatted date time without next day indicator', () => {
        const isNextDay = false;
        expect(formatUnixDatetime(timestamp, isNextDay)).to.not.contain('(+1)');
    });
});
describe('formatTimeForColumn', () => {
    const dateToCompare = '20220428';
    it('return date formatted for column with next day indicator', () => {
        expect(formatTimeForColumn('2022-04-29T12:00:04+12:00', dateToCompare)).to.equal('12:00:04 (+1)');
    });
    it('return date formatted for column should not contain next day indicator', () => {
        expect(formatTimeForColumn('2022-04-28T12:00:04+12:00', dateToCompare)).to.equal('12:00:04');
    });
    it('return empty when time is undefined', () => {
        // Using equal() as .empty triggers eslint complain
        expect(formatTimeForColumn(undefined, false)).equal('');
    });
    it('return empty when time is undefined even if nextDay is true', () => {
        // Using equal() as .empty triggers eslint complain
        expect(formatTimeForColumn(undefined, true)).equal('');
    });
});
describe('isDelayBetweenRage', () => {
    it('delay is not within range', () => {
        expect(isDelayBetweenRange(10, [2, 300])).equal(false);
    });
    it('delay is within range', () => {
        expect(isDelayBetweenRange(100, [1, 3])).equal(true);
    });
});
describe('getClosestTimeValueForFilter', () => {
    it('format when rounding down minute', () => {
        expect(getClosestTimeValueForFilter('23:45:00')).to.equal('23:30');
    });
    it('format when rounding up minute', () => {
        expect(getClosestTimeValueForFilter('23:15:00')).to.equal('23:00');
    });
    it('return empty when unexpected string is given', () => {
        expect(getClosestTimeValueForFilter('2022-12-12 22:15:00')).to.equal('');
    });
    it('return empty when no value is passed', () => {
        expect(getClosestTimeValueForFilter()).to.equal('');
    });
});
describe('getExpiredMessageRowClassName', () => {
    it('isCurrent is false and should return class', () => {
        expect(getExpiredMessageRowClassName({ isCurrent: false })).to.equal('bg-at-ocean-tint-10 text-muted');
    });
    it('isCurrent is true and should return empty string', () => {
        expect(getExpiredMessageRowClassName({ isCurrent: true })).to.equal('');
    });
});
describe('generateUniqueID', () => {
    it('generates unique id', () => {
        const id1 = generateUniqueID();
        const id2 = generateUniqueID();
        expect(id1).to.not.equal(id2);
    });
});
