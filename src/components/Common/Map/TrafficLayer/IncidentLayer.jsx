import { isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import L from 'leaflet';
import React, { useRef, useState, useEffect } from 'react';
import { FeatureGroup, Polyline, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { generateUniqueID } from '../../../../utils/helpers';
import IncidentMarker from './IncidentMarker';
import { INCIDENTS_MARKER_CLUSTER_FOCUS_ZOOM } from '../../../../constants/traffic';
import IncidentDetails from './IncidentDetails';

export const IncidentLayer = (props) => {
    const { data, weight } = props;

    const polylineGroupRef = useRef();
    const [showPolyline, setShowPolyline] = useState(false);
    const [polylineCoordinates, setPolylineCoordinates] = useState([]);

    const handleMarkerClick = (coordinates) => {
        setShowPolyline(!showPolyline);
        setPolylineCoordinates(coordinates);
    };

    useEffect(() => {
        if (polylineGroupRef.current) {
            polylineGroupRef.current.leafletElement.bringToBack();
        }
    }, []);

    const handleGetClusterIcon = cluster => new L.DivIcon({
        className: 'incident-market-cluster',
        html: `<div style="background-color: #D52923; opacity: 0.7; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; color: white;">${cluster.getChildCount()}</div>`,
    });

    const getIconPoint = (isPoint, coordinates) => {
        if (isPoint) {
            return coordinates;
        }
        return [coordinates[0][1], coordinates[0][0]];
    };

    const getPolyline = (pCoordinates, pWeight) => (
        <Polyline
            positions={ pCoordinates.map(([lon, lat]) => [lat, lon]) }
            weight={ pWeight }
            color="#d21710"
            opacity={ 0.5 }
            onclick={ () => setShowPolyline(false) }
        />
    );

    const getIconMarket = (incident, feature) => (
        <IncidentMarker
            key={ incident.openlr }
            location={ getIconPoint(incident.isPoint, feature.coordinates) }
            category={ incident.type.category }
            onClick={ () => !incident.isPoint && handleMarkerClick(feature.coordinates) }
            className={ incident.situationRecordsId }
        >
            <Tooltip direction="top" offset={ [0, -50] }>
                <IncidentDetails incident={ incident } />
            </Tooltip>
        </IncidentMarker>
    );

    const renderIncidentFeatures = () => data.map(incident => incident.features?.map(feature => (
        <React.Fragment key={ `${incident.openlr}-${generateUniqueID(10)}` }>
            { showPolyline && getPolyline(polylineCoordinates, weight) }
            { getIconMarket(incident, feature) }
        </React.Fragment>
    )));

    return !isEmpty(data) ? (
        <FeatureGroup ref={ polylineGroupRef }>
            <MarkerClusterGroup
                spiderfyOnMaxZoom={ false }
                showCoverageOnHover={ false }
                removeOutsideVisibleBounds
                disableClusteringAtZoom={ INCIDENTS_MARKER_CLUSTER_FOCUS_ZOOM }
                iconCreateFunction={ cluster => handleGetClusterIcon(cluster) }
            >
                {renderIncidentFeatures()}
            </MarkerClusterGroup>
        </FeatureGroup>
    ) : null;
};

IncidentLayer.propTypes = {
    data: PropTypes.array,
    weight: PropTypes.number,
};

IncidentLayer.defaultProps = {
    data: [],
    weight: 5,
};
