import { expect } from 'chai';
import { UNSCHEDULED_TAG } from '../../../types/vehicle-types';
import { handleVehicleFiltersMerge, INIT_STATE as VEHICLES_INIT_STATE, handleVehiclesUpdate } from './vehicles';

describe('Vehicles reducer', () => {
    describe('when filtering vehicles', () => {
        it('should reset all filters when switching between route types', () => {
            const newState = handleVehicleFiltersMerge(
                { filters: { ...VEHICLES_INIT_STATE.filters, routeType: 1, isShowingDirectionInbound: false, agencyId: 'AT Metro' } },
                { payload: { filters: { routeType: 2 } } },
            );
            expect(newState.filters.isShowingDirectionInbound).to.eql(VEHICLES_INIT_STATE.filters.isShowingDirectionInbound);
            expect(newState.filters.agencyId).to.eql(VEHICLES_INIT_STATE.filters.agencyId);
        });

        it('should preserve predicate filter when switching between route types', () => {
            const newState = handleVehicleFiltersMerge(
                { filters: { ...VEHICLES_INIT_STATE.filters, routeType: 1, predicate: { vehicle: { id: '123' } } } },
                { payload: { filters: { routeType: 2 } } },
            );
            expect(newState.filters.predicate).to.eql({ vehicle: { id: '123' } });
        });

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
    
            expect(newState.all[1].vehicle.timestamp).to.equal(20);
            expect(newState.all[1].vehicle.tags).contains(UNSCHEDULED_TAG);
            expect(newState.all[1].vehicle.route).to.equal('Route A');
    
            expect(newState.all[2].vehicle.tags.length).to.equal(0);
            expect(newState.all[2].vehicle.timestamp).to.equal(15);
            expect(newState.all[2].vehicle.route).to.equal(undefined);
    
            expect(newState.all[3].vehicle.timestamp).to.equal(50);
    
            expect(newState.all[4].vehicle.tags).contains('EXISTING_TAG');
            expect(newState.all[4].vehicle.tags).contains(UNSCHEDULED_TAG);
            expect(newState.all[4].vehicle.route).to.equal('Route B');
    
            expect(newState.all[5].vehicle.timestamp).to.equal(25);
    
            expect(newState.all[6]).to.equal(undefined);
        });
    });
});
