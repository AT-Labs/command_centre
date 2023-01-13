import { groupBy, isEmpty, map, omit } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { LayerGroup } from 'react-leaflet';
import { connect } from 'react-redux';
import { getVisibleVehicles, getFilteredVehicles } from '../../../../redux/selectors/realtime/vehicles';
import { getFleetState, getFleetVehicleType } from '../../../../redux/selectors/static/fleet';
import VehicleClusterLayer from './VehicleClusterLayer';
import { getAllocations } from '../../../../redux/selectors/control/blocks';
import { getVehicleDetail } from '../../../../redux/selectors/realtime/detail';

class VehicleLayer extends React.PureComponent {
    static propTypes = {
        vehicles: PropTypes.object.isRequired,
        vehicleAllocations: PropTypes.object.isRequired,
        allFleet: PropTypes.object.isRequired,
        highlightedVehicle: PropTypes.object,
        filteredVehicles: PropTypes.object,
        tabIndexOverride: PropTypes.number,
    };

    static defaultProps = {
        filteredVehicles: [],
        highlightedVehicle: undefined,
        tabIndexOverride: 0,
    };

    groupVehicles = vehicles => groupBy(vehicles, vehicle => getFleetVehicleType(this.props.allFleet[vehicle.id]));

    setVehiclesToRender = () => {
        const allVehicles = this.groupVehicles(this.props.vehicles);
        if (!isEmpty(this.props.highlightedVehicle)) {
            const unselectedVehicles = this.groupVehicles(omit(this.props.filteredVehicles, Object.keys(this.props.vehicles)));
            const vehicleKeys = Object.keys(unselectedVehicles);
            vehicleKeys.forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(unselectedVehicles, key)) {
                    allVehicles[`unselected${key}`] = unselectedVehicles[key];
                }
            });
        }
        return allVehicles;
    };

    render() {
        const groupedVehicles = this.setVehiclesToRender();

        return (
            <LayerGroup>
                {map(groupedVehicles, (vehiclesByType, key) => key
                    && (
                        <VehicleClusterLayer
                            key={ key }
                            vehicles={ vehiclesByType }
                            vehicleAllocations={ this.props.vehicleAllocations }
                            vehicleType={ key }
                            tabIndexOverride={ this.props.tabIndexOverride }
                        />
                    ))}
            </LayerGroup>
        );
    }
}

export default connect(state => ({
    vehicles: getVisibleVehicles(state),
    vehicleAllocations: getAllocations(state),
    allFleet: getFleetState(state),
    highlightedVehicle: getVehicleDetail(state),
    filteredVehicles: getFilteredVehicles(state),
}))(VehicleLayer);
