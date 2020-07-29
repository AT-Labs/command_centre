import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getRouteIdsByStop } from '../../../../redux/selectors/realtime/detail';
import { getAllRoutes } from '../../../../redux/selectors/static/routes';
import DetailLoader from '../../../Common/Loader/DetailLoader';

export class Routes extends React.Component {
    concatenateRouteName = route => [route.route_short_name, route.route_long_name].filter(Boolean).join(': ');

    getRoutes = (allRoutes, routeIds) => {
        const routes = routeIds
            .map((routeId) => {
                const route = allRoutes[routeId];
                if (!route) {
                    return null;
                }
                return {
                    routeId,
                    routeName: this.concatenateRouteName(route),
                };
            })
            .filter(route => !!route);
        return _.uniqBy(_.sortBy(routes, 'routeName'), 'routeName');
    };

    render() {
        const { allRoutes, routeIds } = this.props;
        const routes = this.getRoutes(allRoutes, routeIds);
        return (
            <section className="stop-detail-view__routes col-12 py-3">
                <h4 className="text-uppercase mb-0">
                    Routes
                </h4>
                {!routeIds.length && <DetailLoader />}
                {routeIds.length > 0 && routes.length > 0
                    && routes.map(route => <div className="text-muted font-weight-normal" key={ route.routeId }>{route.routeName}</div>)
                }
            </section>
        );
    }
}

Routes.propTypes = {
    allRoutes: PropTypes.object.isRequired,
    routeIds: PropTypes.array.isRequired,
};

export default connect(
    state => ({
        allRoutes: getAllRoutes(state),
        routeIds: getRouteIdsByStop(state),
    }),
)(Routes);
