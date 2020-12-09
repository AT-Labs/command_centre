export const VEHICLE_OCCUPANCY_STATUS_TYPE = {
    empty: 'EMPTY',
    manySeatsAvailable: 'MANY_SEATS_AVAILABLE',
    fewSeatsAvailable: 'FEW_SEATS_AVAILABLE',
    standingRoomOnly: 'STANDING_ROOM_ONLY',
    full: 'FULL',
};

export const occupancyStatusToIconSvg = (occupancyLevel, isInverted) => {
    switch (occupancyLevel) {
    case VEHICLE_OCCUPANCY_STATUS_TYPE.empty:
        return `occupancy-empty${isInverted ? '-inverted' : ''}`;
    case VEHICLE_OCCUPANCY_STATUS_TYPE.fewSeatsAvailable:
        return `occupancy-few${isInverted ? '-inverted' : ''}`;
    case VEHICLE_OCCUPANCY_STATUS_TYPE.manySeatsAvailable:
        return `occupancy-many${isInverted ? '-inverted' : ''}`;
    case VEHICLE_OCCUPANCY_STATUS_TYPE.standingRoomOnly:
        return `occupany-standing${isInverted ? '-inverted' : ''}`;
    case VEHICLE_OCCUPANCY_STATUS_TYPE.full:
        return 'occupancy-full';
    default:
        return null;
    }
};

export const occupancyStatusToMessage = (occupancyLevel) => {
    switch (occupancyLevel) {
    case VEHICLE_OCCUPANCY_STATUS_TYPE.empty:
        return 'Empty';
    case VEHICLE_OCCUPANCY_STATUS_TYPE.fewSeatsAvailable:
        return 'Few seats available';
    case VEHICLE_OCCUPANCY_STATUS_TYPE.manySeatsAvailable:
        return 'Many seats available';
    case VEHICLE_OCCUPANCY_STATUS_TYPE.standingRoomOnly:
        return 'Standing room only';
    case VEHICLE_OCCUPANCY_STATUS_TYPE.full:
        return 'Full';
    default:
        return null;
    }
};

export default VEHICLE_OCCUPANCY_STATUS_TYPE;
