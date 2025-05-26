import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Popup, Tooltip } from 'react-leaflet';
import { uniqBy } from 'lodash-es';
import { useDispatch } from 'react-redux';
import IconMarker from '../../IconMarker/IconMarker';
import { EntityPopupContent } from '../popup/EntityPopupContent';
import { updateHoveredEntityKey } from '../../../../redux/actions/realtime/map';

const SelectedStopsDisruptionsMarker = (props) => {
    const [expandedPopupKey, setExpandedPopupKey] = useState(null);
    const markerRefs = useRef({});

    const dispatch = useDispatch();

    const handleHoveredEntitySet = (stop) => {
        dispatch(updateHoveredEntityKey(stop.key ?? undefined));
    };

    const handleHoveredEntityClear = () => {
        dispatch(updateHoveredEntityKey());
    };

    const handleExpandDisruptionsDetails = useCallback((stopKey) => {
        setExpandedPopupKey(stopKey);
        setTimeout(() => {
            const ref = markerRefs.current[stopKey];
            if (ref && ref.leafletElement) {
                ref.leafletElement.openPopup();
            }
        }, 0);
    }, []);

    const handleCollapseDisruptionsDetails = useCallback((stopKey) => {
        setExpandedPopupKey(null);
        setTimeout(() => {
            const ref = markerRefs.current[stopKey];
            if (ref && ref.leafletElement) {
                ref.leafletElement.openPopup();
            }
        }, 0);
    }, []);

    const getMarkerRef = useCallback(
        stopId => (ref) => { markerRefs.current[stopId] = ref; },
        [],
    );

    const stopsToDisplay = () => {
        let uniqueStops = uniqBy(props.stops, stop => stop.stop_code);
        if (props.maximumStopsToDisplay > 0) {
            uniqueStops = uniqueStops.slice(0, props.maximumStopsToDisplay);
        }
        return uniqueStops;
    };

    return useMemo(
        () => stopsToDisplay(props.stops).map((stop) => {
            if (!stop.stop_lat) return null;
            const isExpanded = expandedPopupKey === stop.stop_id;
            const popupSize = isExpanded
                ? { maxWidth: 520, minWidth: 400 }
                : { maxWidth: 230, minWidth: 200 };
            return (
                <IconMarker
                    ref={ getMarkerRef(stop.stop_id) }
                    keyboard={ props.tabIndexOverride >= 0 }
                    key={ stop.stop_id }
                    className="selected-stop-marker"
                    location={ [stop.stop_lat, stop.stop_lon] }
                    imageName="bus-stop"
                    size={ props.size }
                    onPopupOpen={ () => handleHoveredEntitySet(stop) }
                    onPopupClose={ handleHoveredEntityClear }
                >
                    {props.tooltip && (
                        <Tooltip>
                            {`${stop.stop_code} - ${stop.stop_name}`}
                        </Tooltip>
                    )}
                    {props.popup && (
                        <Popup
                            key={ stop.stop_id }
                            direction="top"
                            offset={ [0, -50] }
                            maxWidth={ popupSize.maxWidth }
                            minWidth={ popupSize.minWidth }
                            closeButton={ false }
                        >
                            <EntityPopupContent
                                entity={ stop }
                                causes={ props.causes }
                                impacts={ props.impacts }
                                goToDisruptionSummary={ props.goToDisruptionSummary }
                                onExpandPopup={ () => handleExpandDisruptionsDetails(stop.stop_id) }
                                onCollapsePopup={ () => handleCollapseDisruptionsDetails(stop.stop_id) }
                                isExpanded={ isExpanded }
                            />
                        </Popup>
                    )}
                </IconMarker>
            );
        }),
        [
            props.stops,
            expandedPopupKey,
            props.tabIndexOverride,
            props.size,
            props.tooltip,
            props.popup,
            props.causes,
            props.impacts,
            props.goToDisruptionSummary,
            getMarkerRef,
            handleExpandDisruptionsDetails,
            handleCollapseDisruptionsDetails,
        ],
    );
};

SelectedStopsDisruptionsMarker.propTypes = {
    stops: PropTypes.array.isRequired,
    size: PropTypes.number.isRequired,
    popup: PropTypes.bool,
    tooltip: PropTypes.bool,
    maximumStopsToDisplay: PropTypes.number,
    tabIndexOverride: PropTypes.number,
    goToDisruptionSummary: PropTypes.func,
    impacts: PropTypes.array,
    causes: PropTypes.array,
};

SelectedStopsDisruptionsMarker.defaultProps = {
    popup: false,
    tooltip: false,
    maximumStopsToDisplay: 0,
    tabIndexOverride: 0,
    goToDisruptionSummary: () => {},
    impacts: [],
    causes: [],
};

export default SelectedStopsDisruptionsMarker;
