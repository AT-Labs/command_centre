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

export const WEEKDAYS_ISO = {
    0: { init: 'Su', name: 'sunday' },
    1: { init: 'M', name: 'monday' },
    2: { init: 'Tu', name: 'tuesday' },
    3: { init: 'W', name: 'wednesday' },
    4: { init: 'Th', name: 'thursday' },
    5: { init: 'F', name: 'friday' },
    6: { init: 'Sa', name: 'saturday' },
};

const weekdayNames = Object.values(WEEKDAYS).map(weekDay => weekDay.name);
const weekdayNamesISO = Object.values(WEEKDAYS_ISO).map(weekDay => weekDay.name);

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
            if (parentStopCode) {
                aggregateTreeDataByPath(row, { routeId, parentStopCode, stopCode }, res);
            }
            aggregateTreeDataByPath(row, { routeId, parentStopCode: parentStopCode || stopCode }, res);
            aggregateTreeDataByPath(row, { routeId }, res);
        } else if (disruptionType === DISRUPTION_TYPE.STOPS) {
            aggregateTreeDataByPath(row, { parentStopCode: parentStopCode || stopCode, routeId }, res);
            aggregateTreeDataByPath(row, { parentStopCode: parentStopCode || stopCode }, res);
        }
    });
    return Array.from(res.values());
};

export const getPassengerCountTotal = (passengerCountData) => {
    let total = 0;
    passengerCountData.forEach((affectedEntityData) => {
        weekdayNames.forEach((weekDay) => {
            if (affectedEntityData[weekDay]) {
                total += affectedEntityData[weekDay].reduce((prev, value) => prev + value, 0);
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

export const isPeriodLongerThanWeek = (startDate, endDate) => {
    const parsedStartDate = moment(startDate).startOf('hour');
    const parsedEndDate = moment(endDate).startOf('hour');

    return parsedEndDate.diff(parsedStartDate, 'weeks') >= 1;
};

const parseHoursNonRecurrentDisruption = (weekDays, startDayInWeek, startHour, endDayInWeek, endHour) => {
    const weekDayWithHours = {};
    weekDays.forEach((weekDay) => {
        const hours = [];
        if (weekDay === startDayInWeek) {
            for (let i = startHour; i <= 23; i++) {
                hours.push(i);
            }
        } else if (weekDay === endDayInWeek) {
            for (let i = 0; i < endHour; i++) {
                hours.push(i);
            }
        } else {
            hours.push(...Array.from(Array(24).keys()));
        }
        weekDayWithHours[weekdayNamesISO[weekDay]] = hours;
    });
    return weekDayWithHours;
};

export const parseRequestedHoursNonRecurrentDisruption = (weekDays, startDate, endDate) => {
    const startDayInWeek = moment(startDate).day();
    const startHour = moment(startDate).hour();
    const endDayInWeek = moment(endDate).day();
    const endHour = moment(endDate).hour();
    if (isPeriodLongerThanWeek(startDate, endDate)) {
        weekDays.push(...Array.from(Array(7).keys()));
        return weekDays.reduce((acc, value) => ({
            ...acc,
            ...({ [weekdayNamesISO[value]]: Array.from(Array(24).keys()) }),
        }), {});
    }
    if (startDayInWeek <= endDayInWeek) {
        for (let i = startDayInWeek; i <= endDayInWeek; i++) {
            weekDays.push(i);
        }
    } else {
        for (let i = startDayInWeek; i <= 6; i++) {
            weekDays.push(i);
        }
        for (let i = 0; i <= endDayInWeek; i++) {
            weekDays.push(i);
        }
    }
    return parseHoursNonRecurrentDisruption(weekDays, startDayInWeek, startHour, endDayInWeek, endHour);
};

export const parseRequestedHours = (weekDays, hourStartDate, hourEndDate) => {
    let weekDayWithHours = {};
    weekDays.forEach((weekDay) => {
        const hours = [];
        const nextDayHours = [];
        let nextDay;
        if (hourStartDate < hourEndDate) {
            for (let i = hourStartDate; i < hourEndDate; i++) {
                hours.push(i);
            }
        } else {
            for (let i = hourStartDate; i <= 23; i++) {
                hours.push(i);
            }
            nextDay = weekDay + 1;
            if (nextDay > 6) { nextDay = 0; }
            for (let i = 0; i < hourEndDate; i++) {
                nextDayHours.push(i);
            }
        }
        weekDayWithHours = ({
            ...weekDayWithHours,
            ...(weekDayWithHours[weekDay] ? { [weekDay]: [...weekDayWithHours[weekDay], ...hours] } : { [weekDay]: hours }),
            ...((nextDay >= 0 && weekDayWithHours[nextDay]) ? { [nextDay]: [...weekDayWithHours[nextDay], ...nextDayHours] } : { [nextDay]: nextDayHours }),
        });
    });
    return weekDayWithHours;
};

export const getHourFromDate = date => moment.utc(date).hour();

export const fillAffectedEntitiesWithData = (disruptionData, affectedEntities, startTime, endTime) => {
    let filledAffectedEntities;
    if (!disruptionData.recurrent) {
        const weekDayWithHours = parseRequestedHoursNonRecurrentDisruption([], startTime, endTime);
        filledAffectedEntities = affectedEntities.map(entity => ({
            ...entity,
            ...weekDayWithHours,
        }));
    } else {
        const hourStartDate = getHourFromDate(startTime);
        const hourEndDate = getHourFromDate(moment(startTime).add(disruptionData.duration, 'hour').toISOString());

        let weekDays = [];
        weekDays.push(...disruptionData.recurrencePattern.byweekday);

        const hours = parseRequestedHours(weekDays, hourStartDate, hourEndDate);
        weekDays = Object.keys(hours).map(key => Number(key));

        filledAffectedEntities = affectedEntities.map(entity => ({
            ...entity,
            ...(weekdayNames.reduce((obj, name, currentIndex) => (weekDays.includes(currentIndex) ? ({ ...obj, [name]: hours[currentIndex] }) : obj), {})),
        }));
    }
    return filledAffectedEntities;
};

export const fetchAndProcessPassengerImpactData = async (disruptionData, affectedRoutes, affectedStops, allChildStops, allRoutes, allStops, stopsByRoute) => {
    let affectedEntities = [...affectedRoutes, ...affectedStops].map((entity) => {
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

    if (disruptionData.recurrent) {
        startTime = disruptionData.recurrencePattern.dtstart;
    }

    let { endTime } = disruptionData;
    if (!isEmpty(disruptionData.endDate) && !isEmpty(disruptionData.endTime)) {
        endTime = momentFromDateTime(disruptionData.endDate, disruptionData.endTime).toISOString();
    }
    affectedEntities = fillAffectedEntitiesWithData(disruptionData, affectedEntities, startTime, endTime);

    let rawPassengerCountData = await getPassengerCountData(affectedEntities);

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
        total: getPassengerCountTotal(rawPassengerCountData),
    };
};
