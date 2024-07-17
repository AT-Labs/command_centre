import { isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import L from 'leaflet';
import moment from 'moment';
import React, { useRef, useState, useEffect } from 'react';
import { FeatureGroup, Polyline, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { generateUniqueID, parseIncidentEndTime } from '../../../../utils/helpers';
import IconMarker from '../../IconMarker/IconMarker';
import { dateTimeFormat } from '../../../../utils/dateUtils';
import { INCIDENTS_MARKER_CLUSTER_FOCUS_ZOOM } from '../../../../constants/traffic';

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
        html: `<div style="background-color: #E30084; opacity: 0.5; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; color: white;">${cluster.getChildCount()}</div>`,
    });

    const getIconName = (name) => {
        if (name) {
            return name.replace(/\s+/g, '_').toLowerCase();
        }
        return 'unknown';
    };

    const parseValidityStatus = (validityStatus) => {
        if (validityStatus === 'definedByValidityTimeSpec') {
            return 'Valid until incident end time';
        }
        return validityStatus;
    };

    const getIconPoint = (isPoint, coordinates) => {
        if (isPoint) {
            return coordinates;
        }
        return [coordinates[0][1], coordinates[0][0]];
    };

    const getShowLabel = (label, value) => {
        if (value) {
            return (
                <>
                    <span>
                        <strong>
                            {label}
                            :
                            {' '}
                        </strong>
                        {value}
                    </span>
                    <br />
                </>
            );
        }
        return <></>;
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
        <IconMarker
            key={ incident.openlr }
            location={ getIconPoint(incident.isPoint, feature.coordinates) }
            imageName={ getIconName(incident.type.category) }
            size={ 45 }
            onClick={ () => !incident.isPoint && handleMarkerClick(feature.coordinates) }
            className={ incident.situationRecordsId }
        >
            <Tooltip direction="top">
                <h4>Incident information</h4>
                {getShowLabel('Status', parseValidityStatus(incident.validity.status))}
                {getShowLabel('Probability of occurrence', incident.probabilityOfOccurrence)}
                {getShowLabel('Type', incident.type.name)}
                {getShowLabel('Category', incident.type.category)}
                {getShowLabel('Description', incident.type.description)}
                {getShowLabel('From', incident.from)}
                {getShowLabel('To', incident.to)}
                {getShowLabel('Average speed(Km/h)', incident.averageSpeed)}
                {getShowLabel('Delay time(sec)', incident.delayTime)}
                {getShowLabel('Start time', moment(incident.validity.overallStartTime).format(dateTimeFormat))}
                {getShowLabel('End time', parseIncidentEndTime(incident.validity.overallEndTime))}
                {getShowLabel('General public comment', incident.generalPublicComment)}
            </Tooltip>
        </IconMarker>
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
