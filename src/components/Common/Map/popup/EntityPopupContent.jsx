import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash-es';
import { MdWest } from 'react-icons/md';
import IconButton from '@mui/material/IconButton';
import DisruptionDetails from '../TrafficLayer/DisruptionDetails';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { routeSelected } from '../../../../redux/actions/realtime/detail/route';
import { stopSelected } from '../../../../redux/actions/realtime/detail/stop';
import { updateHoveredEntityKey } from '../../../../redux/actions/realtime/map';
import { getViewDetailKey } from '../../../../redux/selectors/realtime/detail';
import './EntityPopupContent.scss';

class EntityPopupContent extends React.PureComponent {
    static propTypes = {
        entity: PropTypes.object.isRequired,
        routeSelected: PropTypes.func.isRequired,
        stopSelected: PropTypes.func.isRequired,
        updateHoveredEntityKey: PropTypes.func.isRequired,
        currentDetailKey: PropTypes.string,
        disruptions: PropTypes.array,
        causes: PropTypes.array,
        impacts: PropTypes.array,
        goToDisruptionSummary: PropTypes.func,
    };

    static defaultProps = {
        currentDetailKey: '',
        disruptions: [],
        causes: [],
        impacts: [],
        goToDisruptionSummary: () => {},
    };

    state = {
        showDisruptions: false,
    };

    handleViewDetails = (entity) => {
        this.props.updateHoveredEntityKey('');
        if (entity.searchResultType === SEARCH_RESULT_TYPE.ROUTE.type) {
            this.props.routeSelected(entity);
        } else if (entity.searchResultType === SEARCH_RESULT_TYPE.STOP.type) {
            this.props.stopSelected(entity);
        }
    };

    handleShowDisruptions = () => {
        this.setState({ showDisruptions: true });
    };

    handleBack = () => {
        this.setState({ showDisruptions: false });
    };

    renderRoutePopupContent() {
        const { entity } = this.props;
        const activeRouteVariants = entity.routes && entity.routes.filter(routeVariant => routeVariant.vehicles.length);
        return (
            <div>
                <div className="entity-popup-title">{`Route ${entity.route_short_name}`}</div>
                {
                    !isEmpty(activeRouteVariants) && activeRouteVariants.map((route) => {
                        const runningVehicles = ` (${route.vehicles.length} running vehicle${route.vehicles.length > 1 ? 's' : ''})`;
                        return (
                            <div className="entity-popup-content"
                                key={ route.routeVariantName }>
                                {`${route.routeVariantName}${runningVehicles}`}
                            </div>
                        );
                    })
                }
                {
                    isEmpty(activeRouteVariants) && (
                        <div className="entity-popup-content">No vehicles are running</div>)
                }
            </div>
        );
    }

    renderStopPopupContent() {
        const { entity } = this.props;
        return (
            <div>
                <div className="entity-popup-title">{`Stop ${entity.stop_code}`}</div>
                <div className="entity-popup-content">{entity.stop_name}</div>
            </div>
        );
    }

    render() {
        const { entity, disruptions, causes, impacts, goToDisruptionSummary, currentDetailKey } = this.props;
        const { showDisruptions } = this.state;

        if (showDisruptions && entity.searchResultType === SEARCH_RESULT_TYPE.STOP.type) {
            return (
                <div>
                    <IconButton
                        onClick={ this.handleBack }
                        aria-label="Back"
                        className="entity-popup-back-btn"
                    >
                        <MdWest size={ 20 } />
                    </IconButton>
                    <DisruptionDetails
                        disruptions={ disruptions }
                        stopTitle={ `${entity.stop_code} - ${entity.stop_name}` }
                        impacts={ impacts }
                        causes={ causes }
                        goToDisruptionSummary={ goToDisruptionSummary }
                    />
                </div>
            );
        }

        return (
            <div className="entity-popup">
                {entity.searchResultType === SEARCH_RESULT_TYPE.ROUTE.type && this.renderRoutePopupContent()}
                {entity.searchResultType === SEARCH_RESULT_TYPE.STOP.type && this.renderStopPopupContent()}
                {(!currentDetailKey || currentDetailKey !== entity.key) && (
                    <div>
                        <Button className="cc-btn-secondary w-100" onClick={ () => this.handleViewDetails(entity) }>
                            View details
                        </Button>
                        {disruptions?.length > 0 && entity.searchResultType === SEARCH_RESULT_TYPE.STOP.type && (
                            <Button className="cc-btn-secondary w-100 mt-2" onClick={ this.handleShowDisruptions }>
                                View Disruption details
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default connect(state => ({
    currentDetailKey: getViewDetailKey(state),
}), { updateHoveredEntityKey, routeSelected, stopSelected })(EntityPopupContent);
