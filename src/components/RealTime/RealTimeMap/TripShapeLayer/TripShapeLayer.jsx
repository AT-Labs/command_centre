import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { FeatureGroup, Polyline } from 'react-leaflet';
import { connect } from 'react-redux';
import { getShapes } from '../../../../redux/selectors/realtime/detail';
import { ROUTE_COLOR } from '../constants';

class TripShapeLayer extends React.PureComponent {
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
        if (this.polylineGroupRef.current) this.polylineGroupRef.current.leafletElement.bringToBack();
    }

    render() {
        const { shapes } = this.props;
        return !_.isEmpty(shapes)
            ? (
                <FeatureGroup ref={ this.polylineGroupRef }>
                    <Polyline positions={ shapes } weight={ 5 } color={ ROUTE_COLOR } />
                </FeatureGroup>
            )
            : null;
    }
}

export default connect(state => ({
    shapes: getShapes(state),
}))(TripShapeLayer);
