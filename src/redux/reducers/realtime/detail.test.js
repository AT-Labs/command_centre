import { expect } from 'chai';

import { handleUpcomingStopsOfSelectedVehicle, handleUpcomingVehiclesOfSelectedStop, handleVehiclesUpdate } from './detail';

describe('Details reducer', () => {
    describe('when filtering past stops', () => {
        const stopA = { stop: { stopCode: 'A' } };
        const stopB = { stop: { stopCode: 'B' } };
        const stopC = { stop: { stopCode: 'C' } };

        const upcomingStops = [stopA, stopB, stopC];

        it('should handle special cases', () => {
            expect(handleUpcomingStopsOfSelectedVehicle(
                { vehicle: { pastStops: undefined } },
                { payload: { upcomingStops: undefined } },
            ).vehicle.upcomingStops)
                .to.eql(undefined);
            expect(handleUpcomingStopsOfSelectedVehicle(
                { vehicle: { pastStops: [] } },
                { payload: { upcomingStops: undefined } },
            ).vehicle.upcomingStops)
                .to.eql(undefined);
            expect(handleUpcomingStopsOfSelectedVehicle(
                { vehicle: { pastStops: undefined } },
                { payload: { upcomingStops: [] } },
            ).vehicle.upcomingStops)
                .to.eql([]);
            expect(handleUpcomingStopsOfSelectedVehicle(
                { vehicle: { pastStops: [stopA] } },
                { payload: { upcomingStops: undefined } },
            ).vehicle.upcomingStops)
                .to.eql(undefined);
            expect(handleUpcomingStopsOfSelectedVehicle(
                { vehicle: { pastStops: undefined } },
                { payload: { upcomingStops } },
            ).vehicle.upcomingStops)
                .to.eql(upcomingStops);
        });
    });

    describe('when filtering past vehicles', () => {
        const vRouteA = { scheduledTime: '2018-09-27T23:35:00.000Z', route: { route_short_name: 'A' }, trip: { tripId: 'A' } };
        const vRouteB = { scheduledTime: '2018-09-27T23:35:00.000Z', route: { route_short_name: 'B' }, trip: { tripId: 'B' } };
        const vRouteC = { scheduledTime: '2018-09-27T23:35:00.000Z', route: { route_short_name: 'C' }, trip: { tripId: 'C' } };

        const vehiclesListA = [vRouteA, vRouteB, vRouteC];

        it('should handle special cases', () => {
            expect(handleUpcomingVehiclesOfSelectedStop(
                { stop: { pastVehicles: undefined } },
                { payload: { upcomingVehicles: undefined } },
            ).stop.upcomingVehicles)
                .to.eql(undefined);
            expect(handleUpcomingVehiclesOfSelectedStop(
                { stop: { pastVehicles: [] } },
                { payload: { upcomingVehicles: undefined } },
            ).stop.upcomingVehicles)
                .to.eql(undefined);
            expect(handleUpcomingVehiclesOfSelectedStop(
                { stop: { pastVehicles: undefined } },
                { payload: { upcomingVehicles: [] } },
            ).stop.upcomingVehicles)
                .to.eql([]);

            expect(handleUpcomingVehiclesOfSelectedStop(
                { stop: { pastVehicles: [vRouteA] } },
                { payload: { upcomingVehicles: undefined } },
            ).stop.upcomingVehicles)
                .to.eql(undefined);
            expect(handleUpcomingVehiclesOfSelectedStop(
                { stop: { pastVehicles: undefined } },
                { payload: { upcomingVehicles: vehiclesListA } },
            ).stop.upcomingVehicles)
                .to.eql(vehiclesListA);
        });
    });
});

describe('handleVehiclesUpdate', () => {
    it('should update vehicle correctly when replacementTripId clears', () => {
        const state = {
            vehicle: {
                id: 'bus-1',
                trip: {
                    tripId: 'trip-1',
                    ".replacementTripId": "1",
                },
            },
        };
        const vehicles = [
            {
                id: 'bus-1',
                vehicle: {
                    trip: {
                        tripId: 'trip-1',
                    },
                },
            },
            {
                id: 'bus-2',
                vehicle: {
                    trip: {
                        tripId: 'trip-2',
                    },
                },
            },
        ];
        const result = handleVehiclesUpdate(state, { payload: { vehicles, shouldUseDiversion: true } });
        expect(result.vehicle).to.eql({
            id: 'bus-1',
            trip: {
                tripId: 'trip-1',
                ".replacementTripId": undefined,
            },
        });
    });

    it('should update vehicle in state if matching id and newer replacementTripId exists', () => {
        const state = {
            vehicle: {
                id: 'bus-1',
                trip: {
                    tripId: 'trip-1',
                    ".replacementTripId": "1",
                },
            },
        };
        const vehicles = [
            {
                id: 'bus-1',
                vehicle: {
                    trip: {
                        tripId: 'trip-1',
                        ".replacementTripId": "2",
                    },
                },
            },
            {
                id: 'bus-2',
                vehicle: {
                    trip: {
                        tripId: 'trip-2',
                    },
                },
            },
        ];
        const result = handleVehiclesUpdate(state, { payload: { vehicles, shouldUseDiversion: true } });
        expect(result.vehicle).to.eql({
            id: 'bus-1',
            trip: {
                tripId: 'trip-1',
                ".replacementTripId": "2",
            },
        });
    });

    it('should return original state for empty payload', () => {
        const state = {
            vehicle: {
                id: 'bus-1',
                trip: {
                    tripId: 'trip-1',
                },
            },
        };
        const result = handleVehiclesUpdate(state, { payload: { vehicles: [] } });
        expect(result).to.equal(state);
    });

    it('should return original state if vehicle id not found', () => {
        const state = {
            vehicle: {
                id: 'bus-3',
                trip: {
                    tripId: 'trip-3',
                },
            },
        };
        const vehicles = [
            {
                id: 'bus-1-NOT_IN_STATE',
                vehicle: {
                    trip: {
                        tripId: 'trip-1',
                    },
                    foo: 'new',
                },
            },
        ];
        const result = handleVehiclesUpdate(state, { payload: { vehicles } });
        expect(result).to.equal(state);
    });

    it('should update replacementTripId if diversion removed and replacementTripId becomes empty', () => {
        const state = {
            vehicle: {
                id: 'bus-1',
                trip: {
                    tripId: 'trip-1',
                    ".replacementTripId": 'this_will_become_empty',
                },
            },
        };
        const vehicles = [
            {
                id: 'bus-1',
                vehicle: {
                    trip: {
                        tripId: 'trip-1',
                        ".replacementTripId": null,
                    },
                },
            },
        ];
        const result = handleVehiclesUpdate(state, { payload: { vehicles, shouldUseDiversion: true } });
        expect(result.vehicle).to.eql({
            id: 'bus-1',
            trip: {
                tripId: 'trip-1',
                ".replacementTripId": null,
            },
        });
    });
});
