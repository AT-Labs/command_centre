import { isEmpty, camelCase, isObject, uniq, transform, isArray, omit, pick, groupBy } from 'lodash-es';
import moment from 'moment';
import { TIME_FORMAT, LABEL_FREQUENCY, FREQUENCY_TYPE } from '../../constants/disruptions';
import { DATE_FORMAT_DDMMYYYY as DATE_FORMAT } from '../dateUtils';
import VEHICLE_TYPES from '../../types/vehicle-types';
import { STATUSES, PASSENGER_IMPACT_RANGE } from '../../types/disruptions-types';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import { calculateActivePeriods } from '../recurrence';

export const PAGE_SIZE = 50;

export const formatCreatedUpdatedTime = time => moment(time).format(`${DATE_FORMAT} ${TIME_FORMAT}`);

export const momentFromDateTime = (date, time) => {
    if (time && date) {
        return moment(`${date}T${time}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`);
    }
    return undefined;
};

export const generateDisruptionActivePeriods = (disruption) => {
    if (disruption.recurrent) {
        return calculateActivePeriods(disruption.recurrencePattern, Number(disruption.duration), [], false);
    }

    const startTimeMoment = momentFromDateTime(disruption.startDate, disruption.startTime);
    const endTimeMoment = momentFromDateTime(disruption.endDate, disruption.endTime);

    return [{
        startTime: startTimeMoment ? startTimeMoment.unix() : undefined,
        endTime: endTimeMoment ? endTimeMoment.unix() : undefined,
    }];
};

export const isStartTimeValid = (startDate, startTime, openingTime, recurrent = false) => startTime !== '24:00'
    && moment(startTime, TIME_FORMAT, true).isValid()
    && (!recurrent || moment(`${startDate}T${startTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`).isSameOrAfter(openingTime, 'minute'));

export const isEndTimeValid = (endDate, endTime, startDate, startTime) => {
    if (isEmpty(endTime)) {
        return true;
    }

    const endTimeMoment = moment(`${endDate}T${endTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`);

    return moment(endTime, TIME_FORMAT, true).isValid()
        && moment(`${startDate}T${startTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`).isSameOrBefore(endTimeMoment, 'minute');
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
        && (!recurrent || moment(endDate, DATE_FORMAT).isSameOrAfter(moment(), 'day'));
};

export const isStartDateValid = (startDate, openingTime, recurrent = false) => moment(startDate, DATE_FORMAT, true).isValid()
    && (!recurrent || moment(startDate, DATE_FORMAT).isSameOrAfter(openingTime, 'day'));

export const isDurationValid = (duration, recurrent) => !recurrent || (!isEmpty(duration) && (Number.isInteger(+duration) && +duration > 0 && +duration < 25));

export const buildSubmitBody = (disruption, routes, stops, workarounds) => {
    const modes = [...routes.map(route => VEHICLE_TYPES[route.routeType].type),
        ...stops.filter(stop => stop.routeId).map(routeByStop => VEHICLE_TYPES[routeByStop.routeType].type)];
    const routesToRequest = routes.map(({ routeId, routeShortName, routeType, type, directionId, stopId, stopCode, stopName, stopLat, stopLon }) => ({
        routeId,
        routeShortName,
        routeType,
        type,
        ...(stopCode !== undefined && {
            directionId,
            stopId,
            stopCode,
            stopName,
            stopLat,
            stopLon,
        }),
    }));
    const stopsToRequest = stops.map(entity => omit(entity, ['shapeWkt']));
    return {
        ...disruption,
        mode: uniq(modes).join(', '),
        affectedEntities: [...routesToRequest, ...stopsToRequest],
        ...(workarounds && { workarounds }),
    };
};

const getMode = disruption => [...disruption.affectedEntities.affectedRoutes.map(route => VEHICLE_TYPES[route.routeType].type),
    ...disruption.affectedEntities.affectedStops.filter(stop => stop.routeId).map(routeByStop => VEHICLE_TYPES[routeByStop.routeType].type)];

