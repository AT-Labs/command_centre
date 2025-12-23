import React, { useState, useRef, useEffect } from 'react';
import { Map as LeafletMap, TileLayer, Polyline, FeatureGroup, Tooltip } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './RouteShapeEditor.scss';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { findDifferences, mergeCoordinates, parseWKT, thinCoordinates, toCoordinates, toWKT } from './ShapeHelper';
import IconMarker from '../../IconMarker/IconMarker';
import { generateUniqueID } from '../../../../utils/helpers';
import { DEFAULT_AUCKLAND_COORDINATES, DIVERSION_SHAPE_COLOR, DIVERSION_SHAPE_OPACITY,
    DIVERSION_SHAPE_WEIGHT, EDITOR_BUTTON_TOOLTIP, EDITOR_HANDLER_TOOLTIP, ROUTE_SHAPE_COLOR, ROUTE_SHAPE_OPACITY,
    ROUTE_SHAPE_WEIGHT, TOMTOM_STOP_POINTS_LIMIT } from './constants';
import { calculateRoute } from '../../../../utils/transmitters/traffic-api';
import InstructionPanel from './InstructionPanel';
import { captureError } from '../../../../utils/logger';
import { FetchTomTomShapeError } from './FetchTomTomShapeError';

L.drawLocal.edit.handlers.edit.tooltip.text = EDITOR_HANDLER_TOOLTIP;
L.drawLocal.edit.toolbar.buttons.edit = EDITOR_BUTTON_TOOLTIP;

