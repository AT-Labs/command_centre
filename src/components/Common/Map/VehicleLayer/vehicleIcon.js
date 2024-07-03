import L from 'leaflet';
import { getVehicleBearing, getVehicleRouteType, getVehicleRouteName } from '../../../../redux/selectors/realtime/vehicles';
import VEHICLE_TYPE from '../../../../types/vehicle-types';
import VEHICLE_OCCUPANCY_STATUS_TYPE from '../../../../types/vehicle-occupancy-status-types';

const getVehicleIconWithoutRouteName = (vehicleTypeClass, opacityClass) => new L.DivIcon({
    html: `<svg width="30" height="30" class="${vehicleTypeClass}"><circle cx="15" cy="15" r="12" stroke-width="3" /></svg>`,
    iconAnchor: [15, 15],
    className: `vehicle-marker ${opacityClass}`,
});

const getVehicleIconWithRouteName = (bearing, vehicleTypeClass, routeName) => {
    const showArrow = bearing && bearing > 0 ? '<div class="arrow"></div>' : '';
    return new L.DivIcon({
        html: `<div class="icon-wrapper ${vehicleTypeClass}">`
        + `<div class="rotate" style="transform: rotate(${bearing}deg)">${showArrow}</div>`
        + `<div class="vehicle-marker-route-name">${routeName}</div>`
        + '</div>',
        iconAnchor: [18, 18],
        className: 'vehicle-marker-arrow',
    });
};

export const getVehicleIcon = (vehicle, opacityClass) => {
    const { full, standingRoomOnly } = VEHICLE_OCCUPANCY_STATUS_TYPE;
    const newBearing = getVehicleBearing(vehicle);
    const routeTypeId = getVehicleRouteType(vehicle);
    const vehicleTypeClass = routeTypeId ? VEHICLE_TYPE[routeTypeId].className : '';
    const vehicleOccupancyStatusClass = vehicle.vehicle.occupancyStatus === standingRoomOnly
        || vehicle.vehicle.occupancyStatus === full
        ? 'vehicle-occupancy-highlight' : '';
    const routeName = getVehicleRouteName(vehicle) || '';
    return routeTypeId ? getVehicleIconWithRouteName(newBearing, `${vehicleTypeClass} ${vehicleOccupancyStatusClass} ${opacityClass}`, routeName) : getVehicleIconWithoutRouteName(vehicleTypeClass, opacityClass);
};
