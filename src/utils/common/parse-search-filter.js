import moment from 'moment';
import { get } from 'lodash-es';
import { TIME_TYPE } from '../../constants/tripReplays';

const parseSelectedDate = (date, time) => moment(date)
    .add(time.substring(0, 2), 'hours')
    .add(time.substring(3), 'minutes')
    .toISOString();

export const parseSearchFilter = (searchFilters) => {
    const startTime = get(searchFilters, 'startTime') || '00:00';
    const endTime = get(searchFilters, 'endTime') || '27:59';
    const startDateTime = parseSelectedDate(searchFilters.searchDate, startTime);
    const endDateTime = parseSelectedDate(searchFilters.searchDate, endTime);
    const serviceDate = moment(searchFilters.searchDate).format('YYYYMMDD');
    const timeType = get(searchFilters, 'timeType') || TIME_TYPE.Scheduled;
    const searchTermType = get(searchFilters, 'searchTerm.type');
    const searchTerm = get(searchFilters, 'searchTerm.id');

    return { startDateTime, endDateTime, serviceDate, timeType, searchTermType, searchTerm };
};
