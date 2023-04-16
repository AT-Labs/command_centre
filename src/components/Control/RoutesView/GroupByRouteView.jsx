import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { slice, filter } from 'lodash-es';
import ControlTable from '../Common/ControlTable/ControlTable';
import { PAGE_SIZE } from '../../../utils/control/routes';

import { RouteType } from './Types';
import VIEW_TYPE from '../../../types/view-types';
import { clearActiveRoute, updateActiveRoute } from '../../../redux/actions/control/routes/routes';
import { getActiveRoute, getFilteredRoutes, getRoutesLoadingState } from '../../../redux/selectors/control/routes/routes';
import { getControlDetailRoutesViewType } from '../../../redux/selectors/control/routes/filters';
import { clearActiveTripInstanceId } from '../../../redux/actions/control/routes/trip-instances';
import GroupByRouteVariantView from './GroupByRouteVariantView';
import TripsDataGrid from './TripsDataGrid';
import './GroupByRouteView.scss';

const ROUTES = [
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

export const GroupByRouteView = (props) => {
    const handleRouteClick = (route) => {
        const { activeRoute } = props;
        if (activeRoute && activeRoute.routeShortName === route.routeShortName) {
            props.clearActiveRoute();
        } else {
            props.clearActiveTripInstanceId();
            props.updateActiveRoute(route.routeShortName);
        }
    };

    const isRowActive = route => !!(props.activeRoute && props.activeRoute.routeShortName === route.routeShortName);

    const renderRowBody = () => {
        if (props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS) {
            return <GroupByRouteVariantView />;
        }
        return (
            <div className="route-row-body">
                <TripsDataGrid />
            </div>
        );
    };

    const pageData = slice(props.routes, (props.page - 1) * PAGE_SIZE, props.page * PAGE_SIZE);
    const columns = pageData.length && pageData[0].routeType !== 2 ? ROUTES : filter(ROUTES, route => route.label !== 'description');

    return (
        <ControlTable
            columns={ columns }
            data={ pageData }
            getRowId={ route => route.routeShortName }
            isLoading={ props.isLoading }
            rowOnClick={ handleRouteClick }
            rowActive={ isRowActive }
            rowBody={ renderRowBody } />
    );
};

GroupByRouteView.propTypes = {
    page: PropTypes.number,
    routes: PropTypes.arrayOf(RouteType).isRequired,
    activeRoute: RouteType,
    isLoading: PropTypes.bool.isRequired,
    viewType: PropTypes.string.isRequired,
    updateActiveRoute: PropTypes.func.isRequired,
    clearActiveRoute: PropTypes.func.isRequired,
    clearActiveTripInstanceId: PropTypes.func.isRequired,
};

GroupByRouteView.defaultProps = {
    page: 1,
    activeRoute: null,
};

export default connect(
    state => ({
        routes: getFilteredRoutes(state),
        activeRoute: getActiveRoute(state),
        isLoading: getRoutesLoadingState(state),
        viewType: getControlDetailRoutesViewType(state),
    }),
    { updateActiveRoute, clearActiveRoute, clearActiveTripInstanceId },
)(GroupByRouteView);
