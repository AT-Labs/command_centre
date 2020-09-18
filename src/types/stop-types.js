export default {
    VALUES: [
        {
            value: '/GI',
            replacement: ' via Glen Innes',
        },
        {
            value: '/N',
            replacement: ' via Newmarket',
        },
        {
            value: '/NP',
            replacement: ' via Northcote Point',
        },
        {
            value: '/PAN',
            replacement: ' via Panmure',
        },
    ],
    STATUS: {
        DUE: {
            LEGEND: 'arrival/departure due',
            SYMBOL: '*',
            TIME_THRESHOLD: 2,
        },
        CANCELLED: {
            LEGEND: 'cancelled',
            SYMBOL: 'C',
        },
        EMPTY: {
            LEGEND: 'empty',
            SYMBOL: '',
        },
    },
};
