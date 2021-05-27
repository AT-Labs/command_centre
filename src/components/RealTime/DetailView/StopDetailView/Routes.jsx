import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getRouteIdsByStop } from '../../../../redux/selectors/realtime/detail';
import { getAllRoutes } from '../../../../redux/selectors/static/routes';
import DetailLoader from '../../../Common/Loader/DetailLoader';

export class Routes extends React.Component {
    getRouteNames = (allRoutes, routeIds) => {
        const routeNames = routeIds
            .map((routeId) => {
                const route = allRoutes[routeId];
                if (!route) {
                    return null;
                }
                return route.route_short_name;
            }).filter(route => !!route);
        return _.uniq(_.sortBy(routeNames));
    };

    render() {
        const { allRoutes, routeIds } = this.props;
        const routeNames = this.getRouteNames(allRoutes, routeIds);
        return (
            <section className="stop-detail-view__routes col-12 py-3 row">
                <div className="col-4 font-weight-bold">
                    Routes:
                </div>
                {!routeIds.length && <DetailLoader />}
                <div className="col-8 text-muted font-weight-normal text-right pr-0">
                    { routeIds.length > 0 && routeNames.length > 0 && routeNames.join(', ') }
                </div>
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
