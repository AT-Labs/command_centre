import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CircleMarker, Popup, Tooltip } from 'react-leaflet';
import PopupContent from '../popup/PopupContent';
import { getTimesFromStop } from '../../../../utils/helpers';

const getCoordinates = stop => [stop.stopLat, stop.stopLon];

function StopMarker({ openTooltip, openPopup, selectedKeyEvent, currentTrip, stop }) {
    const markerRef = useRef(null);

    const { scheduledTime, time } = getTimesFromStop(stop);

    useEffect(() => {
        if (openTooltip && !markerRef.current.leafletElement.isPopupOpen()) {
            markerRef.current.leafletElement.openTooltip();
        } else {
            markerRef.current.leafletElement.closeTooltip();
        }
        if (openPopup) {
            markerRef.current.leafletElement.closeTooltip();
            markerRef.current.leafletElement.openPopup();
        }
    }, [openTooltip, openPopup]);

    return (
        <CircleMarker
            center={ getCoordinates(stop) }
            radius={ 5 }
            ref={ markerRef }
            fill
            color="white"
            fillColor="black"
            fillRule="nonzero"
            fillOpacity="1"
            stroke
            id={ stop.stopCode }>
            <Tooltip>{ `${stop.stopCode} - ${stop.stopName}` }</Tooltip>
            <Popup maxWidth={ 400 } minWidth={ 300 }>
                <PopupContent
                    markerId={ `${stop.stopCode}_${stop.stopSequence}` }
                    selectedKeyEvent={ selectedKeyEvent }
                    currentTrip={ currentTrip }
                    coordinates={ getCoordinates(stop) }
                    time={ time }
                    scheduledTime={ scheduledTime } />
            </Popup>
        </CircleMarker>
    );
}

StopMarker.propTypes = {
    openTooltip: PropTypes.bool.isRequired,
    openPopup: PropTypes.bool,
    selectedKeyEvent: PropTypes.object,
    currentTrip: PropTypes.object.isRequired,
    stop: PropTypes.object.isRequired,
};

StopMarker.defaultProps = {
    selectedKeyEvent: null,
    openPopup: false,
};

export default StopMarker;
