import { expect } from 'chai';
import moment from 'moment';
import MockDate from 'mockdate';
import { isEndDateValid, isEndTimeValid, isStartDateValid, isStartTimeValid, transformIncidentNo, isDurationValid, buildSubmitBody, getStatusOptions } from './disruptions';
import { DATE_FORMAT, TIME_FORMAT } from '../../constants/disruptions';
import { STATUSES } from '../../types/disruptions-types';

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

    it('endDate after the startDate but before now for non recurrent should be valid', () => {
        MockDate.set(moment('07/22/2020').toDate());
        expect(isEndDateValid('21/07/2020', '20/07/2020', false)).to.equal(true);
        MockDate.reset();
    });

    it('endDate after the startDate but before now for recurrent should be invalid', () => {
        MockDate.set(moment('07/22/2020').toDate());
        expect(isEndDateValid('21/07/2020', '20/07/2020', true)).to.equal(false);
        MockDate.reset();
    });
});

describe('isEndTimeValid', () => {
    const now = moment();
    it('endTime and endDate are not set is valid', () => {
        expect(isEndTimeValid('', '', '20/07/2020', '18:00')).to.equal(true);
    });

    it('endDate is set then endTime needs to be in the right format', () => {
        expect(isEndTimeValid('20/08/2020', '1243', '20/07/2020', '18:00')).to.equal(false);
    });

    it('endTime after startTime and after now should be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.clone().add(5, 'minutes').format(TIME_FORMAT);
        expect(isEndTimeValid(endDate, endTime, '21/07/2020', '12:00')).to.equal(true);
    });

    it('endTime after startTime and equal to now should be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.format(TIME_FORMAT);
        expect(isEndTimeValid(endDate, endTime, '21/07/2020', '12:00')).to.equal(true);
    });

    it('endTime after startTime and before now should be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.clone().subtract(2, 'minutes').format(TIME_FORMAT);
        expect(isEndTimeValid(endDate, endTime, '21/07/2020', '12:00')).to.equal(true);
    });
});

describe('isStartDateValid', () => {
    const now = moment('2020-07-20T00:00:00');
    it('startDate should be in the correct format', () => {
        expect(isStartDateValid('20200721', now)).to.equal(false);
    });

    it('startDate for recurrent after now should be valid', () => {
        expect(isStartDateValid('21/07/2020', now, true)).to.equal(true);
    });

    it('startDate for recurrent before now should be invalid', () => {
        expect(isStartDateValid('19/07/2020', now, true)).to.equal(false);
    });

    it('startDate for non recurrent after now should be valid', () => {
        expect(isStartDateValid('21/07/2020', now, false)).to.equal(true);
    });

    it('startDate for non recurrent before now should be valid', () => {
        expect(isStartDateValid('19/07/2020', now, false)).to.equal(true);
    });
});

describe('isStartTimeValid', () => {
    const now = moment('2020-07-20T12:00:00');
    it('startTime should be in the correct format', () => {
        expect(isStartTimeValid('20/07/2020', '1500', now)).to.equal(false);
    });

    it('startTime for recurrent after now should be valid', () => {
        expect(isStartTimeValid('20/07/2020', '15:00', now, true)).to.equal(true);
    });

    it('startTime for recurrent before now should be invalid', () => {
        expect(isStartTimeValid('20/07/2020', '09:00', now, true)).to.equal(false);
    });

    it('startTime for non recurrent after now should be valid', () => {
        expect(isStartTimeValid('20/07/2020', '15:00', now, false)).to.equal(true);
    });

    it('startTime for non recurrent before now should be valid', () => {
        expect(isStartTimeValid('20/07/2020', '09:00', now, false)).to.equal(true);
    });
});


describe('transformIncidentNo', () => {
    it('Should return null if the incidentNo is undefined or null.', () => {
        expect(transformIncidentNo(null)).to.equal(null);
        expect(transformIncidentNo(undefined)).to.equal(null);
    });

    it('Should return a correct transformed incident No.', () => {
        const fakeIncident01 = 9384;
        const fakeIncident02 = 193822;
        expect(transformIncidentNo(fakeIncident01)).to.equal('DISR009384');
        expect(transformIncidentNo(fakeIncident02)).to.equal('DISR193822');
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

describe('buildSubmitBody', () => {
    it('should include workarounds when passed', () => {
        const workarounds = [{"type": "all", "workaround": "workaround"}];
        expect(buildSubmitBody({}, [], [], workarounds)).to.deep.equal({
            affectedEntities: [],
            mode: "",
            workarounds,
        });
    });

    it('should not include workarounds when not passed', () => {
        expect(buildSubmitBody({}, [], [])).to.deep.equal({
            affectedEntities: [],
            mode: "",
        });
    });
});

describe('getStatusOptions', () => {
    const now = moment('2020-07-20T00:00:00');
    it('should return not-started and resolved when start time is in the future', () => {
        expect(getStatusOptions('20/07/2020', '01:00', now)).to.deep.equal([STATUSES.NOT_STARTED, STATUSES.RESOLVED]);
    });

    it('should return in-progress and resolved when start time is in the past or present', () => {
        expect(getStatusOptions('20/07/2020', '00:00', now)).to.deep.equal([STATUSES.IN_PROGRESS, STATUSES.RESOLVED]);
        expect(getStatusOptions('19/07/2020', '23:00', now)).to.deep.equal([STATUSES.IN_PROGRESS, STATUSES.RESOLVED]);
    });

    it('should return not-started, in-progress and resolved when start time is not valid', () => {
        expect(getStatusOptions('20-07-2020', '0000', now)).to.deep.equal([STATUSES.NOT_STARTED, STATUSES.IN_PROGRESS, STATUSES.RESOLVED]);
    });
});
