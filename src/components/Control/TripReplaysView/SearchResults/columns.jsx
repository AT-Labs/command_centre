/* eslint-disable react/prop-types */
import React from 'react';
import { formatTime, formatUnixTime } from '../../../../utils/helpers';
import TripUpdateTag from '../../Common/Trip/TripUpdateTag';
import { isTripCanceled, tripHasDisruption } from '../../../../utils/control/tripReplays';
import { TRIP_UPDATE_TYPE } from '../../../../constants/tripReplays';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import Icon from '../../../Common/Icon/Icon';

export const getColumns = (searchType) => {
    const columns = [{
        header: 'Vehicle',
        headerClassName: 'trip-replay-progress__fixed-table-cell--stop font-size-sm alignment',
        cellClassName: 'trip-replay-progress__fixed-table-cell--stop font-size-sm',
        formatter: ({ vehicleLabel }) => vehicleLabel,
    }, {
        header: 'Route',
        headerClassName: 'font-size-sm alignment',
        cellClassName: 'font-size-sm',
        formatter: ({ routeShortName, tripHeadsign, ...trip }) => (
            <>
                <div className="d-inline-flex">
                    <span>
                        { `${routeShortName}: ${tripHeadsign}` }
                        { isTripCanceled(trip) && (
                            <>
                                <br />
                                <TripUpdateTag type={ TRIP_UPDATE_TYPE.CANCELED } />
                            </>
                        )}
                    </span>
                    { tripHasDisruption(trip) && (
                        <Icon icon="alert" className="icon alert-icon pl-1 d-inline-block" />
                    )}
                </div>
            </>
        ),
    }, {
        header: 'Scheduled First Stop Departure',
        headerClassName: 'trip-replay-progress__fixed-table-cell--scheduled-time font-size-sm text-right alignment',
        cellClassName: 'trip-replay-progress__fixed-table-cell--scheduled-time font-size-sm text-right',
        formatter: ({ tripStart }) => (tripStart && formatTime(tripStart)) || '',
    }];

    if (searchType !== SEARCH_RESULT_TYPE.STOP.type) {
        columns.push(...[{
            header: 'Trip Sign On',
            headerClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right alignment',
            cellClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right',
            formatter: ({ tripSignOn }) => (tripSignOn && formatTime((tripSignOn))) || '',
        }, {
            header: 'Actual First Stop Departure',
            headerClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right alignment',
            cellClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right',
            formatter: ({ firstStopDeparture }) => (firstStopDeparture && formatTime((firstStopDeparture))) || '-',
        }]);
    } else {
        columns.push(...[{
            header: 'Scheduled Stop Departure',
            headerClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right alignment',
            cellClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right',
            formatter: ({ stop }) => (stop && stop.departureScheduledTime && formatUnixTime((stop.departureScheduledTime))) || '-',
        }, {
            header: 'Actual Stop Departure',
            headerClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right alignment',
            cellClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-right',
            formatter: ({ stop }) => (stop && stop.departureActualTime && formatUnixTime((stop.departureActualTime))) || '-',
        }]);
    }

    return columns;
};
