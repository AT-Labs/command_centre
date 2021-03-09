import moment from 'moment';

// https://momentjs.com/docs/#/customization/dow-doy/
moment.updateLocale('en', {
    week: {
        dow: 1, // First day of week is Monday
        doy: 7, // First week of year must contain 1 January (7 + 1 - 1)
    },
});
