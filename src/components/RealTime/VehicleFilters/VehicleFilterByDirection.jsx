import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import {
    getVehiclesFilterIsShowingDirectionInbound,
    getVehiclesFilterIsShowingDirectionOutbound,
    getVehiclesFilterIsShowingSchoolBus,
    getVehiclesFilterRouteType,
} from '../../../redux/selectors/realtime/vehicles';
import { BUS_TYPE_ID } from '../../../types/vehicle-types';

class VehicleFilterByDirection extends React.Component {
    static propTypes = {
        isShowingDirectionInbound: PropTypes.bool.isRequired,
        isShowingDirectionOutbound: PropTypes.bool.isRequired,
        isShowingSchoolBus: PropTypes.bool.isRequired,
        mergeVehicleFilters: PropTypes.func.isRequired,
        routeType: PropTypes.number.isRequired,
        className: PropTypes.string,
    };

    static defaultProps = {
        className: '',
    };

    handleShowingInboundChange = (event) => {
        this.props.mergeVehicleFilters({ isShowingDirectionInbound: event.target.checked });
    };

    handleShowingOutboundChange = (event) => {
        this.props.mergeVehicleFilters({ isShowingDirectionOutbound: event.target.checked });
    };

    handleShowingSchoolBusChange = (event) => {
        this.props.mergeVehicleFilters({ isShowingSchoolBus: event.target.checked });
    };

    render() {
        return (
            <>
                <FormGroup check>
                    <Label className={ this.props.className } check>
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
                    <Label className={ this.props.className } check>
                        <Input
                            type="checkbox"
                            checked={ this.props.isShowingDirectionOutbound }
                            onChange={ this.handleShowingOutboundChange }
                            className="vehicle-filter-by-direction__checkbox"
                        />
                        <span className="font-weight-light">Outbound</span>
                    </Label>
                </FormGroup>
                { this.props.routeType === BUS_TYPE_ID && (
                    <FormGroup check className="mt-3">
                        <Label className={ this.props.className } check>
                            <Input
                                type="checkbox"
                                checked={ this.props.isShowingSchoolBus }
                                onChange={ this.handleShowingSchoolBusChange }
                                className="vehicle-filter-by-school-bus__checkbox"
                            />
                            <span className="font-weight-light">School Bus</span>
                        </Label>
                    </FormGroup>
                ) }
            </>
        );
    }
}

export default connect(
    state => ({
        isShowingDirectionInbound: getVehiclesFilterIsShowingDirectionInbound(state),
        isShowingDirectionOutbound: getVehiclesFilterIsShowingDirectionOutbound(state),
        isShowingSchoolBus: getVehiclesFilterIsShowingSchoolBus(state),
        routeType: getVehiclesFilterRouteType(state),
    }),
    { mergeVehicleFilters },
)(VehicleFilterByDirection);
