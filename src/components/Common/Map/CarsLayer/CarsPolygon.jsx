import React, { useState } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import PropTypes from 'prop-types';
import { CarsTooltipContent } from './CarsTooltipContent';

export const HOVER_COLOR = '#fff';
export const DEFAULT_COLOR = '#0066cc';

export const CarsPolygon = (props) => {
    const { id, geometry, properties } = props;
    const [hover, setHover] = useState(false);

    return (
        <Polygon
            key={ id }
            color={ hover ? HOVER_COLOR : DEFAULT_COLOR }
            fillColor={ DEFAULT_COLOR }
            positions={ geometry.coordinates }
            onMouseOver={ () => setHover(true) }
            onMouseOut={ () => setHover(false) }>
            <Tooltip className="cars-tooltip-container" sticky="true">
                <CarsTooltipContent properties={ properties } />
            </Tooltip>
        </Polygon>
    );
};

CarsPolygon.propTypes = {
    id: PropTypes.number.isRequired,
    properties: PropTypes.object.isRequired,
    geometry: PropTypes.object.isRequired,
};
