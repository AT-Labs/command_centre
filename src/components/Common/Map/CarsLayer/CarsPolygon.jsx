import React, { useState } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import PropTypes from 'prop-types';
import { CarsTooltipContent } from './CarsTooltipContent';

export const HOVER_COLOR = '#fff';
export const DEFAULT_COLOR = '#0066cc';

export const CarsPolygon = ({ id, geometry, properties, showTooltip, onClick }) => {
    const [hover, setHover] = useState(false);

    return (
        <Polygon
            key={ id }
            onClick={ () => onClick(id) }
            color={ hover ? HOVER_COLOR : DEFAULT_COLOR }
            fillColor={ DEFAULT_COLOR }
            positions={ geometry.coordinates }
            onMouseOver={ () => setHover(true) }
            onMouseOut={ () => setHover(false) }
        >
            {showTooltip && (
                <Tooltip className="cars-tooltip-container" sticky="true" data-testid="tooltip">
                    <CarsTooltipContent properties={ properties } />
                </Tooltip>
            )}
        </Polygon>
    );
};

CarsPolygon.propTypes = {
    id: PropTypes.number.isRequired,
    properties: PropTypes.object.isRequired,
    geometry: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    showTooltip: PropTypes.bool.isRequired,
};
