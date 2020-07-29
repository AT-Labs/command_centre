import { expect } from 'chai';
import { getStartTimeFromFilterInitialTime, formatTripDelay, transformStopName } from './routes';

it('getStartTimeFromFilterInitialTime', () => {
    const inputOutput = {
        '00:00': '00:00',
        '01:59': '00:00',
        '02:00': '00:00',
        '23:01': '21:00',
        '23:14': '21:00',
        '23:15': '21:30',
        '23:44': '21:30',
        '23:45': '22:00',
        '23:59': '22:00',
    };

    Object.keys(inputOutput).forEach((input) => {
        const output = inputOutput[input];
        expect(getStartTimeFromFilterInitialTime(input)).to.equal(output);
    });
});

it('formatTripDelay', () => {
    expect(formatTripDelay(null)).to.equal(null);
    expect(formatTripDelay(undefined)).to.equal(undefined);
    expect(formatTripDelay(60)).to.equal(1);
    expect(formatTripDelay(90)).to.equal(1);
    expect(formatTripDelay(119)).to.equal(1);
    expect(formatTripDelay(121)).to.equal(2);
});

it('transformStopName', () => {
    expect(transformStopName(null)).to.equal(null);
    expect(transformStopName(undefined)).to.equal(undefined);
    expect(transformStopName('Panmure Train Station 1')).to.equal('Panmure Platform 1');
    expect(transformStopName('Stop D Albany Bus Station')).to.equal('Stop D Albany Bus Station');
    expect(transformStopName('44 Hugh Green Dr')).to.equal('44 Hugh Green Dr');
});
