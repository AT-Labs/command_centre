import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

import Icon from '../../Common/Icon/Icon';
import { VEHICLE_OCCUPANCY_STATUS_TYPE, occupancyStatusToIconSvg } from '../../../types/vehicle-occupancy-status-types';
import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import { getVehiclesFilterShowingOccupancyLevels } from '../../../redux/selectors/realtime/vehicles';

class VehicleFilterOccupancy extends React.PureComponent {
    static propTypes = {
        mergeVehicleFilters: PropTypes.func.isRequired,
        showingOccupancyLevels: PropTypes.arrayOf(PropTypes.string).isRequired,
    };

    handleOccupancyLevel = (e) => {
        const { showingOccupancyLevels } = this.props;
        const { name, checked } = e.target;
        const occupancyLevels = checked ? showingOccupancyLevels.concat(name) : showingOccupancyLevels.filter(level => level !== name);
        this.props.mergeVehicleFilters({ showingOccupancyLevels: occupancyLevels });
    };

    render() {
        const { showingOccupancyLevels } = this.props;
        return (
            <React.Fragment>
                <div className="mt-3 mb-1">Occupancy</div>
                {Object.values(VEHICLE_OCCUPANCY_STATUS_TYPE).map(level => (
                    <FormGroup key={ level } check>
                        <Label check>
                            <Input
                                type="checkbox"
                                name={ level }
                                checked={ showingOccupancyLevels.includes(level) }
                                onChange={ this.handleOccupancyLevel }
                                className="vehicle-filter-by-occupancy__checkbox"
                            />
                            <span className="font-weight-light">
                                <Icon className="icon d-inline-block ml-2" icon={ occupancyStatusToIconSvg(level) } />
                            </span>
                        </Label>
                    </FormGroup>
                ))}
            </React.Fragment>
        );
    }
}

export default connect(state => ({
    showingOccupancyLevels: getVehiclesFilterShowingOccupancyLevels(state),
}),
{ mergeVehicleFilters })(VehicleFilterOccupancy);
