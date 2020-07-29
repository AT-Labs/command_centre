import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { routeSelected } from '../../../../../redux/actions/realtime/detail/route';
import { getTripHeadsign, getVehicleDetail, getVehicleFleetInfo } from '../../../../../redux/selectors/realtime/detail';
import {
    getVehicleRoute,
    getVehicleRouteId,
    getVehicleRouteName,
    getVehicleTripId,
    getJoinedVehicleLabel,
    getVehicleTripStartTime,
    getVehicleRouteType,
    getVehicleAgencyName,
} from '../../../../../redux/selectors/realtime/vehicles';
import { getFleetVehicleAgencyName, getFleetVehicleType, getFleetVehicleLabel } from '../../../../../redux/selectors/static/fleet';
import VehicleCapacityOccupancy from './VehicleCapacityOccupancy';
import './VehicleDetails.scss';
import { getAllocations } from '../../../../../redux/selectors/control/blocks';

const VehicleDetails = (props) => {
    const { vehicleDetail, tripHeadsign, vehicleFleetInfo, vehicleAllocations } = props;

    const createDetailRow = (name, value) => (
        <Fragment key={ name }>
            <dt className="font-size-sm">{name}</dt>
            <dd>{value}</dd>
        </Fragment>
    );

    const vehicleLabel = getJoinedVehicleLabel(vehicleDetail, vehicleAllocations) || getFleetVehicleLabel(vehicleFleetInfo);
    const tripId = getVehicleTripId(vehicleDetail);
    const startTime = getVehicleTripStartTime(vehicleDetail);
    const route = getVehicleRoute(vehicleDetail);
    const routeId = getVehicleRouteId(vehicleDetail);
    const routeType = getFleetVehicleType(vehicleFleetInfo) || getVehicleRouteType(vehicleDetail);
    const routeName = getVehicleRouteName(vehicleDetail);
    const agencyName = getFleetVehicleAgencyName(vehicleFleetInfo) || getVehicleAgencyName(vehicleDetail);

    return (
        <section className="vehicle-detail-view__vehicle-details px-3 pt-3">
            <h2 className="font-weight-normal text-capitalize">
                {`${routeType || ''} ${vehicleLabel}`}
            </h2>

            <dl className="vehicle-details__list my-3">
                <VehicleCapacityOccupancy />
                {
                    ((tripId && [
                        ['Route:', (
                            <Button
                                className="cc-btn-link pl-0"
                                onClick={ () => props.routeSelected(route) }>
                                { routeName }
                            </Button>
                        )],
                        ['Description:', tripHeadsign],
                        ['Operator:', agencyName],
                        ['Trip Start Time:', startTime],
                        ['Route ID:', routeId],
                        ['Trip ID:', tripId],

                    ]) || [
                        ['Description:', 'Not In Service'],
                        ['Operator:', agencyName],
                    ]).map(r => createDetailRow(...r))
                }
            </dl>
        </section>
    );
};

VehicleDetails.propTypes = {
    tripHeadsign: PropTypes.string,
    vehicleDetail: PropTypes.object.isRequired,
    vehicleFleetInfo: PropTypes.object,
    routeSelected: PropTypes.func.isRequired,
    vehicleAllocations: PropTypes.object.isRequired,
};

VehicleDetails.defaultProps = {
    tripHeadsign: '',
    vehicleFleetInfo: {},
};

export default connect(
    state => ({
        vehicleDetail: getVehicleDetail(state),
        vehicleFleetInfo: getVehicleFleetInfo(state),
        tripHeadsign: getTripHeadsign(state),
        vehicleAllocations: getAllocations(state),
    }),
    { routeSelected },
)(VehicleDetails);
