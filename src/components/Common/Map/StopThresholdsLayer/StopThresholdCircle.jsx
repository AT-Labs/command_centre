import React from 'react';
import PropTypes from 'prop-types';
import { LayerGroup, Circle } from 'react-leaflet';
import { BUS_TYPE_ID, FERRY_TYPE_ID } from '../../../../types/vehicle-types';

const StopThresholdCircle = ({ stops, routeType, hideExitCircle }) => {
    let thresholdCircles = [];

    // Global outer circle threshold value from Schedule Adherence
    const outerCircleThreshold = 600;

    if (stops.length && routeType === BUS_TYPE_ID) {
        const firstStop = stops[0];
        const { stopLat, stopLon } = firstStop;
        const innerCircleBusThreshold = firstStop.innerRadius || firstStop.entryDistance || 30;

        const entryCircle = (
            <Circle
                key={ `${firstStop.stopId}-entry` }
                center={ [stopLat, stopLon] }
                radius={ innerCircleBusThreshold }
                color="gold"
                fillOpacity={ 0.6 }
            />
        );

        const exitCircle = (
            <Circle
                key={ `${firstStop.stopId}-exit` }
                center={ [stopLat, stopLon] }
                radius={ outerCircleThreshold }
                color="cyan"
                fillOpacity={ 0.4 }
                stroke={ false }
            />
        );

        thresholdCircles.push(entryCircle);
        if (!hideExitCircle) {
            thresholdCircles.push(exitCircle);
        }
    } else if (stops.length && routeType === FERRY_TYPE_ID) {
        thresholdCircles = stops.map((stop) => {
            const { stopId, stopLat, stopLon, entryDistance, exitDistance } = stop;
            const innerCircleFerryThreshold = entryDistance || 30;
            const exitCircleFerryThreshold = exitDistance || 30;

            const entryCircle = (
                <Circle
                    key={ `${stopId}-entry` }
                    center={ [stopLat, stopLon] }
                    radius={ innerCircleFerryThreshold }
                    color="gold"
                    fillOpacity={ 0.6 }
                />
            );

            const exitCircle = (
                <Circle
                    key={ `${stopId}-exit` }
                    center={ [stopLat, stopLon] }
                    radius={ exitCircleFerryThreshold }
                    color="darksalmon"
                    fillOpacity={ 0.5 }
                    stroke={ false }
                />
            );

            return [entryCircle, exitCircle];
        });
    }

    return (
        <LayerGroup>{thresholdCircles}</LayerGroup>
    );
};

StopThresholdCircle.propTypes = {
    stops: PropTypes.arrayOf(
        PropTypes.shape({
            stopId: PropTypes.string.isRequired,
            stopLat: PropTypes.number.isRequired,
            stopLon: PropTypes.number.isRequired,
            entryDistance: PropTypes.number.isRequired,
            exitDistance: PropTypes.number.isRequired,
            innerRadius: PropTypes.number,
        }),
    ).isRequired,
    routeType: PropTypes.number,
    hideExitCircle: PropTypes.bool,
};

StopThresholdCircle.defaultProps = {
    routeType: 0,
    hideExitCircle: false,
};

export default StopThresholdCircle;
