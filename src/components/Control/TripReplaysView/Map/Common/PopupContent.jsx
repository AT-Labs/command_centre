import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import moment from 'moment';
import { occupancyStatusToMessage } from '../../../../../types/vehicle-occupancy-status-types';

const formatTimeLabel = (times, prefix) => {
    if (_.has(times, 'signedOn')) {
        return 'Signed on time';
    }

    if ((_.has(times, 'arrival') && _.has(times, 'departure'))
    || (!_.has(times, 'arrival') && !_.has(times, 'departure'))) {
        return `${prefix} time`.trim();
    }

    if (_.has(times, 'arrival')) {
        return `${prefix} arrival`.trim();
    }

    return `${prefix} departure`.trim();
};

const formatArrivalDeparture = (times) => {
    if (_.has(times, 'signedOn')) {
        return _.get(times, 'signedOn');
    }

    if (_.has(times, 'arrival') && _.has(times, 'departure')) {
        return `${_.get(times, 'arrival')} - ${_.get(times, 'departure')}`;
    }

    if (!_.has(times, 'arrival') && !_.has(times, 'departure')) {
        return '-';
    }

    if (_.has(times, 'arrival')) {
        return _.get(times, 'arrival');
    }

    return _.get(times, 'departure');
};

function PopupContent({ selectedKeyEvent, currentTrip, coordinates, scheduledTime, time, markerId }) {
    const tripDate = moment(currentTrip.tripSignOn).format('YYYY-MM-DD');
    const tripDateAndTime = moment(`${tripDate} ${time.arrival}`).unix().toString();
    const vehicleEvent = currentTrip.vehicleEvents.find(e => e.timestamp === tripDateAndTime);

    return (
        <div>
            { selectedKeyEvent && selectedKeyEvent.id === markerId
            && (
                <div className="row align-items-baseline">
                    <div className="col-8 text-left"><h2><b>{ selectedKeyEvent.type }</b></h2></div>
                </div>
            )}
            { scheduledTime && (
                <div className="row">
                    <div className="col pb-2"><b>{formatTimeLabel(scheduledTime, 'Scheduled')}:</b> {formatArrivalDeparture(scheduledTime)}</div>
                </div>
            )}
            <div className="row">
                <div className="col pb-2"><b>{formatTimeLabel(time, 'Actual')}:</b> {formatArrivalDeparture(time)}</div>
            </div>
            <div className="row">
                <div className="col pb-2"><b>Location:</b> lat: { coordinates[0] }, lon: { coordinates[1] }</div>
            </div>
            <div className="row">
                <div className="col pb-2"><b>Route:</b> { _.get(currentTrip, 'route.shortName') }</div>
            </div>
            <div className="row">
                <div className="col pb-2"><b>Trip ID:</b> { currentTrip.tripId }</div>
            </div>
            <div className="row">
                <div className="col pb-2"><b>Operator code:</b> { currentTrip.agencyId }</div>
            </div>
            <div className="row">
                <div className="col pb-2"><b>Fleet number:</b> { currentTrip.vehicleId }</div>
            </div>
            <div className="row">
                <div className="col pb-2"><b>Vehicle label:</b> { currentTrip.vehicleLabel }</div>
            </div>
            {vehicleEvent && vehicleEvent.occupancyStatus && (
                <div className="row">
                    <div className="col pb-2"><b>Occupancy:</b> { occupancyStatusToMessage(vehicleEvent.occupancyStatus) }</div>
                </div>
            )}
        </div>
    );
}

PopupContent.propTypes = {
    markerId: PropTypes.string.isRequired,
    selectedKeyEvent: PropTypes.object,
    currentTrip: PropTypes.object.isRequired,
    coordinates: PropTypes.array.isRequired,
    time: PropTypes.object.isRequired,
    scheduledTime: PropTypes.object,
};

PopupContent.defaultProps = {
    selectedKeyEvent: null,
    scheduledTime: null,
};

export default PopupContent;
