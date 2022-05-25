import { expect } from 'chai';
import moment from 'moment';
import MockDate from 'mockdate';
import { isEndDateValid, isEndTimeValid, transformIncidentNo, isDurationValid } from './disruptions';
import { DATE_FORMAT, TIME_FORMAT } from '../../constants/disruptions';

describe('isEndDateValid', () => {
    it('endDate is optional', () => {
        expect(isEndDateValid('', '2020/07/20')).to.equal(true);
    });

    it('endDate should be in the correct format', () => {
        expect(isEndDateValid('20200721', '2020/07/20')).to.equal(false);
    });

    it('endDate equal to startDate should be valid', () => {
        MockDate.set(moment('07/20/2020').toDate());
        expect(isEndDateValid('20/07/2020', '20/07/2020')).to.equal(true);
        MockDate.reset();
    });

    it('endDate after the startDate should be valid', () => {
        MockDate.set(moment('07/20/2020').toDate());
        expect(isEndDateValid('21/07/2020', '20/07/2020')).to.equal(true);
        MockDate.reset();
    });

    it('endDate after the startDate but before now should be invalid', () => {
        MockDate.set(moment('07/22/2020').toDate());
        expect(isEndDateValid('21/07/2020', '20/07/2020')).to.equal(false);
        MockDate.reset();
    });
});

describe('isEndTimeValid', () => {
    const now = moment();
    it('endTime and endDate are not set is valid', () => {
        expect(isEndTimeValid('', '', now, '20/07/2020', '18:00')).to.equal(true);
    });

    it('endDate is set then endTime needs to be in the right format', () => {
        expect(isEndTimeValid('20/08/2020', '1243', now, '20/07/2020', '18:00')).to.equal(false);
    });

    it('endTime after startTime and after now should be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.clone().add(5, 'minutes').format(TIME_FORMAT);
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


describe('transformIncidentNo', () => {
    it('Should return null if the incidentNo is undefined or null.', () => {
        expect(transformIncidentNo(null)).to.equal(null);
        expect(transformIncidentNo(undefined)).to.equal(null);
    });

    it('Should return a correct transformed incident No.', () => {
        const fakeIncident01 = 9384;
        const fakeIncident02 = 93822;
        expect(transformIncidentNo(fakeIncident01)).to.equal('DISR09384');
        expect(transformIncidentNo(fakeIncident02)).to.equal('DISR93822');
    });
});

describe('isDurationValid', () => {
    it('should be true, regardless of value, if not a recurrent disruption', () => {
        expect(isDurationValid(null, false)).to.be.true;
        expect(isDurationValid('-1', false)).to.be.true;
    });

    it('should be true for an integer between 1 and 24', () => {
        for (let i = 1; i <= 24; i++) {
            expect(isDurationValid(i.toString(), true)).to.be.true;
        }
    });

    it('should be false for non integer', () => {
        expect(isDurationValid('duration', true)).to.be.false;
    });

    it('should be false for negatives, zero or greater than 24', () => {
        expect(isDurationValid('-1', true)).to.be.false;
        expect(isDurationValid('0', true)).to.be.false;
        expect(isDurationValid('25', true)).to.be.false;
    });
});
