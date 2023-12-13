import { lowerCase } from 'lodash-es';
import moment from 'moment';
import { getGridSingleSelectOperators } from '@mui/x-data-grid-pro';

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

export const formatTripDelay = (delaySeconds) => {
    let res = delaySeconds && Math.trunc(delaySeconds / 60);
    res = Object.is(res, -0) ? 0 : res;
    return res;
};

export const getTripDelayDisplayData = (delayMinutes) => {
    if (delayMinutes === 0) {
        return { text: 'On time', className: 'text-success' };
    }
    if (!delayMinutes) {
        return { text: '--', className: '' };
    }

    return { text: `${delayMinutes > 0 ? 'Late' : 'Early'} ${Math.abs(delayMinutes)} min`, className: 'text-danger' };
};

export const unformatTripDelay = formattedDelay => formattedDelay * 60;

export const transformStopName = name => name && name.replace('Train Station', 'Platform');

export const isTripAdded = tripInstance => lowerCase(tripInstance.source) === 'manual';

export const dateOperators = [
    { label: 'is on or after', value: 'onOrAfter' },
    { label: 'is on or before', value: 'onOrBefore' },
].map((filterOperator) => {
    const selectOperator = getGridSingleSelectOperators(true).find(
        operator => operator.value === 'is',
    );
    return {
        ...selectOperator,
        ...filterOperator,
    };
});
