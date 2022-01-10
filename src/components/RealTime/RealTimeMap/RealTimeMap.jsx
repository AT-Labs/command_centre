import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import {
    LeafletProvider, Map as LeafletMap, TileLayer, ZoomControl,
} from 'react-leaflet';

import { recenterMap } from '../../../redux/actions/realtime/map';
import { getBoundsToFit, getMapRecenterStatus, getMaxZoom, getShouldOffsetForSidePanel } from '../../../redux/selectors/realtime/map';
import HighlightingLayer from './HighlightingLayer/HighlightingLayer';
import SelectedAddressMarker from './SelectedAddressMarker/SelectedAddressMarker';
import StopsLayer from './StopsLayer/StopsLayer';
import SelectedStopsMarker from './StopsLayer/SelectedStopsMarker';
import TripShapeLayer from './TripShapeLayer/TripShapeLayer';
import VehicleLayer from './VehicleLayer/VehicleLayer';
import { MAP_DATA } from '../../../types/map-types';
import 'leaflet/dist/leaflet.css';

const SIDE_PANEL_WIDTH_PX = 440;

class RealTimeMap extends React.Component {
    static propTypes = {
        shouldMapBeRecentered: PropTypes.bool.isRequired,
        shouldOffsetForSidePanel: PropTypes.bool.isRequired,
        dispatch: PropTypes.func.isRequired,
        boundsToFit: PropTypes.array.isRequired,
        maxZoom: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            needBoundsFit: true,
            boundsToFit: [],
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
        const { boundsToFit, shouldMapBeRecentered, shouldOffsetForSidePanel, maxZoom } = this.props;
        const paddingTopLeft = shouldOffsetForSidePanel ? [SIDE_PANEL_WIDTH_PX, 0] : [0, 0];
        if (!_.isEmpty(boundsToFit) && this.state.needBoundsFit) {
            const options = maxZoom ? { maxZoom, paddingTopLeft } : { paddingTopLeft };
            leafletInstance.fitBounds(boundsToFit, options);
        }

        if (shouldMapBeRecentered) {
            leafletInstance.setView(MAP_DATA.centerLocation, MAP_DATA.zoomLevel.initial);
            this.props.dispatch(recenterMap(false));
        }
    };

    handleResize = () => this.mapRef.current.leafletElement.invalidateSize();

    handleMove = () => this.setState({ needBoundsFit: false });

    handleZoom = () => this.setState({ needBoundsFit: false });

    render() {
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
                    onResize={ this.handleResize }>
                    <ZoomControl position="bottomright" />
                    <SelectedAddressMarker />
                    <TileLayer
                        url={ MAP_DATA.tileServerUrl }
                        attribution={ MAP_DATA.copyright }
                        minZoom={ MAP_DATA.zoomLevel.min }
                        maxZoom={ MAP_DATA.zoomLevel.max } />
                    <TripShapeLayer />
                    <StopsLayer />
                    <HighlightingLayer />
                    <SelectedStopsMarker />
                    <VehicleLayer />
                </LeafletMap>
            </LeafletProvider>
        );
    }
}

export default connect(
    state => ({
        shouldMapBeRecentered: getMapRecenterStatus(state),
        shouldOffsetForSidePanel: getShouldOffsetForSidePanel(state),
        boundsToFit: getBoundsToFit(state),
        maxZoom: getMaxZoom(state),
    }), null, null, { withRef: true },
)(RealTimeMap);
