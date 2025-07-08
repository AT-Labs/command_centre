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
import { generateUniqueID } from '../../../../utils/helpers';

L.drawLocal.edit.handlers.edit.tooltip.text = 'Drag the red dots to update the shape for the selected route variant.';

const RouteShapeEditor = (props) => {
    const initialPolyline = props.initialShape ? parseWKT(props.initialShape) : [];
    const [center, setCenter] = useState([-36.8485, 174.7633]);
    const [originalShape, setOriginalShape] = useState(props.routeVariant?.shapeWkt);
    const [originalCoords, setOriginalCoords] = useState([]);
    const [editablePolyline, setEditablePolyline] = useState(initialPolyline);
    const [updatedCoords, setUpdatedCoords] = useState([]);
    const [isEditablePolylineVisible, setIsEditablePolylineVisible] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [diversionPolyline, setDiversionPolyline] = useState([]);

    // Undo stack for editable polyline, each entry: { name: string, polyline: array }
    const [featureGroupKey, setFeatureGroupKey] = useState(0);
    const [editingAction, setEditingAction] = useState(null);
    const [undoStack, setUndoStack] = useState([]);

    const mapRef = useRef();
    const isProcessingEdit = useRef(false);

    // Only allow user to modify the shape when there is no other additional route variants.
    const editable = props.additionalRouteVariants.length === 0;

    const toCoordinates = latlngs => latlngs.map(item => [item.lat, item.lng]);

    const onEdited = (e) => {
        // Leaflet Draw's internal event listeners can get duplicated.
        // This is because the EditControl component (from react-leaflet-draw) attaches event listeners to the map/layers,
        // and when you remount, the old listeners may not be fully cleaned up before new ones are attached.
        // This results in onEdited being called multiple times for a single user edit.
        // This is a known issue with react-leaflet-draw and forced remounts.
        if (isProcessingEdit.current) return;
        isProcessingEdit.current = true;
        setTimeout(() => { isProcessingEdit.current = false; }, 1000); // reset after 1s
        console.log('Called!');
        const { layers } = e;
        layers.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
                const latlngs = layer.getLatLngs();
                if (latlngs.length > 0) {
                    const coordinates = toCoordinates(latlngs);
                    // Record state
                    const newEntry = {
                        name: `Edit ${generateUniqueID()}`,
                        polyline: coordinates,
                    };
                    setEditingAction(newEntry);
                    setUpdatedCoords(coordinates);
                }
            }
        });
    };

    useEffect(() => {
        if (editingAction) {
            // Add the current state to the undo stack
            setUndoStack((prevStack) => {
                const newStack = [...prevStack, editingAction];
                console.log('UndoStack after edit:', newStack.map(s => s.name));
                return newStack;
            });
        }
    }, [editingAction]);

    // Undo handler
    const handleUndo = () => {
        if (undoStack.length < 2) return; // No previous state to revert to

        const previousEntry = undoStack[undoStack.length - 2];
        console.log('Undoing to:', previousEntry.polyline);
        setUndoStack((stack) => {
            const updatedStack = stack.slice(0, -1);
            console.log('UndoStack after undo:', updatedStack.map(s => s.name));
            return updatedStack;
        }); // Remove last entry
        setEditablePolyline(previousEntry.polyline);
        if (previousEntry.polyline === originalCoords) {
            setUpdatedCoords([]);
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

    useEffect(() => {
        if (originalShape?.startsWith('LINESTRING')) {
            const coords = parseWKT(originalShape);
            setOriginalCoords(coords);
            if (props.initialShape) {
                const initialCoords = parseWKT(props.initialShape);
                setEditablePolyline(initialCoords);
                setUpdatedCoords(parseWKT(props.initialShape));
                setUndoStack([{ name: 'Initial', polyline: initialCoords }]);
            } else {
                setEditablePolyline(coords);
                setUndoStack([{ name: 'Initial', polyline: coords }]);
            }

            if (coords.length > 0 && mapRef.current) {
                setCenter(coords[0]);
            }
        }
    }, [originalShape, props.initialShape]);

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
            { !isEditing && editable && (
                <div className="route-shape-editor-buttons">
                    <button type="button" onClick={ handleReset }>Reset</button>
                    <button type="button" onClick={ handleUndo } disabled={ undoStack.length < 2 }>Undo</button>
                </div>
            )}
            <LeafletMap
                key={ props.routeVariant?.routeVariantId }
                center={ center }
                zoom={ 14 }
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
                    <FeatureGroup key={ `base-${featureGroupKey}` }>
                        <Polyline
                            positions={ editablePolyline }
                            color="DEEPSKYBLUE"
                            weight={ 5 }
                            opacity={ props.visible ? 0.5 : 0 }
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
                                <Polyline key={ rv.routeVariantId } positions={ parseWKT(rv.shapeWkt) } color={ rv.color } weight={ 5 } opacity={ 0.5 }>
                                    <Tooltip sticky="true">
                                        { `${rv.routeVariantId} - ${rv.routeLongName}` }
                                    </Tooltip>
                                </Polyline>
                            ))}
                    </FeatureGroup>
                )}
                {diversionPolyline.length > 0 && (
                    <FeatureGroup key={ `diversion-${featureGroupKey}` }>
                        <Polyline
                            positions={ diversionPolyline }
                            color="RED"
                            weight={ 8 }
                            opacity={ 0.8 }
                        >
                            <Tooltip sticky="true">
                                <span>Diversion Shape</span>
                            </Tooltip>
                        </Polyline>
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
