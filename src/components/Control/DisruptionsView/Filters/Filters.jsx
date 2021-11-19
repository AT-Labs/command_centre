import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { noop } from 'lodash-es';
import { getSelectedEndDateFilter, getSelectedEntityFilter, getSelectedImpactFilter,
    getSelectedStartDateFilter, getSelectedStatusFilter } from '../../../../redux/selectors/control/disruptions';
import { updateDisruptionFilters } from '../../../../redux/actions/control/disruptions';
import SearchFilter from '../../Common/Filters/SearchFilter/SearchFilter';
import StandardFilter from '../../Common/Filters/StandardFilter';
import FilterByDate from './FilterByDate';
import FilterByImpact from './FilterByImpact';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { STATUSES, IMPACTS } from '../../../../types/disruptions-types';
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
            <div className="search-filter col-3">
                <SearchFilter
                    value={ props.selectedEntity.text }
                    placeholder="Search for a stop or a route"
                    searchInCategory={ [ROUTE.type, STOP.type] }
                    selectionHandlers={ actionHandlers.selection }
                    clearHandlers={ actionHandlers.clear }
                    onClearCallBack={ () => props.updateDisruptionFilters({ selectedEntity: {} }) }
                />
            </div>
            <div className="status-filter col-2">
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
            <div className="dates-filter col-2 pt-2">
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
            <div className="status-filter col-2">
                <FilterByImpact
                    placeholder="Select effect"
                    options={ IMPACTS }
                    selectedOption={ props.selectedImpact }
                    onSelection={ selectedOption => props.updateDisruptionFilters({ selectedImpact: selectedOption.value }) }
                    updateOnPropsValueChange />
            </div>
        </section>
    );
};

Filters.propTypes = {
    selectedEntity: PropTypes.object,
    selectedStatus: PropTypes.string,
    selectedStartDate: PropTypes.object,
    selectedEndDate: PropTypes.object,
    selectedImpact: PropTypes.string,
    updateDisruptionFilters: PropTypes.func.isRequired,
};

Filters.defaultProps = {
    selectedEntity: {},
    selectedStatus: '',
    selectedStartDate: null,
    selectedEndDate: null,
    selectedImpact: null,
};

export default connect(state => ({
    selectedEntity: getSelectedEntityFilter(state),
    selectedStatus: getSelectedStatusFilter(state),
    selectedStartDate: getSelectedStartDateFilter(state),
    selectedEndDate: getSelectedEndDateFilter(state),
    selectedImpact: getSelectedImpactFilter(state),
}), {
    updateDisruptionFilters,
})(Filters);
