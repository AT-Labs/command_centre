import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';
import { result, isEqual, find } from 'lodash-es';
import moment from 'moment';
import {
    getOperatorCode,
    getRouteShortName, getStops,
    getTripInfo,
    getVehicleInfo,
} from '../../../../redux/selectors/control/tripReplays/currentTrip';
import { formatUnixDatetime } from '../../../../utils/helpers';
import { occupancyStatusToMessage } from '../../../../types/vehicle-occupancy-status-types';

const getDatetime = (vehiclePosition) => {
    const { timestamp } = vehiclePosition;
    return formatUnixDatetime(parseInt(timestamp, 10));
};

const getKeyEventTitle = (vehiclePosition, tripInfo, stops) => {
    if (!tripInfo || !stops) return null;

    const timestamp = parseInt(vehiclePosition.timestamp, 10);
    if (isEqual(timestamp, moment(tripInfo.tripSignOn).unix())) {
        return 'Signed onto trip';
    }

    const matchedStop = find(
        stops,
        (stop) => {
            const isDeparture = isEqual(result(stop, 'departure.time'), vehiclePosition.timestamp);
            const isArrival = isEqual(result(stop, 'arrival.time'), vehiclePosition.timestamp);
            return isDeparture || isArrival;
        },
    );
    if (matchedStop) {
        if (isEqual(result(matchedStop, 'departure.time'), vehiclePosition.timestamp)) {
            return `Departed from stop ${matchedStop.stopCode} - ${matchedStop.stopName}`;
        }

        return `Arrived stop ${matchedStop.stopCode} - ${matchedStop.stopName}`;
    }
    return null;
};

function VehiclePositionTooltip({ position, routeShortName, tripInfo, vehicleInfo, operatorCode, stops }) {
    const title = getKeyEventTitle(position, tripInfo, stops);
    return (
        <Tooltip>
            { title && (
                <>
                    <b>{ title }</b>
                    <br />
                </>
            )}
            { `Time: ${getDatetime(position)}` }
            <br />
            { `Location: lat: ${position.position.latitude.toFixed(5)}` }
            { `, lon: ${position.position.longitude.toFixed(5)}` }
            <br />
            { `Status: ${position.nis ? <b className="text--nis">NIS</b> : 'In Service'}` }
            <br />
            { routeShortName && (
                <>
                    { `Route: ${routeShortName}` }
                    <br />
                </>
            ) }
            { tripInfo && (
                <>
                    { `Trip: ${tripInfo.tripId}` }
                    <br />
                </>
            ) }
            { operatorCode && (
                <>
                    { `Operator code: ${operatorCode}` }
                    <br />
                </>
            ) }
            { vehicleInfo && (
                <>
                    { `Fleet number: ${vehicleInfo.vehicleId}` }
                    <br />
                    { `Vehicle label: ${vehicleInfo.vehicleLabel}` }
                </>
            )}
            {!position.nis && position.occupancyStatus && (
                <>
                    <br />
                    { `Occupancy: ${occupancyStatusToMessage(position.occupancyStatus)}` }
                </>
            )}
        </Tooltip>
    );
}

VehiclePositionTooltip.propTypes = {
    position: PropTypes.object.isRequired,
    vehicleInfo: PropTypes.object.isRequired,
    tripInfo: PropTypes.object.isRequired,
    routeShortName: PropTypes.string,
    stops: PropTypes.array.isRequired,
    operatorCode: PropTypes.string,
};

VehiclePositionTooltip.defaultProps = {
    operatorCode: '',
    routeShortName: '',
};

export default connect(state => ({
    vehicleInfo: getVehicleInfo(state),
    tripInfo: getTripInfo(state),
    routeShortName: getRouteShortName(state),
    stops: getStops(state),
    operatorCode: getOperatorCode(state),
}))(props => (
    <VehiclePositionTooltip { ...props } />
));