export const buildDisruptionSubmitBody = (disruption, incidentHeader, incidentStatus, incidentCause, incidentUrl, isEditMode, incidentEndTimeMoment) => {
    const startDate = disruption.startDate ? disruption.startDate : moment(disruption.startTime).format(DATE_FORMAT);
    const startTimeMoment = momentFromDateTime(startDate, disruption.startTime);
    let endTimeMoment;
    if (!isEmpty(disruption.endDate) && !isEmpty(disruption.endTime)) {
        endTimeMoment = momentFromDateTime(disruption.endDate, disruption.endTime);
    }
    const modes = getMode(disruption);
    const routesToRequest = disruption.affectedEntities.affectedRoutes.map((
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
    }));
    const stopsToRequest = disruption.affectedEntities.affectedStops.map(entity => omit(entity, ['shapeWkt']));

    const isStatusBecomeResolved = incidentStatus === STATUSES.RESOLVED && disruption.status !== STATUSES.RESOLVED;
    return {
        ...disruption,
        ...(isEditMode ? { } : { header: incidentHeader }),
        ...(isEditMode ? { } : { status: incidentStatus }),
        ...(isEditMode ? { } : { cause: incidentCause }),
        url: incidentUrl,
        endTime: endTimeMoment,
        startTime: startTimeMoment,
        mode: uniq(modes).join(', '),
        affectedEntities: [...routesToRequest, ...stopsToRequest],
        ...(isStatusBecomeResolved && incidentEndTimeMoment ? { status: STATUSES.RESOLVED, endTime: incidentEndTimeMoment } : { }),
    };
};

export const buildIncidentSubmitBody = (incident, isEditMode) => {
    const modes = incident.disruptions.flatMap(disruption => getMode(disruption));
    return {
        ...incident,
        mode: uniq(modes).join(', '),
        disruptions: incident.disruptions.flatMap(disruption => buildDisruptionSubmitBody(
            disruption,
            incident.header,
            incident.status,
            incident.cause,
            incident.url,
            isEditMode,
            incident.endTime,
        )),
    };
};

const transformKeysToCamelCase = obj => transform(obj, (acc, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(key);
    acc[camelKey] = isObject(value) ? transformKeysToCamelCase(value) : value;
});

export const toCamelCaseKeys = entities => transformKeysToCamelCase(entities);

export const transformIncidentNo = (disruptionId) => {
    if (!disruptionId) return null;

    return `DISR${disruptionId.toString().padStart(6, '0')}`;
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
    itemOptions: [{ key: '0', value: FREQUENCY_TYPE.ONCE }, { key: '1', value: FREQUENCY_TYPE.RECURRING }],
});

export const getStatusOptions = (startDate, startTime, now, status) => {
    let statuses = Object.values(STATUSES);
    if (status !== STATUSES.DRAFT) statuses = statuses.filter(s => s !== STATUSES.DRAFT);

    const startDateTime = moment(`${startDate}T${startTime}:00`, `${DATE_FORMAT}T${TIME_FORMAT}:ss`, true);
    if (!startDateTime || !startDateTime.isValid()) {
        return Object.values(statuses);
    }
    if (startDateTime.isAfter(now)) {
        return Object.values(statuses).filter(s => s !== STATUSES.IN_PROGRESS);
    }

    return Object.values(statuses).filter(s => s !== STATUSES.NOT_STARTED);
};

/**
 * this function takes a list of stops and groups them by their parent station, those without a parent station are added to the array 'noParentStation'.
 */
export const groupStopsByRouteElementByParentStation = (list) => {
    const result = new Map();
    list.forEach((element) => {
        if (element.parentStationStopId) {
            const parent = {
                stopId: element.parentStationStopId,
                stopCode: element.parentStationStopCode,
                stopName: element.parentStationStopName,
                stopLat: element.parentStationStopLat,
                stopLon: element.parentStationStopLon,
                directionId: element.directionId,
            };
            const parentAsString = JSON.stringify(parent);
            if (!result.has(parentAsString)) {
                result.set(parentAsString, []);
            }
            result.set(parentAsString, [...result.get(parentAsString), element]);
        } else {
            if (!result.has(undefined)) {
                result.set(undefined, []);
            }
            result.set(undefined, [...result.get(undefined), element]);
        }
    });
    return result;
};

