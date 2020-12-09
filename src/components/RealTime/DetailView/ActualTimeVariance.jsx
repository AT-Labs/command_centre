import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { capitalize } from 'lodash-es';


const calculateVariance = (scheduledTime, actualTime) => {
    if (!scheduledTime || !actualTime) {
        return '';
    }

    const scheduledMoment = moment(scheduledTime, moment.ISO_8601);
    const actualMoment = moment(actualTime, moment.ISO_8601);
    const varianceInMinutes = actualMoment.diff(scheduledMoment, 'minute');

    if (varianceInMinutes === 0) {
        return '';
    }

    return `(${varianceInMinutes > 0 ? 'Late' : 'Early'} ${Math.abs(varianceInMinutes)} min)`;
};

const timeDisplay = (isCancelled, actualTime, type) => {
    if (type === 'SKIPPED') {
        return capitalize(type);
    }
    return (isCancelled && 'C')
    || (actualTime ? moment(actualTime, moment.ISO_8601).format('HH:mm') : '—');
};

const ActualTimeVariance = (props) => {
    const { scheduledTime, actualTime, stop, trip } = props;
    const variance = calculateVariance(scheduledTime, actualTime);
    const isCancelled = trip.scheduleRelationship === 'CANCELED';

    const actualTimeDisplay = timeDisplay(isCancelled, actualTime, stop.scheduleRelationship === 'SKIPPED' ? stop.scheduleRelationship : null);
    return (
        <div className="text-right">
            <p className={ `my-0 ${isCancelled ? 'text-danger' : ''}` }>{actualTimeDisplay}</p>
            <small className="text-danger">{variance}</small>
        </div>
    );
};

ActualTimeVariance.propTypes = {
    scheduledTime: PropTypes.string,
    actualTime: PropTypes.string,
    stop: PropTypes.object.isRequired,
    trip: PropTypes.object.isRequired,
};

ActualTimeVariance.defaultProps = {
    scheduledTime: '',
    actualTime: '',
};

export default ActualTimeVariance;
