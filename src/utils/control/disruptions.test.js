import { expect } from 'chai';
import moment from 'moment';
import MockDate from 'mockdate';
import {
    isEndDateValid,
    isEndTimeValid,
    isStartDateValid,
    isStartTimeValid,
    transformIncidentNo,
    isDurationValid,
    buildSubmitBody,
    getStatusOptions,
    groupStopsByRouteElementByParentStation,
    getPassengerCountRange,
    momentFromDateTime,
    generateDisruptionActivePeriods, isRecurringPeriodInvalid
} from './disruptions';
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

describe('momentFromDateTime', () => {
    it('should be undefined for non valid param', () => {
        expect(momentFromDateTime(null, null)).to.be.undefined;
    });

    it('should be valid string for correcnt params', () => {
        expect(momentFromDateTime('2022/08/03', '22:17').toString()).to.be.string;
    });
});

describe('buildSubmitBody', () => {
    it('should include workarounds when passed', () => {
        const workarounds = [{ type: 'all', workaround: 'workaround' }];
        expect(buildSubmitBody({}, [], [], workarounds)).to.deep.equal({
            affectedEntities: [],
            mode: '',
            workarounds,
        });
    });

    it('should not include workarounds when not passed', () => {
        expect(buildSubmitBody({}, [], [])).to.deep.equal({
            affectedEntities: [],
            mode: '',
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

    it('should return draft when status is draft and start time is in the future', () => {
        expect(getStatusOptions('20/07/2020', '01:00', now, STATUSES.DRAFT)).to.deep.equal([STATUSES.NOT_STARTED, STATUSES.RESOLVED, STATUSES.DRAFT]);
    });

    it('should return draft when status is draft and start time is in the past', () => {
        expect(getStatusOptions('19/07/2020', '23:00', now, STATUSES.DRAFT)).to.deep.equal([STATUSES.IN_PROGRESS, STATUSES.RESOLVED, STATUSES.DRAFT]);
    });

    it('should return draft, in-progress, and resolved when status is draft and start time is invalid', () => {
        expect(getStatusOptions('20-07-2020', '0000', now, STATUSES.DRAFT)).to.deep.equal([STATUSES.NOT_STARTED, STATUSES.IN_PROGRESS, STATUSES.RESOLVED, STATUSES.DRAFT]);
    });

    it('should return draft when status is draft and start time is in the past or present', () => {
        expect(getStatusOptions('20/07/2020', '00:00', now, STATUSES.DRAFT)).to.deep.equal([STATUSES.IN_PROGRESS, STATUSES.RESOLVED, STATUSES.DRAFT]);
    });
});

describe('groupStopsByRouteElementByParentStation', () => {
    it('should an object with grouped stop by parent station with a stringify parent object as a key', () => {
        const data = [
            {
                stopSequence: 1,
                stopId: '4226-19578f75',
                stopCode: '4226',
                stopName: 'Stop A Albany Bus Station',
                parentStationStopId: '41386-6206d5fd',
                parentStationStopCode: '41386',
                parentStationStopName: 'Albany Bus Station',
                stopLat: -36.72237,
                stopLon: 174.71309,
                directionId: 0,
            },
            {
                stopSequence: 1,
                stopId: '4981-ecc5b741',
                stopCode: '4981',
                stopName: 'Stop A Hibiscus Coast',
                parentStationStopId: '41672-866a7e51',
                parentStationStopCode: '41672',
                parentStationStopName: 'Painton Rd/Hibiscus Coast Station',
                stopLat: -36.62431,
                stopLon: 174.66608,
                directionId: 0,
            },
            {
                stopSequence: 1,
                stopId: '4211-ecc5b741',
                stopCode: '49822',
                stopName: 'Stop A Hibiscus Coast',
                parentStationStopId: '41672-866a7e51',
                parentStationStopCode: '41672',
                parentStationStopName: 'Painton Rd/Hibiscus Coast Station',
                stopLat: -36.62431,
                stopLon: 174.66608,
                directionId: 0,
            },
        ];
        const result = groupStopsByRouteElementByParentStation(data);
        expect(result.has(JSON.stringify({
            stopId: '41386-6206d5fd',
            stopCode: '41386',
            stopName: 'Albany Bus Station',
            directionId: 0,
        }))).to.be.true;
        expect(result.get(JSON.stringify({
            stopId: '41386-6206d5fd',
            stopCode: '41386',
            stopName: 'Albany Bus Station',
            stopLat: undefined,
            stopLon: undefined,
            directionId: 0,
        }))).to.deep.equal(
            [
                {
                    stopSequence: 1,
                    stopId: '4226-19578f75',
                    stopCode: '4226',
                    stopName: 'Stop A Albany Bus Station',
                    parentStationStopId: '41386-6206d5fd',
                    parentStationStopCode: '41386',
                    parentStationStopName: 'Albany Bus Station',
                    stopLat: -36.72237,
                    stopLon: 174.71309,
                    directionId: 0,
                },
            ],
        );
    });
    it('those who dont have a parent station will be put inside the `undefined` key value', () => {
        const data = [
            {
                stopSequence: 6,
                stopId: '1315-e6177005',
                stopCode: '1315',
                stopName: 'Fanshawe Street/Victoria Park',
                parentStationStopId: null,
                parentStationStopCode: null,
                parentStationStopName: null,
                stopLat: -36.84566,
                stopLon: 174.75542,
                directionId: 0,
            },
            {
                stopSequence: 8,
                stopId: '7005-afc9794d',
                stopCode: '7005',
                stopName: 'Customs Street West/Te Komititanga',
                parentStationStopId: null,
                parentStationStopCode: null,
                parentStationStopName: null,
                stopLat: -36.84445,
                stopLon: 174.76613,
                directionId: 0,
            },
        ];
        const result = groupStopsByRouteElementByParentStation(data);
        expect(result.has(undefined)).to.be.true;
        expect(result.get(undefined)).to.length == 2;
    });
    it('Should return a empty map', () => {
        expect(groupStopsByRouteElementByParentStation([])).to.deep.equal(new Map());
    });
});

describe('getPassengerCountRange', () => {
    it('should return an appropriate value', () => {
        expect(getPassengerCountRange(237)).to.eql('<500');
        expect(getPassengerCountRange(500)).to.eql('500 - 5,000');
        expect(getPassengerCountRange(6789)).to.eql('5,001 - 15,000');
        expect(getPassengerCountRange(23700)).to.eql('15,001 - 40,000');
        expect(getPassengerCountRange(86000)).to.eql('>40,000');
    });
});

describe('generateDisruptionActivePeriods', () => {
    it('should return calculated active periods for recurrent disruptions', () => {
        const mockDisruption = {
            recurrent: true,
            recurrencePattern: {
                until: '2024-12-02T04:00:00.000Z',
                dtstart: '2024-11-29T04:00:00.000Z',
            },
            duration: 9,
        };
        const result = generateDisruptionActivePeriods(mockDisruption);
        expect(result).to.deep.equal([{
            endTime: 1732838400,
            startTime: 1732806000,
        }]);
    });

    it('should return a single active period with start and end times for non-recurrent disruptions with both startTime and endTime', () => {
        const mockDisruption = {
            recurrent: false,
            startTime: '23:00',
            startDate: '12/12/2024',
            endTime: '01:00',
            endDate: '13/12/2024',
        };

        const result = generateDisruptionActivePeriods(mockDisruption);

        expect(result).to.eql([
            {
                startTime: momentFromDateTime(mockDisruption.startDate, mockDisruption.startTime).unix(),
                endTime: momentFromDateTime(mockDisruption.endDate, mockDisruption.endTime).unix(),
            },
        ]);
    });

    it('should return a single active period with only start time for non-recurrent disruptions without endTime', () => {
        const mockDisruption = {
            recurrent: false,
            startDate: '12/12/2024',
            startTime: '23:00',
        };

        const result = generateDisruptionActivePeriods(mockDisruption);

        expect(result).to.eql([
            {
                startTime: momentFromDateTime(mockDisruption.startDate, mockDisruption.startTime).unix(),
                endTime: undefined,
            },
        ]);
    });

    it('should handle invalid or missing disruption data gracefully', () => {
        const mockDisruption = {
            recurrent: false,
        };

        const result = generateDisruptionActivePeriods(mockDisruption);

        expect(result).to.eql([
            {
                startTime: undefined,
                endTime: undefined,
            },
        ]);
    });
});

describe('isRecurringPeriodInvalid - Additional Cases', () => {
    it('should return true for disruption with null byweekday', () => {
        const disruption = { recurrencePattern: { byweekday: null, dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: 2 };
        expect(isRecurringPeriodInvalid(disruption)).to.be.true;
    });

    it('should return true for disruption with undefined byweekday', () => {
        const disruption = { recurrencePattern: { byweekday: undefined, dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: 2 };
        expect(isRecurringPeriodInvalid(disruption)).to.be.true;
    });

    it('should return true for disruption with duration of 0', () => {
        const disruption = { recurrencePattern: { byweekday: [1, 2], dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: 0 };
        expect(isRecurringPeriodInvalid(disruption)).to.be.true;
    });

    it('should return true for disruption with negative duration', () => {
        const disruption = { recurrencePattern: { byweekday: [1, 2], dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: -5 };
        expect(isRecurringPeriodInvalid(disruption)).to.be.true;
    });

    it('should return true for disruption with empty recurrencePattern object', () => {
        const disruption = { recurrencePattern: {}, duration: 2 };
        expect(isRecurringPeriodInvalid(disruption)).to.be.true;
    });

    it('should return true for disruption with non-integer duration', () => {
        const disruption = { recurrencePattern: { byweekday: [1, 2], dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: 'two' };
        expect(isRecurringPeriodInvalid(disruption)).to.be.true;
    });

    it('should return false for disruption with valid byweekday, valid dtstart, valid until, and duration as a stringified number', () => {
        const disruption = { recurrencePattern: { byweekday: [1, 2], dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: '2' };
        expect(isRecurringPeriodInvalid(disruption)).to.be.false;
    });
});
