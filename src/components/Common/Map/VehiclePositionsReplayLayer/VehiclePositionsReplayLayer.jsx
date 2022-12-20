import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as moment from 'moment';
import * as L from 'leaflet';
import _ from 'lodash-es';
import { FeatureGroup, LeafletConsumer } from 'react-leaflet';
import { getVehiclePositions, getTripSignOn } from '../../../../redux/selectors/control/tripReplays/currentTrip';
import VehiclePositionMarker from './VehiclePositionMarker';
import './VehiclePositionsReplayLayer.scss';

const getCoordinates = (vehiclePosition) => {
    const { position } = vehiclePosition;
    return [position.latitude, position.longitude];
};

const getLength = (start, end, leafletMap) => {
    const startPoint = leafletMap.latLngToLayerPoint(L.latLng(getCoordinates(start)));
    const endPoint = leafletMap.latLngToLayerPoint(L.latLng(getCoordinates(end)));
    return startPoint.distanceTo(endPoint);
};

// only show vps are 30px away from each other
const filterPositions = (positions, leafletMap, tripSignOn) => {
    if (_.isEmpty(positions)) return positions;
    const tripSignOnTimestamp = moment(tripSignOn).unix().toString();
    let signOnPositionNotFound = true;
    let current = 0;
    const filteredPositions = [positions[0]];
    for (let i = 0; i < positions.length - 1; i++) {
        if (signOnPositionNotFound) {
            if (_.isEqual(positions[i].timestamp, tripSignOnTimestamp)) {
                filteredPositions.push(positions[i]);
                signOnPositionNotFound = false;
                current = i;
                // eslint-disable-next-line no-continue
                continue;
            }
        }
        if (getLength(positions[i], positions[current], leafletMap) >= 30) {
            filteredPositions.push(positions[i]);
            current = i;
        }
    }
    if (positions.length > 1) filteredPositions.push(positions[positions.length - 1]);
    return filteredPositions;
};

function VehiclePositionsReplayLayer({ tripSignOn, vehiclePositions, leafletMap, selectedKeyEvent, hoveredKeyEvent, selectedKeyEventId, clearSelectedKeyEvent }) {
    const [positionsToDisplay, setPositionsToDisplay] = useState([]);

    useEffect(() => {
        leafletMap.on('zoomend', () => {
            setPositionsToDisplay(filterPositions(vehiclePositions, leafletMap, tripSignOn));
        });
    }, [leafletMap, vehiclePositions]);

    useEffect(() => {
        setPositionsToDisplay(filterPositions(vehiclePositions, leafletMap, tripSignOn));
    }, [vehiclePositions]);

    const handleOnClick = (event) => {
        clearSelectedKeyEvent(selectedKeyEvent && selectedKeyEvent.id !== _.get(event, 'layer.options.id'));
    };

    return (
        <FeatureGroup onClick={ handleOnClick }>
            {
                positionsToDisplay.map(position => (
                    <VehiclePositionMarker
                        key={ position.timestamp }
                        center={ getCoordinates(position) }
                        selectedKeyEvent={ selectedKeyEvent }
                        openTooltip={ hoveredKeyEvent === position.timestamp.toString() }
                        openPopup={ selectedKeyEvent && selectedKeyEventId === position.timestamp.toString() }
                        position={ position } />
                ))
            }
        </FeatureGroup>
    );
}

VehiclePositionsReplayLayer.propTypes = {
    vehiclePositions: PropTypes.array.isRequired,
    leafletMap: PropTypes.object.isRequired,
    selectedKeyEvent: PropTypes.object,
    hoveredKeyEvent: PropTypes.string,
    selectedKeyEventId: PropTypes.string,
    clearSelectedKeyEvent: PropTypes.func.isRequired,
    tripSignOn: PropTypes.string,
};

VehiclePositionsReplayLayer.defaultProps = {
    selectedKeyEvent: null,
    hoveredKeyEvent: '',
    selectedKeyEventId: '',
    tripSignOn: '',
};

export default connect(state => ({
    vehiclePositions: getVehiclePositions(state),
    tripSignOn: getTripSignOn(state),
}))(props => (
    <LeafletConsumer>
        {({ map }) => <VehiclePositionsReplayLayer { ...props } leafletMap={ map } />}
    </LeafletConsumer>
));
