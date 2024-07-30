import wellknown from 'wellknown';
import moment from 'moment-timezone';
import { isEmpty, intersectionWith, get, has, isEqual, cloneDeep } from 'lodash-es';
import isURL from 'validator/lib/isURL';
import crypto from 'crypto';
import { fetchWithAuthHeader } from '../auth';
import DATE_TYPE from '../types/date-types';
import { dateTimeFormat } from './dateUtils';
import { Category } from '../types/incidents';

export const getJSONFromWKT = text => wellknown.parse(text);
export const getAllCoordinatesFromWKT = text => getJSONFromWKT(text).coordinates.map(c => c.reverse());
export const parseTime = (time, date) => {
    const [hour, minute = 0, second = 0, millisecond = 0] = time.split(':').map(part => parseInt(part, 10));
    return moment(date).set({ hour, minute, second, millisecond });
};
export const generateUniqueID = (length = 16) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += alphabet[crypto.randomBytes(4).readUInt32LE(0) % alphabet.length];
    }
    return result;
};
export const getTripTimeDisplay = (time) => {
    if (!time) return '—';
    const timeMoment = parseTime(time);
    return `${timeMoment.format('HH:mm')}${timeMoment.isAfter(moment(), 'day') ? ' (+1)' : ''}`;
};
export const isUrlValid = url => isEmpty(url) || isURL(url, {
    require_protocol: true,
    protocols: ['http', 'https'],
});
export const getTimePickerOptions = (hoursThreshold = 24) => {
    const options = [];
    for (let i = 0; i < hoursThreshold; i++) {
        const hour = i < 10 ? `0${i}` : i;
        options.push({ value: `${hour}:00`, label: getTripTimeDisplay(`${hour}:00:00`) });
        options.push({ value: `${hour}:30`, label: getTripTimeDisplay(`${hour}:30:00`) });
    }
    return options;
};
export const getClosestTimeValueForFilter = (time) => {
    if (!time || (!moment(time, 'HH:mm:ss', true).isValid() && !moment(time, 'HH:mm', true).isValid())) {
        return '';
    }
    const timeMoment = moment(time, 'HH:mm:ss');
    const minute = timeMoment.minute();
    if (minute < 30) {
        timeMoment.set('minute', 0);
    } else {
        timeMoment.set('minute', 30);
    }
    return timeMoment.format('HH:mm');
};
export const formatGroupsForPresentation = items => items.map(item => ({
    value: `group_${item.id}`,
    label: item.title,
    stopGroup: item,
}));
export const getViewPermission = url => fetchWithAuthHeader(
    url,
    { method: 'GET' },
).then(response => response.ok && response.status === 200); // TODO: block, trips, trip replays and messages should expect the same (200 or 204)
export const getTripInstanceId = trip => (trip.tripId ? `${trip.tripId}-${trip.serviceDate}-${trip.startTime}` : 'new-trip');
export const getStopKey = stop => `${stop.stopId}-${stop.stopSequence}-${stop.departureTime || stop.arrivalTime}`;
const browserDetection = () => {
    const { userAgent } = navigator;
    const browsers = {
        chrome: !!userAgent.match(/chrome|chromium|crios/i),
        firefox: !!userAgent.match(/firefox|fxios/i),
        safari: !!userAgent.match(/safari/i),
        opera: !!userAgent.match(/opr\//i),
        Edge: !!userAgent.match(/edg/i),
        IE: !!userAgent.indexOf('MSIE ') || !!userAgent.indexOf('Trident/'),
    };
    return Object.keys(browsers).find(key => browsers[key] === true);
};
export const isChrome = browserDetection() === 'chrome';
// Check if all trips in a specific view are also in the selected trips list to determine whether "all trips selected".
export const checkIfAllTripsAreSelected = (notCompletedTripsKeys, selectedTripsKeys) => notCompletedTripsKeys.length > 0
    && notCompletedTripsKeys.length === intersectionWith(notCompletedTripsKeys, selectedTripsKeys, isEqual).length;

export const formatTime = (time, isNextDay = false) => {
    if (!moment(time).isValid()) {
        throw new Error('Invalid date time');
    }
    return moment(time).tz(DATE_TYPE.TIME_ZONE).format('HH:mm:ss') + (isNextDay ? ' (+1)' : '');
};
export const formatUnixTime = (timestamp, searchDate) => {
    const timeMoment = moment.unix(timestamp).tz(DATE_TYPE.TIME_ZONE);
    const viewDateMoment = moment(new Date(searchDate)).tz(DATE_TYPE.TIME_ZONE);
    const isNextDay = viewDateMoment.endOf('day').isBefore(timeMoment);
    if (!moment.unix(timestamp).isValid() || !moment(searchDate).isValid()) {
        throw new Error('Invalid date time');
    }
    return moment.unix(timestamp).tz(DATE_TYPE.TIME_ZONE).format('HH:mm:ss') + (isNextDay ? ' (+1)' : '');
};
export const formatUnixDatetime = (timestamp, isNextDay = false) => {
    if (!moment.unix(timestamp).isValid()) {
        throw new Error('Invalid date time');
    }
    return moment.unix(timestamp).tz(DATE_TYPE.TIME_ZONE).format('dddd, MMMM Do YYYY, HH:mm:ss') + (isNextDay ? ' (+1)' : '');
};
export const formatTimeForColumn = (time, viewDate) => {
    const timeMoment = moment(time).tz(DATE_TYPE.TIME_ZONE);
    const viewDateMoment = moment(viewDate, 'YYYYMMDD').tz(DATE_TYPE.TIME_ZONE);
    if (timeMoment.isValid() && viewDateMoment.isValid()) {
        const isNextDay = viewDateMoment.endOf('day').isBefore(timeMoment);
        return formatTime(time, isNextDay);
    }
    return '';
};
export const getTimesFromStop = (stop, searchDate) => {
    const scheduledTime = {};
    const time = {};
    if (has(stop, 'arrival.scheduledTime')) {
        scheduledTime.arrival = formatUnixTime(parseInt(get(stop, 'arrival.scheduledTime', 0), 10), searchDate);
    }
    if (has(stop, 'arrival.time')) {
        time.arrival = formatUnixTime(parseInt(get(stop, 'arrival.time', 0), 10), searchDate);
    }
    if (has(stop, 'departure.scheduledTime')) {
        scheduledTime.departure = formatUnixTime(parseInt(get(stop, 'departure.scheduledTime', 0), 10), searchDate);
    }
    if (has(stop, 'departure.time')) {
        time.departure = formatUnixTime(parseInt(get(stop, 'departure.time', 0), 10), searchDate);
    }
    return {
        scheduledTime,
        time,
    };
};
export const getExpiredMessageRowClassName = ({ isCurrent }) => (isCurrent ? '' : 'bg-at-ocean-tint-10 text-muted');
export const formatStopLabel = stop => `${stop.stop_code} - ${stop.stop_name}`;
export const isDelayBetweenRange = (delay, range) => {
    const value = Math.abs(delay);
    const from = range[0] * 60;
    const until = range[1] * 60;
    return from < value && value < until;
};
export const getNumbersSequence = (from, to) => [...Array(to).keys()].map(i => i + from);
export const formatRealtimeDetailListItemKey = (entityType, entityId) => (`${entityType}-${entityId}`);
export const idFromString = string => string.replace(/[^a-zA-Z0-9]/g, '');
export const convertTimeToMinutes = (time) => {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    return hours * 60 + minutes;
};
export const getDifferenceInMinutes = (time1, time2) => convertTimeToMinutes(time2) - convertTimeToMinutes(time1);
export const addMinutesToTime = (timeString, minutesToAdd) => {
    const [hours, minutes, seconds] = timeString.split(':');
    let totalMinutes = Number(hours) * 60 + Number(minutes);
    totalMinutes += minutesToAdd;
    const updatedHours = Math.floor(totalMinutes / 60);
    const updatedMinutes = totalMinutes % 60;
    return [updatedHours, updatedMinutes, seconds]
        .filter(time => time !== undefined)
        .map(time => `${String(time).padStart(2, '0')}`)
        .join(':');
};
export const parseIncidentEndTime = (endTime) => {
    if (!endTime || !moment(endTime).isValid() || moment(endTime).isSame(moment(), 'minute')) {
        return 'Unknown';
    }
    return moment(endTime).format(dateTimeFormat);
};
export const getAgencyDepotsOptions = (selectedAgency, agencies) => {
    if (selectedAgency) {
        const agency = agencies.find(a => a.agencyId === selectedAgency);
        return agency ? agency.depots.map(depot => ({ value: depot.depotId, label: depot.depotName })) : [];
    }
    return [];
};
export const getIconNameByIncidentCategory = (category) => {
    const categoryToIconFileNameMap = {
        [Category.Accidents]: 'accidents',
        [Category.WeatherEnvironmentalConditions]: 'weather_environmental_conditions',
        [Category.RoadConditions]: 'road_conditions',
        [Category.Emergencies]: 'emergencies',
        [Category.TrafficJams]: 'traffic_jams',
        [Category.SpecialEvents]: 'special_events',
        [Category.EnvironmentalHazards]: 'environmental_hazards',
        [Category.RoadMaintenance]: 'road_maintenance',
        [Category.Unknown]: 'unknown',
    };
    return categoryToIconFileNameMap[category] ?? 'unknown';
};

export const getRandomPointWithinRadius = (x, y, radius) => {
    const angle = (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 2 * Math.PI;
    const distance = Math.sqrt(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * radius;
    return [x + distance * Math.cos(angle), y + distance * Math.sin(angle)];
};

export const addOffsetToIncident = (incident) => {
    const incidentCopy = cloneDeep(incident);
    if (!incidentCopy.isPoint && get(incidentCopy, 'features[0].coordinates[0]', []).length > 0) {
        const newCoordinates = getRandomPointWithinRadius(get(incidentCopy, 'features[0].coordinates[0][0]', 0), get(incidentCopy, 'features[0].coordinates[0][1]', 0), 0.0001);
        incidentCopy.features[0].coordinates[0] = newCoordinates;
        return incidentCopy;
    }
    return incident;
};
