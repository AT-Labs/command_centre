import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { CircleMarker, FeatureGroup, LeafletConsumer, Tooltip } from 'react-leaflet';
import { filter, uniqBy } from 'lodash-es';
import IconMarker from '../../../../Common/IconMarker/IconMarker';
import { getStopDetail } from '../../../../../redux/selectors/realtime/detail';
import { getChildStops, getStopLatLng } from '../../../../../redux/selectors/static/stops';
import { getAffectedStops, getDisruptionStepCreation } from '../../../../../redux/selectors/control/disruptions';
import { updateAffectedStopsState } from '../../../../../redux/actions/control/disruptions';
import { TRAIN_TYPE_ID } from '../../../../../types/vehicle-types';
import { toCamelCaseKeys } from '../../../../../utils/control/disruptions';

const FOCUS_ZOOM = 16;

const StopsLayer = (props) => {
    const [zoomLevel, setZoomLevel] = useState(props.leafletMap.getZoom());
    const [bounds, setBounds] = useState(props.leafletMap.getBounds());

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

    const handleStopOnClick = (stop) => {
        props.updateAffectedStopsState([...props.affectedStops, toCamelCaseKeys(stop)]);
    };

    return (
        <Fragment>
            <FeatureGroup>
                {uniqBy(props.affectedStops, stop => stop.stopId).map(stop => (stop.stopLat
                    ? (
                        <IconMarker
                            key={ stop.stopId }
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
                )
            }
        </Fragment>
    );
};

StopsLayer.propTypes = {
    childStops: PropTypes.object,
    affectedStops: PropTypes.array,
    leafletMap: PropTypes.object.isRequired,
    stopDetail: PropTypes.object.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    currentStep: PropTypes.number.isRequired,
};

StopsLayer.defaultProps = {
    childStops: {},
    affectedStops: [],
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
