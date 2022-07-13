import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { CircleMarker, FeatureGroup, LeafletConsumer, Tooltip } from 'react-leaflet';
import { filter, uniqBy } from 'lodash-es';
import IconMarker from '../../../../Common/IconMarker/IconMarker';
import AlertMessage from '../../../../Common/AlertMessage/AlertMessage';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';
import { getStopDetail } from '../../../../../redux/selectors/realtime/detail';
import { getChildStops, getStopLatLng } from '../../../../../redux/selectors/static/stops';
import { getAffectedStops, getDisruptionStepCreation } from '../../../../../redux/selectors/control/disruptions';
import { updateAffectedStopsState } from '../../../../../redux/actions/control/disruptions';
import { TRAIN_TYPE_ID } from '../../../../../types/vehicle-types';
import { toCamelCaseKeys } from '../../../../../utils/control/disruptions';
import { DISRUPTION_TYPE, ALERT_TYPES } from '../../../../../types/disruptions-types';

const FOCUS_ZOOM = 16;
const maximumStopsToDisplay = 200;

const StopsLayer = (props) => {
    const [zoomLevel, setZoomLevel] = useState(props.leafletMap.getZoom());
    const [bounds, setBounds] = useState(props.leafletMap.getBounds());
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        props.leafletMap.on('zoomend', ({ sourceTarget }) => {
            setZoomLevel(sourceTarget.getZoom());
        });

        props.leafletMap.on('moveend', ({ sourceTarget }) => {
            setBounds(sourceTarget.getBounds());
        });
    }, [props.leafletMap]);

    const isChildTrainPlatform = stop => stop.route_type === TRAIN_TYPE_ID && stop.location_type === 0;

    const getStops = () => {
        let stopsInBoundary = [];
        if (zoomLevel >= FOCUS_ZOOM) {
            stopsInBoundary = filter(props.childStops, stop => bounds.contains(getStopLatLng(stop)));
        }
        return stopsInBoundary.filter(stop => !isChildTrainPlatform(stop));
    };

    const getDisplayStops = () => (props.stops.length > 0 ? props.stops : props.affectedStops).slice(0, maximumStopsToDisplay);

    const handleStopOnClick = (stop) => {
        if (props.disruptionType === DISRUPTION_TYPE.ROUTES) {
            setShowAlert(true);
            return;
        }

        props.updateAffectedStopsState([...props.affectedStops, toCamelCaseKeys(stop)].map(stopEntity => ({
            ...stopEntity,
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: SEARCH_RESULT_TYPE.STOP.type,
        })));
    };

    return (
        <>
            <FeatureGroup>
                {uniqBy(getDisplayStops(), stop => stop.stopCode).map(stop => (stop.stopLat
                    ? (
                        <IconMarker
                            key={ stop.stopCode }
                            location={ [stop.stopLat, stop.stopLon] }
                            imageName="bus-stop"
                            size={ 28 }>
                            <Tooltip>
                                {`${stop.stopCode} - ${stop.stopName}`}
                            </Tooltip>
                        </IconMarker>
                    ) : null)) }
            </FeatureGroup>
            {(props.currentStep !== 2 && props.currentStep !== 3)
                && (
                    <FeatureGroup>
                        {getStops().map(stop => (stop.stop_lat
                            ? (
                                <CircleMarker
                                    key={ stop.stop_code }
                                    center={ [stop.stop_lat, stop.stop_lon] }
                                    radius={ 5 }
                                    fill
                                    color="white"
                                    fillColor="black"
                                    fillRule="nonzero"
                                    fillOpacity="1"
                                    weight="2"
                                    stroke
                                    onClick={ () => handleStopOnClick(stop) }>
                                    { props.stopDetail.stop_id !== stop.stop_id && (
                                        <Tooltip>
                                            {`${stop.stop_code} - ${stop.stop_name}`}
                                        </Tooltip>
                                    )}
                                </CircleMarker>
                            ) : null)) }
                    </FeatureGroup>
                )}
            {showAlert && (
                <AlertMessage
                    autoDismiss
                    message={ {
                        ...ALERT_TYPES.STOP_SELECTION_DISABLED_ERROR(),
                    } }
                    onClose={ () => setShowAlert(false) }
                />
            )}
        </>
    );
};

StopsLayer.propTypes = {
    childStops: PropTypes.object,
    affectedStops: PropTypes.array,
    leafletMap: PropTypes.object.isRequired,
    stopDetail: PropTypes.object.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    currentStep: PropTypes.number.isRequired,
    stops: PropTypes.array,
    disruptionType: PropTypes.string.isRequired,
};

StopsLayer.defaultProps = {
    childStops: {},
    affectedStops: [],
    stops: [],
};

export default connect(state => ({
    childStops: getChildStops(state),
    affectedStops: getAffectedStops(state),
    stopDetail: getStopDetail(state),
    currentStep: getDisruptionStepCreation(state),
}), { updateAffectedStopsState })(props => (
    <LeafletConsumer>
        {({ map }) => <StopsLayer { ...props } leafletMap={ map } />}
    </LeafletConsumer>
));
