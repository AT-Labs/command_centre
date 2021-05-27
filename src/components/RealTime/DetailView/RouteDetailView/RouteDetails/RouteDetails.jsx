import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getRouteDetail } from '../../../../../redux/selectors/realtime/detail';

const RouteDetails = ({ routeDetail }) => (
    <section className="route-detail-view__route-details col-12">
        <dl className="mb-3">
            <dt>
                Operator
            </dt>
            <dd className="text-muted font-weight-normal">
                { routeDetail.agency_name }
            </dd>
        </dl>
    </section>
);

RouteDetails.propTypes = {
    routeDetail: PropTypes.object.isRequired,
};

export default connect(
    state => ({
        routeDetail: getRouteDetail(state),
    }),
)(RouteDetails);
