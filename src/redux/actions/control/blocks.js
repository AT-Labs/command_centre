import { keyBy, flatten, isEmpty, find, includes, sortBy, isEqual, map, omit, findIndex, unset, noop, groupBy, pick } from 'lodash-es';
import moment from 'moment';
import ERROR_TYPE from '../../../types/error-types';
import OPERATION_TYPE from '../../../types/operation-type';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';
import { BLOCKS_SERVICE_DATE_FORMAT, getVehicleAllocationKey } from '../../../utils/control/blocks';
import * as blockMgtApi from '../../../utils/transmitters/block-mgt-api';
import { getTrips } from '../../../utils/transmitters/trip-mgt-api';
import { subscribeVehicleAllocation } from '../../../utils/transmitters/vehicle-allocation-streaming-api';
import ACTION_TYPE from '../../action-types';
import { getActiveBlocksIds, getAllBlocks, getBlockTrips } from '../../selectors/control/blocks';
import { getLinkRouteVariantId, getLinkStartTime } from '../../selectors/control/link';
import { getServiceDate } from '../../selectors/control/serviceDate';
import { reportError, setBannerError } from '../activity';
import { clearSearchResults } from '../search';

const loadBlocks = blocks => ({
    type: ACTION_TYPE.FETCH_CONTROL_BLOCKS,
    payload: {
        blocks,
    },
});

export const updateBlocksSortingParams = sortingParams => ({
    type: ACTION_TYPE.UPDATE_CONTROL_BLOCKS_SORTING_PARAMS,
    payload: {
        sortingParams,
    },
});

const updateLoadingState = isLoading => ({
    type: ACTION_TYPE.UPDATE_CONTROL_BLOCKS_LOADING,
    payload: {
        isLoading,
    },
});

const updateBlocksPermissions = blocksPermissions => ({
    type: ACTION_TYPE.UPDATE_BLOCKS_PERMISSIONS,
    payload: {
        blocksPermissions,
    },
});

export const updateFocusedBlock = focusedBlock => ({
    type: ACTION_TYPE.UPDATE_FOCUSED_BLOCK,
    payload: {
        focusedBlock,
    },
});

export const enrichBlocksTrips = (blocks, tripsWithStatusFromTripMgtApi) => {
    const generateKey = (tripId, startTime) => `${tripId}_${startTime}`;

    const tripsWithStatusKeyedById = keyBy(tripsWithStatusFromTripMgtApi.tripInstances, trip => generateKey(trip.tripId, trip.startTime));
    return blocks.map(block => ({
        ...block,
        operationalTrips: block.operationalTrips.map((trip) => {
            const key = generateKey(trip.tripId, trip.startTime);
            if (tripsWithStatusKeyedById[key]) {
                return ({
                    ...trip,
                    status: tripsWithStatusKeyedById[key].status,
                    delay: tripsWithStatusKeyedById[key].delay,
                });
            }
            return trip;
        }),
    }));
};

const getTripsWithStatusFromTripMgtApi = (blocks, serviceDate) => {
    const blocksTripsIds = flatten(blocks.map(block => block.operationalTrips.map(trip => trip.tripId)));
    const BlocksTripsInfo = {
        serviceDate: moment(serviceDate).format('YYYYMMDD'),
        tripIds: blocksTripsIds,
    };

    return getTrips(BlocksTripsInfo);
};

export const updateActiveBlock = activeBlock => ({
    type: ACTION_TYPE.UPDATE_CONTROL_BLOCKS_ACTIVE_BLOCK,
    payload: {
        activeBlock,
    },
});

export const clearActiveBlock = activeBlock => ({
    type: ACTION_TYPE.CLEAR_CONTROL_BLOCKS_ACTIVE_BLOCK,
    payload: {
        activeBlock,
    },
});

export const updateActiveTrip = activeTrip => ({
    type: ACTION_TYPE.UPDATE_CONTROL_BLOCKS_ACTIVE_TRIP,
    payload: {
        activeTrip,
    },
});

