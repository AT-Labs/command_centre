import L from 'leaflet';
import { debounce, groupBy, filter, isEmpty, map, lowerCase } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { LeafletConsumer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { disableClustering, enableClustering } from 'leaflet.markercluster.freezable'; // eslint-disable-line
import 'react-leaflet-markercluster/dist/styles.min.css';
import { connect } from 'react-redux';
import { vehicleSelected } from '../../../../redux/actions/realtime/detail/vehicle';

import { getVehicleDetail } from '../../../../redux/selectors/realtime/detail';
import { getTripUpdateSnapshot } from '../../../../redux/actions/realtime/detail/quickview';
import { getTripUpdates } from '../../../../redux/selectors/realtime/quickview';
import { formatTripDelay } from '../../../../utils/control/routes';
import { getJoinedVehicleLabel,
    getVehicleLatLng, getVehiclePositionCoordinates, getVehicleRouteName, getVehicleRouteType } from '../../../../redux/selectors/realtime/vehicles';
import { FOCUS_ZOOM } from '../constants';
import VEHICLE_TYPES, { FERRY_TYPE_ID } from '../../../../types/vehicle-types';
import { getClusterIcon } from './vehicleClusterIcon';
import { getVehicleIcon } from './vehicleIcon';
import { tooltipContent } from './vehicleTooltip';
import { formatRealtimeDetailListItemKey } from '../../../../utils/helpers';
import './VehicleLayer.scss';

class VehicleClusterLayer extends React.Component {
    static propTypes = {
        vehicles: PropTypes.array.isRequired,
        vehicleAllocations: PropTypes.object.isRequired,
        vehicleType: PropTypes.string.isRequired,
        vehicleSelected: PropTypes.func.isRequired,
        highlightedVehicle: PropTypes.object,
        leafletMap: PropTypes.object.isRequired,
        tripUpdates: PropTypes.object.isRequired,
        getTripUpdateSnapshot: PropTypes.func.isRequired,
        tabIndexOverride: PropTypes.number,
    };

    static defaultProps = {
        highlightedVehicle: undefined,
        tabIndexOverride: 0,
    };

    constructor(props) {
        super(props);

        this.clusterLayerRef = React.createRef();
        this.unselectedVehiclesClusterLayerRef = React.createRef();
    }

    getTripUpdateSnapshotDebounced = debounce(tripId => this.props.getTripUpdateSnapshot(tripId), 1000);

    componentDidMount() { return this.refreshMarkers(); }

    componentDidUpdate() { return this.refreshMarkers(); }

    modifyOverlappedMarkersPosition = (markers) => {
        let latitudeOffset = 0;
        let longitudeOffset = 0;

        const groupedMarkersByPosition = groupBy(markers, ({ options: { vehicle } }) => getVehiclePositionCoordinates(vehicle));
        const groupsWithMultipleMarkers = filter(groupedMarkersByPosition, group => group.length > 1);

        groupsWithMultipleMarkers.forEach((group) => {
            group.forEach((marker) => {
                marker.setLatLng(
                    new L.LatLng(
                        marker.getLatLng().lat - latitudeOffset,
                        marker.getLatLng().lng - longitudeOffset,
                    ),
                );
                latitudeOffset += 0.00004;
                longitudeOffset += 0.00002;
            });
        });
    };

    getTooltipContent = ({ options }) => {
        const { vehicleAllocations, tripUpdates } = this.props;
        const hoveredVehicleState = tripUpdates[options.vehicle.id] || {};
        const markerTripId = options.vehicle.vehicle.trip ? options.vehicle.vehicle.trip.tripId : null;
        const hoveredVehicleTripId = hoveredVehicleState && hoveredVehicleState.trip ? hoveredVehicleState.trip.tripId : null;
        const occupancyStatus = markerTripId ? options.vehicle.vehicle.occupancyStatus : null;
        const routeType = getVehicleRouteType(options.vehicle);
        const tripDelay = markerTripId && hoveredVehicleState
            ? formatTripDelay(hoveredVehicleState.delay) : null;

        // Because tooltip is an html string and not a react dom
        // when getTripUpdateSnapshotThrottle is called there is some chance
        // that the binded html tooltip is not for the current marker.
        const isLoading = hoveredVehicleTripId !== markerTripId;

        if (markerTripId && routeType && routeType !== FERRY_TYPE_ID) {
            if (isLoading) {
                this.props.getTripUpdateSnapshot(markerTripId);
            } else {
                // The call is debounced as the map marker refreshes automatically retriggering the tooltip unncessarily
                // and updating the state (this call) also refresh it
                this.getTripUpdateSnapshotDebounced(markerTripId);
            }
        }

        return tooltipContent(
            getVehicleRouteName(options.vehicle) || 'NIS',
            getJoinedVehicleLabel(options.vehicle, vehicleAllocations),
            routeType,
            tripDelay,
            occupancyStatus,
            isLoading,
        );
    };

    refreshMarkers = () => {
        const { vehicles, highlightedVehicle } = this.props;
        const bounds = this.props.leafletMap.getBounds();
        const markersInBoundary = filter(vehicles, vehicle => bounds.contains(getVehicleLatLng(vehicle)));

        if (!this.props.vehicleType.startsWith('unselected')) {
            const markers = map(markersInBoundary, vehicle => L.marker(getVehicleLatLng(vehicle), {
                icon: getVehicleIcon(vehicle, ''),
                vehicle,
                keyboard: this.props.tabIndexOverride >= 0,
            }));
            this.handleClusterLayers(this.clusterLayerRef, markers);
        }

        if (!isEmpty(highlightedVehicle)) {
            if (this.props.vehicleType.startsWith('unselected')) {
                const unselectedVehiclesInBoundary = filter(vehicles, vehicle => bounds.contains(getVehicleLatLng(vehicle)));
                const unselectedMarkers = unselectedVehiclesInBoundary.map(vehicle => L.marker(getVehicleLatLng(vehicle), {
                    icon: getVehicleIcon(vehicle, 'opacity-markers'),
                    vehicle,
                    keyboard: this.props.tabIndexOverride >= 0,
                }));
                this.handleClusterLayers(this.unselectedVehiclesClusterLayerRef, unselectedMarkers);
            }
            this.clusterLayerRef.current.leafletElement.disableClustering();
            this.unselectedVehiclesClusterLayerRef.current.leafletElement.enableClustering();
        } else {
            this.clusterLayerRef.current.leafletElement.enableClustering();
        }
    };

    handleClick = ({ layer, type }) => {
        if (type === 'clusterclick') return;

        const { highlightedVehicle } = this.props;
        const { options: { vehicle } } = layer;
        if (!highlightedVehicle || highlightedVehicle.id !== vehicle.id) {
            const vehicleRouteType = getVehicleRouteType(vehicle);
            const vehicleType = vehicleRouteType ? lowerCase(VEHICLE_TYPES[vehicleRouteType].type) : '';
            this.props.vehicleSelected({
                id: vehicle.id,
                ...vehicle.vehicle,
                searchResultType: vehicleType,
                key: formatRealtimeDetailListItemKey(vehicleType, vehicle.id),
                checked: true,
            });
        }
    };

    handleClusterLayers = (ref, markers) => {
        ref.current.leafletElement.unbindTooltip();
        ref.current.leafletElement.clearLayers();
        ref.current.leafletElement.addLayers(markers);

        this.modifyOverlappedMarkersPosition(markers);

        ref.current.leafletElement.bindTooltip(
            this.getTooltipContent,
            { direction: 'top', className: 'vehicle-tooltip' },
        );
    };

    handleGetClusterIcon = (cluster, opacity) => {
        const clusterCopy = cluster;
        clusterCopy.options.keyboard = this.props.tabIndexOverride >= 0;
        return getClusterIcon(cluster, this.props.vehicleType, opacity);
    };

    render() {
        return (
            <>
                {!isEmpty(this.props.highlightedVehicle) && (
                    <MarkerClusterGroup
                        ref={ this.unselectedVehiclesClusterLayerRef }
                        zoomToBoundsOnClick
                        chunkedLoading
                        spiderfyOnMaxZoom={ false }
                        showCoverageOnHover={ false }
                        disableClusteringAtZoom={ FOCUS_ZOOM }
                        removeOutsideVisibleBounds
                        iconCreateFunction={ cluster => this.handleGetClusterIcon(cluster, 'opacity-markers') }
                        onClick={ this.handleClick } />
                )}
                <MarkerClusterGroup
                    ref={ this.clusterLayerRef }
                    zoomToBoundsOnClick
                    chunkedLoading
                    spiderfyOnMaxZoom={ false }
                    showCoverageOnHover={ false }
                    disableClusteringAtZoom={ FOCUS_ZOOM }
                    removeOutsideVisibleBounds
                    iconCreateFunction={ cluster => this.handleGetClusterIcon(cluster) }
                    onClick={ this.handleClick } />
            </>
        );
    }
}

export default connect(
    state => ({
        highlightedVehicle: getVehicleDetail(state),
        tripUpdates: getTripUpdates(state),
    }),
    { vehicleSelected, getTripUpdateSnapshot },
)(props => (
    <LeafletConsumer>
        { leafletContext => <VehicleClusterLayer { ...props } leafletMap={ leafletContext.map } />}
    </LeafletConsumer>
));
