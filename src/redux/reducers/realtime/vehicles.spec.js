import { UNSCHEDULED_TAG } from '../../../types/vehicle-types';
import { handleVehiclesUpdate } from './vehicles';

describe('handleVehiclesUpdate', () => {
    it('should update vehicles coming from snapshot with newer timestamps and tags and route for existing vehicles with Unscheduled tag', () => {
        const initialState = {
            all: {
                1: { id: 1, vehicle: { vehicle: { id: 1 }, tags: [UNSCHEDULED_TAG], route: 'Route A', timestamp: 10 } },
                2: { id: 2, vehicle: { vehicle: { id: 2 }, tags: [], timestamp: 5 } },
                3: { id: 3, vehicle: { vehicle: { id: 3 }, timestamp: 50 } },
                4: { id: 4, vehicle: { vehicle: { id: 4 }, tags: [UNSCHEDULED_TAG, 'EXISTING_TAG'], route: 'Route B', timestamp: 60 } },
            },
        };

        const action = {
            payload: {
                isSnapshotUpdate: true,
                vehicles: [
                    { id: 1, vehicle: { vehicle: { id: 1 }, timestamp: 20 } }, // update to new timestamp including tags and route fields from state
                    { id: 2, vehicle: { vehicle: { id: 2 }, tags: [], timestamp: 15 } }, // update to new timestamp no other changes
                    { id: 3, vehicle: { vehicle: { id: 3 }, timestamp: 50 } }, // no update as same timestamp
                    {
                        id: 4,
                        vehicle: {
                            vehicle: { id: 4 },
                            tags: ['EXISTING_TAG'],
                            timestamp: 70,
                        },
                    }, // update to new timestamp including extending tags field and add route field from state
                    { id: 5, vehicle: { vehicle: { id: 5 }, timestamp: 25 } }, // new vp no existing one
                    { id: 6, vehicle: { vehicle: { id: 6 }, timestamp: 0 } }, // new vp no existing one - invalid timestamp
                ],
            },
        };

        const newState = handleVehiclesUpdate(initialState, action);

        expect(newState.all[1].vehicle.timestamp).toBe(20);
        expect(newState.all[1].vehicle.tags).toContain(UNSCHEDULED_TAG);
        expect(newState.all[1].vehicle.route).toBe('Route A');

        expect(newState.all[2].vehicle.tags.length).toBe(0);
        expect(newState.all[2].vehicle.timestamp).toBe(15);
        expect(newState.all[2].vehicle.route).toBe(undefined);

        expect(newState.all[3].vehicle.timestamp).toBe(50);

        expect(newState.all[4].vehicle.tags).toContain('EXISTING_TAG');
        expect(newState.all[4].vehicle.tags).toContain(UNSCHEDULED_TAG);
        expect(newState.all[4].vehicle.route).toBe('Route B');

        expect(newState.all[5].vehicle.timestamp).toBe(25);

        expect(newState.all[6]).toBe(undefined);
    });

    it('should only update vehicles from streamer with newer timestamps and position changed', () => {
        const initialState = {
            all: {
                1: {
                    id: 1,
                    vehicle: {
                        vehicle: { id: 1 },
                        position: {
                            latitude: -36.9930324,
                            longitude: 174.8778147,
                        },
                        tags: [UNSCHEDULED_TAG],
                        route: 'Route A',
                        timestamp: 10,
                    },
                },
                2: {
                    id: 2,
                    vehicle: {
                        vehicle: { id: 2 },
                        position: {
                            latitude: -36.9930324,
                            longitude: 174.8778147,
                        },
                        timestamp: 15,
                    },
                },
            },
        };

        const action = {
            payload: {
                isSnapshotUpdate: false,
                vehicles: [{
                    id: 1,
                    vehicle: {
                        vehicle: { id: 1 },
                        position: {
                            latitude: -36.9930324,
                            longitude: 174.8778147,
                        },
                        tags: [UNSCHEDULED_TAG],
                        route: 'Route A',
                        timestamp: 20,
                    },
                }, // newer timestamp but position not changed
                {
                    id: 2,
                    vehicle: {
                        vehicle: { id: 2 },
                        position: {
                            latitude: -36.9930328,
                            longitude: 174.8778149,
                        },
                        timestamp: 25,
                    }, // newer timestamp and position changed
                }],
            },
        };

        const newState = handleVehiclesUpdate(initialState, action);

        expect(newState.all[1].vehicle.timestamp).toBe(10);
        expect(newState.all[2].vehicle.timestamp).toBe(25);
        expect(newState.all[2].vehicle.position.latitude).toBe(-36.9930328);
    });
});
