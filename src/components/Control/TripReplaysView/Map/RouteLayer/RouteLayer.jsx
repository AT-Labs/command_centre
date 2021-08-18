import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { FeatureGroup, Polyline } from 'react-leaflet';

class RouteLayer extends React.PureComponent {
    constructor(props) {
        super(props);

        this.polylineGroupRef = React.createRef();
    }

    componentDidUpdate = () => {
        if (this.polylineGroupRef.current) this.polylineGroupRef.current.leafletElement.bringToBack();
    }

    render() {
        const { shapes, routeColor } = this.props;
        return !_.isEmpty(shapes)
            ? (
                <FeatureGroup ref={ this.polylineGroupRef }>
                    <Polyline positions={ shapes } weight={ 5 } color={ routeColor ? `#${routeColor}` : 'DEEPSKYBLUE' } />
                </FeatureGroup>
            )
            : null;
    }
}

RouteLayer.propTypes = {
    shapes: PropTypes.array,
    routeColor: PropTypes.string,
};

RouteLayer.defaultProps = {
    shapes: [],
    routeColor: null,
};

export default RouteLayer;
