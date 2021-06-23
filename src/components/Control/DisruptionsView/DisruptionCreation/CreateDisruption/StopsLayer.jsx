import React from 'react';
import PropTypes from 'prop-types';
import { FeatureGroup } from 'react-leaflet';
import IconMarker from '../../../../Common/IconMarker/IconMarker';

const StopsLayer = props => (
    <FeatureGroup>
        {props.stops.map(stop => (stop.stopLat
            ? (
                <IconMarker
                    key={ stop.stopId }
                    location={ [stop.stopLat, stop.stopLon] }
                    imageName="bus-stop"
                    size={ 28 } />
            ) : null)) }
    </FeatureGroup>
);

StopsLayer.propTypes = {
    stops: PropTypes.array.isRequired,
};

export default StopsLayer;
