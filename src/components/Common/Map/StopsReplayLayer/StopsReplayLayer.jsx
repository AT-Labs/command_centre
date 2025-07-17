import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FeatureGroup } from 'react-leaflet';
import { get, has } from 'lodash-es';
import StopMarker from './StopMarker';
import './StopsReplayLayer.scss';
import { getCurrentTripState } from '../../../../redux/selectors/control/tripReplays/currentTripSelector';

function StopsReplayLayer(props) {
    const { stops, selectedKeyEvent, hoveredKeyEvent, selectedKeyEventId, currentTrip, clearSelectedKeyEvent } = props;
    const handleOnClick = (event) => {
        clearSelectedKeyEvent(selectedKeyEvent && selectedKeyEvent.id !== get(event, 'layer.options.id'));
    };
    return (
        <FeatureGroup onClick={ handleOnClick }>
            {
                stops.map(stop => (has(stop, 'stopLat') ? (
                    <StopMarker
                        key={ `${stop.stopCode}_${stop.stopSequence}` }
                        selectedKeyEvent={ selectedKeyEvent }
                        openTooltip={ hoveredKeyEvent === `${stop.stopCode}_${stop.stopSequence}` }
                        openPopup={ selectedKeyEvent && selectedKeyEventId === `${stop.stopCode}_${stop.stopSequence}` }
                        stop={ stop }
                        currentTrip={ currentTrip } />
                ) : null))
            }
        </FeatureGroup>
    );
}

StopsReplayLayer.propTypes = {
    stops: PropTypes.array,
    currentTrip: PropTypes.object.isRequired,
    selectedKeyEvent: PropTypes.object,
    hoveredKeyEvent: PropTypes.string,
    selectedKeyEventId: PropTypes.string,
    clearSelectedKeyEvent: PropTypes.func.isRequired,
};

StopsReplayLayer.defaultProps = {
    stops: [],
    selectedKeyEvent: null,
    hoveredKeyEvent: '',
    selectedKeyEventId: '',
};

export default connect(
    state => ({
        currentTrip: getCurrentTripState(state),
    }),
)(StopsReplayLayer);