export const getDeduplcatedAffectedRoutes = (affectedEntities) => {
    if (!Array.isArray(affectedEntities)) return [];
    return [...new Set(affectedEntities.filter(entity => entity.routeId).map(({ routeShortName }) => routeShortName))];
};

export const getDeduplcatedAffectedStops = (affectedEntities) => {
    if (!Array.isArray(affectedEntities)) return [];
    return [...new Set(affectedEntities.filter(entity => entity.stopCode).map(({ stopCode }) => stopCode))];
};

export const filterOnlyRouteParams = route => pick(route, ['routeId', 'routeShortName', 'routeType', 'routeColor', 'shapeWkt', 'agencyId', 'agencyName',
    'text', 'category', 'icon', 'valueKey', 'labelKey', 'type']);
export const filterOnlyStopParams = stop => pick(stop, ['stopId', 'stopName', 'stopCode', 'locationType', 'stopLat', 'stopLon', 'parentStation',
    'platformCode', 'text', 'category', 'icon', 'valueKey', 'labelKey', 'type', 'groupId']);

const { ROUTE, STOP, STOP_GROUP } = SEARCH_RESULT_TYPE;

export const formatStop = (stop, text = null, category = null, icon = null) => ({
    stopId: stop.stop_id,
    stopName: stop.stop_name,
    stopCode: stop.stop_code,
    locationType: stop.location_type,
    stopLat: stop.stop_lat,
    stopLon: stop.stop_lon,
    parentStation: stop.parent_station,
    platformCode: stop.platform_code,
    routeType: stop.route_type,
    text: text ?? `${stop.stop_code} - ${stop.stop_name}`,
    category,
    icon,
    valueKey: 'stopCode',
    labelKey: 'stopCode',
    type: STOP.type,
});

export const formatStopsWithGroup = (stops, groupId) => stops.map(stop => ({
    ...formatStop(stop),
    groupId,
}));

export const formatStopsInStopGroup = (stopGroups, allStops) => {
    const stops = [];
    stopGroups.forEach((group) => {
        if (!group.stops[0].value) {
            stops.push(...group.stops);
        } else {
            const groupStops = group.stops.map((stop) => {
                let foundStop = allStops[stop.value];

                if (!foundStop) {
                    foundStop = {
                        stop_id: `-${stop.value}`,
                        text: `${stop.value}`,
                        stop_name: `${stop.value}`,
                        stop_code: 'Not Found',
                    };
                }

                return foundStop;
            });

            stops.push(...formatStopsWithGroup(groupStops, group.groupId));
        }
    });

    return groupBy(stops, 'groupId');
};

export const entityToItemTransformers = {
    [ROUTE.type]: entity => ({
        routeId: entity.data.route_id,
        routeType: entity.data.route_type,
        routeShortName: entity.data.route_short_name,
        agencyName: entity.data.agency_name,
        agencyId: entity.data.agency_id,
        text: entity.text,
        category: entity.category,
        icon: entity.icon,
        valueKey: 'routeId',
        labelKey: 'routeShortName',
        type: ROUTE.type,
    }),
    [STOP.type]: entity => formatStop(entity.data, entity.text, entity.category, entity.icon),
    [STOP_GROUP.type]: entity => ({
        groupId: entity.data.id,
        groupName: entity.data.title,
        stops: entity.data.stops,
        valueKey: 'groupId',
        labelKey: 'groupName',
        type: STOP_GROUP.type,
        category: entity.category,
    }),
};

