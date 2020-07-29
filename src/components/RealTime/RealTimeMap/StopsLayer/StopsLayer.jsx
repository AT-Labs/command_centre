import _ from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import {
    CircleMarker, FeatureGroup, LeafletConsumer, Popup, Tooltip,
} from 'react-leaflet';
import { connect } from 'react-redux';
import { stopSelected } from '../../../../redux/actions/realtime/detail/stop';
import { getStopDetail } from '../../../../redux/selectors/realtime/detail';
import { getChildStops, getStopLatLng, getVisibleStops } from '../../../../redux/selectors/static/stops';
import './StopsLayer.scss';
import { TRAIN_TYPE_ID } from '../../../../types/vehicle-types';
import { FOCUS_ZOOM } from '../constants';

class StopsLayer extends React.Component {
    static propTypes = {
        visibleStops: PropTypes.array,
        childStops: PropTypes.object.isRequired,
        stopDetail: PropTypes.object.isRequired,
        stopSelected: PropTypes.func.isRequired,
        leafletMap: PropTypes.object.isRequired,
    };

    static defaultProps = {
        visibleStops: [],
    };

    constructor(props) {
        super(props);

        this.state = {
            zoomLevel: props.leafletMap.getZoom(),
            bounds: props.leafletMap.getBounds(),
        };
    }

    componentDidMount() {
        this.props.leafletMap.on('zoomend', ({ sourceTarget }) => {
            this.setState({ zoomLevel: sourceTarget.getZoom() });
        });

        this.props.leafletMap.on('moveend', ({ sourceTarget }) => {
            this.setState({ bounds: sourceTarget.getBounds() });
        });
    }

    // stop renamed to stp to prevent cypress from changing it https://github.com/cypress-io/cypress/issues/5330
    isChildTrainPlatform = stp => stp.route_type === TRAIN_TYPE_ID && stp.location_type === 0;

    getStops = () => {
        const { childStops, visibleStops } = this.props;
        const { zoomLevel, bounds } = this.state;
        let stopsInBoundary = [];
        if (zoomLevel > FOCUS_ZOOM) {
            stopsInBoundary = _.filter(childStops, stop => bounds.contains(getStopLatLng(stop)));
        }
        return (!_.isEmpty(visibleStops)) ? visibleStops : stopsInBoundary.filter(stop => !this.isChildTrainPlatform(stop));
    };

    handleStopOnClick = (stop) => {
        const { stopDetail } = this.props;
        if (stopDetail && stopDetail.stop_id !== stop.stop_id) this.props.stopSelected(stop);
    };

    render() {
        return (
            <FeatureGroup ref={ this.tripShapeLayer }>
                {
                    this.getStops().map((stop) => {
                        const latlng = [stop.stop_lat, stop.stop_lon];
                        return (
                            <CircleMarker
                                key={ stop.stop_code }
                                center={ latlng }
                                radius={ 5 }
                                fill
                                color="white"
                                fillColor="black"
                                fillRule="nonzero"
                                fillOpacity="1"
                                weight="2"
                                stroke
                                onClick={ () => this.handleStopOnClick(stop) }>
                                { this.props.stopDetail.stop_id !== stop.stop_id && (
                                    <Tooltip>
                                        {`${stop.stop_code} - ${stop.stop_name}`}
                                    </Tooltip>
                                )}
                                <Popup
                                    className="stops-layer-popup"
                                    autoPan={ false }
                                    closeButton={ false }>
                                    {`${stop.stop_code} - ${stop.stop_name}`}
                                </Popup>
                            </CircleMarker>
                        );
                    })
                }
            </FeatureGroup>
        );
    }
}

export default connect(
    state => ({
        childStops: getChildStops(state),
        visibleStops: getVisibleStops(state),
        stopDetail: getStopDetail(state),
    }),
    { stopSelected },
)(props => (
    <LeafletConsumer>
        {({ map }) => <StopsLayer { ...props } leafletMap={ map } />}
    </LeafletConsumer>
));
