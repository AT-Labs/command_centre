import React, { useState, useRef, useEffect } from 'react';
import { Map as LeafletMap, TileLayer, Polyline, FeatureGroup, Tooltip } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './RouteShapeEditor.scss';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { findDifferences, parseWKT, toWKT } from './ShapeHelper';
import IconMarker from '../../IconMarker/IconMarker';

L.drawLocal.edit.handlers.edit.tooltip.text = 'Drag the red dots to update the shape for the selected route variant.';

const RouteShapeEditor = (props) => {
    const [center, setCenter] = useState([-36.8485, 174.7633]);
    const [originalShape, setOriginalShape] = useState(props.routeVariant?.shapeWkt);
    const [originalCoords, setOriginalCoords] = useState([]);
    const [updatedCoords, setUpdatedCoords] = useState(props.initialShape ? parseWKT(props.initialShape) : []); // For editing mode
    const [diversionPolyline, setDiversionPolyline] = useState([]);
    const [editablePolyline, setEditablePolyline] = useState([]);
    const [isEditablePolylineVisible, setIsEditablePolylineVisible] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const mapRef = useRef();
    const featureGroupRef = useRef();

    // Only allow user to modify the shape when there is no other additional route variants.
    const editable = props.additionalRouteVariants.length === 0;

    const toCoordinates = latlngs => latlngs.map(item => [item.lat, item.lng]);

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

    // Collect all unique stops from main route and additional variants
    const getAllUniqueStops = () => {
        const stopMap = new Map();

        // Add stops from main route
        if (props.visible) {
            props.routeVariant?.stops?.forEach((stop) => {
                if (stop.stopId) {
                    stopMap.set(stop.stopId, stop);
                }
            });
        }

        // Add stops from additional visible route variants
        props.additionalRouteVariants.filter(rv => rv.visible).forEach((variant) => {
            variant.stops?.forEach((stop) => {
                if (stop.stopId) {
                    stopMap.set(stop.stopId, stop);
                }
            });
        });

        return Array.from(stopMap.values());
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

            props.onShapeUpdated(updatedDiversionShape, toWKT(updatedCoords));
        } else {
            setDiversionPolyline([]);
            props.onShapeUpdated(null, null);
        }
    }, [updatedCoords, props.stopCheckRadius]);

    return (
        <div className="map route-shape-editor-container">
            <LeafletMap
                key={ props.routeVariant?.routeVariantId }
                center={ center }
                zoom={ 14 }
                style={ { height: '100%', width: '100%' } }
                ref={ mapRef }
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {!isEditing && props.routeVariant?.stops?.length > 0 && (
                    <FeatureGroup>
                        {getAllUniqueStops().map((stop) => {
                            const isHighlighted = props.highlightedStops.includes(stop.stopId);
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
                            opacity={ props.visible ? 0.8 : 0 }
                        >
                            <Tooltip sticky="true">
                                { `${props.routeVariant?.routeVariantId} - ${props.routeVariant?.routeLongName}` }
                            </Tooltip>
                        </Polyline>
                        {editable && (
                            <EditControl
                                position="topleft"
                                onEditStart={ () => setIsEditing(true) }
                                onEdited={ onEdited }
                                onEditStop={ () => setIsEditing(false) }
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
                        )}

                    </FeatureGroup>
                )}
                {diversionPolyline.length > 0 && (
                    <FeatureGroup>
                        <Polyline
                            positions={ diversionPolyline }
                            color="RED"
                            weight={ 5 }
                        >
                            <Tooltip sticky="true">
                                <spa>Diversion Shape</spa>
                            </Tooltip>
                        </Polyline>
                    </FeatureGroup>
                )}
                {!isEditing && (
                    <FeatureGroup>
                        { props.additionalRouteVariants
                            .filter(rv => rv.visible)
                            .map(rv => (
                                <Polyline key={ rv.routeVariantId } positions={ parseWKT(rv.shapeWkt) } color={ rv.color } weight={ 5 } opacity={ 0.6 }>
                                    <Tooltip sticky="true">
                                        { `${rv.routeVariantId} - ${rv.routeLongName}` }
                                    </Tooltip>
                                </Polyline>
                            ))}
                    </FeatureGroup>
                )}
            </LeafletMap>
        </div>
    );
};

RouteShapeEditor.propTypes = {
    routeVariant: PropTypes.object,
    initialShape: PropTypes.string,
    highlightedStops: PropTypes.array,
    visible: PropTypes.bool,
    additionalRouteVariants: PropTypes.array,
    stopCheckRadius: PropTypes.number,
    onShapeUpdated: PropTypes.func.isRequired,
};

RouteShapeEditor.defaultProps = {
    visible: true,
    routeVariant: {},
    initialShape: null,
    highlightedStops: [],
    additionalRouteVariants: [],
    stopCheckRadius: 20,
};

export default RouteShapeEditor;
