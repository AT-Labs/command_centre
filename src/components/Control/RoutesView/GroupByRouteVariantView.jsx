import React from 'react';
import PropTypes from 'prop-types';
import { filter, slice, get } from 'lodash-es';
import { connect } from 'react-redux';
import { RouteType, RouteVariantType } from './Types';
import ControlTable from '../Common/ControlTable/ControlTable';
import { getActiveRoute } from '../../../redux/selectors/control/routes/routes';
import { getControlDetailRoutesViewType } from '../../../redux/selectors/control/routes/filters';
import { clearActiveRouteVariant, updateActiveRouteVariant } from '../../../redux/actions/control/routes/routeVariants';
import {
    getActiveRouteVariant,
    getFilteredRouteVariants,
    getRouteVariantsLoadingState,
} from '../../../redux/selectors/control/routes/routeVariants';
import VIEW_TYPE from '../../../types/view-types';
import { PAGE_SIZE } from '../../../utils/control/routes';
import { clearActiveTripInstanceId } from '../../../redux/actions/control/routes/trip-instances';
import TripsDataGrid from './TripsDataGrid';
import './GroupByRouteVariantView.scss';

export const GroupByRouteVariantView = (props) => {
    const isRouteVariantTripView = () => props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTE_VARIANTS_TRIPS;

    const isVariantRowActive = variant => !!(props.activeRouteVariant && (props.activeRouteVariant.routeVariantId === variant.routeVariantId));

    const handleRouteVariantClick = (variant) => {
        if (isVariantRowActive(variant)) {
            props.clearActiveRouteVariant();
        } else {
            props.clearActiveTripInstanceId();
            props.updateActiveRouteVariant(variant.routeVariantId);
        }
    };

    const renderRowBody = () => (
        <div className="route-variant-row-body">
            <TripsDataGrid />
        </div>
    );

    const routeVariants = isRouteVariantTripView()
        ? slice(props.routeVariants, (props.page - 1) * PAGE_SIZE, props.page * PAGE_SIZE)
        : filter(props.routeVariants, ['routeShortName', get(props.activeRoute, 'routeShortName')]);

    const ROUTE_VARIANT = [
        {
            label: (isRouteVariantTripView() ? 'route #' : ''),
            key: 'routeVariantId',
            cols: 'col-2',
        },
        {
            label: (isRouteVariantTripView() ? 'description' : ''),
            key: 'routeLongName',
            cols: 'col-6',
            getContent: row => `${row.routeShortName} ${row.routeLongName}`,
        },
        {
            label: (isRouteVariantTripView() ? 'operator' : ''),
            key: 'agencyName',
            cols: 'col-3',
        },
    ];

    return (
        <ControlTable
            columns={ ROUTE_VARIANT }
            data={ routeVariants }
            getRowId={ variant => variant.routeVariantId }
            isLoading={ props.isLoading }
            rowOnClick={ handleRouteVariantClick }
            rowActive={ isVariantRowActive }
            rowBody={ renderRowBody }
            level={ isRouteVariantTripView() ? 1 : 2 }
        />
    );
};

GroupByRouteVariantView.propTypes = {
    page: PropTypes.number,
    routeVariants: PropTypes.arrayOf(RouteVariantType).isRequired,
    activeRoute: RouteType,
    activeRouteVariant: RouteVariantType,
    isLoading: PropTypes.bool.isRequired,
    viewType: PropTypes.string.isRequired,
    updateActiveRouteVariant: PropTypes.func.isRequired,
    clearActiveRouteVariant: PropTypes.func.isRequired,
    clearActiveTripInstanceId: PropTypes.func.isRequired,
};

GroupByRouteVariantView.defaultProps = {
    page: 1,
    activeRoute: null,
    activeRouteVariant: null,
};

export default connect(
    state => ({
        routeVariants: getFilteredRouteVariants(state),
        activeRoute: getActiveRoute(state),
        activeRouteVariant: getActiveRouteVariant(state),
        isLoading: getRouteVariantsLoadingState(state),
        viewType: getControlDetailRoutesViewType(state),
    }),
    { updateActiveRouteVariant, clearActiveRouteVariant, clearActiveTripInstanceId },
)(GroupByRouteVariantView);
