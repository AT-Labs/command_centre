import _ from 'lodash-es';
import moment from 'moment-timezone';
import { DateRange } from 'moment-range';
import { parseTime } from '../helpers';
import TRIP_STATUS_TYPES from '../../types/trip-status-types';

export const BLOCKS_SERVICE_DATE_FORMAT = 'YYYY-MM-DD';

export const getTripVehiclesDisplay = ({ vehicles }) => (vehicles ? _.map(vehicles, 'label').join('/') : '');

export const getVehiclesFromBlockTrips = (block) => {
    const vehicles = [];

    if (block.operationalTrips) {
        block.operationalTrips.forEach((trip) => {
            if (trip.vehicles) {
                vehicles.push({
                    vehicles: trip.vehicles,
                    buttonLabel: _.map(trip.vehicles, 'label').join('/'),
                });
            }
        });
    }

    return _.uniqBy(vehicles, 'buttonLabel');
};

class ExtendTrip {
    constructor(trip, vehicles, serviceDate, blockId) {
        this.blockId = blockId;
        this.trip = trip;
        this.vehicles = vehicles;
        this.serviceDate = serviceDate;
        this.externalRef = trip.externalRef;
        this.timeRange = new DateRange(
            parseTime(this.trip.startTime, this.serviceDate),
            parseTime(this.trip.endTime, this.serviceDate),
        );
    }

    isCompletedOrCancelled() {
        return [TRIP_STATUS_TYPES.completed, TRIP_STATUS_TYPES.cancelled].includes(this.trip.status);
    }

    overlaps(anotherTrip) {
        return !this.isCompletedOrCancelled() && !anotherTrip.isCompletedOrCancelled()
            && this.externalRef !== anotherTrip.externalRef && this.timeRange.overlaps(anotherTrip.timeRange);
    }
}

const prepareAllExtendTripsFromBlocks = (allBlocks, selectedBlock, selectedVehicles, tripsWillAllocate) => {
    const extendTrips = [];
    const isCurrentBlock = (currentBlock, anotherBlock) => currentBlock.operationalBlockId === anotherBlock.operationalBlockId;
    allBlocks.forEach((eachBlock) => {
        if (isCurrentBlock(selectedBlock, eachBlock)) {
            const tripsWillNotAllocate = eachBlock.operationalTrips.filter(tripInAll => !tripsWillAllocate.some(trip => trip.externalRef === tripInAll.externalRef));
            extendTrips.push(...tripsWillNotAllocate.map(trip => new ExtendTrip(trip, trip.vehicles, selectedBlock.serviceDate, selectedBlock.operationalBlockId)));
            extendTrips.push(...tripsWillAllocate.map(trip => new ExtendTrip(trip, selectedVehicles, selectedBlock.serviceDate, selectedBlock.operationalBlockId)));
        } else {
            extendTrips.push(...eachBlock.operationalTrips.map(trip => new ExtendTrip(trip, trip.vehicles, eachBlock.serviceDate, eachBlock.operationalBlockId)));
        }
    });
    return extendTrips;
};

const filterTripsWithVehicles = (extendTrips, selectedVehicles) => {
    const filteredTrips = [];
    extendTrips.forEach((extendTrip) => {
        if (extendTrip.vehicles) {
            extendTrip.vehicles.forEach((vehicle) => {
                selectedVehicles.forEach((selectedVehicle) => {
                    if (selectedVehicle.id && selectedVehicle.id === vehicle.id) {
                        filteredTrips.push(extendTrip);
                    }
                });
            });
        }
    });
    const uniqFilteredTrips = _.uniqBy(filteredTrips, 'externalRef');
    return uniqFilteredTrips;
};


export const getOverlappingTrips = (allBlocks, selectedBlock, selectedVehicles, selectedTrips) => {
    if (!selectedVehicles || selectedVehicles.length === 0) {
        return {};
    }
    const overlappingTrips = [];
    const tripsWillAllocate = (selectedTrips && selectedTrips.length > 0) ? selectedTrips : selectedBlock.operationalTrips;
    const extendedTripsWillAllocate = tripsWillAllocate.map(trip => new ExtendTrip(trip, selectedVehicles, selectedBlock.serviceDate, selectedBlock.operationalBlockId));
    const allExtendTripsInBlocks = prepareAllExtendTripsFromBlocks(allBlocks, selectedBlock, selectedVehicles, tripsWillAllocate);
    const extendTripsToSearch = filterTripsWithVehicles(allExtendTripsInBlocks, selectedVehicles);

    extendTripsToSearch.forEach((tripToSearch) => {
        extendedTripsWillAllocate.forEach((tripWillAllocate) => {
            if (tripWillAllocate.overlaps(tripToSearch)) {
                overlappingTrips.push(tripToSearch);
            }
        });
    });
    return _.mapValues(_.groupBy(_.uniqBy(overlappingTrips, 'externalRef'), 'blockId'), trips => trips.map(trip => trip.trip));
};

export const getVehicleAllocationKey = (tripId, startDate = moment().tz('Pacific/Auckland').format('YYYYMMDD'), startTime) => `${startDate.replace(/-/g, '')}-${tripId}-${startTime}`;