export const itemToEntityTransformers = {
    [ROUTE.type]: item => ({
        text: item.routeShortName,
        data: {
            route_id: item.routeId,
            route_type: item.routeType,
            route_short_name: item.routeShortName,
            agency_name: item.agencyName,
            agency_id: item.agencyId,
        },
        category: item.category,
        icon: item.icon,
    }),
    [STOP.type]: item => ({
        text: item.text,
        data: {
            stop_id: item.stopId,
            stop_name: item.stopName,
            stop_code: item.stopCode,
            location_type: item.locationType,
            stop_lat: item.stopLat,
            stop_lon: item.stopLon,
            parent_station: item.parentStation,
            platform_code: item.platformCode,
            route_type: item.routeType,
        },
        category: item.category,
        icon: item.icon,
    }),
    [STOP_GROUP.type]: item => ({
        text: item.groupName,
        data: {
            group_id: item.groupId,
        },
        category: item.category,
        icon: item.icon,
    }),
};

export const getPassengerCountRange = (count) => {
    if (count < 500) return PASSENGER_IMPACT_RANGE.LOWER_THAN_500;
    if (count >= 500 && count <= 5000) return PASSENGER_IMPACT_RANGE.BETWEEN_500_5000;
    if (count >= 5001 && count <= 15000) return PASSENGER_IMPACT_RANGE.BETWEEN_5001_15000;
    if (count >= 15001 && count <= 40000) return PASSENGER_IMPACT_RANGE.BETWEEN_15001_40000;
    return PASSENGER_IMPACT_RANGE.GREATER_THAN_40000;
};

export const isRecurringPeriodInvalid = (disruption) => {
    const { recurrencePattern, duration } = disruption;
    return (
        isEmpty(recurrencePattern?.byweekday)
        || isEmpty(recurrencePattern?.dtstart)
        || isEmpty(recurrencePattern?.until)
        || !(Number.isInteger(+duration) && +duration > 0)
    );
};

const buildDuration = (disruption) => {
    const startTime = moment(disruption.startTime);
    const endTime = moment(disruption.endTime);
    const now = moment();
    let cutoff = now;
    let duration;

    if (now <= startTime) {
        return undefined;
    }

    if (disruption.status === STATUSES.DRAFT && disruption.activePeriods?.length === 0) {
        return undefined;
    }

    if (disruption.status === STATUSES.RESOLVED || endTime <= now) {
        cutoff = endTime;
    }

    if (!disruption.recurrent) {
        duration = cutoff.diff(startTime, 'seconds');
    }

    if (disruption.recurrent) {
        const cutoffEpoch = cutoff.unix();
        duration = disruption.activePeriods
            ?.filter(activePeriod => activePeriod.startTime < cutoffEpoch)
            .map(activePeriod => ({
                startTime: activePeriod.startTime,
                endTime: Math.min(activePeriod.endTime, cutoffEpoch),
            }))
            .reduce((sum, activePeriod) => sum + (activePeriod.endTime - activePeriod.startTime), 0);
    }

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return { hours, minutes, seconds };
};

export const getDuration = (disruption) => {
    const duration = buildDuration(disruption);
    if (!duration) return '-';
    const { hours, minutes, seconds } = duration;
    return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
};

export const getDurationWithoutSeconds = (disruption) => {
    const duration = buildDuration(disruption);
    if (!duration) return '-';
    const { hours, minutes } = duration;
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return '-';
    return `${hours} hours, ${minutes} minutes`;
};

export const buildDisruptionsQuery = (filters) => {
    const { statuses, stopId, stopCode, onlyWithStops, includeDrafts } = filters;

    const queryParams = [];

    if (statuses) {
        queryParams.push(statuses.map(status => `statuses=${status}`).join('&'));
    }
    if (stopId) {
        queryParams.push(`stopId=${stopId}`);
    }
    if (stopCode) {
        queryParams.push(`stopCode=${stopCode}`);
    }
    if (onlyWithStops) {
        queryParams.push(`onlyWithStops=${onlyWithStops}`);
    }
    if (includeDrafts) {
        queryParams.push(`includeDraft=${includeDrafts}`);
    } else {
        queryParams.push('includeDraft=false');
    }

    return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
};
