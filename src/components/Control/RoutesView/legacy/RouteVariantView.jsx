import React from 'react';
import PropTypes from 'prop-types';
import { filter, slice, get } from 'lodash-es';
import { connect } from 'react-redux';
import { RouteType, RouteVariantType } from '../Types';
import ControlTable from '../../Common/ControlTable/ControlTable';
import { getActiveRoute } from '../../../../redux/selectors/control/routes/routes';
import { getControlDetailRoutesViewType } from '../../../../redux/selectors/control/routes/filters';
import { clearActiveRouteVariant, updateActiveRouteVariant } from '../../../../redux/actions/control/routes/routeVariants';
import {
    getActiveRouteVariant,
    getFilteredRouteVariants,
    getRouteVariantsLoadingState,
} from '../../../../redux/selectors/control/routes/routeVariants';
import TripsView from './TripsView';
import VIEW_TYPE from '../../../../types/view-types';
import { PAGE_SIZE } from '../../../../utils/control/routes';
import { clearActiveTripInstanceId } from '../../../../redux/actions/control/routes/trip-instances';

export class RouteVariantView extends React.Component {
    static propTypes = {
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

    static defaultProps = {
        page: 1,
        activeRoute: null,
        activeRouteVariant: null,
    };

    constructor(props) {
        super(props);

        this.ROUTE_VARIANT = [
            {
                label: (this.isRouteVariantTripView() ? 'route #' : ''),
                key: 'routeVariantId',
                cols: 'col-2',
            },
            {
                label: (this.isRouteVariantTripView() ? 'description' : ''),
                key: 'routeLongName',
                cols: 'col-6',
                getContent: row => `${row.routeShortName} ${row.routeLongName}`,
            },
            {
                label: (this.isRouteVariantTripView() ? 'operator' : ''),
                key: 'agencyName',
                cols: 'col-3',
            },
        ];
    }

    isRouteVariantTripView = () => this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTE_VARIANTS_TRIPS;

    isVariantRowActive = variant => !!(this.props.activeRouteVariant && (this.props.activeRouteVariant.routeVariantId === variant.routeVariantId));

    handleRouteVariantClick = (variant) => {
        if (this.isVariantRowActive(variant)) {
            this.props.clearActiveRouteVariant();
        } else {
            this.props.clearActiveTripInstanceId();
            this.props.updateActiveRouteVariant(variant.routeVariantId);
        }
    };

    renderRowBody = () => <TripsView />;

    render() {
        const routeVariants = this.isRouteVariantTripView()
            ? slice(this.props.routeVariants, (this.props.page - 1) * PAGE_SIZE, this.props.page * PAGE_SIZE)
            : filter(this.props.routeVariants, ['routeShortName', get(this.props.activeRoute, 'routeShortName')]);
        return (
            <ControlTable
                columns={ this.ROUTE_VARIANT }
                data={ routeVariants }
                getRowId={ variant => variant.routeVariantId }
                isLoading={ this.props.isLoading }
                rowOnClick={ this.handleRouteVariantClick }
                rowActive={ this.isVariantRowActive }
                rowBody={ this.renderRowBody }
                level={ this.isRouteVariantTripView() ? 1 : 2 }
            />
        );
    }
}

export default connect(
    state => ({
        routeVariants: getFilteredRouteVariants(state),
        activeRoute: getActiveRoute(state),
        activeRouteVariant: getActiveRouteVariant(state),
        isLoading: getRouteVariantsLoadingState(state),
        viewType: getControlDetailRoutesViewType(state),
    }),
    { updateActiveRouteVariant, clearActiveRouteVariant, clearActiveTripInstanceId },
)(RouteVariantView);
