// Settings for RouteShapeEditor
export const ROUTE_SHAPE_OPACITY = 0.8;
export const ROUTE_SHAPE_WEIGHT = 5;
export const ROUTE_SHAPE_COLOR = 'DEEPSKYBLUE';
export const DIVERSION_SHAPE_OPACITY = 0.8;
export const DIVERSION_SHAPE_WEIGHT = 6;
export const DIVERSION_SHAPE_COLOR = 'RED';
export const DEFAULT_AUCKLAND_COORDINATES = [-36.8485, 174.7633];
export const TOMTOM_STOP_POINTS_LIMIT = 20; // TomTom API allows up to 20 points (including start and end)
export const EDITOR_HANDLER_TOOLTIP = 'Drag the red dots to update the shape for the selected route variant.';
export const EDITOR_BUTTON_TOOLTIP = 'Edit route path';

// TomTom maneuver types for left and right instructions
export const TomTomManeuver = Object.freeze({
    DEPART: 'DEPART',
    TURN_RIGHT: 'TURN_RIGHT',
    ROUNDABOUT_RIGHT: 'ROUNDABOUT_RIGHT',
    TURN_LEFT: 'TURN_LEFT',
    ROUNDABOUT_LEFT: 'ROUNDABOUT_LEFT',
    ROUNDABOUT_STRAIGHT: 'ROUNDABOUT_STRAIGHT',
    WAYPOINT_REACHED: 'WAYPOINT_REACHED',
    ARRIVE: 'ARRIVE',
});
