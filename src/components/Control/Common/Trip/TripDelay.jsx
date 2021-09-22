import React from 'react';
import PropTypes from 'prop-types';
import { formatTripDelay } from '../../../../utils/control/routes';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';

const TripDelay = ({ delayInSeconds, noDelayText, status }) => {
    const delay = formatTripDelay(delayInSeconds);

    if (delay === 0 || status === TRIP_STATUS_TYPES.cancelled
        || (status === TRIP_STATUS_TYPES.notStarted && delay < 0)) {
        return noDelayText;
    }
    return <span className="text-lowercase">{`${Math.abs(delay)} mins ${delay > 0 ? 'delayed' : 'early'}`}</span>;
};

TripDelay.propTypes = {
    delayInSeconds: PropTypes.number.isRequired,
    noDelayText: PropTypes.string,
    status: PropTypes.string.isRequired,
};

TripDelay.defaultProps = {
    noDelayText: '',
};

export default TripDelay;
