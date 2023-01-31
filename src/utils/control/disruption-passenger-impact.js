import moment from 'moment';
import { sum, isEmpty } from 'lodash-es';
import { DISRUPTION_TYPE } from '../../types/disruptions-types';
import { momentFromDateTime } from './disruptions';
import { DATE_FORMAT } from '../../constants/disruptions';
import { getPassengerCountData } from '../transmitters/passenger-count-api';

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

export const getAllChildStopCodesByStops = (stops, allChildStops) => stops.map(({ locationType, stopCode }) => {
    if (locationType === 1) {
        return Object.values(allChildStops).filter(childStop => childStop.parent_stop_code === stopCode).map(stop => stop.stop_code);
    }
    return stopCode;
}).flat().filter(stopCode => stopCode);

export const extendPassengerCountData = (transformedPassengerCountTreeData, allRoutes, allStops) => transformedPassengerCountTreeData.map(row => ({
    ...row,
    ...(row.routeId && { routeShortName: allRoutes[row.routeId].route_short_name }),
    ...(row.stopCode && { stopName: allStops[row.stopCode].stop_name }),
    ...(row.parentStopCode && { parentStopName: allStops[row.parentStopCode].stop_name }),
}));

export const fetchAndProcessPassengerImpactData = async (disruptionData, affectedRoutes, affectedStops, allChildStops, allRoutes, allStops) => {
    const affectedEntities = [...affectedRoutes, ...affectedStops];
    const routeIds = [...new Set(affectedEntities.map(({ routeId }) => routeId))].filter(routeId => routeId);
    const stopCodes = [...new Set(getAllChildStopCodesByStops(affectedEntities, allChildStops))];
    const startDate = disruptionData.startDate ? disruptionData.startDate : moment(disruptionData.startTime).format(DATE_FORMAT);
    const startTime = momentFromDateTime(startDate, disruptionData.startTime).toISOString();
    let endTime;
    if (!isEmpty(disruptionData.endDate) && !isEmpty(disruptionData.endTime)) {
        endTime = momentFromDateTime(disruptionData.endDate, disruptionData.endTime).toISOString();
    }
    const rawPassengerCountData = await getPassengerCountData(routeIds, stopCodes, startTime, endTime);

    return {
        grid: extendPassengerCountData(transformPassengerCountToTreeData(rawPassengerCountData, disruptionData.disruptionType), allRoutes, allStops),
        total: getPassengerCountTotal(rawPassengerCountData, disruptionData.recurrent, disruptionData.recurrencePattern, disruptionData.duration),
    };
};
