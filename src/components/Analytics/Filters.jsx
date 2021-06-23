import { isEmpty, uniqBy } from 'lodash-es';
import { PropTypes } from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { InputGroup, Label } from 'reactstrap';

import { updateOccupancyFilters, updateAgencyFilters, updateRoutesFilters } from '../../redux/actions/analytics/occupancy';
import { getIsLoadingChart, getAgencyFilters, getRoutesFilters, getOccupancyFilters } from '../../redux/selectors/analytics/occupancy';
import { getAllRoutes } from '../../redux/selectors/static/routes';
import { occupancyOptions } from '../../constants/Analytics';

export const Filters = (props) => {
    const [currentAgency, setCurrentAgency] = useState({});
    const [currentRoutes, setCurrentRoutes] = useState([]);

    useEffect(() => {
        setCurrentAgency(props.agencyFilter);
        setCurrentRoutes(props.routesFilters);
    }, [props.agencyFilter, props.routesFilters]);

    const setAgencyAndRoutesOptions = () => {
        let agenciesOptions = [];
        const routesMapped = [];
        if (!isEmpty(props.routes)) {
            const routes = Object.values(props.routes);
            const allAgencies = [];
            routes.forEach((route) => {
                if (currentRoutes.length === 0 || currentRoutes.find(currentRoute => currentRoute.value === route.route_id)) {
                    allAgencies.push({
                        value: route.agency_id,
                        label: route.agency_name,
                    });
                }
                if (isEmpty(currentAgency) || currentAgency.value === route.agency_id) {
                    routesMapped.push({
                        value: route.route_id,
                        label: route.route_short_name,
                    });
                }
            });
            agenciesOptions = uniqBy(allAgencies, 'value');
        }
        return {
            agenciesOptions,
            routesOptions: [
                {
                    label: 'Routes',
                    options: routesMapped,
                },
            ],
        };
    };

    const agencyAndRoutesOption = setAgencyAndRoutesOptions();

    const handleOnChangeOccupancy = (occupancyValues) => {
        props.updateOccupancyFilters(occupancyValues);
    };

    const handleOnChangeAgency = (agency) => {
        const agencySelected = agency || {};
        props.updateAgencyFilters(agencySelected);
        setCurrentAgency(agencySelected);
    };

    const handleOnChangeRoutes = (routes) => {
        props.updateRoutesFilters(routes);
        setCurrentRoutes(routes);
    };

    const formatGroupLabel = data => (
        <div className="text-right font-weight-bold">
            <span>{data.label}</span>
        </div>
    );

    const styles = {
        control: base => ({
            ...base,
            '&:hover': { borderColor: '#152239' },
            borderColor: '#152239',
            boxShadow: 'none',
        }),
    };

    return (
        <div>
            <InputGroup className="mb-3">
                <Label><span className="font-size-md font-weight-bold">Occupancy Status</span></Label>
                <Select
                    options={ occupancyOptions }
                    controlShouldRenderValue
                    backspaceRemovesValue
                    isMulti
                    onChange={ handleOnChangeOccupancy }
                    value={ props.occupancyFilters }
                    placeholder="Select occupancy statuses"
                    styles={ styles }
                    isDisabled={ props.isLoading } />
            </InputGroup>
            <InputGroup className="mb-3">
                <Label><span className="font-size-md font-weight-bold">Agency</span></Label>
                <Select
                    options={ agencyAndRoutesOption.agenciesOptions }
                    isSearchable
                    onChange={ handleOnChangeAgency }
                    value={ !isEmpty(props.agencyFilter) ? props.agencyFilter : '' }
                    placeholder="Select agency"
                    isClearable
                    styles={ styles }
                    isDisabled={ props.isLoading }
                />
            </InputGroup>
            <InputGroup className="mb-3">
                <Label><span className="font-size-md font-weight-bold">Routes</span></Label>
                <Select
                    options={ agencyAndRoutesOption.routesOptions }
                    isSearchable
                    isMulti
                    onChange={ handleOnChangeRoutes }
                    value={ props.routesFilters }
                    placeholder="Select routes"
                    formatGroupLabel={ formatGroupLabel }
                    components={ { DropdownIndicator: () => null, IndicatorSeparator: () => null } }
                    styles={ styles }
                    isDisabled={ props.isLoading }
                />
            </InputGroup>
        </div>
    );
};

Filters.propTypes = {
    updateOccupancyFilters: PropTypes.func.isRequired,
    updateAgencyFilters: PropTypes.func.isRequired,
    updateRoutesFilters: PropTypes.func.isRequired,
    routes: PropTypes.object,
    isLoading: PropTypes.bool,
    agencyFilter: PropTypes.object,
    routesFilters: PropTypes.array,
    occupancyFilters: PropTypes.array,
};

Filters.defaultProps = {
    routes: {},
    isLoading: false,
    agencyFilter: {},
    occupancyFilters: [],
    routesFilters: [],
};

export default connect(state => ({
    routes: getAllRoutes(state),
    isLoading: getIsLoadingChart(state),
    occupancyFilters: getOccupancyFilters(state),
    agencyFilter: getAgencyFilters(state),
    routesFilters: getRoutesFilters(state),
}), { updateOccupancyFilters, updateAgencyFilters, updateRoutesFilters })(Filters);
