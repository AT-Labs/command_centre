import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { isEmpty, startCase } from 'lodash-es';
import Plotly from 'plotly.js-basic-dist-min';

import Loader from '../Common/Loader/Loader';

import {
    getOccupancyState,
    getOccupancyFilters,
    getAgencyFilters,
    getRoutesIdMappings,
    getRoutesFilters,
    getIsLoadingChart,
} from '../../redux/selectors/analytics/occupancy';
import { updateLoading } from '../../redux/actions/analytics/occupancy';

export const OccupancyBarChart = (props) => {
    const initBarDataState = [
        {
            x: [],
            y: [],
            name: 'null',
            type: 'bar',
        },
        {
            x: [],
            y: [],
            name: 'full',
            type: 'bar',
        },
        {
            x: [],
            y: [],
            name: 'empty',
            type: 'bar',
        },
        {
            x: [],
            y: [],
            name: 'standing_room_only',
            type: 'bar',
        },
        {
            x: [],
            y: [],
            name: 'few_seats_available',
            type: 'bar',
        },
        {
            x: [],
            y: [],
            name: 'many_seats_available',
            type: 'bar',
        },
    ];
    const layout = {
        barmode: 'stack',
        clickmode: 'event',
        hovermode: 'closest',
        xaxis: {
            range: [Date.now() - (80 * 60000), Date.now() + (10 * 60000)],
        },
        colorway: ['#152239', '#88CB40', '#db7739', '#EE2E27', '#399CDB', '#E30084'],
        title: 'Occupancy per minute',
    };
    const [occupancyState, setOccupancyState] = useState([]);
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const plotEl = useRef(null);

    const filterRoutes = (latestData) => {
        const isRoutesFilterEmpty = props.routesFiltered.length === 0;
        const isAgencyFilterEmpty = isEmpty(props.agencyFilter);
        if (!isRoutesFilterEmpty) {
            return latestData.filter(route => props.routesFiltered.find(filterRoute => filterRoute.value === route.route_id));
        }

        if (!isAgencyFilterEmpty) {
            return latestData.filter(route => route.agency_id === props.agencyFilter.value);
        }

        return latestData;
    };

    useEffect(() => {
        props.updateLoading(true);
        const { occupancy } = props;
        const mappedData = {};
        const container = plotEl.current;

        if (occupancy.length) {
            const oldestTimePeriod = occupancy[occupancy.length - 1].time_period;
            const latestData = !isEmpty(occupancyState)
                ? occupancy.concat(occupancyState.filter(o => o.time_period < oldestTimePeriod))
                : occupancy;
            setOccupancyState(latestData);

            const filteredRoutes = filterRoutes(latestData);

            filteredRoutes.forEach((element) => {
                if (!mappedData.empty) {
                    mappedData.empty = {};
                    mappedData.many_seats_available = {};
                    mappedData.few_seats_available = {};
                    mappedData.standing_room_only = {};
                    mappedData.full = {};
                }

                if (isEmpty(props.occupancyFilters)) {
                    mappedData.empty[element.time_period] = (mappedData.empty[element.time_period] || 0) + element.empty;
                    mappedData.many_seats_available[element.time_period] = (mappedData.many_seats_available[element.time_period] || 0) + element.many_seats_available;
                    mappedData.few_seats_available[element.time_period] = (mappedData.few_seats_available[element.time_period] || 0) + element.few_seats_available;
                    mappedData.standing_room_only[element.time_period] = (mappedData.standing_room_only[element.time_period] || 0) + element.standing_room_only;
                    mappedData.full[element.time_period] = (mappedData.full[element.time_period] || 0) + element.full;
                } else {
                    props.occupancyFilters.forEach((filter) => {
                        mappedData[filter.value][element.time_period] = (mappedData[filter.value][element.time_period] || 0) + element[filter.value];
                    });
                }
            });

            const dataToRender = Object.keys(mappedData).map((key) => {
                const entry = initBarDataState.find(e => e.name === key);
                entry.name = startCase(entry.name);
                entry.x = Object.keys(mappedData[key]).map(val => new Date(val * 1000));
                entry.y = Object.values(mappedData[key]);
                return entry;
            });

            const config = { responsive: true };

            if (!shouldUpdate) {
                Plotly.newPlot(
                    container,
                    dataToRender,
                    layout,
                    config,
                ).finally(() => {
                    setShouldUpdate(true);
                    props.updateLoading(false);
                });
            } else {
                container.data = dataToRender;
                Plotly.redraw(container).finally(() => props.updateLoading(false));
            }
        }
    }, [props.occupancy, props.occupancyFilters, props.agencyFilter, props.routesFiltered]);

    return (
        <section>
            {props.isChartLoading && <Loader />}
            <div ref={ plotEl } />
        </section>
    );
};

OccupancyBarChart.propTypes = {
    occupancy: PropTypes.array,
    occupancyFilters: PropTypes.array,
    agencyFilter: PropTypes.object,
    routesFiltered: PropTypes.array,
    updateLoading: PropTypes.func.isRequired,
    isChartLoading: PropTypes.bool,
};

OccupancyBarChart.defaultProps = {
    occupancy: [],
    occupancyFilters: [],
    agencyFilter: {},
    routesFiltered: [],
    isChartLoading: true,
};

export default connect(state => ({
    occupancy: getOccupancyState(state),
    occupancyFilters: getOccupancyFilters(state),
    agencyFilter: getAgencyFilters(state),
    routesFiltered: getRoutesFilters(state),
    routesIdMappings: getRoutesIdMappings(state),
    isChartLoading: getIsLoadingChart(state),
}), { updateLoading })(OccupancyBarChart);
