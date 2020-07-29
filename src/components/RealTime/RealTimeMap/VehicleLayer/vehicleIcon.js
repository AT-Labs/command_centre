import L from 'leaflet';
import { getVehicleBearing, getVehicleRouteType } from '../../../../redux/selectors/realtime/vehicles';
import VEHICLE_TYPE from '../../../../types/vehicle-types';
import VEHICLE_OCCUPANCY_STATUS_TYPE from '../../../../types/vehicle-occupancy-status-types';

const getVehicleIconWithoutArrow = vehicleTypeClass => new L.DivIcon({
    html: '<svg width="30" height="30"><circle cx="15" cy="15" r="12" stroke-width="3" /></svg>',
    iconAnchor: [15, 15],
    className: `vehicle-marker ${vehicleTypeClass}`,
});

const getVehicleIconWithArrow = (bearing, vehicleTypeClass) => new L.DivIcon({
    html: `<svg width="30" height="30" style="transform:rotate(${bearing}deg)">`
        + '<path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm6-6.04c.634.214 '
        + '1.238-.46.906-1.075L12.808 4.522A.889.889 0 0 0 11.993 4a.943.943 0 0 0-.815.522L5.08 16.885c-.302.614.302 '
        + '1.289.936 1.074l5.735-2.025a.737.737 0 0 1 .514 0L18 17.96z"/></svg>',
    iconAnchor: [15, 15],
    className: `vehicle-marker-arrow ${vehicleTypeClass}`,
});

export const getVehicleIcon = (vehicle) => {
    const { full, standingRoomOnly } = VEHICLE_OCCUPANCY_STATUS_TYPE;
    const newBearing = getVehicleBearing(vehicle);
    const routeTypeId = getVehicleRouteType(vehicle);
    const vehicleTypeClass = routeTypeId ? VEHICLE_TYPE[routeTypeId].className : '';
    const vehicleOccupancyStatusClass = vehicle.vehicle.occupancyStatus === standingRoomOnly
        || vehicle.vehicle.occupancyStatus === full
        ? 'vehicle-occupancy-highlight' : '';
    return newBearing ? getVehicleIconWithArrow(newBearing, `${vehicleTypeClass} ${vehicleOccupancyStatusClass}`) : getVehicleIconWithoutArrow(vehicleTypeClass);
};
