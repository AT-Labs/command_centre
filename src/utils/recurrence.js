import { RRule } from 'rrule';
import moment from 'moment-timezone';
import DATE_TYPE from '../types/date-types';
import { utcDateFormatWithoutTZ, DATE_FORMAT_MMMDDYYYY, DATE_FORMAT_DDMMYYYY } from './dateUtils';

const parseWeekDays = weekdays => weekdays.map((day) => {
    switch (+day) {
    case 0:
        return RRule.MO;
    case 1:
        return RRule.TU;
    case 2:
        return RRule.WE;
    case 3:
        return RRule.TH;
    case 4:
        return RRule.FR;
    case 5:
        return RRule.SA;
    case 6:
        return RRule.SU;
    default:
        return day;
    }
});

export const displayRecurrentDays = (recurrence) => {
    let emptyString = '';
    const Day = {
        0: 'M',
        1: 'Tu',
        2: 'W',
        3: 'Th',
        4: 'F',
        5: 'Sa',
        6: 'Su',
    };
    const stringToArray = recurrence.substring(1, recurrence.length - 1);
    const recurrenceArray = stringToArray.split(',');

    recurrenceArray.forEach((day, index) => {
        if (index === 0) {
            emptyString += Day[day];
        } else {
            emptyString += `, ${Day[day]}`;
        }
    });

    return emptyString;
};

export const getWeekDaysAsString = weekday => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][weekday] || '';

export const getRecurringTextWithFrom = (prefix, { startDate, selectedWeekdays, endDate }) => {
    const from = `from ${moment(startDate, DATE_FORMAT_DDMMYYYY).format(DATE_FORMAT_MMMDDYYYY)}`;
    const recurrence = selectedWeekdays.length === 7 ? 'everyday' : `on ${selectedWeekdays.map(weekday => getWeekDaysAsString(weekday)).join(' ,')}`;
    const until = endDate ? `until ${moment(endDate, DATE_FORMAT_DDMMYYYY).format(DATE_FORMAT_MMMDDYYYY)}` : '';
    return `${prefix} ${recurrence} ${from} ${until}`;
};

export const getRecurrenceText = (recurrencePattern) => {
    if (!recurrencePattern) {
        return null;
    }

    const parsedPattern = {
        ...recurrencePattern,
        byweekday: recurrencePattern.byweekday ? parseWeekDays(recurrencePattern.byweekday) : [],
    };

    return `Repeats ${new RRule(parsedPattern).toText()}`;
};

export const parseRecurrencePattern = recurrencePattern => ({
    ...recurrencePattern,
    until: moment.utc(recurrencePattern.until).toDate(),
    dtstart: moment.utc(recurrencePattern.dtstart).toDate(),
});

export const generateActivePeriodsFromRecurrencePattern = (recurrencePattern, durationInHours) => {
    const rrule = new RRule(parseRecurrencePattern(recurrencePattern));

    return rrule.all().map((date) => {
        const startDate = moment.tz(moment.utc(date).format(utcDateFormatWithoutTZ), DATE_TYPE.TIME_ZONE);

        return ({
            startTime: startDate.unix(),
            endTime: startDate.add(durationInHours, 'h').unix(),
        });
    });
};

const filterPastAndCurrentPeriods = (allActivePeriods, duration, isResolved) => {
    const pastAndCurrentPeriods = [];

    allActivePeriods.some((period) => {
        if (period.endTime && moment.unix(period.endTime).isBefore(moment())) {
            const periodToAdd = { ...period };
            if (!isResolved) {
                const calculatedEndTime = moment.unix(period.startTime).add(duration, 'h');
                if (calculatedEndTime.isAfter(moment())) {
                    periodToAdd.endTime = calculatedEndTime.unix();
                }
            }
            pastAndCurrentPeriods.push(periodToAdd);
        } else if (period.endTime && moment().isBetween(moment.unix(period.startTime), moment.unix(period.endTime))) {
            pastAndCurrentPeriods.push({
                ...period,
                endTime: isResolved ? moment().unix() : moment.unix(period.startTime).add(duration, 'h').unix(),
            });
            return true;
        } else if (moment.unix(period.startTime).isAfter(moment())) {
            return true;
        }

        return false;
    });

    return pastAndCurrentPeriods;
};

const filterFuturePeriods = (allActivePeriods, isResolved) => (isResolved ? []
    : allActivePeriods.filter(period => moment.unix(period.startTime).isAfter(moment())));

export const calculateActivePeriods = (recurrencePattern, durationInHours, allActivePeriods, isResolved) => {
    const newActivePeriods = generateActivePeriodsFromRecurrencePattern(recurrencePattern, durationInHours);

    if (!isResolved && (!allActivePeriods || allActivePeriods.length === 0 || moment().isBefore(moment.unix(allActivePeriods[0].startTime)))) {
        return newActivePeriods;
    }

    const calculatedPeriods = [...filterPastAndCurrentPeriods(allActivePeriods, durationInHours, isResolved), ...filterFuturePeriods(newActivePeriods, isResolved)];

    if (isResolved && (!calculatedPeriods || calculatedPeriods?.length === 0)) {
        const unixNow = moment().unix();
        return [{
            startTime: unixNow,
            endTime: unixNow,
        }];
    }

    return calculatedPeriods;
};

export const fetchEndDateFromRecurrence = pattern => moment.utc(pattern.until).format('DD/MM/YYYY');
