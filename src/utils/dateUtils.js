import moment from 'moment';

export const utcDateFormatWithoutTZ = 'YYYY-MM-DDTHH:mm:ss';
export const TIME_FORMAT_HHMM = 'HH:mm';
export const TIME_FORMAT_HHMMSS = 'HH:mm:ss';
export const DATE_FORMAT_DDMMYYYY = 'DD/MM/YYYY';
export const DATE_FORMAT_MMMDDYYYY = 'MMM DD, YYYY';
export const dateTimeFormat = 'DD/MM/YY HH:mm';
export const DATE_FORMAT_GTFS = 'YYYYMMDD';

export const getDatePickerOptions = (minimumDate) => {
    let minDate = minimumDate;
    if (minimumDate && minimumDate !== 'today') {
        minDate = moment(minimumDate, DATE_FORMAT_DDMMYYYY).valueOf();
    }
    return {
        enableTime: false,
        minDate,
        dateFormat: 'd/m/Y',
    };
};

export const formatSeconds = (seconds) => {
    if (seconds) {
        if (seconds < 60) {
            return `${seconds} seconds`;
        }
        if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        }
        const hours = Math.floor(seconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return undefined;
};
