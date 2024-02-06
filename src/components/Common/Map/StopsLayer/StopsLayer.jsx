import { filter, isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import {
    CircleMarker, FeatureGroup, LeafletConsumer, Tooltip,
} from 'react-leaflet';
import { getStopLatLng } from '../../../../redux/selectors/static/stops';
import './StopsLayer.scss';
import { TRAIN_TYPE_ID } from '../../../../types/vehicle-types';

class StopsLayer extends React.Component {
    static propTypes = {
        visibleStops: PropTypes.array,
        childStops: PropTypes.object,
        stopDetail: PropTypes.object.isRequired,
        leafletMap: PropTypes.object.isRequired,
        focusZoom: PropTypes.number.isRequired,
        onStopClick: PropTypes.func.isRequired,
    };

    static defaultProps = {
        visibleStops: [],
        childStops: {},
    };

    constructor(props) {
        super(props);

        this.state = {
            zoomLevel: props.leafletMap.getZoom(),
        };
    }

    componentDidMount() {
        this.props.leafletMap.on('zoomend', ({ sourceTarget }) => {
            this.setState({ zoomLevel: sourceTarget.getZoom() });
        });

        this.props.leafletMap.on('moveend', ({ sourceTarget }) => {
            this.setState({ bounds: sourceTarget.getBounds() });
        });

        this.setState({ bounds: this.props.leafletMap.getBounds() });
    }

    // stop renamed to stp to prevent cypress from changing it https://github.com/cypress-io/cypress/issues/5330
    isChildTrainPlatform = stp => stp.route_type === TRAIN_TYPE_ID && stp.location_type === 0;

    getStops = () => {
        const { childStops, visibleStops, focusZoom } = this.props;
        const { zoomLevel, bounds } = this.state;
        let stopsInBoundary = [];
        if (zoomLevel > focusZoom) {
            stopsInBoundary = filter(childStops, stop => bounds?.contains(getStopLatLng(stop)));
        }
        return (!isEmpty(visibleStops)) ? visibleStops : stopsInBoundary.filter(stop => !this.isChildTrainPlatform(stop));
    };

    render() {
        return (
            <FeatureGroup>
                {this.getStops().map(stop => (stop.stop_lat
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
                            onClick={ () => this.props.onStopClick(stop) }>
                            { this.props.stopDetail.stop_id !== stop.stop_id && (
                                <Tooltip>
                                    {`${stop.stop_code} - ${stop.stop_name}`}
                                </Tooltip>
                            )}
                        </CircleMarker>
                    ) : null)) }
            </FeatureGroup>
        );
    }
}

export default props => (
    <LeafletConsumer>
        {({ map }) => <StopsLayer { ...props } leafletMap={ map } />}
    </LeafletConsumer>
);
