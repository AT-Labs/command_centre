import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getVehicleId, getVehicleTripId } from '../../../../redux/selectors/realtime/detail';
import TripProgress from './TripProgress/TripProgress';
import VehicleDetails from './VehicleDetails/VehicleDetails';

const VehicleDetailView = ({ vehicleId, vehicleTripId }) => (vehicleId && (
    <section className="vehicle-detail-view">
        <VehicleDetails />
        {vehicleTripId && <TripProgress vehicleId={ vehicleId } />}
    </section>
)) || null;

VehicleDetailView.propTypes = {
    vehicleId: PropTypes.string,
    vehicleTripId: PropTypes.string,
};

VehicleDetailView.defaultProps = {
    vehicleId: null,
    vehicleTripId: null,
};

export default connect(
    state => ({
        vehicleId: getVehicleId(state),
        vehicleTripId: getVehicleTripId(state),
    }),
)(VehicleDetailView);
