import React from 'react';
import PropTypes from 'prop-types';
import { FeatureGroup } from 'react-leaflet';
import IconMarker from '../../../../Common/IconMarker/IconMarker';

const StopsLayer = props => (
    <FeatureGroup>
        {props.stops.map(stop => (stop.stop_lat
            ? (
                <IconMarker
                    key={ stop.stop_id }
                    location={ [stop.stop_lat, stop.stop_lon] }
                    imageName="bus-stop"
                    size={ 28 } />
            ) : null)) }
    </FeatureGroup>
);

StopsLayer.propTypes = {
    stops: PropTypes.array.isRequired,
};

export default StopsLayer;
