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
        const { shapes } = this.props;
        return !_.isEmpty(shapes)
            ? (
                <FeatureGroup ref={ this.polylineGroupRef }>
                    <Polyline positions={ shapes } weight={ 5 } color="DEEPSKYBLUE" />
                </FeatureGroup>
            )
            : null;
    }
}

RouteLayer.propTypes = {
    shapes: PropTypes.array,
};

RouteLayer.defaultProps = {
    shapes: [],
};

export default RouteLayer;
