import React from 'react';
import moment from 'moment';
import _ from 'lodash-es';
import ActualTimeVariance from '../../ActualTimeVariance';
import { getVehicleAllocationLabel } from '../../../../../redux/selectors/control/blocks';

export const getColumns = ({ isHistorical }) => [{
    header: 'Vehicle',
    headerClassName: 'w-20',
    formatter: ({ vehicle, allocation }) => getVehicleAllocationLabel(allocation) || _.result(vehicle, 'label', '—'),
}, {
    header: 'Route',
    headerClassName: '',
    formatter: ({ route, trip }) => `${route.route_short_name}${trip.headsign ? `: ${trip.headsign}` : ''}`,
}, {
    header: 'Scheduled',
    headerClassName: 'w-15',
    cellClassName: 'text-right',
    formatter: ({ scheduledTime }) => (scheduledTime && moment(scheduledTime).format('HH:mm')) || '',
}, {
    header: isHistorical ? 'Arrived' : 'Due',
    headerClassName: 'w-25 text-right',
    formatter: vehicle => (
        <ActualTimeVariance { ...vehicle } />
    ),
}];
