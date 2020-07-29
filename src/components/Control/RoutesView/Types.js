import PropTypes from 'prop-types';

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
    arrivalTime: PropTypes.string,
    departureTime: PropTypes.string,
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
};

export const updateStopsModalTypes = {
    SKIP: 'skip',
    REINSTATE: 'reinstate',
    MOVE_SERVICE: 'move-service',
};
