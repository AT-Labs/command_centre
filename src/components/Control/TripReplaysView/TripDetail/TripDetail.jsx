import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty, get, maxBy, find } from 'lodash-es';
import moment from 'moment';
import { IoIosArrowForward } from 'react-icons/io';
import {
    getStops,
    getCurrentTripState,
    getVehiclePositions,
    getTripStatus,
    getOperationalEvents,
} from '../../../../redux/selectors/control/tripReplays/currentTrip';
import { search } from '../../../../redux/actions/search';
import { getSearchResults } from '../../../../redux/selectors/search';
import KeyEventList from './KeyEventList';
import { formatTime, formatUnixTime } from '../../../../utils/helpers';
import TripUpdateTag from '../../Common/Trip/TripUpdateTag';
import { TRIP_UPDATE_TYPE } from '../../../../constants/tripReplays';
import { isTripMissed, isCopyTrip, tripHasDisruption } from '../../../../utils/control/tripReplays';
import { updateControlDetailView, updateMainView } from '../../../../redux/actions/navigation';
import VIEW_TYPE from '../../../../types/view-types';
import { updateDisruptionFilters } from '../../../../redux/actions/control/disruptions';
import Icon from '../../../Common/Icon/Icon';

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

function TripDetail({ summary, stops, status, handleMouseEnter, handleMouseLeave, handleMouseClick, vehiclePositions, operationalEvents,
    navigate, updateView, updateFilters, searchRoutes, searchResults }) {
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


    const fetchDateFromStopEvent = (stopEvent, hasEndTime) => {
        let unixTime = 0;

        if (stopEvent.departure) {
            unixTime = stopEvent.departure.time ? stopEvent.departure.time : stopEvent.departure.scheduledTime;
        } else if (stopEvent.arrival) {
            unixTime = stopEvent.arrival.time ? stopEvent.arrival.time : stopEvent.arrival.scheduledTime;
        }

        if (unixTime === 0) return null;

        if (hasEndTime) {
            return moment.unix(unixTime).endOf('day').toDate();
        }

        return moment.unix(unixTime).startOf('day').toDate();
    };

    const fetchStartEndDatesFromTripSummary = () => {
        const startDate = fetchDateFromStopEvent(summary.stopEvents[0]);

        const endDate = fetchDateFromStopEvent(summary.stopEvents[summary.stopEvents.length - 1], true);

        return [startDate, endDate];
    };

    const [isNavigatingToDisruption, setIsNavigatingToDisruption] = useState(false);

    useEffect(() => {
        if (!isNavigatingToDisruption) return;

        const [startDate, endDate] = fetchStartEndDatesFromTripSummary();

        const filters = {
            selectedStartDate: startDate,
            selectedEndDate: endDate,
            selectedEntity: searchResults.route[0],
            selectedStatus: null,
            selectedImpact: null,
        };

        updateFilters(filters);
        updateView(VIEW_TYPE.MAIN.CONTROL);
        navigate(VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS);
    }, [searchResults]);

    const navigateToDisruption = () => {
        // searchResults useEffect will navigate
        setIsNavigatingToDisruption(true);
        searchRoutes(routeInfo.shortName, ['route']);
    };

    return (
        <section className="flex-grow-1 overflow-y-auto">
            <div className="pl-3 pr-3 pb-3 border-bottom">
                <h3>{`${routeInfo.shortName}: ${routeInfo.description}`}</h3>
                { isTripMissed(summary) && <TripUpdateTag type={ TRIP_UPDATE_TYPE.MISSED } /> }
                <p className="font-size-sm font-weight-light mt-0 mb-0">
                    { renderDate(tripStart) }<br />
                    { renderStartAndEndTime(tripSignOn, endTime) }
                </p>
                { isCopyTrip(summary) && <TripUpdateTag type={ TRIP_UPDATE_TYPE.COPY_TRIP } /> }
                { tripHasDisruption(summary) && (
                    <button
                        type="button"
                        className="cc-btn-alert pr-3 mb-2 mt-2"
                        onClick={ () => navigateToDisruption() }
                    >
                        <Icon icon="alert" className="icon alert-icon pl-1 pr-3 d-inline-block" />
                        <span>View disruption details</span>
                        <IoIosArrowForward className="text-info" size={ 12 } />
                    </button>
                ) }
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
    updateView: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
    updateFilters: PropTypes.func.isRequired,
    searchRoutes: PropTypes.func.isRequired,
    searchResults: PropTypes.object.isRequired,
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
        searchResults: getSearchResults(state),
    }), {
        updateFilters: updateDisruptionFilters,
        updateView: updateMainView,
        navigate: updateControlDetailView,
        searchRoutes: search,
    },
)(TripDetail);
