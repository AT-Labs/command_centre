import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { LeafletConsumer } from 'react-leaflet';
import * as L from 'leaflet';
import StopThreshold from './StopThreshold';
import 'leaflet-geometryutil';

const findStopIndexInRoute = (stop, route) => _.findIndex(route, point => point[0] === stop.stopLat && point[1] === stop.stopLon);

/**
 * This function is used to get stop thresholds
 * Normally a stop is a key point of the route polyline path, which means it's in the route array. In this case, we
 * trace backward entryDistance and trace forward for exitDistance to contain all the points required to draw the threshold polyline
 * For some stops, the stop's coordinates is not in the array, so we need to find out the correct index in route array to insert
 * the stop's coordinates, and then trace forward and backward the threshold's points.
 *
 * @param leafletMap
 * @param stops
 * @param route
 * @returns {Array}
 */
const getThresholds = (leafletMap, stops, route) => _.map(stops, (stop) => {
    if (!_.has(stop, 'stopLat')) return null;
    let stopIndex = findStopIndexInRoute(stop, route);

    // In case the stop's point is not a key point on the route polyline
    if (stopIndex === -1) {
        let shortestDistance = Infinity;
        let shortestDistanceIndex = 0;

        // Loop to find the closet segment of the polyline to the stop,
        // between the start point and end point is where we should insert the stop's coordinates
        for (let i = 0; i < route.length - 1; i++) {
            const distanceToLine = L.GeometryUtil.distanceSegment(
                leafletMap,
                L.latLng(stop.stopLat, stop.stopLon),
                L.latLng(route[i]),
                L.latLng(route[i + 1]),
            );

            const closestPoint = L.GeometryUtil.closestOnSegment(
                leafletMap,
                L.latLng(stop.stopLat, stop.stopLon),
                L.latLng(route[i]),
                L.latLng(route[i + 1]),
            );

            if (distanceToLine < shortestDistance && !closestPoint.equals(L.latLng(route[i])) && !closestPoint.equals(L.latLng(route[i + 1]))) {
                shortestDistance = distanceToLine;
                shortestDistanceIndex = i;
                if (distanceToLine === 0) break;
            }
        }

        stopIndex = shortestDistanceIndex + 1;
        route.splice(stopIndex, 0, [stop.stopLat, stop.stopLon]);
    }

    const threshold = [L.latLng(route[stopIndex])];

    // Find entry point if the stop not first stop
    if (stopIndex !== 0) {
        let distance = stop.entryDistance;
        let index = stopIndex;

        // when there is next point on the route
        while (index - 1 >= 0) {
            if (distance === 0) break;
            const prevIndex = index - 1;

            // calc the distance between current point and previous point
            const distanceToPrevPoint = L.latLng(route[index]).distanceTo(L.latLng(route[prevIndex]));
            if (distanceToPrevPoint <= distance) {
                // if the distance to previous point is less than distance, add the point, distance minus the result, and go to next loop
                threshold.unshift(L.latLng(route[prevIndex]));
                distance -= distanceToPrevPoint;
                index = prevIndex;
            } else {
                // if the distance to previous point is greater than distance, means the entry point is between
                // the current point and previous point, than we can calculate the coordinates of the entry point
                const bearing = L.GeometryUtil.bearing(L.latLng(route[index]), L.latLng(route[prevIndex]));
                const dest = L.GeometryUtil.destination(L.latLng(route[index]), bearing, distance);
                threshold.unshift(dest);
                break;
            }
        }
    }

    // same logic is used for finding the exit point as finding the entry point, please refer to the comments above
    if (stopIndex !== route.length - 1) {
        // find exit point
        let distance = stop.exitDistance;
        let index = stopIndex;
        while (index + 1 < route.length) {
            if (distance === 0) break;
            const nextIndex = index + 1;
            const distanceToNextPoint = L.latLng(route[index]).distanceTo(L.latLng(route[nextIndex]));
            if (distanceToNextPoint <= distance) {
                threshold.push(L.latLng(route[nextIndex]));
                distance -= distanceToNextPoint;
                index = nextIndex;
            } else {
                const bearing = L.GeometryUtil.bearing(L.latLng(route[index]), L.latLng(route[nextIndex]));
                const dest = L.GeometryUtil.destination(L.latLng(route[index]), bearing, distance);
                threshold.push(dest);
                break;
            }
        }
    }

    return threshold;
});

function StopThresholdsLayer({ leafletMap, stops, route }) {
    return route.length && (
        <>
            {
                _.map(getThresholds(leafletMap, stops, route), (threshold, index) => (threshold ? (<StopThreshold key={ `threshold_${index}` } threshold={ threshold } />) : null))
            }
        </>
    );
}

StopThresholdsLayer.propTypes = {
    leafletMap: PropTypes.object.isRequired,
    stops: PropTypes.array.isRequired,
    route: PropTypes.array.isRequired,
};

export default (props => (
    <LeafletConsumer>
        {({ map }) => <StopThresholdsLayer { ...props } leafletMap={ map } />}
    </LeafletConsumer>
));
