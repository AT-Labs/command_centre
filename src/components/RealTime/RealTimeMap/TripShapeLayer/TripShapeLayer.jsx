import { isEmpty, find } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { FeatureGroup, Polyline } from 'react-leaflet';
import { connect } from 'react-redux';
import { getViewDetailKey, getVisibleEntities } from '../../../../redux/selectors/realtime/detail';
import { ROUTE_COLOR, HIGHLIGHTED_ROUTE_COLOR } from '../constants';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { getAllCoordinatesFromWKT } from '../../../../utils/helpers';
import { getHoveredEntityKey } from '../../../../redux/selectors/realtime/map';
import { updateHoveredEntityKey } from '../../../../redux/actions/realtime/map';
import EntityPopup from '../popup/EntityPopup';

const { ROUTE, STOP, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;
class TripShapeLayer extends React.PureComponent {
    static propTypes = {
        visibleEntities: PropTypes.array,
        currentDetailKey: PropTypes.string,
        hoveredEntityKey: PropTypes.string,
        updateHoveredEntityKey: PropTypes.func.isRequired,
    };

    static defaultProps = {
        visibleEntities: [],
        currentDetailKey: '',
        hoveredEntityKey: '',
    }

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
    }

    handleClick = (event) => {
        event.target.bringToFront();
        event.target.openPopup(event.latlng);
    }

    handlePopupOpen = (entity) => {
        this.props.updateHoveredEntityKey(entity.key);
    }

    handlePopupClose = () => {
        this.props.updateHoveredEntityKey('');
    }

    componentDidUpdate = () => {
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
                        return !isEmpty(shapes) && (
                            <Polyline
                                positions={ shapes }
                                weight={ 5 }
                                color={ this.props.hoveredEntityKey === entity.key ? HIGHLIGHTED_ROUTE_COLOR : ROUTE_COLOR }
                                onClick={ this.handleClick }
                                opacity={
                                    this.props.currentDetailKey === entity.key
                                    || this.props.hoveredEntityKey === entity.key
                                    || !this.props.currentDetailKey
                                    || isCurrentEntityUnchecked ? 1 : 0.4
                                }
                                key={ entity.key }
                                onPopupOpen={ () => this.handlePopupOpen(entity) }
                                onPopupClose={ this.handlePopupClose }
                            >
                                {entity.searchResultType === ROUTE.type && (<EntityPopup entity={ entity } />)}
                            </Polyline>
                        );
                    })}
                </FeatureGroup>
            )
            : null;
    }
}

export default connect(state => ({
    visibleEntities: getVisibleEntities(state),
    currentDetailKey: getViewDetailKey(state),
    hoveredEntityKey: getHoveredEntityKey(state),
}), { updateHoveredEntityKey })(TripShapeLayer);
