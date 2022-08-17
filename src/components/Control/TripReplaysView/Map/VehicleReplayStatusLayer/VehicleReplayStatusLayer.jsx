import PropTypes from 'prop-types';
import React from 'react';
import { FeatureGroup } from 'react-leaflet';
import _ from 'lodash-es';
import VehicleStatusMarker from './VehicleReplayMarker';
import './VehicleReplayStatusLayer.scss';

function VehicleReplayStatusLayer(props) {
    const { eventPositions, selectedKeyEvent, hoveredKeyEvent, selectedKeyEventId, clearSelectedKeyEvent } = props;
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
        </FeatureGroup>
    );
}

VehicleReplayStatusLayer.propTypes = {
    eventPositions: PropTypes.array,
    selectedKeyEvent: PropTypes.object,
    hoveredKeyEvent: PropTypes.string,
    selectedKeyEventId: PropTypes.string,
    clearSelectedKeyEvent: PropTypes.func.isRequired,
};

VehicleReplayStatusLayer.defaultProps = {
    eventPositions: [],
    selectedKeyEvent: null,
    hoveredKeyEvent: '',
    selectedKeyEventId: '',
};

export default VehicleReplayStatusLayer;
