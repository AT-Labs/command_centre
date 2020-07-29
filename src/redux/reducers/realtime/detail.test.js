import { expect } from 'chai';

import { handleUpcomingStopsOfSelectedVehicle, handleUpcomingVehiclesOfSelectedStop } from './detail';

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
