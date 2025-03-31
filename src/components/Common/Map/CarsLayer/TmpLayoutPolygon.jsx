import React from 'react';
import { Tooltip, Polyline } from 'react-leaflet';
import PropTypes from 'prop-types';

import { LayoutTooltipContent } from './LayoutTooltipContent';

export const TmpLayoutPolygon = (props) => {
    const { id, geometry, deployments } = props;

    return (
        <Polyline
            key={ id }
            color="#A10702"
            weight={ 4 }
            opacity={ 0.8 }
            positions={ geometry.coordinates.map(([lon, lat]) => [lat, lon]) }
        >
            {deployments?.length > 0 && (
                <Tooltip sticky="true">
                    <LayoutTooltipContent deployments={ deployments } />
                </Tooltip>
            )}
            {deployments?.length === 0 && (
                <Tooltip sticky="true">
                    <div className="container">
                        No deployments for this impact
                    </div>
                </Tooltip>
            )}
        </Polyline>
    );
};

TmpLayoutPolygon.propTypes = {
    id: PropTypes.number.isRequired,
    geometry: PropTypes.object.isRequired,
    deployments: PropTypes.arrayOf(PropTypes.object).isRequired,
};
