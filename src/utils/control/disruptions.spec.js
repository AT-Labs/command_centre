import moment from 'moment';
import MockDate from 'mockdate';
import { omit } from 'lodash-es';
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
    generateDisruptionActivePeriods,
    isRecurringPeriodInvalid,
    getDurationWithoutSeconds,
    buildIncidentSubmitBody,
    buildDisruptionsQuery,
    transformParentSourceIdNo,
    getStatusForEffect,
} from './disruptions';
import { DATE_FORMAT, TIME_FORMAT } from '../../constants/disruptions';
import { STATUSES } from '../../types/disruptions-types';

const fakeNow = new Date(2025, 5, 19, 11, 12, 0);

describe('isEndDateValid', () => {
    it('endDate is optional', () => {
        expect(isEndDateValid('', '2020/07/20')).toEqual(true);
    });

    it('endDate should be in the correct format', () => {
        expect(isEndDateValid('20200721', '2020/07/20')).toEqual(false);
    });

    it('endDate equal to startDate should be valid', () => {
        MockDate.set(moment('07/20/2020').toDate());
        expect(isEndDateValid('20/07/2020', '20/07/2020')).toEqual(true);
        MockDate.reset();
    });

    it('endDate after the startDate should be valid', () => {
        MockDate.set(moment('07/20/2020').toDate());
        expect(isEndDateValid('21/07/2020', '20/07/2020')).toEqual(true);
        MockDate.reset();
    });

    it('endDate after the startDate but before now for non recurrent should be valid', () => {
        MockDate.set(moment('07/22/2020').toDate());
        expect(isEndDateValid('21/07/2020', '20/07/2020', false)).toEqual(true);
        MockDate.reset();
    });

    it('endDate after the startDate but before now for recurrent should be invalid', () => {
        MockDate.set(moment('07/22/2020').toDate());
        expect(isEndDateValid('21/07/2020', '20/07/2020', true)).toEqual(false);
        MockDate.reset();
    });
});

describe('isEndTimeValid', () => {
    const now = moment();
    it('endTime and endDate are not set is valid', () => {
        expect(isEndTimeValid('', '', '20/07/2020', '18:00')).toEqual(true);
    });

    it('endDate is set then endTime needs to be in the right format', () => {
        expect(isEndTimeValid('20/08/2020', '1243', '20/07/2020', '18:00')).toEqual(false);
    });

    it('endTime after startTime and after now should be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.clone().add(5, 'minutes').format(TIME_FORMAT);
        expect(isEndTimeValid(endDate, endTime, '21/07/2020', '12:00')).toEqual(true);
    });

    it('endTime after startTime and equal to now should be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.format(TIME_FORMAT);
        expect(isEndTimeValid(endDate, endTime, '21/07/2020', '12:00')).toEqual(true);
    });

    it('endTime after startTime and before now should be valid', () => {
        const endDate = now.format(DATE_FORMAT);
        const endTime = now.clone().subtract(2, 'minutes').format(TIME_FORMAT);
        expect(isEndTimeValid(endDate, endTime, '21/07/2020', '12:00')).toEqual(true);
    });
});

describe('isStartDateValid', () => {
    const now = moment('2020-07-20T00:00:00');
    it('startDate should be in the correct format', () => {
        expect(isStartDateValid('20200721', now)).toEqual(false);
    });

    it('startDate for recurrent after now should be valid', () => {
        expect(isStartDateValid('21/07/2020', now, true)).toEqual(true);
    });

    it('startDate for recurrent before now should be invalid', () => {
        expect(isStartDateValid('19/07/2020', now, true)).toEqual(false);
    });

    it('startDate for non recurrent after now should be valid', () => {
        expect(isStartDateValid('21/07/2020', now, false)).toEqual(true);
    });

    it('startDate for non recurrent before now should be valid', () => {
        expect(isStartDateValid('19/07/2020', now, false)).toEqual(true);
    });
});

describe('isStartTimeValid', () => {
    const now = moment('2020-07-20T12:00:00');
    it('startTime should be in the correct format', () => {
        expect(isStartTimeValid('20/07/2020', '1500', now)).toEqual(false);
    });

    it('startTime for recurrent after now should be valid', () => {
        expect(isStartTimeValid('20/07/2020', '15:00', now, true)).toEqual(true);
    });

    it('startTime for recurrent before now should be invalid', () => {
        expect(isStartTimeValid('20/07/2020', '09:00', now, true)).toEqual(false);
    });

    it('startTime for non recurrent after now should be valid', () => {
        expect(isStartTimeValid('20/07/2020', '15:00', now, false)).toEqual(true);
    });

    it('startTime for non recurrent before now should be valid', () => {
        expect(isStartTimeValid('20/07/2020', '09:00', now, false)).toEqual(true);
    });
});

