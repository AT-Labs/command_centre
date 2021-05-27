import _ from 'lodash-es';
import { handleActions } from 'redux-actions';

import ACTION_TYPE from '../../action-types';

export const INIT_STATE = {
    blocks: [],
    sortingParams: {},
    trips: [],
    isLoading: false,
    isActiveBlockLoading: false,
    activeBlocks: [],
    focusedBlock: null,
    activeTrip: null,
    blocksPermissions: [],
    allocations: {},
};

const handleLoadingUpdate = (state, { payload: { isLoading } }) => ({ ...state, isLoading });
const handleFocusedBlockUpdate = (state, { payload: { focusedBlock } }) => ({ ...state, focusedBlock });

const handleActiveBlockUpdate = (state, { payload: { activeBlock } }) => ({
    ...state,
    activeBlocks: [...state.activeBlocks.filter(block => block.operationalBlockId !== activeBlock.operationalBlockId), activeBlock],
});

const handleActiveBlockClear = (state, { payload: { activeBlock } }) => ({
    ...state,
    activeBlocks: state.activeBlocks.filter(block => block.operationalBlockId !== activeBlock.operationalBlockId),
});

const handleActiveTripUpdate = (state, { payload: { activeTrip } }) => ({ ...state, activeTrip });
const handleBlocksPermissionsUpdate = (state, { payload: { blocksPermissions } }) => ({ ...state, blocksPermissions });
const handleIsActiveBlockLoading = (state, { payload: { isActiveBlockLoading } }) => ({ ...state, isActiveBlockLoading });
const handleSortingParamsUpdate = (state, { payload: { sortingParams } }) => ({ ...state, sortingParams });
const handleBlocksUpdate = (state, { payload: { blocks } }) => ({
    ...state,
    trips: _.union(..._.map(blocks, 'operationalTrips')),
    blocks,
});
const handleLoadVehicleAllocations = (state, { payload: { allocations } }) => ({ ...state, allocations });
const handleUpdateVehicleAllocations = (state, { payload: { allocations } }) => ({ ...state, allocations: { ...state.allocations, ...allocations } });

export default handleActions({
    [ACTION_TYPE.UPDATE_CONTROL_BLOCKS_SORTING_PARAMS]: handleSortingParamsUpdate,
    [ACTION_TYPE.FETCH_CONTROL_BLOCKS]: handleBlocksUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_BLOCKS_LOADING]: handleLoadingUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_BLOCKS_ACTIVE_BLOCK]: handleActiveBlockUpdate,
    [ACTION_TYPE.CLEAR_CONTROL_BLOCKS_ACTIVE_BLOCK]: handleActiveBlockClear,
    [ACTION_TYPE.UPDATE_CONTROL_BLOCKS_ACTIVE_TRIP]: handleActiveTripUpdate,
    [ACTION_TYPE.UPDATE_BLOCKS_PERMISSIONS]: handleBlocksPermissionsUpdate,
    [ACTION_TYPE.UPDATE_CONTROL_BLOCKS_ACTIVE_BLOCK_LOADING]: handleIsActiveBlockLoading,
    [ACTION_TYPE.FETCH_CONTROL_VEHICLE_ALLOCATIONS]: handleLoadVehicleAllocations,
    [ACTION_TYPE.UPDATE_CONTROL_VEHICLE_ALLOCATIONS]: handleUpdateVehicleAllocations,
    [ACTION_TYPE.UPDATE_FOCUSED_BLOCK]: handleFocusedBlockUpdate,
}, INIT_STATE);
