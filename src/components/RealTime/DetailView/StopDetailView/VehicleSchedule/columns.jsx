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
    if (!isTrainStop) return destinationDisplay;

    const stopType = STOP_TYPES.VALUES.find(d => destinationDisplay.includes(d.value));
    if (stopType) {
        const name = destinationDisplay.replace(stopType.value, '');
        return (
            <div>
                <strong>{name}</strong>
                <small>{stopType.replacement}</small>
            </div>
        );
    }

    const viaId = destinationDisplay.indexOf('via');
    const lsId = destinationDisplay.indexOf('Limited Stops');
    let splitId = -1;

    if (viaId !== -1 && lsId !== -1) {
        splitId = Math.min(viaId, lsId);
    } else if (viaId !== -1) {
        splitId = viaId;
    } else if (lsId !== -1) {
        splitId = lsId;
    }

    if (splitId !== -1) {
        const name = destinationDisplay.slice(0, splitId).trim();
        const rest = destinationDisplay.slice(splitId).trim();
        return (
            <div>
                <strong>{name}</strong>
                <small>{` ${rest}`}</small>
            </div>
        );
    }

    return <strong>{destinationDisplay}</strong>;
};

export const calculateDue = (arrivalStatus, dueTime) => {
    const { CANCELLED, DUE, EMPTY } = STOP_TYPES.STATUS;

    if (arrivalStatus === CANCELLED.LEGEND) {
        return CANCELLED.SYMBOL;
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
    formatter: ({ arrivalStatus, dueTime }) => calculateDue(arrivalStatus, dueTime),
}];
