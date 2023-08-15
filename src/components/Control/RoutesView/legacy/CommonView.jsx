/* eslint-disable react/no-did-update-set-state */

// TODO:
// react/no-did-update-set-state:  According to React documentation this can be done provided it is wrapped in a condition, which is the case here.
// However, it wouldn't do any harm to try a different approach.

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { isEqual, isEmpty } from 'lodash-es';
import moment from 'moment';

import { fetchRoutes } from '../../../../redux/actions/control/routes/routes';
import { fetchTripInstances } from '../../../../redux/actions/control/routes/trip-instances';
import { getStops } from '../../../../redux/actions/static/stops';
import { getControlDetailRoutesViewType, getRouteFilters } from '../../../../redux/selectors/control/routes/filters';
import {
    getRoutesLoadingState, getFilteredRoutesTotal, getAllRoutesTotal, getAllRoutesArray,
} from '../../../../redux/selectors/control/routes/routes';
import {
    getRouteVariantsLoadingState, getFilteredRouteVariantsTotal, getAllRouteVariantsTotal,
} from '../../../../redux/selectors/control/routes/routeVariants';
import {
    getTripInstancesLoadingState, getTripInstancesUpdatingState, getAllTripInstancesTotal, getSelectedTripsKeys,
} from '../../../../redux/selectors/control/routes/trip-instances';
import { getServiceDate } from '../../../../redux/selectors/control/serviceDate';
import { getAllStops } from '../../../../redux/selectors/static/stops';
import VIEW_TYPE from '../../../../types/view-types';
import RoutesView from './RoutesView';
import RouteVariantView from './RouteVariantView';
import TripsView from './TripsView';
import TableTitle from '../../Common/ControlTable/TableTitle';
import Filters from '../Filters/legacy/Filters';
import { SERVICE_DATE_FORMAT, PAGE_SIZE, TRIPS_POLLING_INTERVAL } from '../../../../utils/control/routes';
import { RouteFiltersType } from '../Types';
import { PageInfo, Pagination } from '../../../Common/Pagination/Pagination';
import { LoadMore } from '../../Common/LoadMore/LoadMore';
import SelectionToolsFooter from '../bulkSelection/TripsSelectionFooter';

const INIT_STATE = {
    page: 1,
    pageSize: PAGE_SIZE,
    isLoadingMoreSpinnerVisible: false,
};

export class CommonView extends React.Component {
    static propTypes = {
        viewType: PropTypes.string.isRequired,
        filters: RouteFiltersType.isRequired,
        serviceDate: PropTypes.string.isRequired,
        platforms: PropTypes.object.isRequired,
        allRoutes: PropTypes.array.isRequired,
        selectedTrips: PropTypes.array.isRequired,

        fetchRoutes: PropTypes.func.isRequired,
        fetchTripInstances: PropTypes.func.isRequired,
        getStops: PropTypes.func.isRequired,

        isRoutesLoading: PropTypes.bool.isRequired,
        isRouteVariantsLoading: PropTypes.bool.isRequired,
        isTripsLoading: PropTypes.bool.isRequired,
        isTripsUpdating: PropTypes.bool.isRequired,

        routesTotal: PropTypes.number.isRequired,
        allRoutesTotal: PropTypes.number.isRequired,
        routeVariantsTotal: PropTypes.number.isRequired,
        allRouteVariantsTotal: PropTypes.number.isRequired,
        tripsTotal: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = INIT_STATE;

        this.intervalId = null;
    }

    isRoutesRouteVariantsTripsView = () => this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS;

    isRouteVariantsTripsView = () => this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTE_VARIANTS_TRIPS;

    isRoutesTripsView = () => this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS;

    isTripsOnlyView = () => this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS;

