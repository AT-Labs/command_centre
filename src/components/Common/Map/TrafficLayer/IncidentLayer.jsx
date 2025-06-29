import { isEmpty, find } from 'lodash-es';
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
    const { data, weight, useNewColors } = props;

    const polylineGroupRef = useRef();
    const [selectedIncidentShape, setSelectedIncidentShape] = useState(null);

    const handleMarkerClick = (situationRecordsId, coordinates) => {
        setSelectedIncidentShape(prevState => (prevState?.situationRecordsId === situationRecordsId ? null : { situationRecordsId, coordinates }));
    };

    useEffect(() => {
        if (polylineGroupRef.current) {
            polylineGroupRef.current.leafletElement.bringToBack();
        }
    }, []);

    useEffect(() => {
        if (selectedIncidentShape && !find(data, incident => incident.situationRecordsId === selectedIncidentShape.situationRecordsId)) {
            setSelectedIncidentShape(null);
        }
    }, [props.data]);

    const handleGetClusterIcon = (cluster) => {
        const color = props.useNewColors ? '#666666' : '#D52923';
        return new L.DivIcon({
            className: 'incident-market-cluster',
            html: `<div style="background-color: ${color}; opacity: 0.7; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; color: white;">${cluster.getChildCount()}</div>`,
        });
    };

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
            onclick={ () => setSelectedIncidentShape(null) }
        />
    );

    const getIconMarket = (incident, feature) => (
        <IncidentMarker
            key={ incident.openlr }
            location={ getIconPoint(incident.isPoint, feature.coordinates) }
            category={ incident.type.category }
            onClick={ () => !incident.isPoint && handleMarkerClick(incident.situationRecordsId, feature.coordinates) }
            className={ incident.situationRecordsId }
            useNewColors={ useNewColors }
        >
            <Tooltip direction="top" offset={ [0, -50] }>
                <IncidentDetails incident={ incident } useNewColors={ useNewColors } />
            </Tooltip>
        </IncidentMarker>
    );

    const renderIncidentFeatures = () => data.map(incident => incident.features?.map(feature => (
        <React.Fragment key={ `${incident.openlr}-${generateUniqueID(10)}` }>
            { selectedIncidentShape && getPolyline(selectedIncidentShape.coordinates, weight) }
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
    useNewColors: PropTypes.bool,
};

IncidentLayer.defaultProps = {
    data: [],
    weight: 5,
    useNewColors: false,
};
