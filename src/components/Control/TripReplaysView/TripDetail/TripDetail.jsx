import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty, get, maxBy, find } from 'lodash-es';
import moment from 'moment';
import {
    getStops,
    getCurrentTripState,
    getVehiclePositions,
    getTripStatus,
    getOperationalEvents,
} from '../../../../redux/selectors/control/tripReplays/currentTrip';
import KeyEventList from './KeyEventList';
import { formatTime, formatUnixTime } from '../../../../utils/helpers';
import TripUpdateTag from '../../Common/Trip/TripUpdateTag';
import { TRIP_UPDATE_TYPE } from '../../../../constants/tripReplays';
import { isTripMissed, isCopyTrip } from '../../../../utils/control/tripReplays';

const renderDate = date => (date && moment(date).format('dddd, DD MMMM YYYY'));

const renderStartAndEndTime = (startTime, endTime) => {
    const formattedStartTime = startTime ? formatTime(startTime) : '';
    const formattedEndTime = endTime ? formatUnixTime(endTime) : '';

    if (startTime && endTime) {
        return `Trip start and end time ${formattedStartTime} - ${formattedEndTime}`;
    }

    if (startTime) {
        return `Trip start time ${formattedStartTime}`;
    }

    if (endTime) {
        return `Trip end time ${formattedEndTime}`;
    }

    return null;
};

function TripDetail({ summary, stops, status, handleMouseEnter, handleMouseLeave, handleMouseClick, vehiclePositions, operationalEvents }) {
    const { route: routeInfo, tripSignOn, tripStart } = summary;

    const endTime = !isEmpty(stops)
        ? parseInt(get(stops[stops.length - 1], 'arrival.time', get(maxBy(vehiclePositions, 'timestamp'), 'timestamp')), 10)
        : null;

    const tripSignOnPosition = find(vehiclePositions, { timestamp: moment(tripSignOn).unix().toString() });

    const vehiclePosition = stop => (stop.arrival ? find(vehiclePositions, { timestamp: stop.arrival.time }) : null);

    const stopsWithOccupancyStatus = stops.map(stop => ({
        ...stop,
        occupancyStatus: vehiclePosition(stop) ? vehiclePosition(stop).occupancyStatus : null,
    }));

    return (
        <section className="flex-grow-1 overflow-y-auto">
            <div className="pl-3 pr-3 mb-3">
                <h3>{`${routeInfo.shortName}: ${routeInfo.description}`}</h3>
                { isTripMissed(summary) && <TripUpdateTag type={ TRIP_UPDATE_TYPE.MISSED } /> }
                <p className="font-size-sm font-weight-light mt-0 mb-0">
                    { renderDate(tripStart) }<br />
                    { renderStartAndEndTime(tripSignOn, endTime) }
                </p>
                { isCopyTrip(summary) && <TripUpdateTag type={ TRIP_UPDATE_TYPE.COPY_TRIP } /> }
            </div>
            <KeyEventList
                tripId={ summary.tripId }
                tripSignOn={ tripSignOn }
                tripSignOnPosition={ tripSignOnPosition }
                stops={ stopsWithOccupancyStatus }
                operationalEvents={ operationalEvents }
                status={ status }
                handleMouseEnter={ handleMouseEnter }
                handleMouseLeave={ handleMouseLeave }
                handleMouseClick={ handleMouseClick } />
        </section>
    );
}

TripDetail.propTypes = {
    summary: PropTypes.object.isRequired,
    stops: PropTypes.array,
    status: PropTypes.string,
    handleMouseEnter: PropTypes.func.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
    handleMouseClick: PropTypes.func.isRequired,
    vehiclePositions: PropTypes.array,
    operationalEvents: PropTypes.array,
};

TripDetail.defaultProps = {
    stops: [],
    vehiclePositions: [],
    status: null,
    operationalEvents: [],
};

export default connect(
    state => ({
        summary: getCurrentTripState(state),
        stops: getStops(state),
        operationalEvents: getOperationalEvents(state),
        status: getTripStatus(state),
        vehiclePositions: getVehiclePositions(state),
    }),
)(TripDetail);
