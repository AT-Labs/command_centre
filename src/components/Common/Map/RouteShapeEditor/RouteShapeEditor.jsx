import React, { useState, useRef, useEffect } from 'react';
import { Map as LeafletMap, TileLayer, Polyline, FeatureGroup, Tooltip } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './RouteShapeEditor.scss';
import L from 'leaflet';

import PropTypes from 'prop-types';
import { findDifferences, parseWKT, toCoordinates, toWKT } from './ShapeHelper';
import IconMarker from '../../IconMarker/IconMarker';
import { generateUniqueID } from '../../../../utils/helpers';
import { DEFAULT_AUCKLAND_COORDINATES, DIVERSION_SHAPE_COLOR, DIVERSION_SHAPE_OPACITY,
    DIVERSION_SHAPE_WEIGHT, ROUTE_SHAPE_COLOR, ROUTE_SHAPE_OPACITY, ROUTE_SHAPE_WEIGHT } from './constants';

L.drawLocal.edit.handlers.edit.tooltip.text = 'Drag the red dots to update the shape for the selected route variant.';

// Empty state component for when no route variant is selected
const EmptyRouteState = () => (
    <div style={ {
        height: '100%',
        width: '100%',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        color: '#6c757d',
        fontSize: '16px',
        textAlign: 'center',
        padding: '20px',
    } }>
        <div style={ { marginBottom: '10px' } }>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.447 2.224A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
        </div>
        <div style={ { fontWeight: 'bold', marginBottom: '5px' } }>
            Select a Route Variant
        </div>
        <div style={ { fontSize: '14px' } }>
            Please select a route variant from the dropdown to display the map
        </div>
    </div>
);

