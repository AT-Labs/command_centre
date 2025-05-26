import PropTypes from 'prop-types';
import React, { useRef, useState, useMemo } from 'react';
import { Popup, Tooltip } from 'react-leaflet';
import { uniqBy } from 'lodash-es';
import { useDispatch } from 'react-redux';
import IconMarker from '../../IconMarker/IconMarker';
import { EntityPopupContent } from '../popup/EntityPopupContent';
import { updateHoveredEntityKey } from '../../../../redux/actions/realtime/map';

function getUniqueStops(stops, maximumStopsToDisplay) {
    let unique = uniqBy(stops, stop => stop.stop_code);
    if (maximumStopsToDisplay > 0) {
        unique = unique.slice(0, maximumStopsToDisplay);
    }
    return unique;
}

const SelectedStopsDisruptionsMarker = (props) => {
    const [expandedPopupKey, setExpandedPopupKey] = useState(null);
    const markerRefs = useRef({});
    const dispatch = useDispatch();

    const uniqueStops = useMemo(
        () => getUniqueStops(props.stops, props.maximumStopsToDisplay),
        [props.stops, props.maximumStopsToDisplay],
    );

    const handleHoveredEntitySet = (stop) => {
        dispatch(updateHoveredEntityKey(stop.key ?? undefined));
    };

    const handleHoveredEntityClear = () => {
        dispatch(updateHoveredEntityKey());
    };

    const handleExpandDisruptionsDetails = (stopKey) => {
        setExpandedPopupKey(stopKey);
        setTimeout(() => {
            const ref = markerRefs.current[stopKey];
            if (ref?.leafletElement) {
                ref.leafletElement.openPopup();
            }
        }, 0);
    };

    const handleCollapseDisruptionsDetails = (stopKey) => {
        setExpandedPopupKey(null);
        setTimeout(() => {
            const ref = markerRefs.current[stopKey];
            if (ref?.leafletElement) {
                ref.leafletElement.openPopup();
            }
        }, 0);
    };

    const renderPopup = (stop, isExpanded) => {
        const popupSize = isExpanded
            ? { maxWidth: 520, minWidth: 460 }
            : { maxWidth: 226, minWidth: 200 };
        return (
            <Popup
                key={ stop.stop_id }
                offset={ [0, -10] }
                maxWidth={ popupSize.maxWidth }
                minWidth={ popupSize.minWidth }
                closeButton={ false }
            >
                <EntityPopupContent
                    entity={ stop }
                    causes={ props.causes }
                    impacts={ props.impacts }
                    goToDisruptionEditPage={ props.goToDisruptionEditPage }
                    onExpandPopup={ () => handleExpandDisruptionsDetails(stop.stop_id) }
                    onCollapsePopup={ () => handleCollapseDisruptionsDetails(stop.stop_id) }
                    isExpanded={ isExpanded }
                />
            </Popup>
        );
    };

    const markers = useMemo(
        () => uniqueStops.map((stop) => {
            if (!stop.stop_lat) return null;
            const isExpanded = expandedPopupKey === stop.stop_id;
            return (
                <IconMarker
                    ref={ (ref) => { markerRefs.current[stop.stop_id] = ref; } }
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
                    {props.popup && renderPopup(stop, isExpanded)}
                </IconMarker>
            );
        }),
        [uniqueStops, expandedPopupKey, props.tooltip, props.popup, props.size, props.tabIndexOverride, props.causes, props.impacts, props.goToDisruptionEditPage],
    );

    return <>{markers}</>;
};

SelectedStopsDisruptionsMarker.propTypes = {
    stops: PropTypes.array.isRequired,
    size: PropTypes.number.isRequired,
    popup: PropTypes.bool,
    tooltip: PropTypes.bool,
    maximumStopsToDisplay: PropTypes.number,
    tabIndexOverride: PropTypes.number,
    goToDisruptionEditPage: PropTypes.func,
    impacts: PropTypes.array,
    causes: PropTypes.array,
};

SelectedStopsDisruptionsMarker.defaultProps = {
    popup: false,
    tooltip: false,
    maximumStopsToDisplay: 0,
    tabIndexOverride: 0,
    goToDisruptionEditPage: () => {},
    impacts: [],
    causes: [],
};

export default SelectedStopsDisruptionsMarker;
