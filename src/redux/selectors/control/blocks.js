import { result, orderBy, map, filter, isEmpty, uniq, flatten, find } from 'lodash-es';
import { createSelector } from 'reselect';
import { getAllFleetTrains } from '../static/fleet';
import { getVehicleAllocationKey } from '../../../utils/control/blocks';

export const getBlocksState = state => result(state, 'control.blocks');
export const getAllBlocks = createSelector(getBlocksState, blocksState => result(blocksState, 'blocks'));
export const getBlocksSortingParams = createSelector(getBlocksState, blocksState => result(blocksState, 'sortingParams'));
export const getBlockTrips = createSelector(getBlocksState, blocksState => result(blocksState, 'trips'));
export const getActiveBlocks = createSelector(getBlocksState, blocksState => result(blocksState, 'activeBlocks'));
export const getActiveBlocksIds = createSelector(getActiveBlocks, activeBlocks => uniq(activeBlocks.map(block => block.operationalBlockId)));

export const getActiveTrip = createSelector(getBlocksState, blocksState => result(blocksState, 'activeTrip'));
export const getBlocksLoadingState = createSelector(getBlocksState, blocksState => result(blocksState, 'isLoading'));
export const getActiveBlocksLoadingState = createSelector(getBlocksState, blocksState => result(blocksState, 'isActiveBlockLoading'));
export const getBlocksPermissions = createSelector(getBlocksState, blocksState => result(blocksState, 'blocksPermissions'));

export const getSortedBlocks = createSelector(
    getAllBlocks,
    getBlocksSortingParams,
    (allBlocks, blocksSortingParams) => (!isEmpty(blocksSortingParams)
        ? orderBy(allBlocks, blocksSortingParams.sortBy, blocksSortingParams.order)
        : allBlocks),
);

export const getAllTrainsWithAssignedBlocks = createSelector(
    getAllBlocks,
    getAllFleetTrains,
    (allBlocks, allTrains) => {
        const tripsWithVehicles = flatten(allBlocks.map(block => block.operationalTrips
            .filter(trip => !isEmpty(trip.vehicles))));

        return allTrains.map((train) => {
            const cloneTrain = { ...train, blocks: [] };
            tripsWithVehicles.forEach((trip) => {
                trip.vehicles.forEach((vehicle) => {
                    if (vehicle.label.includes(cloneTrain.label)) {
                        cloneTrain.blocks.push(trip.operationalBlockId);
                    }
                });
            });
            cloneTrain.blocks = uniq(cloneTrain.blocks);
            return cloneTrain;
        });
    },
);

export const getFocusedBlock = createSelector(getBlocksState, blocksState => result(blocksState, 'focusedBlock'));
export const getAllocations = createSelector(getBlocksState, blocksState => result(blocksState, 'allocations'));
export const getVehicleAllocationByTrip = (trip, allocations) => {
    const { tripId, startTime, startDate, serviceDate } = trip;
    const key = getVehicleAllocationKey(tripId, startDate || serviceDate, startTime);
    return allocations[key];
};
export const getNumberOfCarsByAllocations = (allocations) => {
    const isAdlTrain = allocations.some(v => v.toUpperCase().includes('ADL'));
    return allocations.length > 0 && allocations.length * (isAdlTrain ? 2 : 3);
};
export const getVehicleAllocationLabel = allocation => map(allocation, 'vehicleLabel').join(', ');
export const getVehicleAllocationLabelByTrip = (trip, allocations) => {
    const matchingAllocation = trip && getVehicleAllocationByTrip(trip, allocations);
    return matchingAllocation && matchingAllocation.length && getVehicleAllocationLabel(matchingAllocation);
};

export const getVehicleAllocationByVehicleId = (vehicleId, allocations) => filter(allocations, allocation => !!find(allocation, { vehicleId }));
