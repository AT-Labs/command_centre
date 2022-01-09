import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import {
    getVehiclesFilterIsShowingDirectionInbound,
    getVehiclesFilterIsShowingDirectionOutbound,
} from '../../../redux/selectors/realtime/vehicles';

class VehicleFilterByDirection extends React.Component {
    static propTypes = {
        isShowingDirectionInbound: PropTypes.bool.isRequired,
        isShowingDirectionOutbound: PropTypes.bool.isRequired,
        mergeVehicleFilters: PropTypes.func.isRequired,
    };

    handleShowingInboundChange = (event) => {
        this.props.mergeVehicleFilters({ isShowingDirectionInbound: event.target.checked });
    };

    handleShowingOutboundChange = (event) => {
        this.props.mergeVehicleFilters({ isShowingDirectionOutbound: event.target.checked });
    };

    render() {
        return (
            <>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            checked={ this.props.isShowingDirectionInbound }
                            onChange={ this.handleShowingInboundChange }
                            className="vehicle-filter-by-direction__checkbox"
                        />
                        <span className="font-weight-light">Inbound</span>
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            checked={ this.props.isShowingDirectionOutbound }
                            onChange={ this.handleShowingOutboundChange }
                            className="vehicle-filter-by-direction__checkbox"
                        />
                        <span className="font-weight-light">Outbound</span>
                    </Label>
                </FormGroup>
            </>
        );
    }
}

export default connect(
    state => ({
        isShowingDirectionInbound: getVehiclesFilterIsShowingDirectionInbound(state),
        isShowingDirectionOutbound: getVehiclesFilterIsShowingDirectionOutbound(state),
    }),
    { mergeVehicleFilters },
)(VehicleFilterByDirection);
