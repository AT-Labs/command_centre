import { formatTime } from '../../../../utils/helpers';

export const getColumns = () => [{
    header: 'Vehicle',
    headerClassName: 'trip-replay-progress__fixed-table-cell--stop font-size-sm alignment',
    cellClassName: 'trip-replay-progress__fixed-table-cell--stop font-size-sm',
    formatter: ({ vehicleLabel }) => vehicleLabel,
}, {
    header: 'Route',
    headerClassName: 'font-size-sm alignment',
    cellClassName: 'font-size-sm',
    formatter: ({ route: { shortName, description } }) => `${shortName}: ${description}`,
}, {
    header: 'Scheduled Start',
    headerClassName: 'trip-replay-progress__fixed-table-cell--scheduled-time font-size-sm text-right alignment',
    cellClassName: 'trip-replay-progress__fixed-table-cell--scheduled-time font-size-sm text-right',
    formatter: ({ tripStart }) => (tripStart && formatTime(tripStart)) || '',
}, {
    header: 'Actual Start',
    headerClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right alignment',
    cellClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right',
    formatter: ({ tripSignOn }) => (tripSignOn && formatTime((tripSignOn))) || '',
}];
