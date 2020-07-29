import { expect } from 'chai';
import { isEndDateValid, isEndTimeValid } from './disruptions';

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
    it('endTime and endDate are not set is valid', () => {
        expect(isEndTimeValid('', '', '20/07/2020', '18:00')).to.equal(true);
    });

    it('endDate is set then endTime needs to be set as well', () => {
        expect(isEndTimeValid('20/07/2020', '', '20/07/2020', '18:00')).to.equal(false);
    });

    it('endDate is set then endTime needs to be in the right format', () => {
        expect(isEndTimeValid('20/08/2020', '1243', '20/07/2020', '18:00')).to.equal(false);
    });

    it('endTime after to startTime should be valid', () => {
        expect(isEndTimeValid('21/07/2020', '12:01', '21/07/2020', '12:00')).to.equal(true);
    });
});
