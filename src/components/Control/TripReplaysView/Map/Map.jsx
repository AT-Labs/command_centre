import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import {
    LeafletProvider, Map as LeafletMap, TileLayer, ZoomControl,
} from 'react-leaflet';
import { getBoundsToFit } from '../../../../redux/selectors/control/tripReplays/map';
import { getRouteColor, getShape, getStops } from '../../../../redux/selectors/control/tripReplays/currentTrip';
import SelectedAddressMarker from '../../../RealTime/RealTimeMap/SelectedAddressMarker/SelectedAddressMarker';
import RouteLayer from './RouteLayer/RouteLayer';
import StopsLayer from './StopsLayer/StopsLayer';
import StopThresholdsLayer from './StopThresholdsLayer/StopThresholdsLayer';
import VehiclePositionsLayer from './VehiclePositionsLayer/VehiclePositionsLayer';
import { MAP_DATA } from '../../../../types/map-types';
import 'leaflet/dist/leaflet.css';

const SIDE_PANEL_WIDTH_PX = 440;

class Map extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            needBoundsFit: false,
            boundsToFit: [],
            shape: [],
            stops: [],
            vehiclePositions: [],
        };

        this.mapRef = React.createRef();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            needBoundsFit: !_.isEqual(nextProps.boundsToFit, prevState.boundsToFit),
            boundsToFit: nextProps.boundsToFit,
        };
    }

    // Temporary workaround to prevent focus on map elements on keyboard navigation.
    // FocusTrap doesn't allow us to handle the two side panels simultaneously as we need on RT section.
    // It only listens to one focusTrap at a time (https://github.com/davidtheclark/focus-trap#one-at-a-time)
    // This approach skips the map on tab, forwards and backwards, and allows us to access all other elements without having to refactor
    // the whole structure, which might possibly be the other option.
    componentDidMount = () => {
        document.querySelector('.map').addEventListener('keyup', this.skipMapOnTab);
    };

    skipMapOnTab = (event) => {
        const TabKeyCode = 9;
        const { shiftKey, keyCode } = event;
        if (keyCode === TabKeyCode && !shiftKey) document.querySelector('.vehicle-filters__bus').focus();
        else if (keyCode === TabKeyCode && shiftKey) document.querySelector('.omni-search .search__input').focus();
    };
    // ================================= Temporary workaround ends

    shouldComponentUpdate = (nextProps, nextState) => !(_.isEqual(nextProps, this.props) && _.isEqual(nextState, this.state));

    componentDidUpdate = () => this.fitBounds();

    fitBounds = () => {
        const leafletInstance = this.mapRef.current.leafletElement;
        const { boundsToFit, shouldOffsetForSidePanel } = this.props;
        const paddingTopLeft = shouldOffsetForSidePanel ? [SIDE_PANEL_WIDTH_PX, 0] : [0, 0];
        if (!_.isEmpty(boundsToFit) && this.state.needBoundsFit) {
            leafletInstance.fitBounds(boundsToFit, { paddingTopLeft });
        }

        if (this.props.center) {
            leafletInstance.setView(this.props.center, MAP_DATA.zoomLevel.initial);
        }
    };

    handleResize = () => this.mapRef.current.leafletElement.invalidateSize();

    handleMove = () => this.setState({ needBoundsFit: false });

    handleZoom = () => this.setState({ needBoundsFit: false });

    render() {
        const { shape, stops, routeColor } = this.props;
        return (
            <LeafletProvider>
                <LeafletMap
                    className="map flex-grow-1"
                    center={ MAP_DATA.centerLocation }
                    zoom={ MAP_DATA.zoomLevel.initial }
                    preferCanvas
                    zoomControl={ false }
                    ref={ this.mapRef }
                    onMoveend={ this.handleMove }
                    onZoomend={ this.handleZoom }
                    onResize={ this.handleResize }
                    onPopupClose={ this.props.handlePopupClose }>
                    <ZoomControl position="bottomright" />
                    <SelectedAddressMarker />
                    <TileLayer
                        url={ MAP_DATA.tileServerUrl }
                        attribution={ MAP_DATA.copyright }
                        minZoom={ MAP_DATA.zoomLevel.min }
                        maxZoom={ MAP_DATA.zoomLevel.max } />
                    <RouteLayer shapes={ [shape] } routeColor={ routeColor } />
                    <StopThresholdsLayer route={ shape } stops={ stops } />
                    <StopsLayer
                        stops={ stops }
                        selectedKeyEvent={ this.props.selectedKeyEvent }
                        selectedKeyEventId={ this.props.selectedKeyEventId }
                        hoveredKeyEvent={ this.props.hoveredKeyEvent }
                        clearSelectedKeyEvent={ this.props.clearSelectedKeyEvent } />
                    <VehiclePositionsLayer
                        selectedKeyEvent={ this.props.selectedKeyEvent }
                        selectedKeyEventId={ this.props.selectedKeyEventId }
                        hoveredKeyEvent={ this.props.hoveredKeyEvent }
                        clearSelectedKeyEvent={ this.props.clearSelectedKeyEvent } />
                </LeafletMap>
            </LeafletProvider>
        );
    }
}

Map.propTypes = {
    shouldOffsetForSidePanel: PropTypes.bool.isRequired,
    boundsToFit: PropTypes.array.isRequired,
    shape: PropTypes.array.isRequired,
    stops: PropTypes.array.isRequired,
    selectedKeyEventId: PropTypes.string,
    selectedKeyEvent: PropTypes.object,
    hoveredKeyEvent: PropTypes.string,
    handlePopupClose: PropTypes.func.isRequired,
    center: PropTypes.array,
    clearSelectedKeyEvent: PropTypes.func.isRequired,
    routeColor: PropTypes.string,
};

Map.defaultProps = {
    selectedKeyEventId: null,
    selectedKeyEvent: null,
    hoveredKeyEvent: null,
    center: null,
    routeColor: null,
};

export default connect(
    state => ({
        boundsToFit: getBoundsToFit(state),
        shape: getShape(state),
        stops: getStops(state),
        routeColor: getRouteColor(state),
    }), null, null, { withRef: true },
)(Map);
