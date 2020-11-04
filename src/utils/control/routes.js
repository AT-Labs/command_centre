import moment from 'moment';

export const PAGE_SIZE = 100;

export const TRIPS_POLLING_INTERVAL = 9000;

const TIME_FORMAT = 'HH:mm';

export const SERVICE_DATE_FORMAT = 'YYYYMMDD';

const TWO_OCLOCK = moment('02:00', TIME_FORMAT, true);

export const getStartTimeFromFilterInitialTime = (time) => {
    const timeMoment = moment(time, TIME_FORMAT, true);
    if (timeMoment.isBefore(TWO_OCLOCK)) {
        return '00:00';
    }
    timeMoment.subtract(2, 'hours');
    const minute = timeMoment.minute();
    const hour = timeMoment.hour();
    if (minute < 15) {
        timeMoment.set('minute', 0);
    } else if (minute < 45) {
        timeMoment.set('minute', 30);
    } else if (minute <= 59) {
        timeMoment.set('minute', 0).set('hour', hour + 1);
    }
    return timeMoment.format(TIME_FORMAT);
};

export const formatTripDelay = (delay) => {
    let res = delay && Math.trunc(delay / 60);
    res = Object.is(res, -0) ? 0 : res;
    return res;
};

export const unformatTripDelay = formattedDelay => formattedDelay * 60;

export const transformStopName = name => name && name.replace('Train Station', 'Platform');
