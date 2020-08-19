import { expect } from 'chai';
import moment from 'moment';
import { isEndDateValid, isEndTimeValid, getDatePickerOptions } from './disruptions';
import { DATE_FORMAT, TIME_FORMAT } from '../../constants/disruptions';

describe('isEndDateValid', () => {
    it('endDate is optional', () => {
        expect(isEndDateValid('', '2020/07/20')).to.equal(true);
    });

    it('endDate should be in the correct format', () => {
        expect(isEndDateValid('20200721', '2020/07/20')).to.equal(false);
    });

    it('endDate equal to startDate should be valid', () => {
        expect(isEndDateValid('20/07/2020', '20/07/2020')).to.equal(true);
    });

    it('endDate after to startDate should be valid', () => {
        expect(isEndDateValid('20/07/2020', '20/07/2020')).to.equal(true);
    });
});

describe('isEndTimeValid', () => {
    const now = moment();
    it('endTime and endDate are not set is valid', () => {
        expect(isEndTimeValid('', '', now, '20/07/2020', '18:00')).to.equal(true);
    });

    it('endDate is set then endTime needs to be set as well', () => {
        expect(isEndTimeValid('20/07/2020', '', now, '20/07/2020', '18:00')).to.equal(false);
    });

    it('endDate is set then endTime needs to be in the right format', () => {
        expect(isEndTimeValid('20/08/2020', '1243', now, '20/07/2020', '18:00')).to.equal(false);
    });

    it('endTime after startTime and after now should be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.clone().add(2, 'minutes').format(TIME_FORMAT);
        expect(isEndTimeValid(endDate, endTime, now, '21/07/2020', '12:00')).to.equal(true);
    });

    it('endTime after startTime and equal to now should be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.format(TIME_FORMAT);
        expect(isEndTimeValid(endDate, endTime, now, '21/07/2020', '12:00')).to.equal(true);
    });

    it('endTime after startTime and before now should not be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.clone().subtract(2, 'minutes').format(TIME_FORMAT);
        expect(isEndTimeValid(endDate, endTime, now, '21/07/2020', '12:00')).to.equal(false);
    });
});

describe('getDatePickerOptions', () => {
    it('will always return the same option object when input the same date', () => {
        const options1 = getDatePickerOptions('21/07/2020');
        const options2 = getDatePickerOptions('21/07/2020');
        expect(options1.dateFormat).to.equal(options2.dateFormat);
        expect(options1.minDate).to.equal(options2.minDate);
        expect(options1.enableTime).to.equal(options2.enableTime);
    });
});
