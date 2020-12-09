import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FormGroup, Input, Label } from 'reactstrap';
import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import { getVehiclesFilterIsShowingNIS } from '../../../redux/selectors/realtime/vehicles';

class VehicleFilterByNIS extends React.Component {
    static propTypes = {
        isShowingNIS: PropTypes.bool.isRequired,
        mergeVehicleFilters: PropTypes.func.isRequired,
    };

    handleShowingNISChange = (event) => {
        this.props.mergeVehicleFilters({ isShowingNIS: event.target.checked });
    };

    render() {
        return (
            <React.Fragment>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            checked={ this.props.isShowingNIS }
                            onChange={ this.handleShowingNISChange }
                            className="vehicle-filter-by-direction__checkbox"
                        />
                        <span className="font-weight-light">Not In Service</span>
                    </Label>
                </FormGroup>
            </React.Fragment>
        );
    }
}

export default connect(state => ({
    isShowingNIS: getVehiclesFilterIsShowingNIS(state),
}), { mergeVehicleFilters })(VehicleFilterByNIS);
