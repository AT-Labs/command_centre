import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getStopDetail } from '../../../../redux/selectors/realtime/detail';

const StopDetails = ({ stopDetail }) => (
    <section className="stop-detail-view__stop-details col-12 pt-3">
        <h2 className="font-weight-normal">
            { `Stop ${stopDetail.stop_code}` }
        </h2>

        <dl className="my-3">
            <dt>
                LOCATION
            </dt>
            <dd className="text-muted font-weight-normal mb-3">
                { stopDetail.stop_name }
            </dd>
            <dt>
                STOP ID
            </dt>
            <dd className="text-muted font-weight-normal mb-3">
                { stopDetail.stop_id }
            </dd>
        </dl>
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
