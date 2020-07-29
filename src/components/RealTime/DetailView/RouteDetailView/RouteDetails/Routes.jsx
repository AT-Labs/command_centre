import _ from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button, Collapse } from 'reactstrap';
import { vehicleSelected } from '../../../../../redux/actions/realtime/detail/vehicle';
import { getRoutesByRoute } from '../../../../../redux/selectors/realtime/detail';
import { getJoinedVehicleLabel, getVehicleTripStartTimeISO } from '../../../../../redux/selectors/realtime/vehicles';
import DetailLoader from '../../../../Common/Loader/DetailLoader';
import './Routes.scss';
import { getAllocations } from '../../../../../redux/selectors/control/blocks';

class Routes extends Component {
    static propTypes = {
        routes: PropTypes.array,
        vehicleAllocations: PropTypes.object.isRequired,
        vehicleSelected: PropTypes.func.isRequired,
    }

    static defaultProps = {
        routes: undefined,
    }

    constructor(props) {
        super(props);

        this.state = {
            routeVariantSelected: null,
        };
    }

    toggleSelectedRoute = ({ routeVariantName }) => {
        this.setState(({ routeVariantSelected }) => ({ routeVariantSelected: routeVariantSelected === routeVariantName ? null : routeVariantName }));
    }

    renderSelectedRouteInfo = route => (
        <Collapse
            className="mx-5 my-2"
            isOpen={ this.state.routeVariantSelected === route.routeVariantName }>
            <div className="route-detail-view__vehicles-table">
                <div className="row py-2">
                    <div className="col-6 font-weight-bold">Vehicle</div>
                    <div className="col-6 text-right font-weight-bold">Trip start time</div>
                </div>
                <div className="row">
                    { _.map(_.orderBy(route.vehicles, ['arrivalTime'], 'asc'), (vehicle) => {
                        const startTime = getVehicleTripStartTimeISO(vehicle);
                        const formattedStartTime = (startTime && moment(startTime).format('HH:mm')) || '-';
                        return (
                            <div
                                key={ vehicle.id }
                                className="route-detail-view__vehicles-tr custom-table--hover col-12 py-2">
                                <div className="row">
                                    <div className="col-10 text-info">
                                        <Button
                                            className="cc-btn-link pl-0"
                                            onClick={ () => this.props.vehicleSelected(vehicle) }>
                                            { getJoinedVehicleLabel(vehicle, this.props.vehicleAllocations) }
                                        </Button>
                                    </div>
                                    <div className="col-2 text-right">
                                        {formattedStartTime}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Collapse>
    );

    render() {
        const { routes } = this.props;
        const routesWithVehicles = _.filter(routes, route => !_.isEmpty(route.vehicles));
        const areVehiclesForRouteAvailable = _.some(routesWithVehicles, route => _.has(route, 'vehicles'));
        const shouldShowDetailLoader = !routes || (!_.isEmpty(routesWithVehicles) && !areVehiclesForRouteAvailable);
        const shouldShowNoResults = routes && !_.isEmpty(routes) && _.isEmpty(routesWithVehicles);

        return (
            <section className="route-detail-view__routes col-12">
                <h4 className="text-uppercase mb-0">
                    Routes with running vehicles
                </h4>

                { shouldShowDetailLoader && <DetailLoader /> }

                { shouldShowNoResults && <p className="text-muted">No Results</p> }

                { areVehiclesForRouteAvailable && (
                    <div className="route-detail-view__routes-table">
                        <div className="row py-3">
                            <div className="col-6 font-weight-bold">Route</div>
                            <div className="col-6 text-right font-weight-bold">Vehicles</div>
                        </div>
                        <div className="row">
                            { _.map(routesWithVehicles, (route, index) => (
                                <div
                                    className={ `route-detail-view__routes-tr col-12 ${index % 2 ? 'bg-white' : 'bg-at-ocean-tint-10'}` }
                                    key={ route.routeVariantName }>
                                    <div className="custom-table--hover row py-3"
                                        role="button"
                                        tabIndex="0"
                                        onClick={ () => this.toggleSelectedRoute(route) }
                                        onKeyPress={ () => this.toggleSelectedRoute(route) }>
                                        <div className="col-10">{ route.routeVariantName }</div>
                                        <div className="col-2 text-right">{ route.vehicles.length }</div>
                                    </div>
                                    { this.renderSelectedRouteInfo(route) }
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        );
    }
}

export default connect(
    state => ({
        routes: getRoutesByRoute(state),
        vehicleAllocations: getAllocations(state),
    }),
    { vehicleSelected },
)(Routes);
