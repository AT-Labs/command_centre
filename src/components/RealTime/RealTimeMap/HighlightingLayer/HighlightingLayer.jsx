import L from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';
import { CircleMarker } from 'react-leaflet';
import { connect } from 'react-redux';
import { getStopDetail } from '../../../../redux/selectors/realtime/detail';
import { getHighlightVehiclePosition } from '../../../../redux/selectors/realtime/vehicles';

export class HighlightingLayer extends React.PureComponent {
    static propTypes = {
        vehiclePosition: PropTypes.object,
        stopDetail: PropTypes.object.isRequired,
    };

    static defaultProps = {
        vehiclePosition: undefined,
    };

    constructor(props) {
        super(props);

        this.highlightingLayerRef = React.createRef();
    }

    componentDidUpdate() {
        if (this.highlightingLayerRef.current) this.highlightingLayerRef.current.leafletElement.bringToBack();
    }

    renderHiglightingLayer = () => {
        const { stopDetail, vehiclePosition } = this.props;
        let newHiglightPosition;

        if (stopDetail.stop_code) {
            newHiglightPosition = new L.LatLng(
                stopDetail.stop_lat,
                stopDetail.stop_lon,
            );
        } else if (vehiclePosition) {
            newHiglightPosition = new L.LatLng(
                vehiclePosition.latitude,
                vehiclePosition.longitude,
            );
        }

        return newHiglightPosition;
    };

    render() {
        const { stopDetail, vehiclePosition } = this.props;
        const layer = ((stopDetail && stopDetail.stop_code) || vehiclePosition)
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
        vehiclePosition: getHighlightVehiclePosition(state),
        stopDetail: getStopDetail(state),
    }),
)(HighlightingLayer);
