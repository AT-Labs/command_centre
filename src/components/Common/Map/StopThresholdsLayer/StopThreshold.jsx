import React from 'react';
import { isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import { FeatureGroup, Polyline } from 'react-leaflet';

function StopThreshold({ threshold }) {
    return !isEmpty(threshold)
        ? (
            <FeatureGroup>
                <Polyline positions={ threshold } weight={ 5 } color="BLACK" />
            </FeatureGroup>
        ) : null;
}

StopThreshold.propTypes = {
    threshold: PropTypes.array,
};

StopThreshold.defaultProps = {
    threshold: [],
};

export default StopThreshold;
