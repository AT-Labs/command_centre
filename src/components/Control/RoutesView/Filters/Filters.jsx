import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { noop, get, debounce } from 'lodash-es';

import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import FilterByOperator from '../../Common/Filters/FilterByOperator';
import FilterRouteVariantGroup from './FilterByGroup';
import FilterByStartTime from './FilterByStartTime';
import StandardFilter from '../../Common/Filters/StandardFilter';
import SearchFilter from '../../Common/Filters/SearchFilter/SearchFilter';
import FilterByDelay from '../../Common/Filters/FilterByDelay';
import {
    getTripStatusFilter, getAgencyIdRouteFilter,
    getRouteShortNameFilter, getRouteVariantIdFilter, getDepotIdsRouteFilter, getSorting, getDelayRangeRouteFilter,
} from '../../../../redux/selectors/control/routes/filters';
import { mergeRouteFilters, resetSorting } from '../../../../redux/actions/control/routes/filters';
import { clearSelectedStops } from '../../../../redux/actions/control/routes/trip-instances';
import FilterByDepot from '../../Common/Filters/FilterByDepot';
import { updateUserPreferences } from '../../../../utils/transmitters/command-centre-config-api';
import { useRoutesTripsPreferences } from '../../../../redux/selectors/appSettings';

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
    const isFirstRender = useRef(true);
    const updateUserPreferencesQueryDebounced = useRef(debounce(q => updateUserPreferences(q), 700)).current;
    const { agencyId, depotIds } = props;
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

    useEffect(() => {
        if (props.useRoutesTripsPreferences) {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            updateUserPreferencesQueryDebounced({ routesFilters: { agencyId, depotIds } });
        }
    }, [agencyId, depotIds]);

    return (
        <section className="search-filters bg-at-ocean-tint-10 border border-at-ocean-tint-20 mb-3">
            <div className="row justify-content-between pt-3 px-3">
                <div className="col-md-12 col-xl-9">
                    <div className="row justify-content-between">
                        <div className="col-md-6 col-lg-3 col-xl-3">
                            <SearchFilter
                                value={ props.routeVariantId || props.routeShortName }
                                placeholder="Search for a route or route variant"
                                searchInCategory={ [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type, SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type] }
                                selectionHandlers={ actionHandlers.selection }
                                clearHandlers={ actionHandlers.clear }
                                onClearCallBack={ () => props.mergeRouteFilters(valuesOnClear) }
                                label="Route or Route Variant" />
                        </div>
                        <div className="col-md-6 col-lg-3 col-xl-3">
                            <FilterByOperator
                                id="control-filters-operators-search"
                                selectedOption={ props.agencyId }
                                onSelection={ selectedOption => props.mergeRouteFilters({ agencyId: selectedOption.value }) } />
                        </div>
                        <div className="col-md-6 col-lg-3 col-xl-3">
                            <FilterByDepot
                                id="control-filters-depot"
                                selectedAgency={ props.agencyId }
                                selectedOptions={ props.depotIds }
                                onSelection={ selectedOptions => props.mergeRouteFilters({ depotIds: selectedOptions }) } />
                        </div>
                        <div className="col-md-6 col-lg-3 col-xl-3">
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
                    <div className="row justify-content-start">
                        <div className="col-md-6 col-lg-3 col-xl-3 pt-3">
                            <FilterRouteVariantGroup />
                        </div>
                        <div className="col-md-6 col-lg-4 col-xl-4">
                            <div><FilterByStartTime /></div>
                        </div>
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
    routeShortName: PropTypes.string,
    routeVariantId: PropTypes.string.isRequired,
    clearSelectedStops: PropTypes.func.isRequired,
    sorting: PropTypes.object.isRequired,
    resetSorting: PropTypes.func.isRequired,
    delayRange: PropTypes.object.isRequired,
    useRoutesTripsPreferences: PropTypes.bool.isRequired,
};

Filters.defaultProps = {
    status: '',
    routeShortName: null,
};

export default connect(
    state => ({
        status: getTripStatusFilter(state),
        agencyId: getAgencyIdRouteFilter(state),
        depotIds: getDepotIdsRouteFilter(state),
        delayRange: getDelayRangeRouteFilter(state),
        routeShortName: getRouteShortNameFilter(state),
        routeVariantId: getRouteVariantIdFilter(state),
        sorting: getSorting(state),
        useRoutesTripsPreferences: useRoutesTripsPreferences(state),
    }),
    { mergeRouteFilters, clearSelectedStops, resetSorting },
)(Filters);
