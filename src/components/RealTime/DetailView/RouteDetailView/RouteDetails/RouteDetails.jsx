import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getRouteDetail } from '../../../../../redux/selectors/realtime/detail';

const RouteDetails = ({ routeDetail }) => (
    <section className="route-detail-view__route-details col-12 py-3">
        <h2 className="font-weight-normal">
            Route { routeDetail.route_short_name }
        </h2>
        <dl className="my-3">
            <dt>
                OPERATOR
            </dt>
            <dd className="text-muted font-weight-normal mb-3">
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
