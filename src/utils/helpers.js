import wellknown from 'wellknown';
import moment from 'moment';
import _ from 'lodash-es';
import isURL from 'validator/lib/isURL';

import { fetchWithAuthHeader } from '../auth';

export const generateUniqueID = () => Math.random().toString(36).substr(2, 16);
export const getJSONFromWKT = text => wellknown.parse(text);
export const getAllCoordinatesFromWKT = text => getJSONFromWKT(text).coordinates.map(c => c.reverse());
export const parseTime = (time, date) => {
    const [hour, minute = 0, second = 0, millisecond = 0] = time.split(':').map(part => parseInt(part, 10));
    const datetime = moment(date).set({ hour, minute, second, millisecond });
    return datetime;
};

export const getTripTimeDisplay = (time) => {
    if (!time) return '—';

    const timeMoment = parseTime(time);
    return `${timeMoment.format('HH:mm')}${timeMoment.isAfter(moment(), 'day') ? ' (+1)' : ''}`;
};

export const isUrlValid = url => _.isEmpty(url) || isURL(url, {
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
    if (!time) return '';

    const timeMoment = moment(time, 'HH:mm:ss', true);
    const minute = timeMoment.minute();
    if (minute < 30) {
        timeMoment.set('minute', 0);
    } else {
        timeMoment.set('minute', 30);
    }
    return timeMoment.format('HH:mm');
};

export const formatGroupsForPresentation = items => items.map(item => ({
    value: item.id,
    label: item.title,
    stopGroup: item,
}));

export const getViewPermission = url => fetchWithAuthHeader(
    url,
    { method: 'GET' },
).then(response => response.ok && response.status === 200); // TODO: block, trips, trip replays and messages should expect the same (200 or 204)

export const getTripInstanceId = trip => `${trip.tripId}-${trip.serviceDate}-${trip.startTime}`;

export const getStopKey = stop => `${stop.stopId}-${stop.stopSequence}-${stop.departureTime || stop.arrivalTime}`;

const browserDetection = () => {
    const isIE = /* @cc_on!@ */false || !!document.documentMode;
    const browsers = {
        firefox: !!window.InstallTrigger,
        safari: !!window.ApplePaySession,
        opera: (!!window.opr && !!window.opr.addons) || !!window.opera || (navigator.userAgent.indexOf(' OPR/') >= 0),
        chrome: !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime),
        IE: isIE,
        Edge: !isIE && !!window.StyleMedia,
    };

    return Object.keys(browsers).find(key => browsers[key] === true);
};

export const isChrome = browserDetection() === 'chrome';

// Check if all trips in a specific view are also in the selected trips list to determine whether "all trips selected".
export const checkIfAllTripsAreSelected = (notCompletedTripsKeys, selectedTripsKeys) => notCompletedTripsKeys.length > 0
    && notCompletedTripsKeys.length === _.intersectionWith(notCompletedTripsKeys, selectedTripsKeys, _.isEqual).length;

export const formatTime = time => moment(time).format('HH:mm:ss');
export const formatUnixTime = time => moment.unix(time).format('HH:mm:ss');
export const formatUnixDatetime = timestamp => moment.unix(timestamp).format('dddd, MMMM Do YYYY, HH:mm:ss');

export const getTimesFromStop = (stop) => {
    const scheduledTime = {};
    const time = {};
    if (_.has(stop, 'arrival.scheduledTime')) {
        scheduledTime.arrival = formatUnixTime(parseInt(_.get(stop, 'arrival.scheduledTime', 0), 10));
    }

    if (_.has(stop, 'arrival.time')) {
        time.arrival = formatUnixTime(parseInt(_.get(stop, 'arrival.time', 0), 10));
    }

    if (_.has(stop, 'departure.scheduledTime')) {
        scheduledTime.departure = formatUnixTime(parseInt(_.get(stop, 'departure.scheduledTime', 0), 10));
    }

    if (_.has(stop, 'departure.time')) {
        time.departure = formatUnixTime(parseInt(_.get(stop, 'departure.time', 0), 10));
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
