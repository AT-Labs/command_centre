import React from 'react';
import moment from 'moment';
import { result } from 'lodash-es';
import ActualTimeVariance from '../../ActualTimeVariance';
import Icon from '../../../../Common/Icon/Icon';
import { getVehicleAllocationLabel } from '../../../../../redux/selectors/control/blocks';
import { occupancyStatusToIconSvg } from '../../../../../types/vehicle-occupancy-status-types';
import STOP_TYPES from '../../../../../types/stop-types';

export const getColumns = ({ isHistorical }) => [{
    header: 'Vehicle',
    headerClassName: 'w-20 border-top border-bottom font-size-sm',
    cellClassName: 'border-bottom font-size-sm',
    formatter: ({ vehicle, allocation }) => getVehicleAllocationLabel(allocation) || result(vehicle, 'label', '—'),
}, {
    header: 'Route',
    headerClassName: 'border-top border-bottom font-size-sm',
    cellClassName: 'border-bottom font-size-sm',
    formatter: ({ route, trip }) => `${route.route_short_name}${trip.headsign ? `: ${trip.headsign}` : ''}`,
}, {
    header: 'Scheduled',
    headerClassName: 'border-top w-15 border-bottom font-size-sm',
    cellClassName: 'text-right border-bottom font-size-sm',
    formatter: ({ scheduledTime }) => (scheduledTime && moment(scheduledTime).format('HH:mm')) || '',
}, {
    header: isHistorical ? 'Arrived' : 'Due',
    headerClassName: 'border-top w-25 text-right border-bottom font-size-sm',
    cellClassName: 'border-bottom font-size-sm',
    formatter: vehicle => (
        <ActualTimeVariance { ...vehicle } />
    ),
}];

export const formatDestination = (isTrainStop, destinationDisplay) => {
    if (isTrainStop) {
        const stopValue = STOP_TYPES.VALUES.find(d => destinationDisplay.includes(d.value));
        const destination = stopValue ? {
            name: destinationDisplay.replace(stopValue.value, ''),
            via: stopValue.replacement,
        } : destinationDisplay;
        return stopValue ? (
            <div>
                <strong>{destination.name}</strong>
                <small>{destination.via}</small>
            </div>
        ) : <strong>{destination}</strong>;
    }

    return destinationDisplay;
};

export const calculateDue = (arrivalStatus, dueTime, onHold = false) => {
    const { CANCELLED, DUE, EMPTY } = STOP_TYPES.STATUS;

    if (arrivalStatus === CANCELLED.LEGEND) {
        return CANCELLED.SYMBOL;
    }

    // If trip is on hold, return empty symbol
    if (onHold) {
        return EMPTY.SYMBOL;
    }

    if (dueTime) {
        const dueValue = moment(dueTime).diff(moment(), 'minutes');
        return dueValue < DUE.TIME_THRESHOLD ? DUE.SYMBOL : dueValue;
    }
    return EMPTY.SYMBOL;
};

export const getPidColumns = ({ isTrainStop, isFerryStop, isParentBusStop }) => [{
    header: 'Route',
    headerClassName: 'w-15',
    formatter: (pidInfo) => {
        const { route, numberOfCars } = pidInfo;
        return (
            <div>
                {isTrainStop ? <div><strong>{route}</strong></div> : route}
                {isTrainStop && numberOfCars && (
                    <small>
                        {numberOfCars}
                        -car
                    </small>
                )}
            </div>
        );
    },
}, {
    header: 'Destination',
    headerClassName: 'w-35',
    formatter: ({ destinationDisplay }) => formatDestination(isTrainStop, destinationDisplay),
},
...(
    isTrainStop || isParentBusStop ? [{
        header: 'Pl.',
        formatter: ({ platform }) => platform,
    }] : []
),
...(
    isFerryStop ? [{
        header: 'Pi.',
        formatter: ({ platform }) => platform,
    }] : []
), {
    header: 'Occup.',
    headerClassName: 'w-15',
    formatter: pidInfo => (pidInfo.occupancyStatus ? <Icon className="icon d-inline-block" icon={ occupancyStatusToIconSvg(pidInfo.occupancyStatus, true) } /> : null),
}, {
    header: 'Sched.',
    headerClassName: 'w-15',
    formatter: ({ scheduledTime }) => (scheduledTime && moment(scheduledTime).format('HH:mm')) || '',
}, {
    header: 'Due',
    headerClassName: 'w-15 text-right',
    cellClassName: 'text-right',
    formatter: ({ arrivalStatus, dueTime, onHold }) => calculateDue(arrivalStatus, dueTime, onHold),
}];
