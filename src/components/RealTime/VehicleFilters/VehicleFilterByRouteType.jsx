import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'reactstrap';

import './VehicleFilterByRouteType.scss';
import VEHICLE_TYPE, { TRAIN_TYPE_ID, BUS_TYPE_ID, FERRY_TYPE_ID } from '../../../types/vehicle-types';
import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import { getVehiclesFilterRouteType } from '../../../redux/selectors/realtime/vehicles';

export const DEFAULT_ROUTE_TYPE = BUS_TYPE_ID;

class VehicleFilterByRouteType extends React.Component {
    static propTypes = {
        mergeVehicleFilters: PropTypes.func.isRequired,
        routeType: PropTypes.number,
    };

    static defaultProps = {
        routeType: null,
    };

    toggleRouteTypeFilter = (newRouteType) => {
        const routeType = newRouteType === this.props.routeType ? null : newRouteType;
        this.props.mergeVehicleFilters({ routeType });
    };

    createButton = type => (
        <Button
            className={ `vehicle-filters__${VEHICLE_TYPE[type].type} btn btn-white ${this.props.routeType === type ? 'btn--is-active' : ''} text-capitalize border border-primary` }
            onClick={ () => this.toggleRouteTypeFilter(type) }
            tabIndex="0">
            { VEHICLE_TYPE[type].type }
        </Button>
    );

    render() {
        return (
            <ButtonGroup className="btn-group--filter-by-route-type">
                { this.createButton(BUS_TYPE_ID) }
                { this.createButton(TRAIN_TYPE_ID) }
                { this.createButton(FERRY_TYPE_ID) }
            </ButtonGroup>
        );
    }
}

export default connect(
    state => ({
        routeType: getVehiclesFilterRouteType(state),
    }),
    { mergeVehicleFilters },
)(VehicleFilterByRouteType);
