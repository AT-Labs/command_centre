import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { noop, get } from 'lodash-es';

import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import FilterByOperator from '../../Common/Filters/FilterByOperator';
import FilterByMode from '../../Common/Filters/FilterByMode';
import FilterRouteVariantGroup from './FilterByGroup';
import FilterByStartTime from './FilterByStartTime';
import StandardFilter from '../../Common/Filters/StandardFilter';
import SearchFilter from '../../Common/Filters/SearchFilter/SearchFilter';
import FilterByDelay from '../../Common/Filters/FilterByDelay';
import {
    getTripStatusFilter, getAgencyIdRouteFilter, getModeRouteFilter,
    getRouteShortNameFilter, getRouteVariantIdFilter, getDepotIdsRouteFilter, getSorting, getDelayRangeRouteFilter,
} from '../../../../redux/selectors/control/routes/filters';
import { mergeRouteFilters, resetSorting } from '../../../../redux/actions/control/routes/filters';
import { clearSelectedStops } from '../../../../redux/actions/control/routes/trip-instances';
import FilterByDepot from '../../Common/Filters/FilterByDepot';
import FilterByTrackingStatus from './FilterByTrackingStatus';
import { useRoutesTripsDatagrid } from '../../../../redux/selectors/appSettings';

const STATUS = [
    TRIP_STATUS_TYPES.notStarted,
    TRIP_STATUS_TYPES.inProgress,
    TRIP_STATUS_TYPES.completed,
    TRIP_STATUS_TYPES.cancelled,
    TRIP_STATUS_TYPES.missed,
];

const DELAY_RANGE_LIMITS = {
    MIN: -30,
    MAX: 30,
};

const Filters = (props) => {
    const valuesOnClear = {
        routeShortName: '',
        routeVariantId: '',
    };

    const inProgressAndCompletedStatuses = [
        TRIP_STATUS_TYPES.inProgress,
        TRIP_STATUS_TYPES.completed,
    ];

    const actionHandlers = {
        selection: {
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: selectedOption => props.mergeRouteFilters({
                routeShortName: get(selectedOption, 'data.routeShortName'),
                routeVariantId: '',
            }),
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: selectedOption => props.mergeRouteFilters({
                routeShortName: '',
                routeVariantId: get(selectedOption, 'data.routeVariantId'),
            }),
        },
        clear: {
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: noop,
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: noop,
        },
    };

    const onStatusFilterChange = (status) => {
        props.clearSelectedStops();
        if (inProgressAndCompletedStatuses.includes(props.status)
            && !inProgressAndCompletedStatuses.includes(status.tripStatus)
            && props.sorting.sortBy === 'delay') {
            props.resetSorting();
        }
        props.mergeRouteFilters(status);
    };

    return (
        <section className="search-filters bg-at-ocean-tint-10 border border-at-ocean-tint-20 mb-3">
            <div className="row justify-content-between pt-3 px-3">
                <div className="col-md-6 col-lg-4 col-xl-3 pb-3">
                    <SearchFilter
                        value={ props.routeVariantId || props.routeShortName }
                        placeholder="Search for a route or route variant"
                        searchInCategory={ [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type, SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type] }
                        selectionHandlers={ actionHandlers.selection }
                        clearHandlers={ actionHandlers.clear }
                        onClearCallBack={ () => props.mergeRouteFilters(valuesOnClear) } />
                </div>
                <div className="col-auto pb-3">
                    <FilterByMode
                        selectedOption={ props.routeType }
                        onSelection={ selectedOption => props.mergeRouteFilters({ routeType: selectedOption }) } />
                </div>
            </div>
            <div className="border-bottom border-at-ocean-tint-20" />
            <div className="row justify-content-between pt-3 px-3">
                <div className="col-md-12 col-xl-9">
                    <div className="row justify-content-between">
                        <div className="col-md-6 col-lg-4 col-xl-4">
                            <FilterByOperator
                                id="control-filters-operators-search"
                                selectedOption={ props.agencyId }
                                onSelection={ selectedOption => props.mergeRouteFilters({ agencyId: selectedOption.value }) } />
                        </div>
                        <div className="col-md-6 col-lg-4 col-xl-4">
                            <FilterByDepot
                                id="control-filters-depot"
                                selectedAgency={ props.agencyId }
                                selectedOptions={ props.depotIds }
                                onSelection={ selectedOptions => props.mergeRouteFilters({ depotIds: selectedOptions }) } />
                        </div>
                        <div className="col-md-6 col-lg-4 col-xl-4">
                            <StandardFilter
                                id="control-filters-status"
                                title="Status"
                                placeholder="Select status"
                                options={ STATUS }
                                selectedOption={ props.status || '' }
                                onSelection={ selectedOption => onStatusFilterChange({ tripStatus: selectedOption.value }) }
                                updateOnPropsValueChange />
                        </div>

                    </div>
                    <div className="row justify-content-between pt-3 px-3">
                        <div className="col-md-6 col-lg-4 col-xl-4">
                            <FilterRouteVariantGroup />
                        </div>
                        { !props.useRoutesTripsDatagrid && (
                            <>
                                <div className="col-md-6 col-lg-4 col-xl-4">
                                    <div><FilterByStartTime /></div>
                                </div>
                                <div className="col-md-6 col-lg-4 col-xl-4">
                                    <FilterByTrackingStatus />
                                </div>
                            </>
                        ) }
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 col-xl-3 px-3">
                    <FilterByDelay
                        id="control-filters-delayRange"
                        delayRange={ props.delayRange }
                        delayRangeLimits={ DELAY_RANGE_LIMITS }
                        onRangeChange={ newDelayRange => props.mergeRouteFilters({ delayRange: newDelayRange }) } />
                </div>
            </div>
        </section>
    );
};

Filters.propTypes = {
    status: PropTypes.oneOf(STATUS.concat('')),
    mergeRouteFilters: PropTypes.func.isRequired,
    agencyId: PropTypes.string.isRequired,
    depotIds: PropTypes.array.isRequired,
    routeType: PropTypes.number,
    routeShortName: PropTypes.string,
    routeVariantId: PropTypes.string.isRequired,
    clearSelectedStops: PropTypes.func.isRequired,
    sorting: PropTypes.object.isRequired,
    resetSorting: PropTypes.func.isRequired,
    delayRange: PropTypes.object.isRequired,
    useRoutesTripsDatagrid: PropTypes.bool.isRequired,
};

Filters.defaultProps = {
    status: '',
    routeType: null,
    routeShortName: null,
};

export default connect(
    state => ({
        status: getTripStatusFilter(state),
        agencyId: getAgencyIdRouteFilter(state),
        depotIds: getDepotIdsRouteFilter(state),
        routeType: getModeRouteFilter(state),
        delayRange: getDelayRangeRouteFilter(state),
        routeShortName: getRouteShortNameFilter(state),
        routeVariantId: getRouteVariantIdFilter(state),
        sorting: getSorting(state),
        useRoutesTripsDatagrid: useRoutesTripsDatagrid(state),
    }),
    { mergeRouteFilters, clearSelectedStops, resetSorting },
)(Filters);
