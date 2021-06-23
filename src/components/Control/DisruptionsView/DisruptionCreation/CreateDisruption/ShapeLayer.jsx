import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { FeatureGroup, Polyline } from 'react-leaflet';

class ShapeLayer extends React.Component {
    static propTypes = {
        shapes: PropTypes.array,
    };

    static defaultProps = {
        shapes: [],
    }

    constructor(props) {
        super(props);
        this.polylineGroupRef = React.createRef();
    }

    componentDidUpdate = () => {
        if (this.polylineGroupRef.current) {
            this.polylineGroupRef.current.leafletElement.bringToBack();
        }
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

export default ShapeLayer;
