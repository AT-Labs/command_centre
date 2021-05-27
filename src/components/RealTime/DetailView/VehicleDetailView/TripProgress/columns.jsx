import React from 'react';
import moment from 'moment';
import ActualTimeVariance from '../../ActualTimeVariance';

export const getColumns = () => [{
    header: 'Stop',
    headerClassName: 'trip-progress__fixed-table-cell--stop font-size-sm border-top px-0',
    cellClassName: 'trip-progress__fixed-table-cell--stop font-size-sm border-top px-0',
    formatter: ({ stop }) => stop.stopCode,
}, {
    header: 'Description',
    headerClassName: 'font-size-sm border-top',
    cellClassName: 'font-size-sm border-top',
    formatter: ({ stop }) => stop.stopName,
}, {
    header: 'Sched',
    headerClassName: 'trip-progress__fixed-table-cell--scheduled-time font-size-sm text-right border-top px-0',
    cellClassName: 'trip-progress__fixed-table-cell--scheduled-time font-size-sm text-right border-top px-0',
    formatter: ({ scheduledTime }) => (scheduledTime && moment(scheduledTime).format('HH:mm')) || '',
}, {
    header: 'Departed/Due',
    headerClassName: 'trip-progress__fixed-table-cell--time font-size-sm text-right border-top px-0',
    cellClassName: 'trip-progress__fixed-table-cell--time font-size-sm text-right border-top px-0',
    formatter: stopModel => (<ActualTimeVariance { ...stopModel } />),
}];
