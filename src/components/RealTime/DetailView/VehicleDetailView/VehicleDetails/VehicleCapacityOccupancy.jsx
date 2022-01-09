import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import { getVehicleCapacity } from '../../../../../redux/selectors/realtime/detail';
import { getCurrentVehicleOccupancyStatus } from '../../../../../redux/selectors/realtime/vehicles';
import OccupancyStatus from '../../OccupancyStatus';

const VehicleCapacityOccupancy = ({ vehicleCapacity, occupancyStatus }) => {
    const seating = _.result(vehicleCapacity, 'seating');
    const total = _.result(vehicleCapacity, 'total');
    return (
        <>
            {total ? (
                <>
                    <dt className="font-size-md">Total Capacity:</dt>
                    <dd>{ total }</dd>
                </>
            ) : null}
            {seating ? (
                <>
                    <dt className="font-size-md">Seating Capacity:</dt>
                    <dd>{ seating }</dd>
                </>
            ) : null}
            {occupancyStatus && (
                <>
                    <dt className="font-size-md">Occupancy status:</dt>
                    <dd>
                        <OccupancyStatus occupancyStatus={ occupancyStatus } />
                    </dd>
                </>
            )}
        </>
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
        occupancyStatus: getCurrentVehicleOccupancyStatus(state),
    }),
)(VehicleCapacityOccupancy);
