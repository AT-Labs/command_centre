import React, { useRef, useMemo } from 'react';
import { FeatureGroup, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { has } from 'lodash-es';
import { DISRUPTIONS_MARKER_CLUSTER_FOCUS_ZOOM } from '../../../../constants/traffic';
import DisruptionDetails from './DisruptionDetails';
import { generateUniqueID, getDisruptionsByStop } from '../../../../utils/helpers';
import { useAlertCauses, useAlertEffects } from '../../../../utils/control/alert-cause-effect';
import './DisruptionLayer.scss';
import DisruptionMarker from './DisruptionMarker';

export const DisruptionLayer = (props) => {
    const { stops, disruptions, goToDisruptionSummary } = props;
    const polylineGroupRef = useRef();
    const causes = useAlertCauses();
    const impacts = useAlertEffects();

    const handleGetClusterIcon = cluster => new L.DivIcon({
        className: 'incident-market-cluster',
        html: `<div style="background-color: magenta; opacity: 0.7; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; color: white;">${cluster.getChildCount()}</div>`,
    });

    const renderDisruptionFeatures = useMemo(() => (stops.map(stop => (
        has(stop, 'stopLat') && has(stop, 'stopLon') ? (
            <React.Fragment key={ stop.stopCode }>
                <DisruptionMarker
                    key={ generateUniqueID() }
                    stop={ stop }
                >
                    <Popup
                        direction="top"
                        offset={ [0, -50] }
                        maxWidth={ 480 }
                        minWidth={ 400 }>
                        <DisruptionDetails
                            disruptions={ getDisruptionsByStop(disruptions, stop) }
                            stop={ stop }
                            causes={ causes }
                            impacts={ impacts }
                            goToDisruptionSummary={ goToDisruptionSummary }
                        />
                    </Popup>
                </DisruptionMarker>
            </React.Fragment>
        ) : null
    ))), [stops, disruptions]);
    return (
        <FeatureGroup ref={ polylineGroupRef }>
            <MarkerClusterGroup
                spiderfyOnMaxZoom={ false }
                showCoverageOnHover={ false }
                removeOutsideVisibleBounds
                disableClusteringAtZoom={ DISRUPTIONS_MARKER_CLUSTER_FOCUS_ZOOM }
                iconCreateFunction={ cluster => handleGetClusterIcon(cluster) }
            >
                {renderDisruptionFeatures}
            </MarkerClusterGroup>
        </FeatureGroup>
    );
};

DisruptionLayer.propTypes = {
    stops: PropTypes.array,
    disruptions: PropTypes.array,
    goToDisruptionSummary: PropTypes.func,
};

DisruptionLayer.defaultProps = {
    stops: [],
    disruptions: [],
    goToDisruptionSummary: {},
};
