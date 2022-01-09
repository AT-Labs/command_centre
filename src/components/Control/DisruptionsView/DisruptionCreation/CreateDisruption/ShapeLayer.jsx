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
    };

    constructor(props) {
        super(props);
        this.polylineGroupRef = React.createRef();
    }

    renderShapes = () => {
        const { shapes, routeColors } = this.props;
        const routeColorsHexFormat = routeColors.map(color => (color ? `#${color}` : null));

        return shapes.map((shape, index) => {
            if (!shape) {
                return null;
            }

            return (
                <Polyline
                    key={ generateUniqueID() }
                    positions={ shape }
                    weight={ 5 }
                    color={ routeColorsHexFormat[index] || 'DEEPSKYBLUE' } />
            );
        }).filter(shape => !!shape);
    };

    componentDidUpdate() {
        if (this.polylineGroupRef.current) {
            this.polylineGroupRef.current.leafletElement.bringToBack();
        }
    }

    render() {
        const { shapes } = this.props;
        return !isEmpty(shapes.filter(shape => !!shape))
            ? (
                <FeatureGroup ref={ this.polylineGroupRef }>
                    { this.renderShapes() }
                </FeatureGroup>
            )
            : null;
    }
}

export default ShapeLayer;
