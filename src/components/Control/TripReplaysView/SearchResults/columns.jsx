/* eslint-disable react/prop-types */
import React from 'react';

import { formatUnixTime, formatTimeForColumn } from '../../../../utils/helpers';
import TripUpdateTag from '../../Common/Trip/TripUpdateTag';
import { isTripCanceled, tripHasDisruption, isTripAdded } from '../../../../utils/control/tripReplays';
import { TRIP_DETAIL_ICON_TYPE, TRIP_UPDATE_TYPE } from '../../../../constants/tripReplays';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { TripDetailIcon } from '../TripDetailIcon';

export const getColumns = (searchType) => {
    const columns = [{
        header: 'Vehicle',
        headerClassName: 'trip-replay-progress__fixed-table-cell--stop font-size-sm alignment',
        cellClassName: 'trip-replay-progress__fixed-table-cell--stop font-size-sm',
        formatter: ({ vehicleLabel }) => vehicleLabel,
    }, {
        header: 'Route',
        headerClassName: 'font-size-sm',
        cellClassName: 'font-size-sm',
        formatter: ({ routeShortName, tripHeadsign, ...trip }) => (
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
                <div className="flex column align-items-center">
                    { isTripAdded(trip) && (
                        <TripDetailIcon
                            type={ TRIP_DETAIL_ICON_TYPE.ADDED }
                            size={ 16 } />
                    )}
                    { tripHasDisruption(trip) && (
                        <TripDetailIcon type={ TRIP_DETAIL_ICON_TYPE.DISRUPTION } />
                    )}
                </div>
            </div>
        ),
    }, {
        header: 'Scheduled First Stop Departure',
        headerClassName: 'trip-replay-progress__fixed-table-cell--scheduled-time font-size-sm alignment',
        cellClassName: 'trip-replay-progress__fixed-table-cell--scheduled-time font-size-sm text-left',
        formatter: ({ tripStart, serviceDate }) => formatTimeForColumn(tripStart, serviceDate),
    }];

    if (searchType !== SEARCH_RESULT_TYPE.STOP.type) {
        columns.push(...[{
            header: 'Trip Sign On',
            headerClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm alignment',
            cellClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-left',
            formatter: ({ tripSignOn, serviceDate }) => formatTimeForColumn(tripSignOn, serviceDate),
        }, {
            header: 'Actual First Stop Departure',
            headerClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm alignment',
            cellClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-left',
            formatter: ({ firstStopDeparture, serviceDate }) => formatTimeForColumn(firstStopDeparture, serviceDate),
        }]);
    } else {
        columns.push(...[{
            header: 'Scheduled Stop Departure',
            headerClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm alignment',
            cellClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-left',
            formatter: ({ stop }) => (stop && stop.departureScheduledTime && formatUnixTime((stop.departureScheduledTime))) || '-',
        }, {
            header: 'Actual Stop Departure',
            headerClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm alignment',
            cellClassName: 'trip-replay-progress__fixed-table-cell--time font-size-sm text-left',
            formatter: ({ stop }) => (stop && stop.departureActualTime && formatUnixTime((stop.departureActualTime))) || '-',
        }]);
    }

    return columns;
};