describe('transformIncidentNo', () => {
    it('Should return null if the incidentNo is undefined or null.', () => {
        expect(transformIncidentNo(null)).toEqual(null);
        expect(transformIncidentNo(undefined)).toEqual(null);
    });

    it('Should return a correct transformed incident No.', () => {
        const fakeIncident01 = 9384;
        const fakeIncident02 = 193822;
        expect(transformIncidentNo(fakeIncident01)).toEqual('DISR009384');
        expect(transformIncidentNo(fakeIncident02)).toEqual('DISR193822');
    });
});

describe('isDurationValid', () => {
    it('should be true, regardless of value, if not a recurrent disruption', () => {
        expect(isDurationValid(null, false)).toEqual(true);
        expect(isDurationValid('-1', false)).toEqual(true);
    });

    it('should be true for an integer between 1 and 24', () => {
        for (let i = 1; i <= 24; i++) {
            expect(isDurationValid(i.toString(), true)).toEqual(true);
        }
    });

    it('should be false for non integer', () => {
        expect(isDurationValid('duration', true)).toEqual(false);
    });

    it('should be false for negatives, zero or greater than 24', () => {
        expect(isDurationValid('-1', true)).toEqual(false);
        expect(isDurationValid('0', true)).toEqual(false);
        expect(isDurationValid('25', true)).toEqual(false);
    });
});

describe('momentFromDateTime', () => {
    it('should be undefined for non valid param', () => {
        expect(momentFromDateTime(null, null)).toBeUndefined();
    });

    it('should be valid string for correcnt params', () => {
        expect(typeof momentFromDateTime('2022/08/03', '22:17').toString()).toBe('string');
    });
});

describe('buildSubmitBody', () => {
    it('should include workarounds when passed', () => {
        const workarounds = [{ type: 'all', workaround: 'workaround' }];
        expect(buildSubmitBody({}, [], [], workarounds)).toEqual({
            affectedEntities: [],
            mode: '',
            workarounds,
        });
    });

    it('should not include workarounds when not passed', () => {
        expect(buildSubmitBody({}, [], [])).toEqual({
            affectedEntities: [],
            mode: '',
        });
    });
});

describe('getStatusOptions', () => {
    const now = moment('2020-07-20T00:00:00');
    it('should return not-started and resolved when start time is in the future', () => {
        expect(getStatusOptions('20/07/2020', '01:00', now)).toEqual([STATUSES.NOT_STARTED, STATUSES.RESOLVED]);
    });

    it('should return in-progress and resolved when start time is in the past or present', () => {
        expect(getStatusOptions('20/07/2020', '00:00', now)).toEqual([STATUSES.IN_PROGRESS, STATUSES.RESOLVED]);
        expect(getStatusOptions('19/07/2020', '23:00', now)).toEqual([STATUSES.IN_PROGRESS, STATUSES.RESOLVED]);
    });

    it('should return not-started, in-progress and resolved when start time is not valid', () => {
        expect(getStatusOptions('20-07-2020', '0000', now)).toEqual([STATUSES.NOT_STARTED, STATUSES.IN_PROGRESS, STATUSES.RESOLVED]);
    });

    it('should return draft when status is draft and start time is in the future', () => {
        expect(getStatusOptions('20/07/2020', '01:00', now, STATUSES.DRAFT)).toEqual([STATUSES.NOT_STARTED, STATUSES.RESOLVED, STATUSES.DRAFT]);
    });

    it('should return draft when status is draft and start time is in the past', () => {
        expect(getStatusOptions('19/07/2020', '23:00', now, STATUSES.DRAFT)).toEqual([STATUSES.IN_PROGRESS, STATUSES.RESOLVED, STATUSES.DRAFT]);
    });

    it('should return draft, in-progress, and resolved when status is draft and start time is invalid', () => {
        expect(getStatusOptions('20-07-2020', '0000', now, STATUSES.DRAFT)).toEqual([STATUSES.NOT_STARTED, STATUSES.IN_PROGRESS, STATUSES.RESOLVED, STATUSES.DRAFT]);
    });

    it('should return draft when status is draft and start time is in the past or present', () => {
        expect(getStatusOptions('20/07/2020', '00:00', now, STATUSES.DRAFT)).toEqual([STATUSES.IN_PROGRESS, STATUSES.RESOLVED, STATUSES.DRAFT]);
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
        }))).toEqual(true);
        expect(result.get(JSON.stringify({
            stopId: '41386-6206d5fd',
            stopCode: '41386',
            stopName: 'Albany Bus Station',
            stopLat: undefined,
            stopLon: undefined,
            directionId: 0,
        }))).toEqual(
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
        expect(result.has(undefined)).toEqual(true);
        expect(result.get(undefined).length).toEqual(2);
    });
    it('Should return a empty map', () => {
        expect(groupStopsByRouteElementByParentStation([])).toEqual(new Map());
    });
});

