import { map, orderBy, lowerCase, isEmpty, some, has, filter } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Button, Collapse } from 'reactstrap';
import { vehicleSelected } from '../../../../../redux/actions/realtime/detail/vehicle';
import { getRoutesByRoute } from '../../../../../redux/selectors/realtime/detail';
import { getJoinedVehicleLabel, getVehicleTripStartTimeISO, getVehicleRouteType, getActiveRouteVehiclesOccupancyStatus } from '../../../../../redux/selectors/realtime/vehicles';
import { getActiveRouteVehiclesDelay } from '../../../../../redux/selectors/realtime/quickview';
import DetailLoader from '../../../../Common/Loader/DetailLoader';
import './Routes.scss';
import { getAllocations } from '../../../../../redux/selectors/control/blocks';
import VEHICLE_TYPES from '../../../../../types/vehicle-types';
import { formatRealtimeDetailListItemKey } from '../../../../../utils/helpers';
import { formatTripDelay, getTripDelayDisplayData } from '../../../../../utils/control/routes';
import OccupancyStatus from '../../OccupancyStatus';
import Icon from '../../../../Common/Icon/Icon';

class Routes extends Component {
    static propTypes = {
        routes: PropTypes.array,
        vehicleAllocations: PropTypes.object.isRequired,
        vehicleSelected: PropTypes.func.isRequired,
        occupancyStatuses: PropTypes.object.isRequired,
        delays: PropTypes.object.isRequired,
    };

    static defaultProps = {
        routes: undefined,
    };

    constructor(props) {
        super(props);

        this.state = {
            routeVariantSelected: null,
        };
    }

    toggleSelectedRoute = ({ routeVariantName }) => {
        this.setState(({ routeVariantSelected }) => ({ routeVariantSelected: routeVariantSelected === routeVariantName ? null : routeVariantName }));
    };

    renderSelectedRouteInfo = route => (
        <Collapse
            className="mx-1 my-2"
            isOpen={ this.state.routeVariantSelected === route.routeVariantName }>
            <div className="route-detail-view__vehicles-table font-size-sm">
                <div className="route-detail-view__vehicles-th row py-3 rounded-top">
                    <div className="col-2">Vehicle</div>
                    <div className="col-3">Trip start time</div>
                    <div className="col-3">Trip status</div>
                    <div className="col-4">Occupancy</div>
                </div>
                <div className="row">
                    { map(orderBy(route.vehicles, ['arrivalTime'], 'asc'), (vehicle) => {
                        const vehicleRouteType = getVehicleRouteType(vehicle);
                        const vehicleType = vehicleRouteType ? lowerCase(VEHICLE_TYPES[vehicleRouteType].type) : '';
                        const startTime = getVehicleTripStartTimeISO(vehicle);
                        const formattedStartTime = (startTime && moment(startTime).format('HH:mm')) || '-';
                        const occupancyStatus = this.props.occupancyStatuses[vehicle.id];
                        const delayDisplayData = getTripDelayDisplayData(formatTripDelay(this.props.delays[vehicle.id]));
                        return (
                            <div
                                key={ vehicle.id }
                                className="route-detail-view__vehicles-tr custom-table--hover col-12 py-2">
                                <div className="row border-bottom">
                                    <div className="col-2 text-info px-0">
                                        <Button
                                            className="font-size-sm cc-btn-link px-0"
                                            onClick={ () => {
                                                this.props.vehicleSelected({
                                                    id: vehicle.id,
                                                    ...vehicle.vehicle,
                                                    searchResultType: vehicleType,
                                                    key: formatRealtimeDetailListItemKey(vehicleType, vehicle.id),
                                                });
                                            } }>
                                            <Icon icon={ vehicleType } className="route-detail-view__vehicle-icon float-left pr-1" />
                                            { getJoinedVehicleLabel(vehicle, this.props.vehicleAllocations) }
                                        </Button>
                                    </div>
                                    <div className="col-3 pt-2">
                                        {formattedStartTime}
                                    </div>
                                    <div className="col-3 pt-2">
                                        <p className={ delayDisplayData.className }>{ delayDisplayData.text }</p>
                                    </div>
                                    <div className="col-4 pt-2">
                                        <div className="float-left"><OccupancyStatus occupancyStatus={ occupancyStatus } /></div>
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
        const routesWithVehicles = filter(routes, route => !isEmpty(route.vehicles));
        const areVehiclesForRouteAvailable = some(routesWithVehicles, route => has(route, 'vehicles'));
        const shouldShowDetailLoader = !routes || (!isEmpty(routesWithVehicles) && !areVehiclesForRouteAvailable);
        const shouldShowNoResults = routes && !isEmpty(routes) && isEmpty(routesWithVehicles);

        return (
            <section className="route-detail-view__routes col-12">
                <h4 className="mb-0">
                    Routes
                </h4>

                { shouldShowDetailLoader && <DetailLoader /> }

                { shouldShowNoResults && <p className="text-muted">No Results</p> }

                { areVehiclesForRouteAvailable && (
                    <div className="route-detail-view__routes-table">
                        <div className="row">
                            { map(routesWithVehicles, route => (
                                <div
                                    className="route-detail-view__routes-tr col-12"
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
        occupancyStatuses: getActiveRouteVehiclesOccupancyStatus(state),
        delays: getActiveRouteVehiclesDelay(state),
    }),
    { vehicleSelected },
)(Routes);
