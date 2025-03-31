import React, { useState, useEffect, useMemo } from 'react';
import { LayerGroup, FeatureGroup } from 'react-leaflet';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { getAllFeatures } from '../../../../utils/transmitters/cars-api';
import { getLayersState } from '../../../../redux/selectors/realtime/layers';
import { calledRoadworksApi, updateSelectedCars } from '../../../../redux/actions/realtime/layers';
import { reportError } from '../../../../redux/actions/activity';
import { CarsPolygon } from './CarsPolygon';
import { TmpLayoutPolygon } from './TmpLayoutPolygon';
import { filterCarsByDate } from '../../../../utils/cars';

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
    const { showRoadworks, selectedRoadworksFilters, mustCallRoadworks, selectedCars, selectedTmpImpacts } = useSelector(getLayersState);
    const yesterdayTodayTomorrowFilter = selectedRoadworksFilters.find(filter => filter.id === 'Yesterday-Today-Tomorrow');

    const dispatch = useDispatch();

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
        if (selectedCars) {
            return result.filter(car => car.id === selectedCars.id);
        }

        if (yesterdayTodayTomorrowFilter?.selected) {
            return filterCarsByDate(result, true);
        }

        return result;
    }, [cars, selectedRoadworksFilters, selectedCars]);

    const onClick = (id) => {
        const result = cars.filter(item => item.id === id);
        if (result?.length > 0) {
            dispatch(updateSelectedCars({ selectedCars: result[0] }));
        }
    };

    return (
        <>
            <LayerGroup>
                {filteredCars.map(({ id, geometry, properties }) => (
                    <CarsPolygon key={ id } id={ id } geometry={ geometry } properties={ properties } onClick={ onClick } showTooltip={ !selectedCars } />
                ))}
            </LayerGroup>
            <FeatureGroup>
                {selectedTmpImpacts?.map(({ id, geometry, deployments }) => (
                    <TmpLayoutPolygon key={ id } id={ id } geometry={ geometry } deployments={ deployments } />
                ))}
            </FeatureGroup>
        </>
    );
}
