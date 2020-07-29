import L from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';
import { CircleMarker } from 'react-leaflet';
import { connect } from 'react-redux';
import { getStopDetail, getVehicleDetail } from '../../../../redux/selectors/realtime/detail';

export class HighlightingLayer extends React.PureComponent {
    static propTypes = {
        vehicleDetail: PropTypes.object.isRequired,
        stopDetail: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.highlightingLayerRef = React.createRef();
    }

    componentDidUpdate = () => {
        if (this.highlightingLayerRef.current) this.highlightingLayerRef.current.leafletElement.bringToBack();
    }

    renderHiglightingLayer = () => {
        const { stopDetail, vehicleDetail } = this.props;
        let newHiglightPosition;

        if (stopDetail.stop_code) {
            newHiglightPosition = new L.LatLng(
                stopDetail.stop_lat,
                stopDetail.stop_lon,
            );
        } else if (vehicleDetail.vehicle) {
            newHiglightPosition = new L.LatLng(
                vehicleDetail.vehicle.position.latitude,
                vehicleDetail.vehicle.position.longitude,
            );
        }

        return newHiglightPosition;
    }

    render() {
        const { stopDetail, vehicleDetail } = this.props;
        const layer = (stopDetail.stop_code || vehicleDetail.vehicle)
            ? (
                <CircleMarker
                    ref={ this.highlightingLayerRef }
                    center={ this.renderHiglightingLayer() }
                    fillColor="gray"
                    fillOpacity={ 0.5 }
                    stroke={ 0 }
                    radius={ 30 } />
            )
            : null;

        return layer;
    }
}

export default connect(
    state => ({
        vehicleDetail: getVehicleDetail(state),
        stopDetail: getStopDetail(state),
    }),
)(HighlightingLayer);
