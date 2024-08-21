import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import VIEW_TYPE from '../../../types/view-types';
import TableTitle from '../Common/ControlTable/TableTitle';
import Filters from './Filters/Filters';
import LegacyFilters from './Filters/legacy/Filters';
import FilterByMode from '../Common/Filters/FilterByMode';
import SelectionToolsFooter from './bulkSelection/TripsSelectionFooter';
import GroupByRouteView from './GroupByRouteView';
import GroupByRouteVariantView from './GroupByRouteVariantView';
import TripsDataGrid from './TripsDataGrid';
import AddTrip from './AddTrip';
import ClearUserPreferencesModal from './Modals/clearUserPreferencesModal';

import { retrieveAgencies } from '../../../redux/actions/control/agencies';
import { fetchRoutes } from '../../../redux/actions/control/routes/routes';
import { getControlDetailRoutesViewType, getRouteFilters, getModeRouteFilter } from '../../../redux/selectors/control/routes/filters';
import { mergeRouteFilters } from '../../../redux/actions/control/routes/filters';
import { PAGE_SIZE, TRIPS_POLLING_INTERVAL, SERVICE_DATE_FORMAT } from '../../../utils/control/routes';
import { filterTripInstances, updateEnabledAddTripModal } from '../../../redux/actions/control/routes/trip-instances';
import { RouteFiltersType, RouteType, RouteVariantType } from './Types';
import {
    getRoutesLoadingState, getFilteredRoutesTotal, getAllRoutesTotal, getActiveRoute,
} from '../../../redux/selectors/control/routes/routes';
import {
    getRouteVariantsLoadingState, getFilteredRouteVariantsTotal, getAllRouteVariantsTotal, getActiveRouteVariant,
} from '../../../redux/selectors/control/routes/routeVariants';
import { getSelectedTripsKeys, isAddTripModalEnabled, isAddTripAllowed } from '../../../redux/selectors/control/routes/trip-instances';
import { useAddTrip, useRoutesTripsFilterCollapse, useRoutesTripsPreferences, useNextDayTrips } from '../../../redux/selectors/appSettings';
import { getServiceDate } from '../../../redux/selectors/control/serviceDate';
import { PageInfo, Pagination } from '../../Common/Pagination/Pagination';
import CustomModal from '../../Common/CustomModal/CustomModal';

import './TripsDataGrid.scss';

export const RoutesAndTripsView = (props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const loadingTimerRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isClearUserPreferencesModalOpen, setIsClearUserPreferencesModalOpen] = useState(false);

    const getTripInstances = () => {
        if (props.addTripModalIsOpen) {
            clearTimeout(loadingTimerRef.current);
            return;
        }
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
    }, [props.filters, props.activeRoute, props.activeRouteVariant, props.serviceDate, props.addTripModalIsOpen]);

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

    const showAddTripButton = props.useAddTrip
        && props.isAddTripAllowed
        && (moment(props.serviceDate).format(SERVICE_DATE_FORMAT) === moment().format(SERVICE_DATE_FORMAT)
        || (props.useNextDayTrips && moment(props.serviceDate).format(SERVICE_DATE_FORMAT) === moment().add(1, 'days').format(SERVICE_DATE_FORMAT)));

    const getAddTripActionButton = () => (
        <div className="mr-4">
            <Button className="cc-btn-primary" onClick={ () => props.updateEnabledAddTripModal(true) } aria-label="Add trip"> Add trip </Button>
        </div>
    );

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
                        <TableTitle
                            tableTitle="Routes & Trips"
                            subTitle={ props.useRoutesTripsPreferences ? 'Clear user preferences' : undefined }
                            onSubTitleClick={ props.useRoutesTripsPreferences ? () => setIsClearUserPreferencesModalOpen(true) : undefined }
                        >
                            <div className="d-flex align-items-center col-auto">
                                { showAddTripButton && getAddTripActionButton() }
                            </div>
                        </TableTitle>
                        <LegacyFilters />
                    </>
                ) }
                { props.useRoutesTripsFilterCollapse && (
                    <>
                        <TableTitle
                            tableTitle="Routes & Trips"
                            subTitle={ props.useRoutesTripsPreferences ? 'Clear user preferences' : undefined }
                            onSubTitleClick={ props.useRoutesTripsPreferences ? () => setIsClearUserPreferencesModalOpen(true) : undefined }
                        >
                            { renderCollapseFiltersButton() }
                            <div className="d-flex align-items-center col-auto">
                                { showAddTripButton && getAddTripActionButton() }
                                <FilterByMode
                                    selectedOption={ props.routeType }
                                    onSelection={ selectedOption => props.mergeRouteFilters({ routeType: selectedOption }, false, false, props.useRoutesTripsPreferences) } />
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
            { props.useAddTrip && (
                <Dialog open={ props.addTripModalIsOpen } fullScreen scroll="body" style={ { zIndex: 1029 } }>
                    <DialogContent className="p-0">
                        <AddTrip />
                    </DialogContent>
                </Dialog>
            ) }

            { props.useRoutesTripsPreferences && (
                <CustomModal
                    className="confirm-clear-user-preferences__modal"
                    title="Clear User Preferences"
                    isModalOpen={ isClearUserPreferencesModalOpen }
                >
                    <ClearUserPreferencesModal className="" onClose={ () => setIsClearUserPreferencesModalOpen(false) } />
                </CustomModal>
            ) }
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
    addTripModalIsOpen: PropTypes.bool.isRequired,
    updateEnabledAddTripModal: PropTypes.func.isRequired,
    useAddTrip: PropTypes.bool.isRequired,
    isAddTripAllowed: PropTypes.bool.isRequired,
    mergeRouteFilters: PropTypes.func.isRequired,
    routeType: PropTypes.number,
    useRoutesTripsFilterCollapse: PropTypes.bool.isRequired,
    useRoutesTripsPreferences: PropTypes.bool.isRequired,
    useNextDayTrips: PropTypes.bool.isRequired,
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
        addTripModalIsOpen: isAddTripModalEnabled(state),
        useAddTrip: useAddTrip(state),
        isAddTripAllowed: isAddTripAllowed(state),
        routeType: getModeRouteFilter(state),
        useRoutesTripsFilterCollapse: useRoutesTripsFilterCollapse(state),
        useRoutesTripsPreferences: useRoutesTripsPreferences(state),
        useNextDayTrips: useNextDayTrips(state),
    }),
    {
        fetchRoutes, filterTripInstances, retrieveAgencies, updateEnabledAddTripModal, mergeRouteFilters,
    },
)(RoutesAndTripsView);
