import React, { useState, useRef, useEffect } from 'react';
import { Map as LeafletMap, TileLayer, Polyline, FeatureGroup, Tooltip } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './RouteShapeEditor.scss';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { findDifferences, getMinDistanceToPolyline, parseWKT, toWKT } from './ShapeHelper';
import IconMarker from '../../IconMarker/IconMarker';

L.drawLocal.edit.handlers.edit.tooltip.text = 'Drag the red dots to update the shape for the selected route variant.';

const RouteShapeEditor = (props) => {
    const [center, setCenter] = useState([-36.8485, 174.7633]);
    const [originalShape, setOriginalShape] = useState(props.routeVariant?.shapeWkt);
    const [originalCoords, setOriginalCoords] = useState([]);
    const [updatedCoords, setUpdatedCoords] = useState([]);
    const [diversionPolyline, setDiversionPolyline] = useState([]);
    const [editablePolyline, setEditablePolyline] = useState([]);
    const [isEditablePolylineVisible, setIsEditablePolylineVisible] = useState(true);
    const [showStops, setShowStops] = useState(true);
    const [highlightedStops, setHighlightedStops] = useState([]);

    const mapRef = useRef();
    const featureGroupRef = useRef();

    const toCoordinates = latlngs => latlngs.map(item => [item.lat, item.lng]);

    const onEditStart = () => {
        setShowStops(false);
    };

    const onEditStop = () => {
        setShowStops(true);
    };

    const onEdited = (e) => {
        const { layers } = e;
        layers.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
                const latlngs = layer.getLatLngs();
                if (latlngs.length > 0) {
                    const coordinates = toCoordinates(latlngs);
                    setUpdatedCoords(coordinates);
                }
            }
        });
    };

    useEffect(() => {
        if (originalShape?.startsWith('LINESTRING')) {
            const coords = parseWKT(originalShape);
            setOriginalCoords(coords);
            setEditablePolyline(coords);
            if (coords.length > 0 && mapRef.current) {
                setCenter(coords[0]);
            }
        }
    }, [originalShape]);

    useEffect(() => {
        if (props.routeVariant?.shapeWkt) {
            setOriginalShape(props.routeVariant.shapeWkt);
            setUpdatedCoords([]);
        }

        // This is to fix the leaflet issue where the state of editor preserves previous layer.
        // This triggers a force reload
        setIsEditablePolylineVisible(false);
        const timer = setTimeout(() => {
            setIsEditablePolylineVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [props.routeVariant]);

    useEffect(() => {
        if (updatedCoords.length > 0) {
            // Calculate diversion
            const difference = findDifferences(originalCoords, updatedCoords);
            const updatedDiversionShape = toWKT(difference);
            if (difference.length > 0) {
                setDiversionPolyline(parseWKT(toWKT(difference)));
            }

            // Find effected stops
            const map = mapRef.current.leafletElement;
            const polylineLatLngs = updatedCoords.map(coord => L.latLng(coord[0], coord[1]));
            const { stops } = props.routeVariant;
            const highlighted = stops
                .filter((stop) => {
                    const stopLatLng = L.latLng(stop.stopLat, stop.stopLon);
                    const minDistance = getMinDistanceToPolyline(stopLatLng, polylineLatLngs, map);
                    return minDistance > props.stopCheckRadius;
                });
            setHighlightedStops(highlighted);
            props.onShapeUpdated(updatedDiversionShape, toWKT(updatedCoords), highlighted);
        } else {
            setDiversionPolyline([]);
            setHighlightedStops([]);
            props.onShapeUpdated(null, null, []);
        }
    }, [updatedCoords, props.stopCheckRadius]);

    return (
        <div className="map route-shape-editor-container">
            <LeafletMap
                key={ props.routeVariant?.routeVariantId }
                center={ center }
                zoom={ 16 }
                style={ { height: '100%', width: '100%' } }
                ref={ mapRef }
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {showStops && props.routeVariant?.stops?.length > 0 && (
                    <FeatureGroup>
                        {props.routeVariant.stops.map((stop) => {
                            const isHighlighted = highlightedStops.includes(stop);
                            const marker = stop.stopLat ? (
                                <IconMarker
                                    key={ stop.stopId }
                                    location={ [stop.stopLat, stop.stopLon] }
                                    imageName={ isHighlighted ? 'bus-stop-red' : 'bus-stop' }
                                    size={ 24 }
                                >
                                    <Tooltip>
                                        {`${stop.stopCode} - ${stop.stopName}`}
                                    </Tooltip>
                                </IconMarker>
                            ) : null;
                            return marker;
                        })}
                    </FeatureGroup>
                )}
                {isEditablePolylineVisible && editablePolyline.length > 0 && (
                    <FeatureGroup ref={ featureGroupRef }>
                        <Polyline
                            positions={ editablePolyline }
                            color="DEEPSKYBLUE"
                            weight={ 5 }
                        />
                        <EditControl
                            position="topleft"
                            onEditStart={ onEditStart }
                            onEdited={ onEdited }
                            onEditStop={ onEditStop }
                            draw={ {
                                rectangle: false,
                                circle: false,
                                circlemarker: false,
                                marker: false,
                                polygon: false,
                                polyline: false,
                            } }
                            edit={ { edit: true, remove: false } }
                        />
                    </FeatureGroup>
                )}
                {diversionPolyline.length > 0 && (
                    <FeatureGroup>
                        <Polyline
                            positions={ diversionPolyline }
                            color="RED"
                            weight={ 5 }
                        />
                    </FeatureGroup>
                )}
            </LeafletMap>
        </div>
    );
};

RouteShapeEditor.propTypes = {
    routeVariant: PropTypes.object,
    stopCheckRadius: PropTypes.number,
    onShapeUpdated: PropTypes.func.isRequired,
};

RouteShapeEditor.defaultProps = {
    routeVariant: {},
    stopCheckRadius: 20,
};

export default RouteShapeEditor;
