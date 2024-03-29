import React from 'react';
import PropTypes from 'prop-types';
import { map, has, get } from 'lodash-es';
import moment from 'moment';
import { connect } from 'react-redux';
import KeyEvent from './KeyEvent';
import { EVENT_TYPES } from './KeyEventType';
import { formatTime, getTimesFromStop } from '../../../../utils/helpers';
import './KeyEventList.scss';
import TripUpdateTag from '../../Common/Trip/TripUpdateTag';
import { TRIP_UPDATE_TYPE, TRIP_FINAL_STATUS } from '../../../../constants/tripReplays';
import { getCanceledEvent, getPlatformChanges, getSkippedStops, getStopIndexAfterCancel } from '../../../../utils/control/tripReplays';
import { getTripReplaySearchDateFilter } from '../../../../redux/selectors/control/tripReplays/filters';

const renderStops = (stops, status, handleMouseEnter, handleMouseLeave, handleMouseClick, operationalEvents, searchDate) => {
    const skippedStops = getSkippedStops(operationalEvents);
    const platformChanges = getPlatformChanges(operationalEvents);
    const canceledEvent = getCanceledEvent(operationalEvents);
    const stopIndexAfterCancel = getStopIndexAfterCancel(stops, canceledEvent);

    const stopsRendered = map(stops, (stop, index) => {
        let type = EVENT_TYPES.STOP;

        if (!has(stop, 'stopLat')) return null;
        if (index === 0) {
            type = EVENT_TYPES.FIRST_STOP;
        }
        if (index === (stops.length - 1)) {
            type = EVENT_TYPES.TRIP_END;
        }

        const { scheduledTime, time } = getTimesFromStop(stop, searchDate);

        const keyEventDetail = {
            id: `${stop.stopCode}_${stop.stopSequence}`,
            latlon: [stop.stopLat, stop.stopLon],
            title: `Stop ${stop.stopCode} - ${stop.stopName}`,
            type,
            occupancyStatus: stop.occupancyStatus,
            skippedData: skippedStops[stop.stopSequence],
            plaformChangeData: platformChanges[stop.stopSequence],
            isCanceled: index >= stopIndexAfterCancel,
            timepoint: stop.timepoint,
        };

        return (
            <KeyEvent
                key={ `${stop.stopCode}_${stop.stopSequence}` }
                type={ type }
                scheduledTime={ scheduledTime }
                time={ time }
                keyEventDetail={ keyEventDetail }
                handleMouseEnter={ handleMouseEnter }
                handleMouseLeave={ handleMouseLeave }
                handleMouseClick={ handleMouseClick }
            />
        );
    });

    if (status === TRIP_FINAL_STATUS.CANCELED && canceledEvent) {
        const canceledIndicator = (
            <TripUpdateTag
                key="canceledTag"
                type={ TRIP_UPDATE_TYPE.CANCELED }
                indicatorBar
                data={ canceledEvent }
                hasIcon
                hasTooltip />
        );
        stopsRendered.splice(stopIndexAfterCancel, 0, canceledIndicator);
    }

    return stopsRendered;
};

function KeyEventList({ tripId, tripSignOn, stops, status, handleMouseEnter, handleMouseLeave, handleMouseClick, tripSignOnPosition, operationalEvents, searchDate }) {
    const tripSignOnCoordinates = [get(tripSignOnPosition, 'position.latitude'), get(tripSignOnPosition, 'position.longitude')];
    const keyEventDetail = {
        id: moment(tripSignOn).unix().toString(),
        latlon: tripSignOnPosition ? tripSignOnCoordinates : undefined,
        title: `Trip: ${tripId}`,
        type: EVENT_TYPES.SIGN_ON,
    };
    return (
        <ul className="key-event-list">
            {
                tripSignOn && (
                    <KeyEvent type={ EVENT_TYPES.SIGN_ON }
                        time={ formatTime(tripSignOn) }
                        keyEventDetail={ keyEventDetail }
                        handleMouseEnter={ handleMouseEnter }
                        handleMouseLeave={ handleMouseLeave }
                        handleMouseClick={ handleMouseClick } />
                )
            }
            {
                renderStops(stops, status, handleMouseEnter, handleMouseLeave, handleMouseClick, operationalEvents, searchDate)
            }
        </ul>
    );
}

KeyEventList.propTypes = {
    tripSignOn: PropTypes.string,
    tripSignOnPosition: PropTypes.object,
    stops: PropTypes.array,
    status: PropTypes.string,
    tripId: PropTypes.string,
    handleMouseEnter: PropTypes.func.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
    handleMouseClick: PropTypes.func.isRequired,
    operationalEvents: PropTypes.array,
    searchDate: PropTypes.string,
};

KeyEventList.defaultProps = {
    stops: [],
    tripId: '',
    tripSignOn: '',
    tripSignOnPosition: null,
    status: null,
    operationalEvents: [],
    searchDate: undefined,
};

export default connect(state => ({
    searchDate: getTripReplaySearchDateFilter(state),
}))(KeyEventList);
