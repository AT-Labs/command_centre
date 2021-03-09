import moment from 'moment';

const weekdays = moment.weekdays(true);

export const DAYS_OF_THE_WEEK = weekdays.map((day, index) => ({
    value: index,
    label: day,
}));
