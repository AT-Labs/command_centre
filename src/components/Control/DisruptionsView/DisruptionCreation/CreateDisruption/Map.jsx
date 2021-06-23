import React from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import {
    LeafletProvider, Map as LeafletMap, TileLayer, ZoomControl,
} from 'react-leaflet';
import { isEqual, isEmpty } from 'lodash-es';

import { MAP_DATA } from '../../../../../types/map-types';
import ShapeLayer from './ShapeLayer';
import StopsLayer from './StopsLayer';
import { getBoundsToFit, getDisruptionsLoadingState } from '../../../../../redux/selectors/control/disruptions';
import Loader from '../../../../Common/Loader/Loader';
import 'leaflet/dist/leaflet.css';

const SIDE_PANEL_WIDTH_PX = 440;

class Map extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            needBoundsFit: false,
            boundsToFit: [],
        };

        this.mapRef = React.createRef();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            needBoundsFit: !isEqual(nextProps.boundsToFit, prevState.boundsToFit),
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

    shouldComponentUpdate = (nextProps, nextState) => !(isEqual(nextProps, this.props) && isEqual(nextState, this.state));

    componentDidUpdate = () => this.fitBounds();

    fitBounds = () => {
        const leafletInstance = this.mapRef.current.leafletElement;
        const { boundsToFit, shouldOffsetForSidePanel } = this.props;
        const paddingTopLeft = shouldOffsetForSidePanel ? [SIDE_PANEL_WIDTH_PX, 0] : [0, 0];
        if (!isEmpty(boundsToFit) && this.state.needBoundsFit) {
            leafletInstance.fitBounds(boundsToFit, { paddingTopLeft });
        }

        if (this.props.center) {
            leafletInstance.setView(this.props.center, MAP_DATA.zoomLevel.initial);
        }
    };

    handleMove = () => this.setState({ needBoundsFit: false });

    handleZoom = () => this.setState({ needBoundsFit: false });

    handleResize = () => this.mapRef.current.leafletElement.invalidateSize();

    render() {
        const { isLoading } = this.props;
        return (
            <React.Fragment>
                { isLoading && <Loader className="loader-disruptions position-fixed" />}
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
                    >
                        <ZoomControl position="bottomright" />
                        <TileLayer
                            url={ MAP_DATA.tileServerUrl }
                            attribution={ MAP_DATA.copyright }
                            minZoom={ MAP_DATA.zoomLevel.min }
                            maxZoom={ MAP_DATA.zoomLevel.max } />
                        <ShapeLayer shapes={ this.props.shapes } />
                        <StopsLayer stops={ this.props.stops } />
                    </LeafletMap>
                </LeafletProvider>
            </React.Fragment>
        );
    }
}

Map.propTypes = {
    shouldOffsetForSidePanel: PropTypes.bool.isRequired,
    boundsToFit: PropTypes.array.isRequired,
    center: PropTypes.array,
    isLoading: PropTypes.bool,
    stops: PropTypes.array,
    shapes: PropTypes.array,
};

Map.defaultProps = {
    center: null,
    isLoading: false,
    stops: [],
    shapes: [],
};


export default connect(
    state => ({
        boundsToFit: getBoundsToFit(state),
        isLoading: getDisruptionsLoadingState(state),
    }), null, null, { withRef: true },
)(Map);
