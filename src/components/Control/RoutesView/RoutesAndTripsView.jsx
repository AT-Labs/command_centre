import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import { retrieveAgencies } from '../../../redux/actions/control/agencies';
import { fetchRoutes } from '../../../redux/actions/control/routes/routes';
import { getControlDetailRoutesViewType, getRouteFilters, getModeRouteFilter } from '../../../redux/selectors/control/routes/filters';
import { mergeRouteFilters } from '../../../redux/actions/control/routes/filters';
import VIEW_TYPE from '../../../types/view-types';
import { PAGE_SIZE, TRIPS_POLLING_INTERVAL } from '../../../utils/control/routes';
import { filterTripInstances } from '../../../redux/actions/control/routes/trip-instances';
import { RouteFiltersType, RouteType, RouteVariantType } from './Types';
import {
    getRoutesLoadingState, getFilteredRoutesTotal, getAllRoutesTotal, getActiveRoute,
} from '../../../redux/selectors/control/routes/routes';
import {
    getRouteVariantsLoadingState, getFilteredRouteVariantsTotal, getAllRouteVariantsTotal, getActiveRouteVariant,
} from '../../../redux/selectors/control/routes/routeVariants';
import { getSelectedTripsKeys } from '../../../redux/selectors/control/routes/trip-instances';
import { getServiceDate } from '../../../redux/selectors/control/serviceDate';
import { useRoutesTripsFilterCollapse } from '../../../redux/selectors/appSettings';
import { PageInfo, Pagination } from '../../Common/Pagination/Pagination';
import TableTitle from '../Common/ControlTable/TableTitle';
import Filters from './Filters/Filters';
import LegacyFilters from './Filters/legacy/Filters';
import FilterByMode from '../Common/Filters/FilterByMode';
import SelectionToolsFooter from './bulkSelection/TripsSelectionFooter';
import GroupByRouteView from './GroupByRouteView';
import GroupByRouteVariantView from './GroupByRouteVariantView';
import TripsDataGrid from './TripsDataGrid';

import './TripsDataGrid.scss';

export const RoutesAndTripsView = (props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const loadingTimerRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(true);

    const getTripInstances = () => {
        props.filterTripInstances(true);
        const timer = setTimeout(() => {
            getTripInstances();
        }, TRIPS_POLLING_INTERVAL);
        loadingTimerRef.current = timer;
    };

    useEffect(() => {
        getTripInstances();

        return () => {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
            }
        };
    }, [props.filters, props.activeRoute, props.activeRouteVariant, props.serviceDate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [props.filters, props.serviceDate]);

    useEffect(() => {
        if (!props.allRoutesTotal || !props.allRouteVariantsTotal) {
            props.fetchRoutes();
        }

        props.retrieveAgencies();
    }, []);

    const isRoutesRouteVariantsTripsView = () => props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS;
    const isRouteVariantsTripsView = () => props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTE_VARIANTS_TRIPS;
    const isRoutesTripsView = () => props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS;
    const isTripsOnlyView = () => props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS;

    const shouldSelectionToolsFooterBeVisible = props.selectedTrips.length > 0;

    const isLoading = () => {
        if (isRoutesTripsView() || isRoutesRouteVariantsTripsView()) {
            return props.isRoutesLoading;
        }
        if (isRouteVariantsTripsView()) {
            return props.isRouteVariantsLoading;
        }
        return false;
    };

    const getTotal = () => {
        if (isRouteVariantsTripsView()) {
            return props.routeVariantsTotal;
        }
        return props.routesTotal;
    };

    const renderCollapseFiltersButton = () => (
        <IconButton disableRipple color="primary" onClick={ () => setIsExpanded(!isExpanded) }>
            {isExpanded && (
                <>
                    <span className="font-size-md">Hide filters</span>
                    <ExpandLess sx={ { color: 'black' } } />
                </>
            )}
            {!isExpanded && (
                <>
                    <span className="font-size-md">Show filters</span>
                    <ExpandMore sx={ { color: 'black' } } />
                </>
            )}
        </IconButton>
    );

    return (
        <>
            <div className="routes-trips-view d-flex flex-column h-100">
                { !props.useRoutesTripsFilterCollapse && (
                    <>
                        <TableTitle tableTitle="Routes & Trips" />
                        <LegacyFilters />
                    </>
                ) }
                { props.useRoutesTripsFilterCollapse && (
                    <>
                        <TableTitle tableTitle="Routes & Trips">
                            { renderCollapseFiltersButton() }
                            <div className="d-flex align-items-center col-auto">
                                <FilterByMode
                                    selectedOption={ props.routeType }
                                    onSelection={ selectedOption => props.mergeRouteFilters({ routeType: selectedOption }) } />
                            </div>
                        </TableTitle>

                        {isExpanded && <Filters />}
                    </>
                ) }

                {(isRoutesTripsView() || isRoutesRouteVariantsTripsView()) && <GroupByRouteView page={ currentPage } />}

                {isRouteVariantsTripsView() && <GroupByRouteVariantView page={ currentPage } />}

                {isTripsOnlyView() && <TripsDataGrid />}

                <div className={ `${shouldSelectionToolsFooterBeVisible ? 'pb-5' : ''}` }>
                    {!isLoading() && !isTripsOnlyView() && (
                        <>
                            <PageInfo
                                currentPage={ currentPage }
                                itemsPerPage={ PAGE_SIZE }
                                itemsTotal={ getTotal() }
                            />
                            <Pagination
                                currentPage={ currentPage }
                                itemsPerPage={ PAGE_SIZE }
                                itemsTotal={ getTotal() }
                                onPageClick={ page => setCurrentPage(page) }
                            />
                        </>
                    )}
                </div>
            </div>

            { shouldSelectionToolsFooterBeVisible && <SelectionToolsFooter /> }
        </>
    );
};

