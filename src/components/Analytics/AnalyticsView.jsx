import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';

import OccupancyBarChart from './OccupancyBarChart';
import Filters from './Filters';

import { getOccupancy } from '../../redux/actions/analytics/occupancy';

import './style.scss';

const AnalyticsView = (props) => {
    useEffect(() => {
        props.getOccupancy();
    });

    useEffect(() => {
        const getOccupancyInterval = setInterval(() => {
            props.getOccupancy(Math.floor((Date.now() / 1000) - 300));
        }, 30 * 1000);
        return () => clearInterval(getOccupancyInterval);
    });

    return (
        <section id="analytics" className="analytics-view">
            <div className="p-4">
                <h1>Real-time Occupancy</h1>
                <h5 className="font-normal">Explore vehicle occupancy on real-time data that is updated every minute.</h5>
                <div className="row px-2">
                    <div className="col-3 mt-3 pt-3 analytics-view__filters-sidebar">
                        <Filters />
                    </div>
                    <div className="col-9">
                        <OccupancyBarChart />
                    </div>
                </div>
            </div>
        </section>
    );
};

AnalyticsView.propTypes = {
    getOccupancy: PropTypes.func.isRequired,
};

export default connect(null, { getOccupancy })(AnalyticsView);
