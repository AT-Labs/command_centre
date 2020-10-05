import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash-es';

import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import FilterByOperator from '../../Common/Filters/FilterByOperator';
import FilterByMode from '../../Common/Filters/FilterByMode';
import FilterRouteVariantGroup from './FilterByGroup';
import FilterByStartTime from './FilterByStartTime';
import StandardFilter from '../../Common/Filters/StandardFilter';
import SearchFilter from '../../Common/Filters/SearchFilter/SearchFilter';
import {
    getTripStatusFilter, getAgencyIdRouteFilter, getModeRouteFilter,
    getRouteShortNameFilter, getRouteVariantIdFilter, getDepotIdsRouteFilter, getSorting,
} from '../../../../redux/selectors/control/routes/filters';
import { mergeRouteFilters, resetSorting } from '../../../../redux/actions/control/routes/filters';
import { clearSelectedStops } from '../../../../redux/actions/control/routes/trip-instances';
import FilterByDepot from '../../Common/Filters/FilterByDepot';
import FilterByTrackingStatus from './FilterByTrackingStatus';

const STATUS = [
    TRIP_STATUS_TYPES.notStarted,
    TRIP_STATUS_TYPES.inProgress,
    TRIP_STATUS_TYPES.completed,
    TRIP_STATUS_TYPES.cancelled,
    TRIP_STATUS_TYPES.missed,
];

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
                routeShortName: _.get(selectedOption, 'data.routeShortName'),
                routeVariantId: '',
            }),
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: selectedOption => props.mergeRouteFilters({
                routeShortName: '',
                routeVariantId: _.get(selectedOption, 'data.routeVariantId'),
            }),
        },
        clear: {
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: _.noop,
            [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: _.noop,
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
                <div className="col-md-6 col-lg-4 col-xl-3">
                    <FilterByOperator
                        id="control-filters-operators-search"
                        selectedOption={ props.agencyId }
                        onSelection={ selectedOption => props.mergeRouteFilters({ agencyId: selectedOption.value }) } />
                </div>
                <div className="col-md-6 col-lg-4 col-xl-3">
                    <FilterByDepot
                        id="control-filters-depot"
                        selectedAgency={ props.agencyId }
                        selectedOptions={ props.depotIds }
                        onSelection={ selectedOptions => props.mergeRouteFilters({ depotIds: selectedOptions }) } />
                </div>
                <div className="col-md-6 col-lg-4 col-xl-3">
                    <StandardFilter
                        id="control-filters-status"
                        title="Status"
                        placeholder="Select status"
                        options={ STATUS }
                        selectedOption={ props.status || '' }
                        onSelection={ selectedOption => onStatusFilterChange({ tripStatus: selectedOption.value }) }
                        updateOnPropsValueChange />
                </div>
                <div className="col-md-6 col-lg-4 col-xl-3"><FilterByStartTime /></div>
            </div>
            <div className="row justify-content-between pb-3 px-3">
                <div className="col-md-6">
                    <FilterRouteVariantGroup />
                </div>
                <div className="col-md-6">
                    <FilterByTrackingStatus />
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
    routeType: PropTypes.number.isRequired,
    routeShortName: PropTypes.string.isRequired,
    routeVariantId: PropTypes.string.isRequired,
    clearSelectedStops: PropTypes.func.isRequired,
    sorting: PropTypes.object.isRequired,
    resetSorting: PropTypes.func.isRequired,
};

Filters.defaultProps = {
    status: '',
};

export default connect(state => ({
    status: getTripStatusFilter(state),
    agencyId: getAgencyIdRouteFilter(state),
    depotIds: getDepotIdsRouteFilter(state),
    routeType: getModeRouteFilter(state),
    routeShortName: getRouteShortNameFilter(state),
    routeVariantId: getRouteVariantIdFilter(state),
    sorting: getSorting(state),
}),
{ mergeRouteFilters, clearSelectedStops, resetSorting })(Filters);