RoutesAndTripsView.propTypes = {
    viewType: PropTypes.string.isRequired,
    selectedTrips: PropTypes.array.isRequired,
    isRoutesLoading: PropTypes.bool.isRequired,
    isRouteVariantsLoading: PropTypes.bool.isRequired,
    routesTotal: PropTypes.number.isRequired,
    allRoutesTotal: PropTypes.number.isRequired,
    routeVariantsTotal: PropTypes.number.isRequired,
    allRouteVariantsTotal: PropTypes.number.isRequired,
    activeRoute: RouteType,
    activeRouteVariant: RouteVariantType,
    filters: RouteFiltersType.isRequired,
    filterTripInstances: PropTypes.func.isRequired,
    retrieveAgencies: PropTypes.func.isRequired,
    fetchRoutes: PropTypes.func.isRequired,
    serviceDate: PropTypes.string.isRequired,
    mergeRouteFilters: PropTypes.func.isRequired,
    routeType: PropTypes.number,
    useRoutesTripsFilterCollapse: PropTypes.bool.isRequired,
};

RoutesAndTripsView.defaultProps = {
    activeRoute: null,
    activeRouteVariant: null,
    routeType: null,
};

export default connect(
    state => ({
        viewType: getControlDetailRoutesViewType(state),
        selectedTrips: getSelectedTripsKeys(state),
        isRoutesLoading: getRoutesLoadingState(state),
        isRouteVariantsLoading: getRouteVariantsLoadingState(state),
        routesTotal: getFilteredRoutesTotal(state),
        allRoutesTotal: getAllRoutesTotal(state),
        routeVariantsTotal: getFilteredRouteVariantsTotal(state),
        allRouteVariantsTotal: getAllRouteVariantsTotal(state),
        filters: getRouteFilters(state),
        activeRoute: getActiveRoute(state),
        activeRouteVariant: getActiveRouteVariant(state),
        serviceDate: getServiceDate(state),
        routeType: getModeRouteFilter(state),
        useRoutesTripsFilterCollapse: useRoutesTripsFilterCollapse(state),
    }),
    {
        fetchRoutes, filterTripInstances, retrieveAgencies, mergeRouteFilters,
    },
)(RoutesAndTripsView);