const RouteShapeEditor = (props) => {
    // Helper function to check if route variant is valid
    const hasValidRouteVariant = () => props.routeVariant && Object.keys(props.routeVariant).length > 0;

    // Map
    const [center, setCenter] = useState(DEFAULT_AUCKLAND_COORDINATES);
    const mapRef = useRef();

    // Shapes
    const [originalCoords, setOriginalCoords] = useState([]);
    const [editablePolyline, setEditablePolyline] = useState(props.initialShape ? parseWKT(props.initialShape) : []);
    const [isEditablePolylineVisible, setIsEditablePolylineVisible] = useState(true);
    const [diversionPolyline, setDiversionPolyline] = useState([]);
    const [updatedCoords, setUpdatedCoords] = useState([]);

    // Undo stack for editable polyline
    const [featureGroupKey, setFeatureGroupKey] = useState(0); // Key to force remount FeatureGroup Editor
    const [editingAction, setEditingAction] = useState(null); // Last editing action
    const [undoStack, setUndoStack] = useState([]);
    const [mapKey, setMapKey] = useState(0); // Key to force remount map when routeVariant changes

    // Editor
    const [isEditing, setIsEditing] = useState(false);
    const isProcessingEdit = useRef(false);
    // Only allow user to modify the shape when there is no other additional route variants.
    const editable = props.additionalRouteVariants.length === 0 && editablePolyline?.length > 0;

    const onEdited = (e) => {
        // Leaflet Draw's internal event listeners can get duplicated.
        // This is because the EditControl component (from react-leaflet-draw) attaches event listeners to the map/layers,
        // and when you remount, the old listeners may not be fully cleaned up before new ones are attached.
        // This results in onEdited being called multiple times for a single user edit.
        // This is a known issue with old version of react-leaflet-draw and forced remounts.
        if (isProcessingEdit.current) return;
        isProcessingEdit.current = true;
        setTimeout(() => { isProcessingEdit.current = false; }, 1000); // reset after 1s

        // Processing the edited polyline
        const { layers } = e;
        layers.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
                const latlngs = layer.getLatLngs();
                if (latlngs.length > 0) {
                    const coordinates = toCoordinates(latlngs);
                    // Record snapshot for undo
                    const newSnapshotAction = {
                        name: `Edit ${generateUniqueID()}`,
                        polyline: coordinates,
                    };
                    setEditingAction(newSnapshotAction);
                    setUpdatedCoords(coordinates);
                }
            }
        });
    };

    // Undo handler
    const handleUndo = () => {
        // Undo stack should have at least 2 entries (Initial + New) to revert to a previous state
        if (undoStack.length < 2) return; // No previous state to revert to
        const previousEntry = undoStack[undoStack.length - 2];
        setUndoStack(stack => stack.slice(0, -1)); // Remove last entry
        setEditablePolyline(previousEntry.polyline);
        if (previousEntry.polyline === originalCoords) {
            setUpdatedCoords([]); // This means there is no updated shape
        } else {
            setUpdatedCoords(previousEntry.polyline);
        }
        setFeatureGroupKey(k => k + 1);
    };

    // Reset handler
    const handleReset = () => {
        setEditablePolyline(originalCoords);
        setUpdatedCoords([]);
        setUndoStack([{ name: 'Initial', polyline: originalCoords }]);
        setFeatureGroupKey(k => k + 1);
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

    // Record the last editing action to the undo stack
    useEffect(() => {
        if (editingAction) {
            // Add the current state to the undo stack
            setUndoStack(prevStack => [...prevStack, editingAction]);
        }
    }, [editingAction]);

    useEffect(() => {
        if (props.initialShape) {
            const initialCoords = parseWKT(props.initialShape);
            setEditablePolyline(initialCoords);
            setUpdatedCoords(parseWKT(props.initialShape));
            setUndoStack([{ name: 'Initial', polyline: initialCoords }]);

            // Force map update when initialShape changes
            setMapKey(prev => prev + 1);
        } else {
            setEditablePolyline(originalCoords);
            setUndoStack([{ name: 'Initial', polyline: originalCoords }]);
        }
    }, [originalCoords, props.initialShape]);

    useEffect(() => {
        const originalShape = props.routeVariant?.shapeWkt;
        if (originalShape?.startsWith('LINESTRING')) {
            const coords = parseWKT(props.routeVariant?.shapeWkt);
            setOriginalCoords(coords);
            setUpdatedCoords([]);
            setEditablePolyline(coords);
            if (coords.length > 0) {
                setCenter(coords[0]);
            }
        } else {
            // Reset state when no valid shape
            setOriginalCoords([]);
            setUpdatedCoords([]);
            setEditablePolyline([]);
        }

        // Force map remount when routeVariant changes
        setMapKey(prev => prev + 1);

        // This is to fix the leaflet issue where the state of editor preserves previous layer.
        // This triggers a force reload
        setIsEditablePolylineVisible(false);
        const timer = setTimeout(() => {
            setIsEditablePolylineVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [props.routeVariant, props.initialShape]);

    // Additional effect to force map update when routeVariant changes
    useEffect(() => {
        if (props.routeVariant) {
            // Force map update with a small delay
            const timer = setTimeout(() => {
                setMapKey(prev => prev + 1);
            }, 50);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [props.routeVariant?.routeVariantId]);

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
        <div className="map route-shape-editor-container" style={ { height: '100%', width: '100%' } }>
            { !isEditing && editable && (
                <div className="route-shape-editor-buttons">
                    <button type="button" onClick={ handleReset }>Reset</button>
                    <button type="button" onClick={ handleUndo } disabled={ undoStack.length < 2 }>Undo</button>
                </div>
            )}
            {/* Placeholder when no route variant is selected */}
            {!hasValidRouteVariant() && <EmptyRouteState />}
            {/* Map when route variant is selected */}
            {hasValidRouteVariant() && (
                <LeafletMap
                    key={ `${props.routeVariant?.routeVariantId}-${mapKey}` }
                    center={ center }
                    zoom={ 16 }
                    maxZoom={ 19 }
                    style={ { height: '100%', width: '100%' } }
                    ref={ mapRef }
                    whenReady={ (mapInstance) => {
                        // Create a custom pane for the diversion polyline
                        const diversionPane = mapInstance.target.createPane('diversionPane');
                        diversionPane.style.zIndex = 650; // Set a higher zIndex to ensure it's on top
                    } }
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
                    {isEditablePolylineVisible && (
                        <FeatureGroup key={ `base-${props.routeVariant?.routeVariantId}-${mapKey}-${featureGroupKey}` }>
                            <Polyline
                                positions={ editablePolyline }
                                color={ ROUTE_SHAPE_COLOR }
                                weight={ ROUTE_SHAPE_WEIGHT }
                                opacity={ props.visible ? ROUTE_SHAPE_OPACITY : 0 }
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
                    {!isEditing && (
                        <FeatureGroup>
                            { props.additionalRouteVariants
                                .filter(rv => rv.visible)
                                .map(rv => (
                                    <Polyline key={ rv.routeVariantId }
                                        positions={ parseWKT(rv.shapeWkt) }
                                        color={ rv.color }
                                        weight={ ROUTE_SHAPE_WEIGHT }
                                        opacity={ ROUTE_SHAPE_OPACITY }>
                                        <Tooltip sticky="true">
                                            { `${rv.routeVariantId} - ${rv.routeLongName}` }
                                        </Tooltip>
                                    </Polyline>
                                ))}
                        </FeatureGroup>
                    )}
                    {diversionPolyline.length > 0 && (
                        <FeatureGroup key={ `diversion-${props.routeVariant?.routeVariantId}-${mapKey}-${featureGroupKey}` }>
                            <Polyline
                                positions={ diversionPolyline }
                                color={ DIVERSION_SHAPE_COLOR }
                                weight={ DIVERSION_SHAPE_WEIGHT }
                                opacity={ DIVERSION_SHAPE_OPACITY }
                            >
                                <Tooltip sticky="true">
                                    <span>Diversion Shape</span>
                                </Tooltip>
                            </Polyline>
                        </FeatureGroup>
                    )}
                </LeafletMap>
            )}
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
