import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get } from 'lodash-es';
import { routeSelected, routeChecked } from '../../../../../redux/actions/realtime/detail/route';
import { clearDetail, addSelectedSearchResult } from '../../../../../redux/actions/realtime/detail/common';
import { updateRealTimeDetailView } from '../../../../../redux/actions/navigation';
import { formatRouteSearchResults } from '../../../../../redux/actions/search';
import { getVehicleDetail, getVehicleFleetInfo } from '../../../../../redux/selectors/realtime/detail';
import { getJoinedVehicleLabel } from '../../../../../redux/selectors/realtime/vehicles';
import { getFleetVehicleAgencyName, getFleetVehicleType, getFleetVehicleLabel, getFleetVehicleTag, getFleetVehicleDepotName } from '../../../../../redux/selectors/static/fleet';
import { getAllocations } from '../../../../../redux/selectors/control/blocks';
import { formatRealtimeDetailListItemKey } from '../../../../../utils/helpers';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';
import VIEW_TYPE from '../../../../../types/view-types';
import VehicleCapacityOccupancy from './VehicleCapacityOccupancy';
import './VehicleDetails.scss';
import { UNSCHEDULED_TAG } from '../../../../../types/vehicle-types';

const VehicleDetails = (props) => {
    const { vehicleDetail, vehicleFleetInfo, vehicleAllocations } = props;
    const { ROUTE } = SEARCH_RESULT_TYPE;
    const createDetailRow = (name, value) => (
        <Fragment key={ name }>
            <dt className="font-size-md">{name}</dt>
            <dd>{value}</dd>
        </Fragment>
    );
    const selectRoute = (route) => {
        props.clearDetail();
        props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.LIST);
        const routeSearchResult = formatRouteSearchResults([route])[0];
        const routeSelectedSearchResult = {
            ...route,
            ...routeSearchResult,
            searchResultType: ROUTE.type,
            key: formatRealtimeDetailListItemKey(ROUTE.type, route.route_id),
            checked: true,
        };
        props.addSelectedSearchResult(routeSelectedSearchResult);
        props.routeChecked(routeSelectedSearchResult);
        props.routeSelected(routeSelectedSearchResult);
    };

    const nonTripDescription = () => {
        if (vehicleDetail.tags?.includes(UNSCHEDULED_TAG)) {
            return 'Unscheduled Service';
        }

        return 'Not In Service';
    };

    const vehicleLabel = getJoinedVehicleLabel(vehicleDetail, vehicleAllocations) || getFleetVehicleLabel(vehicleFleetInfo);
    const tripId = get(vehicleDetail, 'trip.tripId');
    const tripHeadsign = get(vehicleDetail, 'trip.trip_headsign');
    const startTime = get(vehicleDetail, 'trip.startTime');
    const route = get(vehicleDetail, 'route');
    const routeId = get(route, 'route_id');
    const routeType = getFleetVehicleType(vehicleFleetInfo) || get(route, 'route_type');
    const routeName = get(route, 'route_short_name');
    const agencyName = getFleetVehicleAgencyName(vehicleFleetInfo) || get(route, 'agency_name');
    const depotName = getFleetVehicleDepotName(vehicleFleetInfo);
    const vehicleTag = getFleetVehicleTag(vehicleFleetInfo);
    return (
        <section className="vehicle-detail-view__vehicle-details">
            <h2 className="text-capitalize px-4 pt-3 border-bottom">
                {`${routeType || ''} ${vehicleLabel}`}
            </h2>

            <dl className="vehicle-details__list px-4 pt-3">
                <VehicleCapacityOccupancy />
                {
                    ((tripId && [
                        ['Route:', (
                            <Button
                                className="cc-btn-link pl-0"
                                onClick={ () => selectRoute(route) }>
                                { routeName }
                            </Button>
                        )],
                        ['Description:', tripHeadsign || ' '],
                        ['Operator:', agencyName],
                        ['Depot:', depotName || ' '],
                        ...(vehicleTag ? [['Tags:', vehicleTag]] : []),
                        ['Trip Start Time:', startTime],
                        ['Route ID:', routeId],
                        ['Trip ID:', tripId],

                    ]) || [
                        ['Description:', nonTripDescription()],
                        ['Operator:', agencyName],
                        ['Depot:', depotName || ' '],
                        ...(vehicleTag ? [['Tags:', vehicleTag]] : []),
                    ]).map(r => createDetailRow(...r))
                }
            </dl>
        </section>
    );
};

VehicleDetails.propTypes = {
    vehicleDetail: PropTypes.object.isRequired,
    vehicleFleetInfo: PropTypes.object,
    routeSelected: PropTypes.func.isRequired,
    routeChecked: PropTypes.func.isRequired,
    vehicleAllocations: PropTypes.object.isRequired,
    clearDetail: PropTypes.func.isRequired,
    updateRealTimeDetailView: PropTypes.func.isRequired,
    addSelectedSearchResult: PropTypes.func.isRequired,
};

VehicleDetails.defaultProps = {
    vehicleFleetInfo: {},
};

export { VehicleDetails };

export default connect(
    state => ({
        vehicleDetail: getVehicleDetail(state),
        vehicleFleetInfo: getVehicleFleetInfo(state),
        vehicleAllocations: getAllocations(state),
    }),
    { routeSelected, routeChecked, clearDetail, updateRealTimeDetailView, addSelectedSearchResult },
)(VehicleDetails);
