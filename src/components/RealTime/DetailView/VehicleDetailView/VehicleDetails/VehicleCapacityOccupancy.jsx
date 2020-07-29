import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import {
    getVehicleCapacity,
    getVehicleOccupancyStatus,
} from '../../../../../redux/selectors/realtime/detail';

const VehicleCapacityOccupancy = ({ vehicleCapacity, occupancyStatus }) => {
    const seating = _.result(vehicleCapacity, 'seating');
    const total = _.result(vehicleCapacity, 'total');
    return (
        <Fragment>
            {total ? (
                <Fragment>
                    <dt className="font-size-sm">Total Capacity:</dt>
                    <dd>{ total }</dd>
                </Fragment>
            ) : null}
            {seating ? (
                <Fragment>
                    <dt className="font-size-sm">Seating Capacity:</dt>
                    <dd>{ seating }</dd>
                </Fragment>
            ) : null}
            {occupancyStatus && (
                <Fragment>
                    <dt className="font-size-sm">Occupancy status:</dt>
                    <dd>{ _.capitalize(_.replace(occupancyStatus, /[_-]/g, ' ')) }</dd>
                </Fragment>
            )}
        </Fragment>
    );
};

VehicleCapacityOccupancy.propTypes = {
    vehicleCapacity: PropTypes.object,
    occupancyStatus: PropTypes.string,
};

VehicleCapacityOccupancy.defaultProps = {
    vehicleCapacity: null,
    occupancyStatus: null,
};

export default connect(
    state => ({
        vehicleCapacity: getVehicleCapacity(state),
        occupancyStatus: getVehicleOccupancyStatus(state),
    }),
)(VehicleCapacityOccupancy);
