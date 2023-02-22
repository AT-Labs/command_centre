import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash-es';
import moment from 'moment';
import { occupancyStatusToMessage } from '../../../../types/vehicle-occupancy-status-types';
import { formatTimeLabel, formatArrivalDeparture } from '../../../../utils/control/tripReplays';

function PopupContent({ selectedKeyEvent, currentTrip, coordinates, scheduledTime, time, markerId }) {
    const tripDate = moment(currentTrip.tripSignOn).format('YYYY-MM-DD');
    const tripDateAndTime = moment(`${tripDate} ${time.arrival}`).unix().toString();
    const vehicleEvent = currentTrip.vehicleEvents ? currentTrip.vehicleEvents.find(e => e.timestamp === tripDateAndTime) : undefined;

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
                    <div className="col pb-2">
                        <b>
                            {formatTimeLabel(scheduledTime, 'Scheduled')}
                            :
                        </b>
                        {' '}
                        {formatArrivalDeparture(scheduledTime)}
                    </div>
                </div>
            )}
            <div className="row">
                <div className="col pb-2">
                    <b>
                        {formatTimeLabel(time, 'Actual')}
                        :
                    </b>
                    {' '}
                    {formatArrivalDeparture(time)}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Location:</b>
                    {' '}
                    lat:
                    {' '}
                    { coordinates[0] }
                    , lon:
                    {' '}
                    { coordinates[1] }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Route:</b>
                    {' '}
                    { get(currentTrip, 'routeShortName') }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Trip ID:</b>
                    {' '}
                    { currentTrip.tripId }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Operator code:</b>
                    {' '}
                    { currentTrip.agencyId }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Fleet number:</b>
                    {' '}
                    { currentTrip.vehicleId }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Vehicle label:</b>
                    {' '}
                    { currentTrip.vehicleLabel }
                </div>
            </div>
            {vehicleEvent && vehicleEvent.occupancyStatus && (
                <div className="row">
                    <div className="col pb-2">
                        <b>Occupancy:</b>
                        {' '}
                        { occupancyStatusToMessage(vehicleEvent.occupancyStatus) }
                    </div>
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
