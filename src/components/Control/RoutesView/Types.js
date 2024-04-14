import PropTypes from 'prop-types';
import vehicleTypes, { TRAIN_TYPE_ID, BUS_TYPE_ID, FERRY_TYPE_ID } from '../../../types/vehicle-types';
import { DIRECTIONS } from '../DisruptionsView/types';

export const AgencyType = PropTypes.shape({
    agencyId: PropTypes.string.isRequired,
    agencyName: PropTypes.string.isRequired,
});

export const RouteVariantType = PropTypes.shape({
    routeVariantId: PropTypes.string.isRequired,
    routeLongName: PropTypes.string.isRequired,
    routeShortName: PropTypes.string,
    routeType: PropTypes.number,
    agencyName: PropTypes.string.isRequired,
});

export const RouteType = PropTypes.shape({
    routeShortName: PropTypes.string.isRequired,
    routeType: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    routeVariants: PropTypes.arrayOf(RouteVariantType).isRequired,
    agencyId: PropTypes.string.isRequired,
    agencyName: PropTypes.string.isRequired,
});

export const RouteFiltersType = PropTypes.shape({
    agencyId: PropTypes.string,
});

export const StopType = PropTypes.shape({
    stopId: PropTypes.string.isRequired,
    stopSequence: PropTypes.number,
    stopCode: PropTypes.string,
    stopName: PropTypes.string,
    arrivalTime: PropTypes.string, // TODO: Deprected. Delete once ATR-2032 was deployed to Prod
    departureTime: PropTypes.string, // TODO: Deprected. Delete once ATR-2032 was deployed to Prod
    scheduledArrivalTime: PropTypes.string,
    scheduledDepartureTime: PropTypes.string,
    actualArrivalTime: PropTypes.string,
    actualDepartureTime: PropTypes.string,
    predictedArrivalTime: PropTypes.string,
    predictedDepartureTime: PropTypes.string,
    status: PropTypes.string,
    parent: PropTypes.string,
});

export const TripInstanceType = PropTypes.shape({
    tripId: PropTypes.string.isRequired,
    routeId: PropTypes.string,
    routeVariantId: PropTypes.string,
    routeLongName: PropTypes.string,
    routeShortName: PropTypes.string,
    routeType: PropTypes.number,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    vehicleLabel: PropTypes.string,
    serviceDate: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    status: PropTypes.string,
    delay: PropTypes.number,
    stops: PropTypes.arrayOf(StopType),
    referenceId: PropTypes.string,
});

export const TripSubIconType = {
    onTime: 'ON_TIME',
    delayed: 'DELAYED',
};

export const StopStatus = {
    skipped: 'SKIPPED',
    passed: 'PASSED',
    notPassed: 'NOT_PASSED',
    nonStopping: 'NON_STOPPING',
};

export const updateTripsStatusModalTypes = {
    CANCEL_MODAL: 'cancel',
    REINSTATE_MODAL: 'reinstate',
    HIDE_TRIP_MODAL: 'hide-trip',
};

export const updateStopsModalTypes = {
    SKIP: 'skip',
    REINSTATE: 'reinstate',
    MOVE_SERVICE: 'move-service',
    UPDATE_HEADSIGN: 'update-headsign',
    CHANGE_PLATFORM: 'change-platform',
    SET_NON_STOPPING: 'set-non-stopping',
};

export const updateTripsStatusModalOrigins = {
    FOOTER: 'footer',
    TRIP_VIEW: 'trip-view',
};

export const ADD_TRIP_STEPS = {
    SEARCH_TRIPS: 'Search trips',
    SELECT_AND_ADD_TRIP: 'Select and Add Trip',
};

export const modeRadioOptions = (routeType, formGroupClass) => ({
    title: 'Mode',
    formGroupClass,
    checkedKey: routeType,
    itemOptions: [{ key: BUS_TYPE_ID, value: vehicleTypes[3].type }, { key: TRAIN_TYPE_ID, value: vehicleTypes[2].type }, { key: FERRY_TYPE_ID, value: vehicleTypes[4].type }],
});

export const directionRadioOptions = (directionId, formGroupClass) => ({
    title: 'Direction',
    formGroupClass,
    checkedKey: directionId,
    itemOptions: [{ key: 0, value: DIRECTIONS[0] }, { key: 1, value: DIRECTIONS[1] }],
});

export const viewRadioOptions = (viewType, formGroupClass) => ({
    formGroupClass,
    checkedKey: viewType,
    itemOptions: [{ key: 'Route', value: 'Route View' }, { key: 'Trip', value: 'Trips View' }],
});
