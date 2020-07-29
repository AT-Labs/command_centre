import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FeatureGroup } from 'react-leaflet';
import _ from 'lodash-es';
import StopMarker from './StopMarker';
import './StopsLayer.scss';
import { getCurrentTripState } from '../../../../../redux/selectors/control/tripReplays/currentTrip';

function StopsLayer(props) {
    const { stops, selectedKeyEvent, hoveredKeyEvent, selectedKeyEventId, currentTrip, clearSelectedKeyEvent } = props;
    const handleOnClick = (event) => {
        clearSelectedKeyEvent(selectedKeyEvent && selectedKeyEvent.id !== _.get(event, 'layer.options.id'));
    };
    return (
        <FeatureGroup onClick={ handleOnClick }>
            {
                stops.map(stop => (_.has(stop, 'stopLat') ? (
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

StopsLayer.propTypes = {
    stops: PropTypes.array,
    currentTrip: PropTypes.object.isRequired,
    selectedKeyEvent: PropTypes.object,
    hoveredKeyEvent: PropTypes.string,
    selectedKeyEventId: PropTypes.string,
    clearSelectedKeyEvent: PropTypes.func.isRequired,
};

StopsLayer.defaultProps = {
    stops: [],
    selectedKeyEvent: null,
    hoveredKeyEvent: '',
    selectedKeyEventId: '',
};

export default connect(
    state => ({
        currentTrip: getCurrentTripState(state),
    }),
)(StopsLayer);
