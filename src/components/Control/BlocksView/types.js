import PropTypes from 'prop-types';

export const TripType = PropTypes.shape({
    operationalBlockId: PropTypes.string.isRequired,
    externalRef: PropTypes.string.isRequired,
    routeId: PropTypes.string.isRequired,
    routeVariantId: PropTypes.string.isRequired,
    routeLongName: PropTypes.string.isRequired,
    routeShortName: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    tripId: PropTypes.string.isRequired,
    vehicles: PropTypes.array,
});

export const BlockType = PropTypes.shape({
    operationalBlockId: PropTypes.string.isRequired,
    operationalBlockRunId: PropTypes.number.isRequired,
    serviceDate: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    trips: PropTypes.number.isRequired,
    version: PropTypes.number.isRequired,
    operationalTrips: PropTypes.arrayOf(TripType).isRequired,
});
