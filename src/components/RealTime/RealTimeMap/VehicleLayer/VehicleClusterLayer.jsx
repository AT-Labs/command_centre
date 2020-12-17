import L from 'leaflet';
import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { LeafletConsumer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { disableClustering, enableClustering } from 'leaflet.markercluster.freezable'; // eslint-disable-line
import 'react-leaflet-markercluster/dist/styles.min.css';
import { connect } from 'react-redux';
import { updateVehicleSelected, vehicleSelected } from '../../../../redux/actions/realtime/detail/vehicle';
import { getVehicleDetail } from '../../../../redux/selectors/realtime/detail';
import { getTripUpdateSnapshot } from '../../../../redux/actions/realtime/detail/quickview';
import { getTripUpdates } from '../../../../redux/selectors/realtime/quickview';
import { formatTripDelay } from '../../../../utils/control/routes';
import {
    getJoinedVehicleLabel, getVehicleLatLng, getVehiclePositionCoordinates, getVehicleRouteName, getVehicleRouteType,
} from '../../../../redux/selectors/realtime/vehicles';
import { FOCUS_ZOOM } from '../constants';
import { FERRY_TYPE_ID } from '../../../../types/vehicle-types';
import { getClusterIcon } from './vehicleClusterIcon';
import { getVehicleIcon } from './vehicleIcon';
import { tooltipContent } from './vehicleTooltip';
import './VehicleLayer.scss';


class VehicleClusterLayer extends React.Component {
    static propTypes = {
        vehicles: PropTypes.array.isRequired,
        vehicleAllocations: PropTypes.object.isRequired,
        vehicleType: PropTypes.string.isRequired,
        vehicleSelected: PropTypes.func.isRequired,
        highlightedVehicle: PropTypes.object.isRequired,
        leafletMap: PropTypes.object.isRequired,
        updateVehicleSelected: PropTypes.func.isRequired,
        tripUpdates: PropTypes.object.isRequired,
        getTripUpdateSnapshot: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.clusterLayerRef = React.createRef();
    }

    getTripUpdateSnapshotDebounced = _.debounce(tripId => this.props.getTripUpdateSnapshot(tripId), 1000);

    componentDidMount = () => this.refreshMarkers();

    componentDidUpdate = () => this.refreshMarkers();

    modifyOverlappedMarkersPosition = (markers) => {
        let latitudeOffset = 0;
        let longitudeOffset = 0;

        const groupedMarkersByPosition = _.groupBy(markers, ({ options: { vehicle } }) => getVehiclePositionCoordinates(vehicle));
        const groupsWithMultipleMarkers = _.filter(groupedMarkersByPosition, group => group.length > 1);

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
    }

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
    }

    refreshMarkers = () => {
        const { vehicles, highlightedVehicle } = this.props;
        const bounds = this.props.leafletMap.getBounds();
        const markersInBoundary = _.filter(vehicles, vehicle => bounds.contains(getVehicleLatLng(vehicle)));
        const markers = _.map(markersInBoundary, vehicle => L.marker(getVehicleLatLng(vehicle), { icon: getVehicleIcon(vehicle), vehicle }));

        this.clusterLayerRef.current.leafletElement.unbindTooltip();
        this.clusterLayerRef.current.leafletElement.clearLayers();

        this.clusterLayerRef.current.leafletElement.addLayers(markers);
        this.modifyOverlappedMarkersPosition(markers);

        this.clusterLayerRef.current.leafletElement.bindTooltip(
            this.getTooltipContent,
            { direction: 'top', className: 'vehicle-tooltip' },
        );

        if (!_.isEmpty(highlightedVehicle)) {
            const vehicleId = _.result(highlightedVehicle, 'vehicle.vehicle.id');
            const matchingVehicle = _.find(vehicles, _.matchesProperty('vehicle.vehicle.id', vehicleId));
            if (matchingVehicle) this.props.updateVehicleSelected(matchingVehicle);
        }

        if (_.isEmpty(highlightedVehicle)) this.clusterLayerRef.current.leafletElement.enableClustering();
        else this.clusterLayerRef.current.leafletElement.disableClustering();
    }

    handleClick = ({ layer, type }) => {
        if (type === 'clusterclick') return;

        const { highlightedVehicle } = this.props;
        const { options: { vehicle } } = layer;

        if (highlightedVehicle && highlightedVehicle.id !== vehicle.id) this.props.vehicleSelected(vehicle);
    }

    render() {
        return (
            <MarkerClusterGroup
                ref={ this.clusterLayerRef }
                zoomToBoundsOnClick
                chunkedLoading
                spiderfyOnMaxZoom={ false }
                showCoverageOnHover={ false }
                disableClusteringAtZoom={ FOCUS_ZOOM }
                removeOutsideVisibleBounds
                iconCreateFunction={ cluster => getClusterIcon(cluster, this.props.vehicleType) }
                onClick={ this.handleClick } />
        );
    }
}

export default connect(state => ({
    highlightedVehicle: getVehicleDetail(state),
    tripUpdates: getTripUpdates(state),
}),
{ vehicleSelected, updateVehicleSelected, getTripUpdateSnapshot })(props => (
    <LeafletConsumer>
        {({ map }) => <VehicleClusterLayer { ...props } leafletMap={ map } />}
    </LeafletConsumer>
));
