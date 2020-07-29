import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getStopDetail } from '../../../../redux/selectors/realtime/detail';
import Routes from './Routes';
import StopDetails from './StopDetails';
import PastVehicles from './VehicleSchedule/PastVehicles';
import UpcomingVehicles from './VehicleSchedule/UpcomingVehicles';

const StopDetailView = ({ stopDetail }) => {
    if (!stopDetail || !stopDetail.stop_code || !stopDetail.stop_id) return null;

    return (
        <section className="stop-detail-view">
            <StopDetails />
            <UpcomingVehicles stopId={ stopDetail.stop_id } />
            <PastVehicles stopId={ stopDetail.stop_id } />
            <Routes />
        </section>
    );
};

StopDetailView.propTypes = {
    stopDetail: PropTypes.object,
};

StopDetailView.defaultProps = {
    stopDetail: undefined,
};

export default connect(
    state => ({
        stopDetail: getStopDetail(state),
    }),
)(StopDetailView);
