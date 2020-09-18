import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getStopDetail } from '../../../../redux/selectors/realtime/detail';

const StopDetails = ({ stopDetail }) => (
    <section className="stop-detail-view__stop-details col-12 pt-3">
        <h2>
            { `Stop ${stopDetail.stop_id}` }<br />
            { stopDetail.stop_name }
        </h2>
    </section>
);

StopDetails.propTypes = {
    stopDetail: PropTypes.object.isRequired,
};

export default connect(
    state => ({
        stopDetail: getStopDetail(state),
    }),
)(StopDetails);
