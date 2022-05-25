import moment from 'moment';

export const utcDateFormatWithoutTZ = 'YYYY-MM-DDTHH:mm:ss';
export const TIME_FORMAT_HHMM = 'HH:mm';
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
