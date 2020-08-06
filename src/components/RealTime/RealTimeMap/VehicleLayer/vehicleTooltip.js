/* eslint-disable global-require */
import { FERRY_TYPE_ID } from '../../../../types/vehicle-types';
import VEHICLE_OCCUPANCY_STATUS_TYPE from '../../../../types/vehicle-occupancy-status-types';

const status = (tripDelay) => {
    const isLateOrEarly = tripDelay > 0 ? 'Late' : 'Early';
    const adjective = tripDelay === 0 ? 'On time' : isLateOrEarly;
    const delayMins = tripDelay === 0 ? '' : `${Math.abs(tripDelay)} min`;

    return ` ${adjective} ${delayMins}`;
};

const occupancyStatusToIconSvg = (occupancyLevel) => {
    switch (occupancyLevel) {
    case VEHICLE_OCCUPANCY_STATUS_TYPE.empty:
        return 'occupancy-empty';
    case VEHICLE_OCCUPANCY_STATUS_TYPE.fewSeatsAvailable:
        return 'occupancy-few';
    case VEHICLE_OCCUPANCY_STATUS_TYPE.manySeatsAvailable:
        return 'occupancy-many';
    case VEHICLE_OCCUPANCY_STATUS_TYPE.standingRoomOnly:
        return 'occupany-almost-full';
    case VEHICLE_OCCUPANCY_STATUS_TYPE.full:
        return 'occupancy-full';
    default:
        return null;
    }
};

const occupancyIcon = (occupancyLevel) => {
    const icon = occupancyStatusToIconSvg(occupancyLevel);
    return icon ? `<i>${require(`!raw-loader!../../../../assets/img/${icon}.svg`)}</i>` : null;
};

const statusAndOccupancy = (tripDelay, occupancyStatus) => {
    const occupancyIconSvg = occupancyIcon(occupancyStatus);

    return (tripDelay != null
        ? `<dt>Status</dt>
           <dd>${status(tripDelay)}</dd>` : '')
          + (occupancyIconSvg
              ? `<dt>Occupancy</dt>
                 <dd>${occupancyIconSvg}</dd>` : '');
};

export const tooltipContent = (route, vehicleLabel, routeType, tripDelay = null, occupancyStatus = null) => (
    `<dl class="m-0">
     <dt>Route</dt>
     <dd>${route}</dd>
     <dt>Vehicle</dt>
     <dd>${vehicleLabel}</dd>
     ${(routeType && routeType !== FERRY_TYPE_ID
        ? statusAndOccupancy(tripDelay, occupancyStatus) : '')}
     </dl>`
);
