import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { noop } from 'lodash-es';
import { getSelectedEndDateFilter, getSelectedEntityFilter, getSelectedStartDateFilter } from '../../../../redux/selectors/control/incidents';
import { updateIncidentFilters } from '../../../../redux/actions/control/incidents';
import SearchFilter from '../../Common/Filters/SearchFilter/SearchFilter';
import FilterByDate from './FilterByDate';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import './Filters.scss';

const Filters = (props) => {
    const { ROUTE, STOP } = SEARCH_RESULT_TYPE;

    const actionHandlers = {
        selection: {
            [ROUTE.type]: entity => props.updateIncidentFilters({ selectedEntity: entity }),
            [STOP.type]: entity => props.updateIncidentFilters({ selectedEntity: entity }),
        },
        clear: {
            [ROUTE.type]: noop,
            [STOP.type]: noop,
        },
    };

    return (
        <section className="disruption-filters row pb-3">
            <div className="search-filter col-3">
                <SearchFilter
                    value={ props.selectedEntity.text }
                    placeholder="Search for a stop or a route"
                    searchInCategory={ [ROUTE.type, STOP.type] }
                    selectionHandlers={ actionHandlers.selection }
                    clearHandlers={ actionHandlers.clear }
                    onClearCallBack={ () => props.updateIncidentFilters({ selectedEntity: Filters.defaultProps.selectedEntity }) }
                />
            </div>
            <div className="dates-filter-label col-1 pr-0 pt-2">Active between:</div>
            <div className="dates-filter col-2">
                <FilterByDate
                    selectedDate={ props.selectedStartDate }
                    maxDate={ props.selectedEndDate }
                    onChange={ date => props.updateIncidentFilters({ selectedStartDate: date && date[0] }) } />
            </div>
            <div className="dates-filter__separator col-pixel-width-100" />
            <div className="dates-filter col-2">
                <FilterByDate
                    selectedDate={ props.selectedEndDate }
                    minDate={ props.selectedStartDate }
                    onChange={ (date) => {
                        if (date && date[0]) {
                            date[0].setHours(23, 59, 59, 999);
                        }
                        props.updateIncidentFilters({ selectedEndDate: date && date[0] });
                    } } />
            </div>
        </section>
    );
};

Filters.propTypes = {
    selectedEntity: PropTypes.object,
    selectedStartDate: PropTypes.object,
    selectedEndDate: PropTypes.object,
    updateIncidentFilters: PropTypes.func.isRequired,
};

Filters.defaultProps = {
    selectedEntity: {},
    selectedStartDate: null,
    selectedEndDate: null,

};

export default connect(state => ({
    selectedEntity: getSelectedEntityFilter(state),
    selectedStartDate: getSelectedStartDateFilter(state),
    selectedEndDate: getSelectedEndDateFilter(state),
}), {
    updateIncidentFilters,
})(Filters);
