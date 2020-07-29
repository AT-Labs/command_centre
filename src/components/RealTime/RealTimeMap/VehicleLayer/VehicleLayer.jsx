import { groupBy, map } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { LayerGroup } from 'react-leaflet';
import { connect } from 'react-redux';
import { getVisibleVehicles } from '../../../../redux/selectors/realtime/vehicles';
import { getFleetState, getFleetVehicleType } from '../../../../redux/selectors/static/fleet';
import VehicleClusterLayer from './VehicleClusterLayer';
import { getAllocations } from '../../../../redux/selectors/control/blocks';

class VehicleLayer extends React.PureComponent {
    static propTypes = {
        vehicles: PropTypes.object.isRequired,
        vehicleAllocations: PropTypes.object.isRequired,
        allFleet: PropTypes.object.isRequired,
    };

    render() {
        const groupedVehicles = groupBy(this.props.vehicles, vehicle => getFleetVehicleType(this.props.allFleet[vehicle.id]));

        return (
            <LayerGroup>
                {map(groupedVehicles, (vehiclesByType, type) => type
                    && (
                        <VehicleClusterLayer
                            key={ type }
                            vehicles={ vehiclesByType }
                            vehicleAllocations={ this.props.vehicleAllocations }
                            vehicleType={ type } />
                    ))}
            </LayerGroup>
        );
    }
}

export default connect(state => ({
    vehicles: getVisibleVehicles(state),
    vehicleAllocations: getAllocations(state),
    allFleet: getFleetState(state),
}))(VehicleLayer);
