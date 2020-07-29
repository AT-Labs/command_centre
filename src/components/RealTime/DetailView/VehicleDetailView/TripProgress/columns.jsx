import React from 'react';
import moment from 'moment';
import ActualTimeVariance from '../../ActualTimeVariance';

export const getColumns = () => [{
    header: 'Stop',
    headerClassName: 'trip-progress__fixed-table-cell--stop font-size-sm',
    cellClassName: 'trip-progress__fixed-table-cell--stop font-size-sm',
    formatter: ({ stop }) => stop.stopCode,
}, {
    header: 'Description',
    headerClassName: 'font-size-sm',
    cellClassName: 'font-size-sm',
    formatter: ({ stop }) => stop.stopName,
}, {
    header: 'Sched',
    headerClassName: 'trip-progress__fixed-table-cell--scheduled-time font-size-sm text-right',
    cellClassName: 'trip-progress__fixed-table-cell--scheduled-time font-size-sm text-right',
    formatter: ({ scheduledTime }) => (scheduledTime && moment(scheduledTime).format('HH:mm')) || '',
}, {
    header: 'Departed/Due',
    headerClassName: 'trip-progress__fixed-table-cell--time font-size-sm text-right',
    cellClassName: 'trip-progress__fixed-table-cell--time font-size-sm text-right',
    formatter: stopModel => (<ActualTimeVariance { ...stopModel } />),
}];
