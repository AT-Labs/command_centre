import { isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'reactstrap';
import { Popup } from 'react-leaflet';
import { connect } from 'react-redux';
import { getViewDetailKey } from '../../../../redux/selectors/realtime/detail';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { routeSelected } from '../../../../redux/actions/realtime/detail/route';
import { stopSelected } from '../../../../redux/actions/realtime/detail/stop';
import { updateHoveredEntityKey } from '../../../../redux/actions/realtime/map';
import './EntityPopup.scss';

class EntityPopup extends React.PureComponent {
    static propTypes = {
        entity: PropTypes.object.isRequired,
        routeSelected: PropTypes.func.isRequired,
        stopSelected: PropTypes.func.isRequired,
        updateHoveredEntityKey: PropTypes.func.isRequired,
        currentDetailKey: PropTypes.string,
    };

    static defaultProps = {
        currentDetailKey: '',
    }

    handleViewDetails = (entity) => {
        this.props.updateHoveredEntityKey('');
        if (entity.searchResultType === SEARCH_RESULT_TYPE.ROUTE.type) {
            this.props.routeSelected(entity);
        } else if (entity.searchResultType === SEARCH_RESULT_TYPE.STOP.type) {
            this.props.stopSelected(entity);
        }
    }

    renderRoutePopupContent() {
        const { entity } = this.props;
        const activeRouteVariants = entity.routes && entity.routes.filter(routeVariant => routeVariant.vehicles.length);
        return (
            <div>
                <div className="entity-popup-title">{ `Route ${entity.route_short_name}` }</div>
                {
                    !isEmpty(activeRouteVariants) && activeRouteVariants.map((route) => {
                        const runningVehicles = ` (${route.vehicles.length} running vehicle${route.vehicles.length > 1 ? 's' : ''})`;
                        return (<div className="entity-popup-content" key={ route.routeVariantName }>{ `${route.routeVariantName}${runningVehicles}` }</div>);
                    })
                }
                {
                    isEmpty(activeRouteVariants) && (<div className="entity-popup-content">No vehicles are running</div>)
                }
            </div>
        );
    }

    renderStopPopupContent() {
        const { entity } = this.props;
        return (
            <div>
                <div className="entity-popup-title">{ `Stop ${entity.stop_id}` }</div>
                <div className="entity-popup-content">{ entity.stop_name }</div>
            </div>
        );
    }

    render() {
        const { entity } = this.props;
        return (
            <Popup
                className="entity-popup"
                closeButton={ false }
            >
                { entity.searchResultType === SEARCH_RESULT_TYPE.ROUTE.type && this.renderRoutePopupContent() }
                { entity.searchResultType === SEARCH_RESULT_TYPE.STOP.type && this.renderStopPopupContent() }
                { (!this.props.currentDetailKey || this.props.currentDetailKey !== entity.key) && (
                    <Button className="cc-btn-secondary w-100" onClick={ () => this.handleViewDetails(entity) }>
                        View details
                    </Button>
                ) }
            </Popup>
        );
    }
}

export default connect(
    state => ({
        currentDetailKey: getViewDetailKey(state),
    }), { updateHoveredEntityKey, routeSelected, stopSelected },
)(EntityPopup);
