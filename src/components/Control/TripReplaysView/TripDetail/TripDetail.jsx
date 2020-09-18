import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment';
import {
    getStops,
    getCurrentTripState,
    getVehiclePositions,
    getTripStatus,
} from '../../../../redux/selectors/control/tripReplays/currentTrip';
import KeyEventList from './KeyEventList';
import { formatTime, formatUnixTime } from '../../../../utils/helpers';

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

function TripDetail({ summary, stops, status, handleMouseEnter, handleMouseLeave, handleMouseClick, vehiclePositions }) {
    const { route: routeInfo, tripSignOn } = summary;

    const endTime = !_.isEmpty(stops)
        ? parseInt(_.get(stops[stops.length - 1], 'arrival.time', _.get(_.maxBy(vehiclePositions, 'timestamp'), 'timestamp')), 10)
        : null;

    const tripSignOnPosition = _.find(vehiclePositions, { timestamp: moment(tripSignOn).unix().toString() });

    const vehiclePosition = stop => (stop.arrival ? _.find(vehiclePositions, { timestamp: stop.arrival.time }) : null);

    const stopsWithOccupancyStatus = _.map(stops, stop => ({
        ...stop,
        occupancyStatus: vehiclePosition(stop) ? vehiclePosition(stop).occupancyStatus : null,
    }));

    return (
        <section className="flex-grow-1 overflow-y-auto">
            <div className="pl-3 pr-3">
                <h3>{`${routeInfo.shortName}: ${routeInfo.description}`}</h3>
                <p className="font-size-sm font-weight-light">
                    { renderDate(tripSignOn) }<br />
                    { renderStartAndEndTime(tripSignOn, endTime) }
                </p>
            </div>
            <KeyEventList
                tripId={ summary.tripId }
                tripSignOn={ tripSignOn }
                tripSignOnPosition={ tripSignOnPosition }
                stops={ stopsWithOccupancyStatus }
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
};

TripDetail.defaultProps = {
    stops: [],
    vehiclePositions: [],
    status: null,
};

export default connect(
    state => ({
        summary: getCurrentTripState(state),
        stops: getStops(state),
        status: getTripStatus(state),
        vehiclePositions: getVehiclePositions(state),
    }),
)(TripDetail);