    componentDidMount() {
        if (isEmpty(this.props.platforms)) {
            this.props.getStops();
        }

        if (!this.props.allRoutesTotal || !this.props.allRouteVariantsTotal) {
            this.fetchRoutes();
        }

        if (this.isTripsOnlyView()) {
            this.fetchTripInstances(false);
            this.setTripPollingInterval();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const hasAnyFilterChanged = !isEqual(this.props.filters, prevProps.filters);
        const hasServiceDateChanged = !moment(this.props.serviceDate).isSame(moment(prevProps.serviceDate), 'day');
        const hasPageSizeIncreased = this.state.pageSize > prevState.pageSize;
        const hasViewChanged = this.props.viewType !== prevProps.viewType;
        const hasUpdateFinished = prevProps.isTripsUpdating && !this.props.isTripsUpdating;
        const hasLoadingMoreCompleted = hasUpdateFinished && this.state.isLoadingMoreSpinnerVisible;

        if (hasAnyFilterChanged || hasServiceDateChanged) {
            this.setState(INIT_STATE, () => {
                if (this.isTripsOnlyView()) {
                    this.fetchTripInstances(false);
                }
            });
        } else if (this.isTripsOnlyView() && hasPageSizeIncreased) {
            // start Loading more update
            this.fetchTripInstances(true);
        } else if (hasLoadingMoreCompleted) {
            // finish Loading more update
            this.setState({ isLoadingMoreSpinnerVisible: false });
        }

        if (hasViewChanged) {
            if (this.isTripsOnlyView()) {
                this.setTripPollingInterval();
            } else {
                this.clearTripPollingInterval();
            }
        }
    }

    componentWillUnmount() {
        this.clearTripPollingInterval();
    }

    setTripPollingInterval = () => {
        this.clearTripPollingInterval();
        this.intervalId = setInterval(() => {
            if (!this.props.isTripsLoading && !this.props.isTripsUpdating) {
                this.fetchTripInstances(true);
            }
        }, TRIPS_POLLING_INTERVAL);
    };

    clearTripPollingInterval = () => {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    };

    fetchRoutes = () => {
        this.props.fetchRoutes({
            serviceDate: moment(this.props.serviceDate).format(SERVICE_DATE_FORMAT),
        });
    };

    fetchTripInstances = (isUpdate) => {
        const tripsArgs = {
            serviceDate: moment(this.props.serviceDate).format(SERVICE_DATE_FORMAT),
            ...this.props.filters,
            page: 1,
            limit: this.state.pageSize,
        };
        const { routeShortName, routeVariantId } = this.props.filters;
        if (routeVariantId) {
            tripsArgs.routeVariantIds = [routeVariantId];
        } else if (routeShortName) {
            tripsArgs.routeVariantIds = this.props.allRoutes.filter(route => route.agencyAgnostic && routeShortName === route.routeShortName)
                .map(route => route.routeVariants).flat()
                .map(item => item.routeVariantId);
        }
        this.props.fetchTripInstances(tripsArgs, { isUpdate });
    };

    isLoading = () => {
        if (this.isRoutesTripsView() || this.isRoutesRouteVariantsTripsView()) {
            return this.props.isRoutesLoading;
        }
        if (this.isRouteVariantsTripsView()) {
            return this.props.isRouteVariantsLoading;
        }
        if (this.isTripsOnlyView()) {
            return this.props.isTripsLoading;
        }
        return false;
    };

    getTotal = () => {
        if (this.isRoutesTripsView() || this.isRoutesRouteVariantsTripsView()) {
            return this.props.routesTotal;
        }
        if (this.isRouteVariantsTripsView()) {
            return this.props.routeVariantsTotal;
        }
        if (this.isTripsOnlyView()) {
            return this.props.tripsTotal;
        }
        return 0;
    };

    render() {
        const { isRoutesLoading, isRouteVariantsLoading, isTripsLoading, selectedTrips } = this.props;
        const shouldSelectionToolsFooterBeVisible = selectedTrips.length > 0;

        return (
            <>
                <TableTitle
                    tableTitle="Routes & Trips"
                    isServiceDatePickerDisabled={ isRoutesLoading || isRouteVariantsLoading || isTripsLoading } />

                <Filters />

                {(this.isRoutesTripsView() || this.isRoutesRouteVariantsTripsView()) && <RoutesView page={ this.state.page } />}

                {this.isRouteVariantsTripsView() && <RouteVariantView page={ this.state.page } />}

                {this.isTripsOnlyView() && <TripsView />}

                <div className={ `${shouldSelectionToolsFooterBeVisible ? 'pb-5' : ''}` }>
                    {!this.isLoading() && !this.isTripsOnlyView() && (
                        <>
                            <PageInfo
                                currentPage={ this.state.page }
                                itemsPerPage={ PAGE_SIZE }
                                itemsTotal={ this.getTotal() }
                            />
                            <Pagination
                                currentPage={ this.state.page }
                                itemsPerPage={ PAGE_SIZE }
                                itemsTotal={ this.getTotal() }
                                onPageClick={ page => this.setState({ page }) }
                            />
                        </>
                    )}

                    {!this.isLoading() && this.isTripsOnlyView() && (
                        <>
                            <p className="text-center text-muted font-size-sm my-3">{`Displaying ${this.getTotal()} trips`}</p>
                            <LoadMore
                                limit={ this.state.pageSize }
                                total={ this.getTotal() }
                                chunkSize={ PAGE_SIZE }
                                isLoading={ this.state.isLoadingMoreSpinnerVisible }
                                onClick={ () => this.setState(state => ({
                                    pageSize: state.pageSize + PAGE_SIZE,
                                    isLoadingMoreSpinnerVisible: true,
                                })) }
                            />
                        </>
                    )}
                </div>
                { shouldSelectionToolsFooterBeVisible && <SelectionToolsFooter /> }
            </>
        );
    }
}

export default connect(
    state => ({
        viewType: getControlDetailRoutesViewType(state),
        filters: getRouteFilters(state),
        isRoutesLoading: getRoutesLoadingState(state),
        isRouteVariantsLoading: getRouteVariantsLoadingState(state),
        isTripsLoading: getTripInstancesLoadingState(state),
        isTripsUpdating: getTripInstancesUpdatingState(state),
        routesTotal: getFilteredRoutesTotal(state),
        allRoutesTotal: getAllRoutesTotal(state),
        routeVariantsTotal: getFilteredRouteVariantsTotal(state),
        allRouteVariantsTotal: getAllRouteVariantsTotal(state),
        tripsTotal: getAllTripInstancesTotal(state),
        serviceDate: getServiceDate(state),
        platforms: getAllStops(state),
        allRoutes: getAllRoutesArray(state),
        selectedTrips: getSelectedTripsKeys(state),
    }),
    { fetchRoutes, fetchTripInstances, getStops },
)(CommonView);
