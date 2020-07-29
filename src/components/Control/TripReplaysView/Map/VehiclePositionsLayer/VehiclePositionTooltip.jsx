import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';
import _ from 'lodash-es';
import moment from 'moment';
import {
    getOperatorCode,
    getRouteInfo, getStops,
    getTripInfo,
    getVehicleInfo,
} from '../../../../../redux/selectors/control/tripReplays/currentTrip';
import { formatUnixDatetime } from '../../../../../utils/helpers';

const getDatetime = (vehiclePosition) => {
    const { timestamp } = vehiclePosition;
    return formatUnixDatetime(parseInt(timestamp, 10));
};

const getKeyEventTitle = (vehiclePosition, tripInfo, stops) => {
    if (!tripInfo || !stops) return null;

    const timestamp = parseInt(vehiclePosition.timestamp, 10);
    if (_.isEqual(timestamp, moment(tripInfo.tripSignOn).unix())) {
        return 'Signed onto trip';
    }

    const matchedStop = _.find(
        stops,
        (stop) => {
            const isDeparture = _.isEqual(_.result(stop, 'departure.time'), vehiclePosition.timestamp);
            const isArrival = _.isEqual(_.result(stop, 'arrival.time'), vehiclePosition.timestamp);
            return isDeparture || isArrival;
        },
    );
    if (matchedStop) {
        if (_.isEqual(_.result(matchedStop, 'departure.time'), vehiclePosition.timestamp)) {
            return `Departed from stop ${matchedStop.stopCode} - ${matchedStop.stopName}`;
        }

        return `Arrived stop ${matchedStop.stopCode} - ${matchedStop.stopName}`;
    }
    return null;
};

function VehiclePositionTooltip({ position, routeInfo, tripInfo, vehicleInfo, operatorCode, stops }) {
    const title = getKeyEventTitle(position, tripInfo, stops);
    return (
        <Tooltip>
            { title && <React.Fragment><b>{ title }</b><br /></React.Fragment>}
            Time: { getDatetime(position) }<br />
            Location: lat: { position.position.latitude.toFixed(5) }, lon: { position.position.longitude.toFixed(5)}<br />
            Status: { position.nis ? <b className="text--nis">NIS</b> : 'In Service' }<br />
            { routeInfo && <React.Fragment>Route: { routeInfo.shortName }<br /></React.Fragment> }
            { tripInfo && <React.Fragment>Trip: { tripInfo.tripId }<br /></React.Fragment> }
            { operatorCode && <React.Fragment>Operator code: { operatorCode }<br /></React.Fragment> }
            { vehicleInfo && (
                <React.Fragment>
                    Fleet number: { vehicleInfo.vehicleId }<br />
                    Vehicle label: { vehicleInfo.vehicleLabel }
                </React.Fragment>
            )}
        </Tooltip>
    );
}

VehiclePositionTooltip.propTypes = {
    position: PropTypes.object.isRequired,
    vehicleInfo: PropTypes.object.isRequired,
    tripInfo: PropTypes.object.isRequired,
    routeInfo: PropTypes.object.isRequired,
    stops: PropTypes.array.isRequired,
    operatorCode: PropTypes.string,
};

VehiclePositionTooltip.defaultProps = {
    operatorCode: '',
};

export default connect(state => ({
    vehicleInfo: getVehicleInfo(state),
    tripInfo: getTripInfo(state),
    routeInfo: getRouteInfo(state),
    stops: getStops(state),
    operatorCode: getOperatorCode(state),
}))(props => (
    <VehiclePositionTooltip { ...props } />
));
