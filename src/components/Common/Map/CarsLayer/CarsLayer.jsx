import React, { useState, useEffect } from 'react';
import { Polygon, Popup, Tooltip, LayerGroup } from 'react-leaflet';
import PropTypes from 'prop-types';
import { getAllFeatures } from '../../../../utils/transmitters/cars-api';
import { CarsPopupContent } from './CarsPopupContent';

export const CARS_ZOOM_LEVEL = 13;

export function CarsLayer({ mapZoomLevel }) {
    return mapZoomLevel >= CARS_ZOOM_LEVEL ? <CarsLayerInView mapZoomLevel={ CARS_ZOOM_LEVEL } /> : <></>;
}

CarsLayer.propTypes = {
    mapZoomLevel: PropTypes.number.isRequired,
};

export function CarsLayerInView() {
    const [cars, setCars] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const features = await getAllFeatures() || [];
            setCars(features);
        };
        fetchData();
    }, []);

    return (
        <LayerGroup>
            {cars.map(({ id, geometry, properties }) => (
                <Polygon
                    key={ id }
                    positions={ geometry.coordinates }
                    pathOptions={ { color: 'red', fillColor: 'yellow', fillOpacity: 0.4 } }
                >
                    {' '}
                    <Tooltip sticky>
                        Worksite Name:
                        {properties.WorksiteName}
                    </Tooltip>
                    <Popup>
                        <CarsPopupContent properties={ properties } />
                    </Popup>
                </Polygon>
            ))}
        </LayerGroup>
    );
}