describe('getPassengerCountRange', () => {
    it('should return an appropriate value', () => {
        expect(getPassengerCountRange(237)).toEqual('<500');
        expect(getPassengerCountRange(500)).toEqual('500 - 5,000');
        expect(getPassengerCountRange(6789)).toEqual('5,001 - 15,000');
        expect(getPassengerCountRange(23700)).toEqual('15,001 - 40,000');
        expect(getPassengerCountRange(86000)).toEqual('>40,000');
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
        expect(result).toEqual([{
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

        expect(result).toEqual([
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

        expect(result).toEqual([
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

        expect(result).toEqual([
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
        expect(isRecurringPeriodInvalid(disruption)).toEqual(true);
    });

    it('should return true for disruption with undefined byweekday', () => {
        const disruption = { recurrencePattern: { byweekday: undefined, dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: 2 };
        expect(isRecurringPeriodInvalid(disruption)).toEqual(true);
    });

    it('should return true for disruption with duration of 0', () => {
        const disruption = { recurrencePattern: { byweekday: [1, 2], dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: 0 };
        expect(isRecurringPeriodInvalid(disruption)).toEqual(true);
    });

    it('should return true for disruption with negative duration', () => {
        const disruption = { recurrencePattern: { byweekday: [1, 2], dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: -5 };
        expect(isRecurringPeriodInvalid(disruption)).toEqual(true);
    });

    it('should return true for disruption with empty recurrencePattern object', () => {
        const disruption = { recurrencePattern: {}, duration: 2 };
        expect(isRecurringPeriodInvalid(disruption)).toEqual(true);
    });

    it('should return true for disruption with non-integer duration', () => {
        const disruption = { recurrencePattern: { byweekday: [1, 2], dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: 'two' };
        expect(isRecurringPeriodInvalid(disruption)).toEqual(true);
    });

    it('should return false for disruption with valid byweekday, valid dtstart, valid until, and duration as a stringified number', () => {
        const disruption = { recurrencePattern: { byweekday: [1, 2], dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' }, duration: '2' };
        expect(isRecurringPeriodInvalid(disruption)).toEqual(false);
    });
});

describe('getDurationWithoutSeconds', () => {
    const disruption = {
        disruptionId: 1,
        incidentNo: 'DISR0001',
        mode: 'Train',
        affectedEntities: [
            {
                routeId: 'WEST-201',
                routeType: 2,
                routeShortName: 'WEST',
                agencyName: 'AT Metro',
                agencyId: 'AM',
                tokens: [
                    'west',
                ],
            },
        ],
        impact: 'REDUCED_SERVICE',
        cause: 'HOLIDAY',
        startTime: '2023-03-17T11:41:13.775Z',
        endTime: '2023-03-18T19:41:13.775Z',
        estimatedResolutionDuration: 4,
        estimatedServiceResumeTime: '2020-03-17T19:42:00.739Z',
        status: 'in-progress',
        lastUpdatedTime: '2020-03-17T19:42:00.739Z',
        lastUpdatedBy: 'michael.weber@propellerhead.co.nz',
        description: 'Test description',
        createdBy: 'michael.weber@propellerhead.co.nz',
        createdTime: '2020-03-17T19:42:00.739Z',
        url: '',
        header: 'Holidays for everyone',
        uploadedFiles: [],
        workarounds: [{
            type: 'all',
            workaround: 'workaround text',
        }],
        notes: [],
        severity: 'UNKNOWN',
        activePeriods: [
            {
                startTime: 1661805000,
                endTime: 1661812200,
            },
            {
                startTime: 1661977800,
                endTime: 1661985000,
            },
        ],
    };

    beforeEach(() => {
        MockDate.set(moment('2023-03-17T12:00:00Z').toDate());
    });

    afterEach(() => {
        MockDate.reset();
    });

    it('should return - when now <= startTime', () => {
        const result = getDurationWithoutSeconds({
            ...disruption,
            startTime: '2024-03-17T19:41:13.775Z',
            endTime: '2023-10-02T12:00:00Z',
        });
        expect(result).toEqual('-');
    });

    it('should return status draft and no active periods empty array', () => {
        const result = getDurationWithoutSeconds({
            ...disruption,
            startTime: '2023-03-16T10:00:00Z',
            endTime: '2023-03-19T12:00:00Z',
            status: 'draft',
            activePeriods: [],
        });
        expect(result).toEqual('-');
    });

    it('should return valid duration', () => {
        const result = getDurationWithoutSeconds(disruption);
        expect(result).toEqual('0 hours, 18 minutes');
    });
});

describe('buildDisruptionsQuery', () => {
    it('should return only IncludeDraft false', () => {
        const result = buildDisruptionsQuery({});
        expect(result).toEqual('?includeDraft=false');
    });

    it('should include statuses in the query string', () => {
        const result = buildDisruptionsQuery({ statuses: ['in-progress', 'resolved'] });
        expect(result).toEqual('?statuses=in-progress&statuses=resolved&includeDraft=false');
    });

    it('should include stopId in the query string', () => {
        const result = buildDisruptionsQuery({ stopId: '1234' });
        expect(result).toEqual('?stopId=1234&includeDraft=false');
    });

    it('should include stopCode in the query string', () => {
        const result = buildDisruptionsQuery({ stopCode: '5678' });
        expect(result).toEqual('?stopCode=5678&includeDraft=false');
    });

    it('should include onlyWithStops in the query string', () => {
        const result = buildDisruptionsQuery({ onlyWithStops: true });
        expect(result).toEqual('?onlyWithStops=true&includeDraft=false');
    });

    it('should include includeDrafts in the query string when true', () => {
        const result = buildDisruptionsQuery({ includeDrafts: true });
        expect(result).toEqual('?includeDraft=true');
    });

    it('should include includeDraft=false in the query string when not provided', () => {
        const result = buildDisruptionsQuery({});
        expect(result).toEqual('?includeDraft=false');
    });

    it('should combine multiple filters into a single query string', () => {
        const result = buildDisruptionsQuery({
            statuses: ['in-progress', 'resolved'],
            stopId: '1234',
            stopCode: '5678',
            onlyWithStops: true,
            includeDrafts: false,
        });
        expect(result).toEqual('?statuses=in-progress&statuses=resolved&stopId=1234&stopCode=5678&onlyWithStops=true&includeDraft=false');
    });
});

describe('transformParentSourceIdNo', () => {
    it('should return null if id is null', () => {
        expect(transformParentSourceIdNo(null)).toEqual(null);
    });

    it('should return null if id is undefined', () => {
        expect(transformParentSourceIdNo(undefined)).toEqual(null);
    });

    it('should return "CCD000001" when id is 1', () => {
        expect(transformParentSourceIdNo(1)).toEqual('CCD000001');
    });

    it('should return "CCD001234" when id is 1234', () => {
        expect(transformParentSourceIdNo(1234)).toEqual('CCD001234');
    });

    it('should return "CCD123456" when id is 123456', () => {
        expect(transformParentSourceIdNo(123456)).toEqual('CCD123456');
    });

    it('should return "CCD999999" when id is 999999', () => {
        expect(transformParentSourceIdNo(999999)).toEqual('CCD999999');
    });

    it('should return "CCD1234567" when id is more than 6 digits', () => {
        expect(transformParentSourceIdNo(1234567)).toEqual('CCD1234567');
    });

    it('should handle string input as number', () => {
        expect(transformParentSourceIdNo('42')).toEqual('CCD000042');
    });

    it('should return null if id is 0', () => {
        expect(transformParentSourceIdNo(0)).toEqual(null);
    });

    it('should return null if id is empty string', () => {
        expect(transformParentSourceIdNo('')).toEqual(null);
    });
});

const mockDisruption1 = {
    disruptionId: 139535,
    incidentNo: 'DISR139535',
    mode: 'Bus',
    affectedEntities: {
        affectedRoutes: [{
            routeId: '101-202',
            routeType: 3,
            routeShortName: '101',
            agencyName: 'New Zealand Bus',
            agencyId: 'NZB',
            text: '101',
            category: {
                type: 'route',
                icon: '',
                label: 'Routes',
            },
            icon: 'Bus',
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: 'route',
        },
        {
            routeId: '105-202',
            routeType: 3,
            routeShortName: '105',
            agencyName: 'New Zealand Bus',
            agencyId: 'NZB',
            text: '105',
            category: {
                type: 'route',
                icon: '',
                label: 'Routes',
            },
            icon: 'Bus',
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: 'route',
        }],
        affectedStops: [],
    },
    impact: 'ESCALATOR_NOT_WORKING',
    cause: 'CONGESTION',
    startTime: '2025-08-21T20:27:00.000Z',
    endTime: null,
    status: 'in-progress',
    lastUpdatedTime: '2025-08-21T20:27:33.201Z',
    lastUpdatedBy: 'aqwe@propellerhead.co.nz',
    description: null,
    createdBy: 'aqwe@propellerhead.co.nz',
    createdTime: '2025-08-21T20:27:33.201Z',
    header: 'test incident n0827',
    feedEntityId: 'eacda2bb-baf4-44dc-9b11-bd2c15021ff1',
    uploadedFiles: null,
    createNotification: false,
    exemptAffectedTrips: null,
    version: 1,
    duration: '',
    activePeriods: [
        {
            startTime: 1755808020,
        },
    ],
    recurrencePattern: null,
    recurrent: false,
    workarounds: [
        {
            type: 'route',
            workaround: 'route 101',
            routeShortName: '101',
        },
        {
            type: 'route',
            workaround: 'route 105',
            routeShortName: '105',
        },
    ],
    notes: [{ id: 1, description: 'Note 1' }],
    severity: 'HEADLINE',
    passengerCount: null,
    incidentId: 139273,
    incidentTitle: 'test incident n0827',
    incidentDisruptionNo: 'CCD139273',
};

const mockDisruption2 = {
    disruptionId: 139535,
    incidentNo: 'DISR139535',
    mode: 'Train',
    affectedEntities: {
        affectedRoutes: [],
        affectedStops: [{
            stopId: '100-56c57897',
            stopName: 'Papatoetoe Train Station',
            stopCode: '100',
            locationType: 1,
            stopLat: -36.97766,
            stopLon: 174.84925,
            parentStation: null,
            platformCode: null,
            routeType: 2,
            text: '100 - Papatoetoe Train Station',
            category: {
                type: 'stop',
                icon: 'stop',
                label: 'Stops',
            },
            icon: 'stop',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        },
        {
            stopId: '101-9ef61446',
            stopName: 'Otahuhu Train Station',
            stopCode: '101',
            locationType: 1,
            stopLat: -36.94669,
            stopLon: 174.83321,
            parentStation: null,
            platformCode: null,
            routeType: 2,
            text: '101 - Otahuhu Train Station',
            category: {
                type: 'stop',
                icon: 'stop',
                label: 'Stops',
            },
            icon: 'stop',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        },
        {
            stopId: '102-a4eddeea',
            stopName: 'Penrose Train Station',
            stopCode: '102',
            locationType: 1,
            stopLat: -36.91009,
            stopLon: 174.8157,
            parentStation: null,
            platformCode: null,
            routeType: 2,
            text: '102 - Penrose Train Station',
            category: {
                type: 'stop',
                icon: 'stop',
                label: 'Stops',
            },
            icon: 'stop',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        },
        {
            stopId: '103-be3d2b7e',
            stopName: 'Glen Innes Train Station',
            stopCode: '103',
            locationType: 1,
            stopLat: -36.8788,
            stopLon: 174.85412,
            parentStation: null,
            platformCode: null,
            routeType: 2,
            text: '103 - Glen Innes Train Station',
            category: {
                type: 'stop',
                icon: 'stop',
                label: 'Stops',
            },
            icon: 'stop',
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        }],
    },
    impact: 'ESCALATOR_NOT_WORKING',
    cause: 'CONGESTION',
    startTime: '2025-08-24T20:27:00.000Z',
    endTime: null,
    status: 'in-progress',
    lastUpdatedTime: '2025-08-21T20:27:33.201Z',
    lastUpdatedBy: 'aqwe@propellerhead.co.nz',
    description: null,
    createdBy: 'aqwe@propellerhead.co.nz',
    createdTime: '2025-08-21T20:27:33.201Z',
    header: 'test incident n0827',
    feedEntityId: 'eacda2bb-baf4-44dc-9b11-bd2c15021ff1',
    uploadedFiles: null,
    createNotification: false,
    exemptAffectedTrips: null,
    version: 1,
    duration: '',
    activePeriods: [
        {
            startTime: 1755808020,
        },
    ],
    recurrencePattern: null,
    recurrent: false,
    workarounds: [
        {
            type: 'stop',
            workaround: '10',
            stopCode: '100',
        },
        {
            type: 'stop',
            workaround: '101',
            stopCode: '101',
        },
        {
            type: 'stop',
            workaround: '102',
            stopCode: '102',
        },
        {
            type: 'stop',
            workaround: '103',
            stopCode: '103',
        },
    ],
    notes: [{ id: 1, description: 'Note 1' }],
    severity: 'HEADLINE',
    passengerCount: null,
    incidentId: 139273,
    incidentTitle: 'test incident n0827',
    incidentDisruptionNo: 'CCD139273',
};

const mockIncident = {
    incidentId: 139273,
    mode: 'Bus, Train',
    cause: 'CONGESTION',
    startTime: momentFromDateTime(moment('2025-08-21T20:27:00.000Z').format(DATE_FORMAT), '2025-08-21T20:27:00.000Z'),
    endTime: null,
    status: 'in-progress',
    header: 'test incident n0827',
    version: 1,
    recurrencePattern: null,
    duration: '',
    recurrent: false,
    source: 'UI',
    notes: [],
    severity: 'HEADLINE',
    disruptions: [{ ...mockDisruption1 }, { ...mockDisruption2 }],
    lastUpdatedTime: '2025-08-21T20:27:33.172Z',
    lastUpdatedBy: 'aqwe@propellerhead.co.nz',
    createdTime: '2025-08-21T20:27:33.172Z',
    createdBy: 'aqwe@propellerhead.co.nz',
};

const mockRecurrentDisruption1 = {
    ...mockDisruption1,
    startDate: '03/10/2025',
    startTime: '16:25',
    endDate: '12/10/2025',
    endTime: '',
    duration: '3',
    recurrencePattern: {
        byweekday: [2, 4, 6, null],
        dtstart: '2025-10-02T16:23:00.000Z',
        freq: 2,
        until: '2025-10-11T16:23:00.000Z',
    },
};

const mockRecurrentDisruption2 = {
    ...mockDisruption2,
    startDate: '01/10/2025',
    startTime: '16:23',
    endDate: '10/10/2025',
    endTime: '',
    duration: '2',
    recurrencePattern: {
        byweekday: [3, 4],
        dtstart: '2025-10-03T16:25:00.000Z',
        freq: 2,
        until: '2025-10-10T16:25:00.000Z',
    },
};

const mockRecurrentIncident = {
    incidentId: 139273,
    mode: 'Bus, Train',
    cause: 'CONGESTION',
    startDate: '03/10/2025',
    startTime: moment([2025, 9, 3, 16, 23, 0, 0]),
    endTime: '', // moment([2025, 9, 10, 21, 23, 0, 0]),
    endDate: '10/10/2025',
    status: 'in-progress',
    header: 'test incident n0827',
    version: 1,
    recurrencePattern: {
        byweekday: [2, null],
        dtstart: '2025-10-03T16:23:00.000Z',
        freq: 2,
        until: '2025-10-10T16:23:00.000Z',
    },
    duration: '1',
    recurrent: true,
    source: 'UI',
    notes: [],
    severity: 'HEADLINE',
    disruptions: [{ ...mockRecurrentDisruption1 }, { ...mockRecurrentDisruption2 }],
};

describe('buildDisruptionSubmitBody', () => {
    beforeEach(() => {
        MockDate.set(fakeNow);
    });

    afterEach(() => {
        MockDate.reset();
    });
    it('Should build incident body for request', () => {
        const expectedDisruption1 = {
            ...mockDisruption1,
            affectedEntities: [...mockDisruption1.affectedEntities.affectedRoutes.map((
                { routeId, routeShortName, routeType, type, directionId, stopId, stopCode, stopName, stopLat, stopLon },
            ) => ({
                routeId,
                routeShortName,
                routeType,
                type,
                notes: [],
                ...(stopCode !== undefined && {
                    directionId,
                    stopId,
                    stopCode,
                    stopName,
                    stopLat,
                    stopLon,
                }),
            })),
            ...mockDisruption1.affectedEntities.affectedStops.map(entity => omit(entity, ['shapeWkt']))],
            endTime: undefined,
            startTime: momentFromDateTime(moment('2025-08-21T20:27:00.000Z').format(DATE_FORMAT), '2025-08-21T20:27:00.000Z'),
            url: '',
        };
        const expectedDisruption2 = {
            ...mockDisruption2,
            affectedEntities: [...mockDisruption2.affectedEntities.affectedRoutes.map((
                { routeId, routeShortName, routeType, type, directionId, stopId, stopCode, stopName, stopLat, stopLon },
            ) => ({
                routeId,
                routeShortName,
                routeType,
                type,
                notes: [],
                ...(stopCode !== undefined && {
                    directionId,
                    stopId,
                    stopCode,
                    stopName,
                    stopLat,
                    stopLon,
                }),
            })),
            ...mockDisruption2.affectedEntities.affectedStops.map(entity => omit(entity, ['shapeWkt']))],
            endTime: undefined,
            startTime: momentFromDateTime(moment('2025-08-24T20:27:00.000Z').format(DATE_FORMAT), '2025-08-24T20:27:00.000Z'),
            url: '',
        };
        const expectedIncident = {
            ...mockIncident,
            disruptions: [{ ...expectedDisruption1 }, { ...expectedDisruption2 }],
            url: '',
        };
        expect(buildIncidentSubmitBody(mockIncident, true)).toEqual(expectedIncident);
    });
});

describe('getMode', () => {
    it('Should return empty mode', () => {
        const incident = {
            ...mockIncident,
            disruptions: [
                {
                    ...mockDisruption1,
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [],
                    },
                },
            ],
        };
        expect(buildIncidentSubmitBody(incident, false).mode).toEqual('');
    });

    it('Should return multiple modes from routes with duplicated mode', () => {
        const incident = {
            ...mockIncident,
            disruptions: [
                {
                    ...mockDisruption1,
                    affectedEntities: {
                        affectedRoutes: [{ routeType: 3 }, { routeType: 2 }, { routeType: 2 }],
                        affectedStops: [],
                    },
                },
            ],
        };
        expect(buildIncidentSubmitBody(incident, false).mode).toEqual('Bus, Train');
    });

    it('Should return multiple modes from routes', () => {
        const incident = {
            ...mockIncident,
            disruptions: [
                {
                    ...mockDisruption1,
                    affectedEntities: {
                        affectedRoutes: [{ routeType: 3 }, { routeType: 2 }],
                        affectedStops: [],
                    },
                },
            ],
        };
        expect(buildIncidentSubmitBody(incident, false).mode).toEqual('Bus, Train');
    });

    it('Should return empty mode due to invalid routeType from route', () => {
        const incident = {
            ...mockIncident,
            disruptions: [
                {
                    ...mockDisruption1,
                    affectedEntities: {
                        affectedRoutes: [{ routeType: 555 }],
                        affectedStops: [],
                    },
                },
            ],
        };
        expect(buildIncidentSubmitBody(incident, false).mode).toEqual('');
    });

    it('Should return mode from stop', () => {
        const incident = {
            ...mockIncident,
            disruptions: [
                {
                    ...mockDisruption1,
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [{ routeType: 4 }],
                    },
                },
            ],
        };
        expect(buildIncidentSubmitBody(incident, false).mode).toEqual('Ferry');
    });

    it('Should return multiple modes from stops', () => {
        const incident = {
            ...mockIncident,
            disruptions: [
                {
                    ...mockDisruption1,
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [{ routeType: 3 }, { routeType: 2 }],
                    },
                },
            ],
        };
        expect(buildIncidentSubmitBody(incident, false).mode).toEqual('Bus, Train');
    });

    it('Should return multiple modes from stops with duplicated mode', () => {
        const incident = {
            ...mockIncident,
            disruptions: [
                {
                    ...mockDisruption1,
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [{ routeType: 3 }, { routeType: 3 }, { routeType: 2 }],
                    },
                },
            ],
        };
        expect(buildIncidentSubmitBody(incident, false).mode).toEqual('Bus, Train');
    });

    it('Should return empty mode due to invalid routeType from stops', () => {
        const incident = {
            ...mockIncident,
            disruptions: [
                {
                    ...mockDisruption1,
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [{ routeType: 555 }, { routeType: 333 }],
                    },
                },
            ],
        };
        expect(buildIncidentSubmitBody(incident, false).mode).toEqual('');
    });

    it('Should build correct body for recurrent incident', () => {
        const incident = {
            ...mockRecurrentIncident,
        };
        const result = buildIncidentSubmitBody(incident, false);
        expect(result.duration).toEqual('3');
        expect(result.recurrencePattern.byweekday.length).toEqual(4);
        expect(result.recurrencePattern.byweekday).toEqual([2, 3, 4, 6]);
        expect(result.recurrencePattern.dtstart).toEqual(momentFromDateTime(mockRecurrentDisruption2.startDate, mockRecurrentDisruption2.startTime).tz('UTC', true).toDate());
        expect(result.recurrencePattern.until).toEqual(momentFromDateTime(mockRecurrentDisruption1.endDate, mockRecurrentDisruption2.startTime).tz('UTC', true).toDate());
    });

    it('Should stay with earliest startTime and undefined endTime', () => {
        const incident = {
            ...mockIncident,
            startTime: moment('2025-08-10T20:27:00.000Z'),
            endTime: null,
            endDate: '',
        };
        const result = buildIncidentSubmitBody(incident, false);
        expect(result.startTime).toEqual(moment('2025-08-10T20:27:00.000Z'));
        expect(result.endTime).toEqual(null);
    });

    it('Should update endTime to the latest from disruptions', () => {
        const incident = {
            ...mockIncident,
            endTime: moment('2025-10-10T12:00:00.000Z'),
            endDate: '10/10/2025',
            disruptions: [
                {
                    ...mockDisruption1,
                    endDate: '12/12:2025',
                    endTime: '12:12',
                },
            ],
        };
        const result = buildIncidentSubmitBody(incident, false);
        expect(result.endTime).toEqual(momentFromDateTime('12/12:2025', '12:12'));
    });

    it('Should recalculate recurrence pattern for disruption', () => {
        const incident = {
            ...mockRecurrentIncident,
            recurrent: true,
            endTime: moment('2025-10-10T12:00:00.000Z'),
            endDate: '10/10/2025',
            disruptions: [
                {
                    ...mockDisruption1,
                    startDate: '10/10/2025',
                    endDate: '12/12/2025',
                    duration: '2',
                    recurrencePattern: {
                        byweekday: [2, 4, 6],
                        freq: 2,
                    },
                },
            ],
        };
        const result = buildIncidentSubmitBody(incident, false);
        expect(result.disruptions[0].recurrencePattern.until).toBeDefined();
        expect(result.disruptions[0].recurrencePattern.dtstart).toBeDefined();
    });

    it('Should make not started effect resolved when disruption become resolved', () => {
        const incident = {
            ...mockIncident,
            endTime: moment('2025-10-10T12:00:00.000Z'),
            endDate: '10/10/2025',
            status: STATUSES.RESOLVED,
            disruptions: [
                {
                    ...mockDisruption1,
                    status: STATUSES.NOT_STARTED,
                    startDate: '11/11/2025',
                    endDate: '12/12/2025',
                    endTime: '23:59',
                },
                {
                    ...mockDisruption2,
                },
            ],
        };
        const result = buildIncidentSubmitBody(incident, false);
        expect(result.disruptions[0].status).toEqual(STATUSES.RESOLVED);
        expect(result.disruptions[0].startTime).toEqual(incident.endTime);
        expect(result.disruptions[0].endTime).toEqual(incident.endTime);
    });
});

describe('getStatusForEffect', () => {
    const fakeTimeNow = new Date(2025, 5, 20, 12, 0, 0);
    beforeEach(() => {
        MockDate.set(fakeTimeNow);
    });

    afterEach(() => {
        MockDate.reset();
    });
    it('Should return not started status if startTime has not passed yet', () => {
        const expectedResult = { status: STATUSES.NOT_STARTED };
        const disruption = {
            ...mockDisruption1,
            startDate: '20/06/2025',
            startTime: '13:00',
        };
        expect(getStatusForEffect(disruption)).toEqual(expectedResult);
    });

    it('Should return in progress status if startTime has passed yet', () => {
        const expectedResult = { status: STATUSES.IN_PROGRESS };
        const disruption = {
            ...mockDisruption1,
            startDate: '20/06/2025',
            startTime: '11:00',
        };
        expect(getStatusForEffect(disruption)).toEqual(expectedResult);
    });
});
