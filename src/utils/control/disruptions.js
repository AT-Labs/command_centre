import { isEmpty, camelCase, isObject, uniq, transform, isArray, omit } from 'lodash-es';
import moment from 'moment';

import { TIME_FORMAT, LABEL_FREQUENCY, FREQUENCY_TYPE } from '../../constants/disruptions';
import { DATE_FORMAT_DDMMYYYY as DATE_FORMAT } from '../dateUtils';
import VEHICLE_TYPES from '../../types/vehicle-types';

export const PAGE_SIZE = 50;

export const formatCreatedUpdatedTime = time => moment(time).format(`${DATE_FORMAT} ${TIME_FORMAT}`);

export const isStartTimeValid = (startDate, startTime, openingTime) => startTime !== '24:00'
    && moment(startTime, TIME_FORMAT, true).isValid()
    && moment(`${startDate}T${startTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`).isSameOrAfter(openingTime, 'minute');

export const isEndTimeValid = (endDate, endTime, nowAsMoment, startDate, startTime) => {
    if (isEmpty(endTime)) {
        return true;
    }

    const endTimeMoment = moment(`${endDate}T${endTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`);

    return moment(endTime, TIME_FORMAT, true).isValid()
        && moment(`${startDate}T${startTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`).isSameOrBefore(endTimeMoment, 'minute')
        && nowAsMoment.isSameOrBefore(endTimeMoment, 'minute');
};

export const isEndDateValid = (endDate, startDate, recurrent = false) => {
    if (isEmpty(endDate) && !recurrent) {
        return true;
    }

    if (isEmpty(endDate) && recurrent) {
        return false;
    }

    return moment(endDate, DATE_FORMAT, true).isValid()
        && moment(endDate, DATE_FORMAT).isSameOrAfter(moment(startDate, DATE_FORMAT), 'day')
        && moment(endDate, DATE_FORMAT).isSameOrAfter(moment(), 'day');
};

export const isStartDateValid = (startDate, openingTime) => moment(startDate, DATE_FORMAT, true).isValid()
    && moment(startDate, DATE_FORMAT).isSameOrAfter(openingTime, 'day');

export const isDurationValid = (duration, recurrent) => !recurrent || (!isEmpty(duration) && (Number.isInteger(+duration) && +duration > 0 && +duration < 25));

export const momentFromDateTime = (date, time) => {
    if (time && date) {
        return moment(`${date}T${time}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`);
    }
    return undefined;
};

export const buildSubmitBody = (disruption, routes, stops) => {
    const modes = [...routes.map(route => VEHICLE_TYPES[route.routeType].type),
        ...stops.filter(stop => stop.routeId).map(routeByStop => VEHICLE_TYPES[routeByStop.routeType].type)];
    const routesToRequest = routes.map(({ routeId, routeShortName, routeType }) => ({ routeId, routeShortName, routeType }));
    const stopsToRequest = stops.map(entity => omit(entity, ['shapeWkt']));
    return {
        ...disruption,
        mode: uniq(modes).join(', '),
        affectedEntities: [...routesToRequest, ...stopsToRequest],
    };
};

const transformKeysToCamelCase = obj => transform(obj, (acc, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(key);
    acc[camelKey] = isObject(value) ? transformKeysToCamelCase(value) : value;
});

export const toCamelCaseKeys = entities => transformKeysToCamelCase(entities);

export const transformIncidentNo = (disruptionId) => {
    if (!disruptionId) return null;
    const pad = '00000';
    const paddedId = (pad + disruptionId).slice(-pad.length);
    return `DISR${paddedId}`;
};

export const getRecurrenceDates = (startDate, startTime, endDate) => {
    const recurrenceDates = {};
    if (startDate && startTime) {
        recurrenceDates.dtstart = momentFromDateTime(startDate, startTime).tz('UTC', true).toDate();
    }
    if (endDate && startTime) {
        recurrenceDates.until = momentFromDateTime(endDate, startTime).tz('UTC', true).toDate();
    }
    return recurrenceDates;
};

export const recurrenceRadioOptions = isRecurrent => ({
    title: LABEL_FREQUENCY,
    formGroupClass: 'disruption-creation__wizard-select-details-frequency',
    checkedKey: isRecurrent ? '1' : '0',
    keyValues: [{ key: '0', value: FREQUENCY_TYPE.ONCE }, { key: '1', value: FREQUENCY_TYPE.RECURRING }],
});
