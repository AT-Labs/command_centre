import { expect } from 'chai';
import { formatSeconds, getDatePickerOptions } from './dateUtils';

describe('getDatePickerOptions', () => {
    it('will always return the same option object when input the same date', () => {
        const options1 = getDatePickerOptions('21/07/2020');
        const options2 = getDatePickerOptions('21/07/2020');
        expect(options1.dateFormat).to.equal(options2.dateFormat);
        expect(options1.minDate).to.equal(options2.minDate);
        expect(options1.enableTime).to.equal(options2.enableTime);
    });
});

describe('formatSeconds', () => {
    it('will return formatted strings for seconds', () => {
        const seconds = 20;
        expect(formatSeconds(seconds)).to.equal('20 seconds');
    });

    it('will return formatted strings for minutes', () => {
        const seconds1 = 60;
        expect(formatSeconds(seconds1)).to.equal('1 minute');
        const seconds2 = 130;
        expect(formatSeconds(seconds2)).to.equal('2 minutes');
    });

    it('will return formatted strings for hours', () => {
        const seconds1 = 3600;
        expect(formatSeconds(seconds1)).to.equal('1 hour');
        const seconds2 = 7300;
        expect(formatSeconds(seconds2)).to.equal('2 hours');
    });

    it('will return undefined for undefined input', () => {
        const seconds = undefined;
        expect(formatSeconds(seconds)).to.equal(undefined);
    });
});