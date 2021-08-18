import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash-es';
import { FeatureGroup, Polyline } from 'react-leaflet';
import { generateUniqueID } from '../../../../../utils/helpers';

class ShapeLayer extends React.Component {
    static propTypes = {
        shapes: PropTypes.array,
        routeColors: PropTypes.array,
    };

    static defaultProps = {
        shapes: [],
        routeColors: [],
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
        const { shapes, routeColors } = this.props;
        const routeColorsHexFormat = routeColors.map(color => `#${color}`);
        return !isEmpty(shapes)
            ? (
                <FeatureGroup ref={ this.polylineGroupRef }>
                    { shapes.map((shape, index) => (
                        <Polyline
                            key={ generateUniqueID() }
                            positions={ shape }
                            weight={ 5 }
                            color={ routeColorsHexFormat[index] || 'DEEPSKYBLUE' } />
                    )) }
                </FeatureGroup>
            )
            : null;
    }
}

export default ShapeLayer;
