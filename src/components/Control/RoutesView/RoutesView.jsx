import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';

import { clearActiveRoute, updateActiveRoute } from '../../../redux/actions/control/routes/routes';
import { getActiveRoute, getFilteredRoutes, getRoutesLoadingState } from '../../../redux/selectors/control/routes/routes';
import { getControlDetailRoutesViewType } from '../../../redux/selectors/control/routes/filters';
import ControlTable from '../Common/ControlTable/ControlTable';
import TripsView from './TripsView';
import { RouteType } from './Types';
import VIEW_TYPE from '../../../types/view-types';
import RouteVariantView from './RouteVariantView';
import { clearActiveTripInstanceId } from '../../../redux/actions/control/routes/trip-instances';
import { PAGE_SIZE } from '../../../utils/control/routes';

export class RoutesView extends React.Component {
    static propTypes = {
        page: PropTypes.number,
        routes: PropTypes.arrayOf(RouteType).isRequired,
        activeRoute: RouteType,
        isLoading: PropTypes.bool.isRequired,
        viewType: PropTypes.string.isRequired,
        updateActiveRoute: PropTypes.func.isRequired,
        clearActiveRoute: PropTypes.func.isRequired,
        clearActiveTripInstanceId: PropTypes.func.isRequired,
    };

    static defaultProps = {
        page: 1,
        activeRoute: null,
    };

    constructor(props) {
        super(props);

        this.ROUTES = [
            {
                label: 'route #',
                key: 'routeShortName',
                cols: 'col-2',
            },
            {
                label: 'description',
                key: 'description',
                cols: 'col-6',
            },
            {
                label: 'operator',
                key: 'agencyName',
                cols: 'col-3',
            },
        ];
    }

    handleRouteClick = (route) => {
        const { activeRoute } = this.props;
        if (activeRoute && activeRoute.routeShortName === route.routeShortName) {
            this.props.clearActiveRoute();
        } else {
            this.props.clearActiveTripInstanceId();
            this.props.updateActiveRoute(route.routeShortName);
        }
    };

    isRowActive = route => !!(this.props.activeRoute && this.props.activeRoute.routeShortName === route.routeShortName);

    renderRowBody = () => {
        if (this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS) {
            return <RouteVariantView />;
        }
        if (this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS) {
            return <TripsView />;
        }
        return null;
    };

    render() {
        const pageData = _.slice(this.props.routes, (this.props.page - 1) * PAGE_SIZE, this.props.page * PAGE_SIZE);
        const columns = pageData.length && pageData[0].routeType !== 2 ? this.ROUTES : _.filter(this.ROUTES, route => route.label !== 'description');

        return (
            <ControlTable
                columns={ columns }
                data={ pageData }
                getRowId={ route => route.routeShortName }
                isLoading={ this.props.isLoading }
                rowOnClick={ this.handleRouteClick }
                rowActive={ this.isRowActive }
                rowBody={ this.renderRowBody } />
        );
    }
}

export default connect(
    state => ({
        routes: getFilteredRoutes(state),
        activeRoute: getActiveRoute(state),
        isLoading: getRoutesLoadingState(state),
        viewType: getControlDetailRoutesViewType(state),
    }),
    { updateActiveRoute, clearActiveRoute, clearActiveTripInstanceId },
)(RoutesView);
