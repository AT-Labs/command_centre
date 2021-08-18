import React from 'react';
import PropTypes from 'prop-types';
import { formatTripDelay } from '../../../../utils/control/routes';

const TripDelay = ({ delayInSeconds, noDelayText }) => {
    const delay = formatTripDelay(delayInSeconds);
    if (delay === 0) {
        return noDelayText;
    }
    return <span className="text-lowercase">{`${Math.abs(delay)} mins ${delay > 0 ? 'delayed' : 'early'}`}</span>;
};

TripDelay.propTypes = {
    delayInSeconds: PropTypes.number.isRequired,
    noDelayText: PropTypes.string,
};

TripDelay.defaultProps = {
    noDelayText: '',
};

export default TripDelay;