export const getBlocks = shouldUpdateLoader => (dispatch, getState) => {
    if (shouldUpdateLoader) dispatch(updateLoadingState(true));

    const serviceDate = moment(getServiceDate(getState())).format(BLOCKS_SERVICE_DATE_FORMAT);
    return blockMgtApi.getOperationalBlockRuns({ serviceDate })
        .then(async (blocksAndPermissions) => {
            const { _links: { permissions }, blocks } = blocksAndPermissions;

            dispatch(updateBlocksPermissions(permissions));

            if (!isEmpty(blocks)) {
                await getTripsWithStatusFromTripMgtApi(blocks, getServiceDate(getState()))
                    .then((tripsWithStatusFromTripMgtApi) => {
                        dispatch(loadBlocks(enrichBlocksTrips(blocks, tripsWithStatusFromTripMgtApi)));

                        const activeBlocksInStoreIds = getActiveBlocksIds(getState());

                        blocks.forEach((block) => {
                            if (activeBlocksInStoreIds.includes(block.operationalBlockId)) {
                                dispatch(updateActiveBlock(find(getAllBlocks(getState()), { operationalBlockId: block.operationalBlockId })));
                            }
                        });
                    });
            } else {
                dispatch(loadBlocks(blocks));
            }

            const linkRouteVariantId = getLinkRouteVariantId(getState());
            const linkTripStartTime = getLinkStartTime(getState());
            const activeTripFromLink = find(getBlockTrips(getState()), { routeVariantId: linkRouteVariantId, startTime: linkTripStartTime });

            if (activeTripFromLink) {
                const activeBlock = find(getAllBlocks(getState()), { operationalBlockId: activeTripFromLink.operationalBlockId });
                dispatch(updateActiveBlock(activeBlock));
                dispatch(updateActiveTrip(activeTripFromLink));
                dispatch(updateFocusedBlock(activeBlock));
                dispatch(({ type: ACTION_TYPE.CLEAR_TRIP_CROSS_LINK }));
            }
        })
        .catch((error) => {
            if (ERROR_TYPE.fetchBlock) {
                const errorMessage = error.code === 500 ? ERROR_TYPE.fetchBlock : error.message;
                dispatch(setBannerError(errorMessage));
            }
        })
        .finally(() => {
            if (shouldUpdateLoader) dispatch(updateLoadingState(false));
        });
};

const updateOperationalBlockRun = (operationalBlockRunId, data) => (dispatch) => {
    const payload = {
        operation: OPERATION_TYPE.UPDATE,
        data,
    };
    blockMgtApi.allocateVehicles(operationalBlockRunId, payload)
        .then(() => {
            dispatch(clearSearchResults());
            dispatch(getBlocks());
        })
        .catch(() => {
            dispatch(setBannerError(ERROR_TYPE.updateBlock));
        });
};

export const addOperationalBlockRun = operationalBlockRun => (dispatch) => {
    dispatch(updateLoadingState(true));
    return blockMgtApi.addOperationalBlockRun(operationalBlockRun)
        .then(() => {
            dispatch(clearSearchResults());
            dispatch(getBlocks());
            dispatch(updateLoadingState(false));
        })
        .catch((error) => {
            const errorMessage = error.code === 409 ? ERROR_TYPE.blockExisted : ERROR_TYPE.addBlock;
            dispatch(reportError({ error: { addBlock: errorMessage } }));
            dispatch(updateLoadingState(false));
            return Promise.reject();
        });
};

const moveOperationalTrips = data => (dispatch) => {
    const payload = {
        operation: OPERATION_TYPE.MOVE_TRIPS,
        data,
    };

    blockMgtApi.moveOperationalTrips(payload)
        .then(() => {
            dispatch(clearSearchResults());
            dispatch(getBlocks());
        })
        .catch(() => {
            dispatch(reportError({ error: { moveTrips: ERROR_TYPE.moveTrips } }));
        });
};

const isTripStatusCompleted = trip => trip.status === TRIP_STATUS_TYPES.completed;

const isTripStatusInProgress = trip => trip.status === TRIP_STATUS_TYPES.inProgress;

export const allocateVehicles = (operationalBlockRun, vehicles, selectedTrips) => (dispatch) => {
    const { operationalBlockRunId, operationalTrips, version } = operationalBlockRun;

    const finalUpdatedOperationalTrips = operationalTrips.map((trip) => {
        if (selectedTrips.length) {
            return {
                ...trip,
                vehicles: includes(
                    selectedTrips.map(selectedTrip => selectedTrip.externalRef),
                    trip.externalRef,
                ) && !isTripStatusCompleted(trip) ? vehicles : trip.vehicles,
            };
        }

        return {
            ...trip,
            vehicles: !isTripStatusCompleted(trip) ? vehicles : trip.vehicles,
        };
    });

    const vehiclesIds = vehicles.map(vehicle => vehicle.id);

    const data = {
        version,
        operationalTrips: finalUpdatedOperationalTrips,
        vehiclesIds: selectedTrips.length > 0 ? vehiclesIds : undefined,
    };

    dispatch(updateOperationalBlockRun(operationalBlockRunId, data));
};

export const moveTrips = (operationalBlockRunFrom, operationalBlockRunTo, selectedTrips) => (dispatch) => {
    const operationalTrips = selectedTrips.map(trip => ({ externalRef: trip.externalRef }));
    const data = {
        operationalBlockRunIdFrom: operationalBlockRunFrom.operationalBlockRunId,
        operationalBlockRunIdTo: operationalBlockRunTo.operationalBlockRunId,
        operationalTrips,
    };

    dispatch(moveOperationalTrips(data));
};

