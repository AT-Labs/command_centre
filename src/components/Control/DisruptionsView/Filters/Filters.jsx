import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { noop } from 'lodash-es';
import { getSelectedEndDateFilter, getSelectedEntityFilter, getSelectedStartDateFilter, getSelectedStatusFilter } from '../../../../redux/selectors/control/disruptions';
import { updateDisruptionFilters } from '../../../../redux/actions/control/disruptions';
import SearchFilter from '../../Common/Filters/SearchFilter/SearchFilter';
import StandardFilter from '../../Common/Filters/StandardFilter';
import FilterByDate from './FilterByDate';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { STATUSES } from '../../../../types/disruptions-types';
import './Filters.scss';

const Filters = (props) => {
    const { ROUTE, STOP } = SEARCH_RESULT_TYPE;

    const actionHandlers = {
        selection: {
            [ROUTE.type]: entity => props.updateDisruptionFilters({ selectedEntity: entity }),
            [STOP.type]: entity => props.updateDisruptionFilters({ selectedEntity: entity }),
        },
        clear: {
            [ROUTE.type]: noop,
            [STOP.type]: noop,
        },
    };

    return (
        <section className="disruption-filters row">
            <div className="search-filter col-4">
                <SearchFilter
                    value={ props.selectedEntity.text }
                    placeholder="Search for a stop or a route"
                    searchInCategory={ [ROUTE.type, STOP.type] }
                    selectionHandlers={ actionHandlers.selection }
                    clearHandlers={ actionHandlers.clear }
                    onClearCallBack={ () => props.updateDisruptionFilters({ selectedEntity: {} }) }
                />
            </div>
            <div className="status-filter col-3">
                <StandardFilter
                    placeholder="Select status"
                    options={ STATUSES }
                    selectedOption={ props.selectedStatus }
                    onSelection={ selectedOption => props.updateDisruptionFilters({ selectedStatus: selectedOption.value }) }
                    updateOnPropsValueChange />
            </div>
            <div className="dates-filter col-2">
                <FilterByDate
                    selectedDate={ props.selectedStartDate }
                    maxDate={ props.selectedEndDate }
                    onChange={ date => props.updateDisruptionFilters({ selectedStartDate: date && date[0] }) }
                    label="Active between:" />
            </div>
            <div className="dates-filter__separator col-pixel-width-100" />
            <div className="dates-filter col-2">
                <FilterByDate
                    selectedDate={ props.selectedEndDate }
                    minDate={ props.selectedStartDate }
                    onChange={ (date) => {
                        if (date && date[0]) {
                            date[0].setUTCHours(23, 59, 59, 999);
                        }
                        props.updateDisruptionFilters({ selectedEndDate: date && date[0] });
                    } } />
            </div>
        </section>
    );
};

Filters.propTypes = {
    selectedEntity: PropTypes.object.isRequired,
    selectedStatus: PropTypes.string.isRequired,
    selectedStartDate: PropTypes.object.isRequired,
    selectedEndDate: PropTypes.object.isRequired,
    updateDisruptionFilters: PropTypes.func.isRequired,
};

export default connect(state => ({
    selectedEntity: getSelectedEntityFilter(state),
    selectedStatus: getSelectedStatusFilter(state),
    selectedStartDate: getSelectedStartDateFilter(state),
    selectedEndDate: getSelectedEndDateFilter(state),
}), {
    updateDisruptionFilters,
})(Filters);
