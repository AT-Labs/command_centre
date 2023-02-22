import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import Plotly from 'plotly.js-basic-dist-min';

import { getTopRoutes } from '../../redux/selectors/analytics/occupancy';

const TopRoutesBarChart = (props) => {
    const initBarDataState = {
        x: [], // date
        y: [], // total
        name: 'Top Routes',
        type: 'bar',
    };
    const layout = {
        barmode: 'stack',
        clickmode: 'event',
        hovermode: 'closest',
        width: 240,
        height: 360,
        title: 'Top Routes',
    };
    const [topRoutes, setTopRoutes] = useState([]);
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const topRoutesRef = useRef(null);

    useEffect(() => {
        const container = topRoutesRef.current;
        if (props.topRoutes.length) {
            const topTenRoutes = props.topRoutes.slice(0, 10);
            setTopRoutes(topTenRoutes);

            initBarDataState.x = topRoutes.map(route => route.route_id);
            initBarDataState.y = topRoutes.map(route => route.total);

            if (!shouldUpdate) {
                Plotly.newPlot(
                    container,
                    [initBarDataState],
                    layout,
                );
                setShouldUpdate(true);
            } else {
                container.data = [initBarDataState];
                Plotly.redraw(container);
            }
        }
    }, [props.topRoutes]);

    return (<div ref={ topRoutesRef } />);
};

TopRoutesBarChart.propTypes = {
    topRoutes: PropTypes.array,
};

TopRoutesBarChart.defaultProps = {
    topRoutes: [],
};

export default connect(state => ({
    topRoutes: getTopRoutes(state),
}), { })(TopRoutesBarChart);
