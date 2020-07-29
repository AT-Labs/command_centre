import { expect } from 'chai';
import { handleVehicleFiltersMerge, INIT_STATE as VEHICLES_INIT_STATE } from './vehicles';

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
    });
});
