import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CircleMarker, Popup, Tooltip } from 'react-leaflet';
import VehicleStatusPopupContent from '../Common/VehicleStatusPopupContent';

const getCoordinates = eventPosition => [eventPosition.latitude, eventPosition.longitude];

function VehicleReplayMarker({ openTooltip, openPopup, eventPosition }) {
    const markerRef = useRef(null);

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
            center={ getCoordinates(eventPosition.position) }
            radius={ 5 }
            ref={ markerRef }
            fill
            color="white"
            fillColor="black"
            fillRule="nonzero"
            fillOpacity="1"
            stroke
            id={ eventPosition.id }>
            <Tooltip>{ eventPosition.type }</Tooltip>
            <Popup maxWidth={ 400 } minWidth={ 300 } closeButton={ false }>
                <VehicleStatusPopupContent eventDetail={ eventPosition } />
            </Popup>
        </CircleMarker>
    );
}

VehicleReplayMarker.propTypes = {
    openTooltip: PropTypes.bool.isRequired,
    openPopup: PropTypes.bool,
    eventPosition: PropTypes.object.isRequired,
};

VehicleReplayMarker.defaultProps = {
    openPopup: false,
};

export default VehicleReplayMarker;
