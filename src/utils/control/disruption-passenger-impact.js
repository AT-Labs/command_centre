import moment from 'moment';
import { sum, isEmpty } from 'lodash-es';
import { DISRUPTION_TYPE } from '../../types/disruptions-types';
import { momentFromDateTime } from './disruptions';
import { getPassengerCountData } from '../transmitters/passenger-count-api';
import { STOP_NOT_AVAILABLE } from '../../constants/disruptions';

export const WEEKDAYS = {
    0: { init: 'M', name: 'monday' },
    1: { init: 'Tu', name: 'tuesday' },
    2: { init: 'W', name: 'wednesday' },
    3: { init: 'Th', name: 'thursday' },
    4: { init: 'F', name: 'friday' },
    5: { init: 'Sa', name: 'saturday' },
    6: { init: 'Su', name: 'sunday' },
};

const weekdayNames = Object.values(WEEKDAYS).map(weekDay => weekDay.name);

const aggregateTreeDataByPath = (row, treePathObject, resMap) => {
    const id = Object.values(treePathObject).join('_');
    const [[lastAdditionalColumnForTreePathKey, lastAdditionalColumnForTreePathValue]] = Object.entries(treePathObject).slice(-1);
    const basicData = {
        id,
        path: Object.values(treePathObject),
        [lastAdditionalColumnForTreePathKey]: lastAdditionalColumnForTreePathValue,
    };
    let aggregatedValueForEachDay;
    if (resMap.has(id)) {
        aggregatedValueForEachDay = weekdayNames.reduce((prev, weekday) => ({ ...prev, [weekday]: sum([resMap.get(id)[weekday], ...row[weekday]]) }), {});
    } else {
        aggregatedValueForEachDay = weekdayNames.reduce((prev, weekday) => ({ ...prev, [weekday]: sum(row[weekday]) }), {});
    }
    resMap.set(id, { ...basicData, ...aggregatedValueForEachDay });
};

export const transformPassengerCountToTreeData = (rawPassengerCountData, disruptionType) => {
    const res = new Map();
    rawPassengerCountData.forEach((row) => {
        const { routeId, parentStopCode, stopCode } = row;
        if (disruptionType === DISRUPTION_TYPE.ROUTES) {
            aggregateTreeDataByPath(row, { routeId, parentStopCode: parentStopCode || '', stopCode }, res);
            aggregateTreeDataByPath(row, { routeId, parentStopCode: parentStopCode || '' }, res);
            aggregateTreeDataByPath(row, { routeId }, res);
        } else if (disruptionType === DISRUPTION_TYPE.STOPS) {
            aggregateTreeDataByPath(row, { parentStopCode: parentStopCode || stopCode, routeId }, res);
            aggregateTreeDataByPath(row, { parentStopCode: parentStopCode || stopCode }, res);
        }
    });
    return Array.from(res.values());
};

const getAffectedHoursByWeekDay = (weekDay, recurrencePattern, duration) => {
    if (!recurrencePattern.byweekday.includes(weekDay)) {
        return [];
    }
    const dayOfWeek = weekDay === 6 ? 0 : weekDay + 1;
    const affectedHours = [];
    const startDate = moment.utc(recurrencePattern.dtstart);
    const endDate = moment.utc(recurrencePattern.until);
    const currentDay = moment.utc(recurrencePattern.dtstart);
    while (currentDay.isSameOrBefore(endDate)) {
        if (currentDay.day() === dayOfWeek) {
            for (let i = 0; i <= duration && startDate.hour() + i <= 23; i++) {
                affectedHours.push(startDate.hour() + i);
            }
            break;
        }
        currentDay.add(1, 'day');
    }
    return affectedHours;
};

export const getPassengerCountTotal = (passengerCountData, recurrent, recurrencePattern, duration) => {
    let total = 0;
    passengerCountData.forEach((affectedEntityData) => {
        weekdayNames.forEach((weekDay, index) => {
            if (affectedEntityData[weekDay]) {
                if (recurrent) {
                    const hours = getAffectedHoursByWeekDay(index, recurrencePattern, duration);
                    hours.forEach((hour) => {
                        total += affectedEntityData[weekDay][hour];
                    });
                } else {
                    total += affectedEntityData[weekDay].reduce((prev, value) => prev + value, 0);
                }
            }
        });
    });
    return total;
};

