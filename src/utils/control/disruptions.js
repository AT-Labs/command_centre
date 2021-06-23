import { isEmpty, camelCase, isObject, uniq, transform, isArray } from 'lodash-es';
import moment from 'moment';

import { TIME_FORMAT, DATE_FORMAT } from '../../constants/disruptions';
import VEHICLE_TYPES from '../../types/vehicle-types';

export const PAGE_SIZE = 50;

export const formatCreatedUpdatedTime = time => moment(time).format(`${DATE_FORMAT} ${TIME_FORMAT}`);

export const isStartTimeValid = (startDate, startTime, openingTime) => startTime !== '24:00'
    && moment(startTime, TIME_FORMAT, true).isValid()
    && moment(`${startDate}T${startTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`).isSameOrAfter(openingTime, 'minute');

export const isEndTimeValid = (endDate, endTime, nowAsMoment, startDate, startTime) => {
    if (isEmpty(endTime) && isEmpty(endDate)) {
        return true;
    }
    if (isEmpty(endTime) && !isEmpty(endDate)) {
        return false;
    }

    const endTimeMoment = moment(`${endDate}T${endTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`);

    return moment(endTime, TIME_FORMAT, true).isValid()
        && moment(`${startDate}T${startTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`).isSameOrBefore(endTimeMoment, 'minute')
        && nowAsMoment.isSameOrBefore(endTimeMoment, 'minute');
};

export const isEndDateValid = (endDate, startDate) => {
    if (isEmpty(endDate)) {
        return true;
    }

    return moment(endDate, DATE_FORMAT, true).isValid()
        && moment(endDate, DATE_FORMAT).isSameOrAfter(moment(startDate, DATE_FORMAT), 'day')
        && moment(endDate, DATE_FORMAT).isSameOrAfter(moment(), 'day');
};

export const isStartDateValid = (startDate, openingTime) => moment(startDate, DATE_FORMAT, true).isValid()
    && moment(startDate, DATE_FORMAT).isSameOrAfter(openingTime, 'day');

export const momentFromDateTime = (date, time) => {
    if (time && date) {
        return moment(`${date}T${time}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`);
    }
    return undefined;
};

export const getDatePickerOptions = (minimumDate) => {
    let minDate = minimumDate;
    if (minimumDate && minimumDate !== 'today') {
        minDate = moment(minimumDate, DATE_FORMAT).valueOf();
    }
    return {
        enableTime: false,
        minDate,
        dateFormat: 'd/m/Y',
    };
};

export const buildSubmitBody = (disruption, routes, stops) => {
    const modes = routes.map(route => VEHICLE_TYPES[route.routeType].type);
    const routesToRequest = routes.map(({ routeId, routeShortName, routeType }) => ({ routeId, routeShortName, routeType }));
    return {
        ...disruption,
        mode: uniq(modes).join(', '),
        affectedEntities: [...routesToRequest, ...stops],
    };
};

const transformKeysToCamelCase = obj => transform(obj, (acc, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(key);
    acc[camelKey] = isObject(value) ? transformKeysToCamelCase(value) : value;
});

export const toCamelCaseKeys = entities => transformKeysToCamelCase(entities);
