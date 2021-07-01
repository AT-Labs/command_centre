/* eslint-disable react/prop-types */
import React from 'react';
import { formatTime } from '../../../../utils/helpers';
import TripUpdateTag from '../../Common/Trip/TripUpdateTag';
import { isTripCanceled } from '../../../../utils/control/tripReplays';
import { TRIP_UPDATE_TYPE } from '../../../../constants/tripReplays';

export const getColumns = () => [{
    header: 'Vehicle',
    headerClassName: 'trip-replay-progress__fixed-table-cell--stop font-size-sm alignment',
    cellClassName: 'trip-replay-progress__fixed-table-cell--stop font-size-sm',
    formatter: ({ vehicleLabel }) => vehicleLabel,
}, {
    header: 'Route',
    headerClassName: 'font-size-sm alignment',
    cellClassName: 'font-size-sm',
    formatter: ({ route: { shortName, description }, ...trip }) => (
        <React.Fragment>
            { `${shortName}: ${description}` }
            { isTripCanceled(trip) && (
                <React.Fragment>
                    <br />
                    <TripUpdateTag type={ TRIP_UPDATE_TYPE.CANCELED } />
                </React.Fragment>
            )}
        </React.Fragment>
    ),
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
