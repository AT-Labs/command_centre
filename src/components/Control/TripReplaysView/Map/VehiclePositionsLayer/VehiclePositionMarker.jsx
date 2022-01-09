import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash-es';
import { connect } from 'react-redux';
import { CircleMarker, Popup } from 'react-leaflet';
import VehiclePositionTooltip from './VehiclePositionTooltip';
import PopupContent from '../Common/PopupContent';
import { getCurrentTripState } from '../../../../../redux/selectors/control/tripReplays/currentTrip';
import { formatUnixTime } from '../../../../../utils/helpers';

const getCoordinates = position => [
    position.position.latitude.toFixed(5),
    position.position.longitude.toFixed(5)];

function VehiclePositionMarker({ center, openTooltip, openPopup, selectedKeyEvent, position, currentTrip }) {
    const markerRef = useRef(null);
    const timestamp = parseInt(position.timestamp, 10);
    const time = {
        signedOn: formatUnixTime(timestamp),
    };
    const shouldAddPopup = _.isEqual(timestamp, moment(currentTrip.tripSignOn).unix());
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
            center={ center }
            radius={ 4 }
            fill
            ref={ markerRef }
            stroke={ false }
            fillColor={ position.nis ? 'red' : '#3b6a94' }
            fillRule="nonzero"
            fillOpacity={ position.nis ? 0.4 : 1 }
            id={ timestamp }
        >
            <VehiclePositionTooltip position={ position } />
            { shouldAddPopup
            && (
                <Popup maxWidth={ 400 } minWidth={ 300 }>
                    <PopupContent
                        markerId={ timestamp.toString() }
                        selectedKeyEvent={ selectedKeyEvent }
                        currentTrip={ currentTrip }
                        coordinates={ getCoordinates(position) }
                        time={ time }
                    />
                </Popup>
            )}
        </CircleMarker>
    );
}

VehiclePositionMarker.propTypes = {
    center: PropTypes.array.isRequired,
    openTooltip: PropTypes.bool.isRequired,
    openPopup: PropTypes.bool,
    selectedKeyEvent: PropTypes.object,
    position: PropTypes.object.isRequired,
    currentTrip: PropTypes.object.isRequired,
};

VehiclePositionMarker.defaultProps = {
    selectedKeyEvent: null,
    openPopup: false,
};

export default connect(
    state => ({
        currentTrip: getCurrentTripState(state),
    }),
)(VehiclePositionMarker);
