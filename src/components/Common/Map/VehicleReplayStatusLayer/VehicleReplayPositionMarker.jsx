import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Popup, Tooltip, Marker } from 'react-leaflet';
import { generateVehiclePositionIcon } from '../../../../utils/control/vehicleReplay';
import VehicleStatusPopupContent from '../popup/VehicleStatusPopupContent';

const getCoordinates = position => [position.latitude, position.longitude];

function VehicleReplayPositionMarker({ openTooltip, openPopup, vehiclePosition }) {
    const markerColor = vehiclePosition.tripId ? 'blue' : 'orange';
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
        <Marker
            ref={ markerRef }
            icon={ generateVehiclePositionIcon(markerColor, vehiclePosition.position.bearing) }
            position={ getCoordinates(vehiclePosition.position) }
        >
            <Tooltip><VehicleStatusPopupContent eventDetail={ vehiclePosition } /></Tooltip>
            <Popup maxWidth={ 400 } minWidth={ 300 } closeButton={ false }>
                <VehicleStatusPopupContent eventDetail={ vehiclePosition } />
            </Popup>
        </Marker>
    );
}

VehicleReplayPositionMarker.propTypes = {
    openTooltip: PropTypes.bool.isRequired,
    vehiclePosition: PropTypes.object.isRequired,
    openPopup: PropTypes.bool,
};

VehicleReplayPositionMarker.defaultProps = {
    openPopup: false,
};

export default VehicleReplayPositionMarker;
