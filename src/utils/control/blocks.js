import _ from 'lodash-es';
import moment from 'moment-timezone';

export const BLOCKS_SERVICE_DATE_FORMAT = 'YYYY-MM-DD';

export const getTripVehiclesDisplay = ({ vehicles }) => (vehicles ? _.map(vehicles, 'label').join('/') : '');

export const getVehiclesFromBlockTrips = (block) => {
    const vehicles = [];

    if (block.operationalTrips) {
        block.operationalTrips.forEach((trip) => {
            if (trip.vehicles && trip.vehicles.length > 0) {
                vehicles.push({
                    vehicles: trip.vehicles,
                    buttonLabel: _.map(trip.vehicles, 'label').join('/'),
                });
            }
        });
    }

    return _.uniqBy(vehicles, 'buttonLabel');
};

// TODO: fix lint issue
export const getVehicleAllocationKey = (tripId, startDate = moment().tz('Pacific/Auckland').format('YYYYMMDD'), startTime) => `${startDate.replace(/-/g, '')}-${tripId}-${startTime}`; // eslint-disable-line default-param-last
