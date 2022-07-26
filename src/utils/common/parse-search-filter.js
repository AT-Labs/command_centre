import moment from 'moment';
import _ from 'lodash-es';
import { TIME_TYPE } from '../../constants/tripReplays';

const parseSelectedDate = (date, time) => moment(date)
    .add(time.substring(0, 2), 'hours')
    .add(time.substring(3), 'minutes')
    .toISOString();

export const parseSearchFilter = (searchFilters) => {
    const startTime = _.get(searchFilters, 'startTime') || '00:00';
    const endTime = _.get(searchFilters, 'endTime') || '27:59';
    const startDateTime = parseSelectedDate(searchFilters.searchDate, startTime);
    const endDateTime = parseSelectedDate(searchFilters.searchDate, endTime);
    const serviceDate = moment(searchFilters.searchDate).format('YYYYMMDD');
    const timeType = _.get(searchFilters, 'timeType') || TIME_TYPE.Scheduled;
    const searchTermType = _.get(searchFilters, 'searchTerm.type');
    const searchTerm = _.get(searchFilters, 'searchTerm.id');

    return { startDateTime, endDateTime, serviceDate, timeType, searchTermType, searchTerm };
};
