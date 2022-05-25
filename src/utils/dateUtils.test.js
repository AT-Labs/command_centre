import { expect } from 'chai';
import { getDatePickerOptions } from './dateUtils';

describe('getDatePickerOptions', () => {
    it('will always return the same option object when input the same date', () => {
        const options1 = getDatePickerOptions('21/07/2020');
        const options2 = getDatePickerOptions('21/07/2020');
        expect(options1.dateFormat).to.equal(options2.dateFormat);
        expect(options1.minDate).to.equal(options2.minDate);
        expect(options1.enableTime).to.equal(options2.enableTime);
    });
});