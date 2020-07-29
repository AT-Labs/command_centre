import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import moment from 'moment';
import KeyEvent from './KeyEvent';
import { EVENT_TYPES } from './KeyEventType';
import { formatTime, getTimesFromStop, formatUnixTime, spreadStateIntoStops } from '../../../../utils/helpers';
import './KeyEventList.scss';

const renderStops = (stops, status, handleMouseEnter, handleMouseLeave, handleMouseClick) => {
    const currentStops = spreadStateIntoStops(stops, status);

    return _.map(currentStops, (stop, index) => {
        const isRealStop = !!parseInt(stop.stopCode, 10);
        let type = EVENT_TYPES.STOP;
        if (isRealStop) {
            if (!_.has(stop, 'stopLat')) return null;
            if (index === 0) {
                type = EVENT_TYPES.FIRST_STOP;
            }
            if (index === (currentStops.length - 1)) {
                type = EVENT_TYPES.TRIP_END;
            }
        } else {
            if (stop.stopCode === 'CANCELED') {
                type = EVENT_TYPES.CANCELED;
            } else if (stop.stopCode === 'REINSTATED') {
                type = EVENT_TYPES.REINSTATED;
            }
            const time = {
                arrival: formatUnixTime(stop.time),
                departure: formatUnixTime(stop.time),
            };
            return (
                <KeyEvent
                    key={ `${stop.stopCode}_${index}` }
                    type={ type }
                    time={ time }
                />
            );
        }


        const { scheduledTime, time } = getTimesFromStop(stop);

        const keyEventDetail = {
            id: `${stop.stopCode}_${stop.stopSequence}`,
            latlon: [stop.stopLat, stop.stopLon],
            title: `Stop ${stop.stopCode} - ${stop.stopName}`,
            type,
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
};

function KeyEventList({ tripId, tripSignOn, stops, status, handleMouseEnter, handleMouseLeave, handleMouseClick, tripSignOnPosition }) {
    const tripSignOnCoordinates = [_.get(tripSignOnPosition, 'position.latitude'), _.get(tripSignOnPosition, 'position.longitude')];
    const keyEventDetail = {
        id: moment(tripSignOn).unix().toString(),
        latlon: tripSignOnCoordinates,
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
                renderStops(stops, status, handleMouseEnter, handleMouseLeave, handleMouseClick)
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
};

KeyEventList.defaultProps = {
    stops: [],
    tripId: '',
    tripSignOn: '',
    tripSignOnPosition: null,
    status: null,
};

export default KeyEventList;