export const substituteVehicles = (operationalBlockRun, vehicles, operationalTripExternalRef) => (dispatch) => {
    let startSubstituting = false;
    const { operationalBlockRunId, operationalTrips, version } = operationalBlockRun;
    const updatedOperationalTrips = sortBy(operationalTrips, 'startTime')
        .map((trip) => {
            if (trip.externalRef === operationalTripExternalRef) {
                startSubstituting = true;
            }

            return {
                ...trip,
                vehicles: (startSubstituting && !isTripStatusCompleted(trip) && !isTripStatusInProgress(trip)) ? vehicles : trip.vehicles,
            };
        });

    const data = {
        version,
        operationalTrips: updatedOperationalTrips,
    };

    dispatch(updateOperationalBlockRun(operationalBlockRunId, data));
};

export const addOrphanOperationalTrips = (operationalBlockRun, orphanOperationalTripRuns) => (dispatch) => {
    const {
        operationalBlockRunId, operationalTrips, version, operationalBlockId,
    } = operationalBlockRun;

    const data = {
        version,
        operationalTrips: operationalTrips.concat(orphanOperationalTripRuns.map(orphanTrip => ({ ...orphanTrip, operationalBlockId }))),
    };

    dispatch(updateOperationalBlockRun(operationalBlockRunId, data));
};

const deallocateVehicles = (operationalBlockRun, operationalTrips) => async (dispatch) => {
    const { operationalBlockRunId, version } = operationalBlockRun;
    const data = {
        version,
        operationalTrips: sortBy(operationalTrips, 'startTime'),
    };

    await dispatch(updateOperationalBlockRun(operationalBlockRunId, data));
};

export const deallocateVehiclesFromAllTripsInBlock = (operationalBlockRun, vehicles) => async (dispatch) => {
    const trips = operationalBlockRun.operationalTrips.map((trip) => {
        if (!isTripStatusCompleted(trip)) {
            const tripVehiclesIds = map(trip.vehicles, vehicle => (vehicle.id));
            const tripVehiclesIdsInput = map(vehicles, vehicle => (vehicle.id));
            if (isEqual(tripVehiclesIds, tripVehiclesIdsInput)) return omit(trip, 'vehicles');
        }
        return { ...trip };
    });

    await dispatch(deallocateVehicles(operationalBlockRun, trips));
};

export const deallocateVehiclesFromTripSelected = (operationalBlockRun, tripSelectedExternalRef) => async (dispatch) => {
    const trips = operationalBlockRun.operationalTrips.map((trip) => {
        if (trip.externalRef === tripSelectedExternalRef) unset(trip, 'vehicles');
        return trip;
    });

    await dispatch(deallocateVehicles(operationalBlockRun, trips));
};

export const deallocateVehiclesFromTripSelectedOnwards = (operationalBlockRun, tripSelectedExternalRef) => async (dispatch) => {
    const trips = [];
    const { operationalTrips } = operationalBlockRun;
    const tripSelectedIndex = findIndex(operationalTrips, { externalRef: tripSelectedExternalRef });

    for (let i = 0; i < operationalTrips.length; i++) {
        if (i >= tripSelectedIndex && !isTripStatusCompleted(operationalTrips[i])) {
            unset(operationalTrips[i], 'vehicles');
        }
        trips.push(operationalTrips[i]);
    }

    await dispatch(deallocateVehicles(operationalBlockRun, trips));
};

const loadAllocations = allocations => ({
    type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_ALLOCATIONS,
    payload: {
        allocations,
    },
});

const updateAllocations = allocations => ({
    type: ACTION_TYPE.UPDATE_CONTROL_VEHICLE_ALLOCATIONS,
    payload: {
        allocations,
    },
});

export const getAllocationSnapshot = () => dispatch => blockMgtApi.getAllocationSnapshot()
    .then((allocations) => {
        const groupedAllocations = groupBy(
            allocations.map(allocation => pick(allocation, ['tripId', 'serviceDate', 'startTime', 'vehicleId', 'vehicleLabel'])),
            ({ serviceDate, startTime, tripId }) => getVehicleAllocationKey(tripId, serviceDate, startTime),
        );
        dispatch(loadAllocations(groupedAllocations));
    });

export const startTrackingVehicleAllocations = () => dispatch => dispatch(getAllocationSnapshot())
    .then(() => {
        subscribeVehicleAllocation({
            onData: (allocations) => {
                const formattedAllocations = {};
                allocations.vehicleAllocations.forEach(({ trip: { tripId, serviceDate, startTime }, vehicles }) => {
                    const formattedServiceDate = serviceDate && moment.tz(serviceDate, 'Pacific/Auckland').format('YYYYMMDD');
                    const key = getVehicleAllocationKey(tripId, formattedServiceDate, startTime);
                    formattedAllocations[key] = vehicles.map(({ id, label }) => ({ vehicleId: id, vehicleLabel: label, tripId, serviceDate: formattedServiceDate, startTime }));
                });
                dispatch(updateAllocations(formattedAllocations));
            },
            onError: noop,
        });
    });