const RouteShapeEditor = (props) => {
    // Map
    const [center, setCenter] = useState(DEFAULT_AUCKLAND_COORDINATES);
    const mapRef = useRef();

    // Shapes
    const [originalCoords, setOriginalCoords] = useState([]);
    const [editablePolyline, setEditablePolyline] = useState(props.initialShape ? parseWKT(props.initialShape) : []);
    const [isEditablePolylineVisible, setIsEditablePolylineVisible] = useState(true);
    const [diversionPolyline, setDiversionPolyline] = useState([]);
    const [editedCoords, setEditedCoords] = useState([]); // From editing
    const [updatedCoords, setUpdatedCoords] = useState([]); // From TomTom or editing

    // Undo stack for editable polyline
    const [featureGroupKey, setFeatureGroupKey] = useState(0); // Key to force remount FeatureGroup Editor
    const [editingAction, setEditingAction] = useState(null); // Last editing action
    const [undoStack, setUndoStack] = useState([]);

    // Editor
    const [isEditing, setIsEditing] = useState(false);
    const isProcessingEdit = useRef(false);
    // Only allow user to modify the shape when there is no other additional route variants.
    const editable = props.additionalRouteVariants.length === 0 && editablePolyline?.length > 0;
    const shouldShowManualDetourButton = diversionPolyline.length > 1 && diversionPolyline.length <= TOMTOM_STOP_POINTS_LIMIT;

    // TomTom
    const [tomtomPolyline, setTomtomPolyline] = useState([]);
    const [tomtomInstructions, setTomtomInstructions] = useState([]);
    const [showTomTomWarning, setShowTomTomWarning] = useState(false);
    const [mergedTomTom, setMergedTomTom] = useState(false);

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
                    setEditedCoords(coordinates);
                }
            }
        });
    };

    // Reset temporary TomTom data
    const resetTomTom = () => {
        setTomtomPolyline([]);
        setTomtomInstructions(props.initialDirections || []);
        setShowTomTomWarning(false);
        setMergedTomTom(false);
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
            resetTomTom();
        } else {
            setUpdatedCoords(previousEntry.polyline);
            setTomtomPolyline(previousEntry.tomtomPolyline || []);
            setTomtomInstructions(previousEntry.tomtomInstructions || []);
            setShowTomTomWarning(previousEntry.showWarning);
            setMergedTomTom(previousEntry.mergedTomTom || false);
        }
        setFeatureGroupKey(k => k + 1);
    };

    // Reset handler
    const handleReset = () => {
        setEditablePolyline(originalCoords);
        resetTomTom();
        setUpdatedCoords([]);
        setUndoStack([{ name: 'Initial', polyline: originalCoords, showWarning: false }]);
        setFeatureGroupKey(k => k + 1); // Force remount FeatureGroup Editor
    };

    const mergeTomTom = () => {
        if (tomtomPolyline.length > 0) {
            const mergedCoords = mergeCoordinates(originalCoords, tomtomPolyline);
            setUpdatedCoords(mergedCoords);
            setEditablePolyline(mergedCoords);
            setTomtomPolyline([]); // Clear TomTom polyline after merging
            setFeatureGroupKey(k => k + 1); // Force remount FeatureGroup Editor
            props.onDirectionsUpdated({ pending: false });
            setMergedTomTom(true);
            setShowTomTomWarning(false);
        }
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

    const fetchTomTomShape = async (diversion) => {
        const points = diversion.map(latlng => `${latlng[0]},${latlng[1]}`);
        const routePoints = [];
        let maneuvers = [];
        try {
            // Fetch the route shape from TomTom API
            const tomtomShape = await calculateRoute(points);
            if (tomtomShape?.routes?.length > 0) {
                const route = tomtomShape?.routes[0];
                route.legs.forEach((leg) => {
                    leg.points.forEach((point) => {
                        routePoints.push([point.latitude, point.longitude]);
                    });
                });
                maneuvers = route.guidance.instructions;
            }
        } catch (error) {
            captureError(new FetchTomTomShapeError('Error fetching TomTom route shape:'), {
                diversion,
                error,
            });
        }

        // Thin the TomTom returned route points
        const thinnedRoutePoints = thinCoordinates(routePoints);
        return { routePoints: thinnedRoutePoints, maneuvers };
    };

    const autoGenerateDetour = async () => {
        if (diversionPolyline.length > 1) {
            // TomTom requires at least 2 points to calculate a route
            const { routePoints, maneuvers } = await fetchTomTomShape(diversionPolyline);
            if (routePoints.length > 0) {
                // When we get the route points from TomTom
                setTomtomPolyline(routePoints);
                setTomtomInstructions(maneuvers);
                setMergedTomTom(false);
                props.onDirectionsUpdated({ pending: true });
            } else {
                // When we don't get any route points from TomTom
                resetTomTom();
            }
        }
    };

    const renderStopMarker = (stop, highlightedStops) => {
        const isHighlighted = highlightedStops.includes(stop.stopId);
        if (!stop.stopLat) return null;
        return (
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
        );
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
            setUpdatedCoords(initialCoords);
        } else {
            setEditablePolyline(originalCoords);
            setUndoStack([{ name: 'Initial', polyline: originalCoords }]);
        }
    }, [originalCoords, props.initialShape]);

    useEffect(() => {
        if (props.initialDirections?.length > 0) {
            setTomtomInstructions(props.initialDirections);
            setMergedTomTom(true);
        }
    }, [props.initialDirections]);

    useEffect(() => {
        if (props.routeVariant) {
            const originalShape = props.routeVariant?.shapeWkt;
            if (originalShape?.startsWith('LINESTRING')) {
                const coords = parseWKT(props.routeVariant?.shapeWkt);
                setOriginalCoords(coords);
                setUpdatedCoords([]);
                resetTomTom();
                if (coords.length > 0 && mapRef.current) {
                    setCenter(coords[0]);
                }
            }
            setIsEditablePolylineVisible(false);
        } else {
            // Clear everything when there is no route variant
            setOriginalCoords([]);
            setEditablePolyline([]);
            setUpdatedCoords([]);
            resetTomTom();
        }

        // This is to fix the leaflet issue where the state of editor preserves previous layer.
        // This triggers a force reload
        const timer = setTimeout(() => {
            setIsEditablePolylineVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [props.routeVariant]);

    useEffect(async () => {
        if (editedCoords.length > 0) {
            // Calculate diversion
            const difference = findDifferences(originalCoords, editedCoords);
            if (difference.length > 1) {
                setUpdatedCoords(editedCoords);
                setShowTomTomWarning(mergedTomTom);
            }
        }
    }, [editedCoords]);

    useEffect(() => {
        if (updatedCoords.length > 0) {
            // Calculate the diversion shape
            const difference = findDifferences(originalCoords, updatedCoords);
            if (difference.length > 0) {
                setDiversionPolyline(parseWKT(toWKT(difference)));
            }
            const newSnapshotAction = {
                name: `Edit ${generateUniqueID()}`,
                polyline: updatedCoords,
                tomtomPolyline,
                tomtomInstructions,
                mergedTomTom,
                showWarning: showTomTomWarning,
            };
            setEditingAction(newSnapshotAction);
            props.onShapeUpdated(toWKT(difference), toWKT(updatedCoords), tomtomInstructions);
        } else {
            setDiversionPolyline([]);
            props.onShapeUpdated(null, null, null);
        }
    }, [updatedCoords, props.stopCheckRadius]);

    // This makes sure the diversion pane is created once the map is ready
    // This is needed because the LeafletMap component does not expose a direct way to create panes before layers are added
    // Make sure the diversion shape is always on top of the route shape
    useEffect(() => {
        if (mapRef?.current?.leafletElement) {
            const map = mapRef.current.leafletElement;
            // Make sure markerPane is above everything else (Red Dots)
            if (map.getPane('markerPane')) {
                map.getPane('markerPane').style.zIndex = 700;
            }
            if (!map.getPane('diversionPane')) {
                map.createPane('diversionPane');
                map.getPane('diversionPane').style.zIndex = 650;
            }
        }
    }, [mapRef.current, props.routeVariant, isEditing]);

    return (
        <div className="map route-shape-editor-container">
            { !isEditing && editable && (
                <div className="route-shape-editor-buttons">
                    <button type="button" onClick={ handleReset }>Reset</button>
                    <button type="button" onClick={ handleUndo } disabled={ undoStack.length < 2 }>Undo</button>
                    { props.useTomTomDirections && (
                        <>
                            <button onClick={ autoGenerateDetour } type="button" disabled={ !shouldShowManualDetourButton }>
                                Auto-generate detour
                            </button>
                            <button onClick={ mergeTomTom } type="button" disabled={ tomtomPolyline.length < 2 }>Apply auto-generation</button>
                        </>
                    )}
                </div>
            )}
            { showTomTomWarning && (
                <div className="route-shape-editor-warning">
                    The written directions are not automatically updated when manual detour is applied.
                    Please review the written directions information.
                </div>
            )}
            { tomtomInstructions.length > 0 && (
                <div className="route-shape-editor-bottom-right-panel">
                    <InstructionPanel instructions={ tomtomInstructions } />
                </div>
            )}
            <LeafletMap
                key={ props.routeVariant?.routeVariantId }
                center={ center }
                zoom={ 16 }
                maxZoom={ 19 }
                style={ { height: '100%', width: '100%' } }
                ref={ mapRef }
            >
                <TileLayer
                    opacity={ 0.5 }
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {!isEditing && props.routeVariant?.stops?.length > 0 && (
                    <FeatureGroup>
                        {getAllUniqueStops().map(stop => renderStopMarker(stop, props.highlightedStops))}
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
                    <FeatureGroup key={ `diversion-${featureGroupKey}` }>
                        <Polyline
                            positions={ diversionPolyline }
                            color={ DIVERSION_SHAPE_COLOR }
                            weight={ DIVERSION_SHAPE_WEIGHT }
                            opacity={ DIVERSION_SHAPE_OPACITY }
                            pane="diversionPane"
                        >
                            <Tooltip sticky="true">
                                <span>Diversion Shape</span>
                            </Tooltip>
                        </Polyline>
                    </FeatureGroup>
                )}
                {tomtomPolyline.length > 0 && (
                    <FeatureGroup>
                        <Polyline
                            positions={ tomtomPolyline }
                            color="Black"
                            weight={ 4 }
                            opacity={ 0.7 }
                        >
                            <Tooltip sticky="true">
                                <span>TomTom generated diversion</span>
                            </Tooltip>
                        </Polyline>
                    </FeatureGroup>
                )}
                {isEditablePolylineVisible && (
                    <FeatureGroup key={ `base-${featureGroupKey}` }>
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
            </LeafletMap>
        </div>
    );
};

RouteShapeEditor.propTypes = {
    routeVariant: PropTypes.object,
    initialShape: PropTypes.string,
    initialDirections: PropTypes.array,
    highlightedStops: PropTypes.array,
    visible: PropTypes.bool,
    additionalRouteVariants: PropTypes.array,
    stopCheckRadius: PropTypes.number,
    onShapeUpdated: PropTypes.func.isRequired,
    onDirectionsUpdated: PropTypes.func.isRequired,
    useTomTomDirections: PropTypes.bool,
};

RouteShapeEditor.defaultProps = {
    visible: true,
    routeVariant: {},
    initialShape: null,
    initialDirections: [],
    highlightedStops: [],
    additionalRouteVariants: [],
    stopCheckRadius: 20,
    useTomTomDirections: false,
};

export default RouteShapeEditor;
