import React, { useState, useEffect, useMemo } from 'react';
import { LayerGroup } from 'react-leaflet';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { getAllFeatures } from '../../../../utils/transmitters/cars-api';
import { getLayersState } from '../../../../redux/selectors/realtime/layers';
import { calledRoadworksApi } from '../../../../redux/actions/realtime/layers';
import { reportError } from '../../../../redux/actions/activity';
import { CarsPolygon } from './CarsPolygon';

export const CARS_ZOOM_LEVEL = 13;

export function CarsLayer({ mapZoomLevel }) {
    const { showRoadworks } = useSelector(getLayersState);
    return showRoadworks && mapZoomLevel >= CARS_ZOOM_LEVEL ? <CarsLayerInView mapZoomLevel={ CARS_ZOOM_LEVEL } /> : <></>;
}

CarsLayer.propTypes = {
    mapZoomLevel: PropTypes.number.isRequired,
};

export function CarsLayerInView() {
    const [cars, setCars] = useState([]);
    const dispatch = useDispatch();
    const { showRoadworks, selectedRoadworksFilters, mustCallRoadworks } = useSelector(getLayersState);
    useEffect(() => {
        const fetchData = async () => {
            try {
                // the mustCallRoadworks is used to force a call (usually after refresh or on first call)
                // By forcing, I mean not retrieve from a TTL cache
                const features = await getAllFeatures(mustCallRoadworks) || [];
                setCars(features);
                dispatch(calledRoadworksApi()); // This line disable the forcing of the API call
            } catch (error) {
                dispatch(reportError({ error: { roadworksFetchError: error } }, true));
                // eslint-disable-next-line no-console
                console.error(error);
            }
        };
        if (showRoadworks) fetchData();
    }, [showRoadworks, mustCallRoadworks]);

    const filteredCars = useMemo(() => {
        if (cars == null) return [];

        const includedTypes = selectedRoadworksFilters
            .filter(type => type.selected)
            .map(filter => filter.id);
        const result = cars.filter(car => includedTypes.includes(car.properties.WorksiteType));

        return result;
    }, [cars, selectedRoadworksFilters]);

    return (
        <LayerGroup>
            {filteredCars.map(({ id, geometry, properties }) => (
                <CarsPolygon key={ id } id={ id } geometry={ geometry } properties={ properties } />
            ))}
        </LayerGroup>
    );
}
