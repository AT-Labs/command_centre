import React, { useRef, useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { FeatureGroup, LeafletConsumer } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import AlertMessage from '../../../../Common/AlertMessage/AlertMessage';
import { ALERT_ERROR_MESSAGE_TYPE } from '../../../../../types/message-types';
import { MAP_DATA } from '../../../../../types/map-types';

import 'leaflet-draw/dist/leaflet.draw.css';

const DrawLayer = (props) => {
    const drawingRef = useRef(null);
    const [zoomLevel, setZoomLevel] = useState(props.leafletMap.getZoom());
    const [alert, setAlert] = useState({
        show: false,
        message: '',
    });

    useEffect(() => {
        props.leafletMap.on('zoomend', ({ sourceTarget }) => {
            setZoomLevel(sourceTarget.getZoom());
        });
    }, [props.leafletMap]);

    useEffect(() => {
        drawingRef.current.leafletElement.clearLayers();
    }, [props.disruptionType]);

    useEffect(() => {
        if (props.disabled) {
            drawingRef.current.leafletElement.clearLayers();
        }
    }, [props.disabled]);

    const removeFirstDrawing = () => {
        const layers = drawingRef.current.leafletElement.getLayers();
        if (layers.length > 1) {
            drawingRef.current.leafletElement.removeLayer(layers[0]);
        }
    };

    const removeLastDrawing = () => {
        const layers = drawingRef.current.leafletElement.getLayers();
        drawingRef.current.leafletElement.removeLayer(layers[layers.length - 1]);
    };

    const handleDrawCreated = (event) => {
        const { layerType, layer } = event;
        let geograchy;
        if (layerType === 'circle') {
            const latlng = layer.getLatLng();
            const radius = layer.getRadius();
            geograchy = {
                type: layerType,
                coordinates: [latlng],
                radius,
            };
        } else if (layerType === 'polygon') {
            geograchy = {
                type: layerType,
                coordinates: layer.getLatLngs(),
            };
        }
        props.onDrawCreated(geograchy)
            .then(() => removeFirstDrawing())
            .catch((e) => {
                setAlert({ show: true, message: e.message });
                removeLastDrawing();
            });
    };

    const handleDrawDeleted = () => {
        props.onDrawDeleted();
    };

    const enableDrawing = zoomLevel >= MAP_DATA.maxZoomLevelForDrawing;

    return (
        <>
            <FeatureGroup ref={ drawingRef }>
                {!props.disabled && (
                    <EditControl
                        position="topleft"
                        onCreated={ handleDrawCreated }
                        onDeleted={ handleDrawDeleted }
                        edit={ { edit: false } }
                        draw={ {
                            rectangle: false,
                            polyline: false,
                            marker: false,
                            circlemarker: false,
                            circle: enableDrawing,
                            polygon: enableDrawing,
                        } }
                    />
                )}
            </FeatureGroup>
            {alert.show && (
                <AlertMessage
                    autoDismiss
                    message={ {
                        type: ALERT_ERROR_MESSAGE_TYPE,
                        body: alert.message,
                        id: '',
                    } }
                    onClose={ () => setAlert({ show: false, message: '' }) }
                />
            )}
        </>
    );
};

DrawLayer.propTypes = {
    leafletMap: PropTypes.object.isRequired,
    disruptionType: PropTypes.string.isRequired,
    onDrawCreated: PropTypes.func,
    onDrawDeleted: PropTypes.func,
    disabled: PropTypes.bool,
};

DrawLayer.defaultProps = {
    onDrawCreated: () => { },
    onDrawDeleted: () => { },
    disabled: false,
};

export default (props => (
    <LeafletConsumer>
        {({ map }) => <DrawLayer { ...props } leafletMap={ map } />}
    </LeafletConsumer>
));
