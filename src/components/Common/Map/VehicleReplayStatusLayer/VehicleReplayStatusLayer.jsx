import PropTypes from 'prop-types';
import React from 'react';
import { FeatureGroup } from 'react-leaflet';
import _ from 'lodash-es';
import VehicleStatusMarker from './VehicleReplayMarker';
import VehicleReplayPositionMarker from './VehicleReplayPositionMarker';
import './VehicleReplayStatusLayer.scss';

function VehicleReplayStatusLayer(props) {
    const { eventPositions, vehiclePositions, selectedKeyEvent, hoveredKeyEvent, selectedKeyEventId, clearSelectedKeyEvent } = props;
    const handleOnClick = (event) => {
        clearSelectedKeyEvent(selectedKeyEvent && selectedKeyEvent.id !== _.get(event, 'layer.options.id'));
    };
    return (
        <FeatureGroup onClick={ handleOnClick }>
            {
                eventPositions?.map(event => (!_.isNil(event.position.latitude) ? (
                    <VehicleStatusMarker
                        key={ event.id }
                        openTooltip={ hoveredKeyEvent === event.id }
                        openPopup={ selectedKeyEvent && selectedKeyEventId === event.id }
                        eventPosition={ event } />
                ) : null))
            }
            {
                vehiclePositions?.map(vehiclePosition => (!_.isNil(vehiclePosition.position.latitude) ? (
                    <VehicleReplayPositionMarker
                        key={ vehiclePosition.id }
                        openTooltip={ hoveredKeyEvent === vehiclePosition.id }
                        openPopup={ selectedKeyEvent && selectedKeyEventId === vehiclePosition.id }
                        vehiclePosition={ vehiclePosition } />
                ) : null))
            }
        </FeatureGroup>
    );
}

VehicleReplayStatusLayer.propTypes = {
    eventPositions: PropTypes.array,
    vehiclePositions: PropTypes.array,
    selectedKeyEvent: PropTypes.object,
    hoveredKeyEvent: PropTypes.string,
    selectedKeyEventId: PropTypes.string,
    clearSelectedKeyEvent: PropTypes.func.isRequired,
};

VehicleReplayStatusLayer.defaultProps = {
    eventPositions: [],
    vehiclePositions: [],
    selectedKeyEvent: null,
    hoveredKeyEvent: '',
    selectedKeyEventId: '',
};

export default VehicleReplayStatusLayer;
