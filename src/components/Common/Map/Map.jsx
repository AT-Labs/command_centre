import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isEqual, isEmpty } from 'lodash-es';
import {
    LeafletProvider, Map as LeafletMap, TileLayer, ZoomControl,
} from 'react-leaflet';

import { MAP_DATA } from '../../../types/map-types';
import 'leaflet/dist/leaflet.css';
import Loader from '../Loader/Loader';
import { SIDE_PANEL_WIDTH_PX } from './constants';

export const Map = (props) => {
    const mapRef = React.useRef();
    const [needBoundsFit, setNeedBoundsFit] = useState(true);
    const [boundsToFit, setBoundsToFit] = useState([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    const fitBounds = () => {
        const leafletInstance = mapRef.current.leafletElement;
        const { shouldOffsetForSidePanel, maxZoom, sidePanelWidthPX } = props;
        const paddingTopLeft = shouldOffsetForSidePanel ? [sidePanelWidthPX, 0] : [0, 0];
        if (!isEmpty(props.boundsToFit) && needBoundsFit) {
            const options = maxZoom ? { maxZoom, paddingTopLeft } : { paddingTopLeft };
            leafletInstance.fitBounds(props.boundsToFit, options);
        }

        if (props.center) {
            leafletInstance.setView(props.center, MAP_DATA.zoomLevel.initial);
            if (props.recenterMap) {
                props.recenterMap(false);
            }
        }
    };

    useEffect(() => {
        if (props.center) {
            const leafletInstance = mapRef.current.leafletElement;
            leafletInstance.setView(props.center, MAP_DATA.zoomLevel.initial);
        }
    }, [props.center]);

    useEffect(() => {
        fitBounds();
    }, [needBoundsFit]);

    useEffect(() => {
        setNeedBoundsFit(!isEqual(props.boundsToFit, boundsToFit));
        setBoundsToFit(props.boundsToFit);
    }, [props.boundsToFit]);

    useEffect(() => {
        const map = mapRef.current.leafletElement;
        map.whenReady(() => setMapLoaded(true));
    }, []);

    const handleResize = () => mapRef.current.leafletElement.invalidateSize();

    const handleMove = () => {
        setNeedBoundsFit(false);
        if (props.onViewChanged && mapLoaded) {
            const map = mapRef.current.leafletElement;
            const update = {
                center: map.getCenter(),
                zoom: map.getZoom(),
                bounds: map.getBounds(),
            };
            props.onViewChanged(update);
        }
    };

    const handleZoom = () => setNeedBoundsFit(false);

    const childrenWithProps = React.Children.map(props.children, child => (child ? React.cloneElement(child, { tabIndexOverride: props.tabIndexOverride }) : null));

    return (
        <>
            { props.isLoading && <Loader className="position-fixed" />}
            <LeafletProvider value="">
                <LeafletMap
                    className="map flex-grow-1"
                    center={ MAP_DATA.centerLocation }
                    zoom={ MAP_DATA.zoomLevel.initial }
                    preferCanvas
                    zoomControl={ false }
                    ref={ mapRef }
                    onMoveend={ handleMove }
                    onZoomend={ handleZoom }
                    onResize={ handleResize }
                    onPopupClose={ props.handlePopupClose }>
                    <ZoomControl position="bottomright" />
                    <TileLayer
                        url={ MAP_DATA.tileServerUrl }
                        attribution={ MAP_DATA.copyright }
                        minZoom={ MAP_DATA.zoomLevel.min }
                        maxZoom={ MAP_DATA.zoomLevel.max } />
                    { childrenWithProps }
                </LeafletMap>
            </LeafletProvider>
        </>
    );
};

Map.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
    recenterMap: PropTypes.func,
    maxZoom: PropTypes.number,
    shouldOffsetForSidePanel: PropTypes.bool.isRequired,
    boundsToFit: PropTypes.array.isRequired,
    center: PropTypes.array,
    isLoading: PropTypes.bool,
    handlePopupClose: PropTypes.func,
    sidePanelWidthPX: PropTypes.number,
    tabIndexOverride: PropTypes.number,
    onViewChanged: PropTypes.func,
};

Map.defaultProps = {
    children: [],
    recenterMap: null,
    maxZoom: 0,
    center: null,
    isLoading: false,
    handlePopupClose: () => {},
    sidePanelWidthPX: SIDE_PANEL_WIDTH_PX,
    tabIndexOverride: -1,
    onViewChanged: undefined,
};