export const getAllChildStopCodesByStops = (stops, allChildStops, stopsByRoute) => stops.map(({ stopCode, routeId, directionId }) => {
    const childStops = directionId === undefined || !stopsByRoute[routeId]
        ? allChildStops
        : stopsByRoute[routeId]
            .filter(stop => `${stop.directionId}` === `${directionId}`)
            .map(stop => ({ stop_code: stop.stopCode, parent_stop_code: stop.parentStationStopCode }));
    const isParentStop = !!Object.values(childStops).find(childStop => childStop.parent_stop_code === stopCode);
    if (isParentStop) {
        return Object.values(childStops).filter(childStop => childStop.parent_stop_code === stopCode).map(stop => stop.stop_code);
    }
    return stopCode;
}).flat().filter(stopCode => stopCode);

export const extendPassengerCountData = (transformedPassengerCountTreeData, allRoutes, allStops) => transformedPassengerCountTreeData.map(row => ({
    ...row,
    ...(row.stopCode && { stopName: STOP_NOT_AVAILABLE }),
    ...(row.stopCode && allStops[row.stopCode] && { stopName: allStops[row.stopCode].stop_name }),
    ...(row.parentStopCode && { parentStopName: STOP_NOT_AVAILABLE }),
    ...(row.parentStopCode && allStops[row.parentStopCode] && { parentStopName: allStops[row.parentStopCode].stop_name }),
    ...(row.routeId && { routeShortName: allRoutes[row.routeId].route_short_name }),
}));

export const fetchAndProcessPassengerImpactData = async (disruptionData, affectedRoutes, affectedStops, allChildStops, allRoutes, allStops, stopsByRoute) => {
    const affectedEntities = [...affectedRoutes, ...affectedStops].map((entity) => {
        if (!entity.stopCode) {
            return {
                routeId: entity.routeId,
            };
        }
        const childStops = getAllChildStopCodesByStops([entity], allChildStops, stopsByRoute);
        return childStops.map(stopCode => ({
            stopCode,
            ...(entity.routeId && { routeId: entity.routeId }),
        }));
    }).flat().filter((entity, index, arr) => (
        index === arr.findIndex(item => (
            item.routeId === entity.routeId && item.stopCode === entity.stopCode
        ))
    ));
    let { startTime } = disruptionData;
    if (!isEmpty(disruptionData.startDate) && !isEmpty(disruptionData.startTime)) {
        startTime = momentFromDateTime(disruptionData.startDate, disruptionData.startTime).toISOString();
    }
    let { endTime } = disruptionData;
    if (!isEmpty(disruptionData.endDate) && !isEmpty(disruptionData.endTime)) {
        endTime = momentFromDateTime(disruptionData.endDate, disruptionData.endTime).toISOString();
    }
    let rawPassengerCountData = await getPassengerCountData(affectedEntities, startTime, endTime);

    const disruptionType = disruptionData.disruptionType || (isEmpty(affectedRoutes) && !isEmpty(affectedStops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES);

    let gridData = extendPassengerCountData(transformPassengerCountToTreeData(rawPassengerCountData, disruptionType), allRoutes, allStops);
    gridData = gridData.map(row => ({
        ...row,
        ...(row.stopCode && row.stopName === STOP_NOT_AVAILABLE && weekdayNames.reduce((obj, name) => ({ ...obj, [name]: 'n/a' }), {})),
    }));

    rawPassengerCountData = rawPassengerCountData.map(affectedEntityData => ({
        ...affectedEntityData,
        ...(affectedEntityData.stopCode && !allStops[affectedEntityData.stopCode] && weekdayNames.reduce((obj, name) => ({ ...obj, [name]: Array(24).fill(0) }), {})),
    }));
    return {
        grid: gridData,
        total: getPassengerCountTotal(rawPassengerCountData, disruptionData.recurrent, disruptionData.recurrencePattern, disruptionData.duration),
    };
};
