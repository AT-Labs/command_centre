import { isEmpty, find, get } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FeatureGroup, LeafletConsumer, Polyline } from 'react-leaflet';
import { ROUTE_COLOR, HIGHLIGHTED_ROUTE_COLOR } from '../constants';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { getAllCoordinatesFromWKT, generateUniqueID } from '../../../../utils/helpers';
import EntityPopup from '../popup/EntityPopup';
import { useRealtimeMapRouteColors } from '../../../../redux/selectors/appSettings';

const { ROUTE, STOP, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;
class TripShapeLayer extends React.PureComponent {
    static propTypes = {
        visibleEntities: PropTypes.array,
        currentDetailKey: PropTypes.string,
        hoveredEntityKey: PropTypes.string,
        updateHoveredEntityKey: PropTypes.func.isRequired,
        useRealtimeMapRouteColors: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        visibleEntities: [],
        currentDetailKey: '',
        hoveredEntityKey: '',
    };

    constructor(props) {
        super(props);
        this.polylineGroupRef = React.createRef();
    }

    getShapes = (entity) => {
        let wktShapes = [];
        if (entity.searchResultType === ROUTE.type) {
            wktShapes = entity.routes ? entity.routes.map(r => r.shape_wkt) : [];
        } else if ([BUS.type, TRAIN.type, FERRY.type].includes(entity.searchResultType)) {
            wktShapes = entity.trip && entity.trip.shape_wkt ? [entity.trip.shape_wkt] : [];
        } else if (entity.searchResultType === STOP.type) {
            wktShapes = this.props.currentDetailKey === entity.key && entity.routes ? entity.routes.map(r => r.shape_wkt) : [];
        }
        return wktShapes.map(wktShape => getAllCoordinatesFromWKT(wktShape));
    };

    getRouteColors = (entity) => {
        let routeColors = [];
        if (entity.searchResultType === ROUTE.type) {
            routeColors = [get(entity, 'route_color')];
        } else if ([BUS.type, TRAIN.type, FERRY.type].includes(entity.searchResultType)) {
            routeColors = [get(entity, 'route.route_color')];
        } else if (entity.searchResultType === STOP.type) {
            routeColors = this.props.currentDetailKey === entity.key && entity.routes ? entity.routes.map(r => r.route_color) : [];
        }
        return routeColors.map(color => color && `#${color}`);
    };

    handleClick = (event) => {
        event.target.bringToFront();
        event.target.openPopup(event.latlng);
    };

    handlePopupOpen = (entity) => {
        this.props.updateHoveredEntityKey(entity.key);
    };

    handlePopupClose = () => {
        this.props.updateHoveredEntityKey('');
    };

    componentDidUpdate() {
        if (this.polylineGroupRef.current) this.polylineGroupRef.current.leafletElement.bringToBack();
    }

    render() {
        const { visibleEntities } = this.props;
        const isCurrentEntityUnchecked = !find(visibleEntities, visibleEntity => visibleEntity.key === this.props.currentDetailKey);
        return !isEmpty(visibleEntities)
            ? (
                <FeatureGroup ref={ this.polylineGroupRef }>
                    {visibleEntities.map((entity) => {
                        const shapes = this.getShapes(entity);
                        const routeColors = this.getRouteColors(entity);
                        return !isEmpty(shapes) && shapes.map((shape, index) => {
                            let routeColor = routeColors.length === 1 ? routeColors[0] : routeColors[index];
                            if (!this.props.useRealtimeMapRouteColors) {
                                routeColor = ROUTE_COLOR;
                            }
                            return (
                                <Polyline
                                    positions={ [shape] }
                                    weight={ 5 }
                                    color={ this.props.hoveredEntityKey === entity.key ? HIGHLIGHTED_ROUTE_COLOR : routeColor || ROUTE_COLOR }
                                    onClick={ this.handleClick }
                                    opacity={
                                        this.props.currentDetailKey === entity.key
                                        || this.props.hoveredEntityKey === entity.key
                                        || !this.props.currentDetailKey
                                        || isCurrentEntityUnchecked ? 1 : 0.4
                                    }
                                    key={ `${entity.key}-${generateUniqueID()}` }
                                    onPopupOpen={ () => this.handlePopupOpen(entity) }
                                    onPopupClose={ this.handlePopupClose }
                                >
                                    {entity.searchResultType === ROUTE.type && (<EntityPopup entity={ entity } />)}
                                </Polyline>
                            );
                        });
                    })}
                </FeatureGroup>
            )
            : null;
    }
}

export default connect(
    state => ({
        useRealtimeMapRouteColors: useRealtimeMapRouteColors(state),
    }),
    { },
)(props => (
    <LeafletConsumer>
        {({ map }) => <TripShapeLayer { ...props } leafletMap={ map } />}
    </LeafletConsumer>
));
