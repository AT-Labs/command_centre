import _ from 'lodash-es';
import { createSelector } from 'reselect';
import { getAllFleetTrains } from '../static/fleet';
import { getVehicleAllocationKey } from '../../../utils/control/blocks';

export const getBlocksState = state => _.result(state, 'control.blocks');
export const getAllBlocks = createSelector(getBlocksState, blocksState => _.result(blocksState, 'blocks'));
export const getBlocksSortingParams = createSelector(getBlocksState, blocksState => _.result(blocksState, 'sortingParams'));
export const getBlockTrips = createSelector(getBlocksState, blocksState => _.result(blocksState, 'trips'));
export const getActiveBlock = createSelector(getBlocksState, blocksState => _.result(blocksState, 'activeBlock'));
export const getActiveTrip = createSelector(getBlocksState, blocksState => _.result(blocksState, 'activeTrip'));
export const getBlocksLoadingState = createSelector(getBlocksState, blocksState => _.result(blocksState, 'isLoading'));
export const getActiveBlocksLoadingState = createSelector(getBlocksState, blocksState => _.result(blocksState, 'isActiveBlockLoading'));
export const getBlocksPermissions = createSelector(getBlocksState, blocksState => _.result(blocksState, 'blocksPermissions'));
export const getActiveBlockOperationalBlockId = createSelector(
    getBlocksState, blocksState => _.result(blocksState, 'activeBlock.operationalBlockId'),
);
export const getSortedBlocks = createSelector(
    getAllBlocks,
    getBlocksSortingParams,
    (allBlocks, blocksSortingParams) => (!_.isEmpty(blocksSortingParams)
        ? _.orderBy(allBlocks, blocksSortingParams.sortBy, blocksSortingParams.order)
        : allBlocks),
);

export const getAllTrainsWithAssignedBlocks = createSelector(
    getAllBlocks,
    getAllFleetTrains,
    (allBlocks, allTrains) => {
        const tripsWithVehicles = _.flatten(allBlocks.map(block => block.operationalTrips
            .filter(trip => !_.isEmpty(trip.vehicles))));

        return allTrains.map((train) => {
            const cloneTrain = { ...train, blocks: [] };
            tripsWithVehicles.forEach((trip) => {
                trip.vehicles.forEach((vehicle) => {
                    if (vehicle.label.includes(cloneTrain.label)) {
                        cloneTrain.blocks.push(trip.operationalBlockId);
                    }
                });
            });
            cloneTrain.blocks = _.uniq(cloneTrain.blocks);
            return cloneTrain;
        });
    },
);

export const getAllocations = createSelector(getBlocksState, blocksState => _.result(blocksState, 'allocations'));
export const getVehicleAllocationByTrip = (trip, allocations) => {
    const { tripId, startTime, startDate, serviceDate } = trip;
    const key = getVehicleAllocationKey(tripId, startDate || serviceDate, startTime);
    return allocations[key];
};
export const getNumberOfCarsByAllocations = (allocations) => {
    const isAdlTrain = allocations.some(v => v.vehicleLabel.toUpperCase().includes('ADL'));
    return allocations.length > 0 && allocations.length * (isAdlTrain ? 2 : 3);
};
export const getVehicleAllocationLabel = allocation => _.map(allocation, 'vehicleLabel').join(', ');
export const getVehicleAllocationLabelByTrip = (trip, allocations) => {
    const matchingAllocation = trip && getVehicleAllocationByTrip(trip, allocations);
    return matchingAllocation && matchingAllocation.length && getVehicleAllocationLabel(matchingAllocation);
};

export const getVehicleAllocationByVehicleId = (vehicleId, allocations) => _.filter(allocations, allocation => !!_.find(allocation, { vehicleId }));
