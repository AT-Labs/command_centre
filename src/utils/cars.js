import moment from 'moment-timezone';
import { DATE_FORMAT_DDMMYYYY } from './dateUtils';
import DATE_TYPE from '../types/date-types';
import { CARS_ACTIVATION_STATUS } from '../constants/cars';

export const formatDate = (date) => {
    if (!date) return '-';
    const formattedDate = moment.utc(date).tz(DATE_TYPE.TIME_ZONE);
    return formattedDate.isValid() ? formattedDate.format(DATE_FORMAT_DDMMYYYY) : '-';
};

export const checkCarActivation = (workStartDate, workEndDate) => {
    const currentDate = moment.utc();

    if (!workStartDate && !workEndDate) {
        return CARS_ACTIVATION_STATUS.DEACTIVATED;
    }

    const startDate = workStartDate ? moment.utc(workStartDate) : null;
    const endDate = workEndDate ? moment.utc(workEndDate) : null;

    if (startDate?.isAfter(currentDate)) {
        return CARS_ACTIVATION_STATUS.DEACTIVATED;
    }

    if (endDate?.isBefore(currentDate)) {
        return CARS_ACTIVATION_STATUS.DEACTIVATED;
    }

    if (startDate?.isBefore(currentDate) && (!endDate || endDate.isAfter(currentDate))) {
        return CARS_ACTIVATION_STATUS.ACTIVATED;
    }

    return CARS_ACTIVATION_STATUS.DEACTIVATED;
};

export const filterCarsByDate = (objects, filterByYesterdayTodayTomorrow) => {
    if (!filterByYesterdayTodayTomorrow) {
        return objects;
    }

    const yesterday = moment.utc().subtract(1, 'days').startOf('day');
    const tomorrow = moment.utc().add(1, 'days').endOf('day');

    return objects.filter((item) => {
        if (!item.properties) return false;

        const { ProjectStartDate, ProjectEndDate } = item.properties;

        const startDate = ProjectStartDate ? moment.unix(ProjectStartDate / 1000000) : null;
        const endDate = ProjectEndDate ? moment.unix(ProjectEndDate / 1000000) : null;

        if (startDate && !endDate) {
            return startDate.isBetween(yesterday, tomorrow, null, '[]');
        }

        if (endDate && !startDate) {
            return endDate.isBetween(yesterday, tomorrow, null, '[]');
        }

        return startDate.isSameOrBefore(tomorrow) && endDate.isSameOrBefore(yesterday);
    });
};

export const getYesterdayTomorrowDates = () => {
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

    return { dateFrom: yesterday, dateTo: tomorrow };
};
