import { expect } from 'chai';

import { getVisibleVehicles } from './vehicles';
import { TRAIN_TYPE_ID, BUS_TYPE_ID, FERRY_TYPE_ID, TRIP_DIRECTION_INBOUND } from '../../../types/vehicle-types';

const busNewZealandBus = {
    id: '13000',
    vehicle: {
        occupancyStatus: 'MANY_SEATS_AVAILABLE',
        position: {
            latitude: -36.85709166666667,
            longitude: 174.74785,
            bearing: 302,
            odometer: 369819470,
            speed: 0,
        },
        route: {
            agency_id: 'NZB',
            agency_name: 'New Zealand Bus',
            route_id: '10502-20180921103729_v70.37',
            route_short_name: '105',
            route_type: BUS_TYPE_ID,
            tokens: ['105'],
        },
        timestamp: '1538366659',
        trip: {
            directionId: TRIP_DIRECTION_INBOUND,
            tripId: '444143053-20180921103729_v70.37',
            startTime: '16:30:00',
            startDate: '20181001',
            scheduleRelationship: 'SCHEDULED',
            routeId: '10502-20180921103729_v70.37',
        },
        vehicle: {
            id: '13000',
            label: 'NB4076',
            licensePlate: 'GEH828',
        },
    },
};

const busRitchiesTransport = {
    id: '13100',
    vehicle: {
        occupancyStatus: 'MANY_SEATS_AVAILABLE',
        position: {
            latitude: -36.85709166666667,
            longitude: 174.74785,
            bearing: 302,
            odometer: 369819470,
            speed: 0,
        },
        route: {
            agency_id: 'RIT',
            agency_name: 'Ritchies Transport',
            route_id: '10502-20180921103729_v70.37',
            route_short_name: '105',
            route_type: BUS_TYPE_ID,
            tokens: ['105'],
        },
        timestamp: '1538366659',
        trip: {
            directionId: null,
            tripId: '444143053-20180921103729_v70.37',
            startTime: '16:30:00',
            startDate: '20181001',
            scheduleRelationship: 'SCHEDULED',
            routeId: '10502-20180921103729_v70.37',
        },
        vehicle: {
            id: '13100',
            label: 'NB4076',
            licensePlate: 'GEH828',
        },
    },
};

const train = {
    id: '14000',
    vehicle: {
        occupancyStatus: 'MANY_SEATS_AVAILABLE',
        position: {
            latitude: -36.85709166666667,
            longitude: 174.74785,
            bearing: 302,
            odometer: 369819470,
            speed: 0,
        },
        route: {
            agency_id: 'ATM',
            agency_name: 'AT Metro',
            route_id: '10502-20180921103729_v70.37',
            route_short_name: '105',
            route_type: TRAIN_TYPE_ID,
            tokens: ['105'],
        },
        timestamp: '1538366659',
        trip: {
            tripId: '246-850029-52380-2-5214180-ad59969a',
            startTime: '16:30:00',
            startDate: '20181001',
            scheduleRelationship: 'SCHEDULED',
            routeId: '10502-20180921103729_v70.37',
        },
        vehicle: {
            id: '14000',
            label: 'AMP 240',
        },
    },
};

const trainNotInService = {
    id: '14100',
    vehicle: {
        occupancyStatus: 'EMPTY',
        position: {
            latitude: -36.85709166666667,
            longitude: 174.74785,
            bearing: 302,
            odometer: 369819470,
            speed: 0,
        },
        route: null,
        timestamp: '1538366659',
        trip: null,
        vehicle: {
            id: '14100',
            label: 'AMP 241',
        },
    },
};

const trainJoined = {
    id: '14200',
    vehicle: {
        occupancyStatus: 'EMPTY',
        position: {
            latitude: -36.85709166666667,
            longitude: 174.74785,
            bearing: 302,
            odometer: 369819470,
            speed: 0,
        },
        route: null,
        timestamp: '1538366659',
        trip: null,
        vehicle: {
            id: '14200',
            label: 'AMP 242',
        },
    },
};

const ferry = {
    id: '512001263',
    vehicle: {
        vehicle: {
            id: '512001263',
            label: 'DISCOVERY II',
        },
        trip: {
            tripId: '369-90012-47400-2-1OPoK6',
            routeId: '369-209',
            startTime: '13:10:00',
            directionId: null,
        },
        timestamp: '1566955560',
        position: {
            bearing: null,
            latitude: -36.8225,
            longitude: 174.76635833333333,
        },
        route: {
            agency_id: 'FGL',
            agency_name: 'Fullers Ferries',
            route_id: '369-209',
            route_short_name: 'BAYS',
            route_type: FERRY_TYPE_ID,
            tokens: ['BAYS'],
        },
        occupancyStatus: null,
    },
};

const allVehicles = [busNewZealandBus, busRitchiesTransport, train, trainNotInService, trainJoined, ferry];
const allFleet = {
    15000: {
        agency: {
            agencyId: 'FGL',
        },
        type: {
            type: 'Ferry',
        },
    },
    14000: {
        agency: {
            agencyId: 'ATM',
        },
        type: {
            type: 'Train',
        },
    },
    14100: {
        agency: {
            agencyId: 'ATM',
        },
        type: {
            type: 'Train',
        },
    },
    14200: {
        agency: {
            agencyId: 'ATM',
        },
        type: {
            type: 'Train',
        },
    },
    13000: {
        agency: {
            agencyId: 'NZB',
        },
        type: {
            type: 'Bus',
        },
    },
    13100: {
        agency: {
            agencyId: 'RIT',
        },
        type: {
            type: 'Bus',
        },
    },
};
const allocations = {};
const tripUpdates = {};
const allocationsWithTrips = {
    '20181001-246-850029-52380-2-5214180-ad59969a-16:30:00': [
        { vehicleId: '14000', vehicleLabel: 'AMP 240', serviceDate: '20181001', startTime: '16:30:00', tripId: '246-850029-52380-2-5214180-ad59969a' },
        { vehicleId: '14200', vehicleLabel: 'AMP 242', serviceDate: '20181001', startTime: '16:30:00', tripId: '246-850029-52380-2-5214180-ad59969a' },
    ],
};

describe('Vehicles selectors', () => {
    context('when selecting vehicles', () => {
        it('should select all vehicles when no vehicles filters are defined', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                null,
                null,
                true,
                true,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
                [busRitchiesTransport.id]: busRitchiesTransport,
                [train.id]: train,
                [ferry.id]: ferry,
            });
        });

        it('should select vehicle of a particular route type only when filtered by routeType', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                BUS_TYPE_ID,
                null,
                true,
                true,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
                [busRitchiesTransport.id]: busRitchiesTransport,
            });
        });

        it('should filter by operator/agency', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                BUS_TYPE_ID,
                ['RIT'],
                true,
                true,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({
                [busRitchiesTransport.id]: busRitchiesTransport,
            });
        });

        it('should filter by multiple operators/agencies', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                BUS_TYPE_ID,
                ['RIT', 'NZB'],
                true,
                true,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({
                [busRitchiesTransport.id]: busRitchiesTransport,
                [busNewZealandBus.id]: busNewZealandBus,
            });
        });

        it('should only filter by operator/agency when filtered by any of the route types', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                null,
                ['RIT'],
                true,
                true,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
                [busRitchiesTransport.id]: busRitchiesTransport,
                [train.id]: train,
                [ferry.id]: ferry,
            });
        });

        it('should filter by trip direction', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                BUS_TYPE_ID,
                null,
                false,
                true,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({
                [busRitchiesTransport.id]: busRitchiesTransport,
            });
        });

        it('should only filter by trip direction when filtered by any of the route types', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                null,
                null,
                false,
                true,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
                [busRitchiesTransport.id]: busRitchiesTransport,
                [train.id]: train,
                [ferry.id]: ferry,
            });
        });

        it('should filter by predicate defined as a function', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                v => v.vehicle.vehicle.id === busNewZealandBus.id,
                null,
                null,
                null,
                null,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
            });
        });

        it('should filter by predicate defined as an object', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                { vehicle: { vehicle: { id: busNewZealandBus.id } } },
                null,
                null,
                null,
                null,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
            });
        });

        it('should filter by both predicate and route type at the same time', () => {
            const visibleVehicles = getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                { vehicle: { vehicle: { id: busNewZealandBus.id } } },
                TRAIN_TYPE_ID,
                null,
                null,
                null,
                null,
                [],
                {},
            );
            expect(visibleVehicles).to.eql({});
        });

        it('should filter by vehicle service status', () => {
            expect(getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                TRAIN_TYPE_ID,
                null,
                null,
                null,
                true,
                [],
                {},
            )).to.eql({
                [train.id]: train,
                [trainNotInService.id]: trainNotInService,
                [trainJoined.id]: trainJoined,
            });

            expect(getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                TRAIN_TYPE_ID,
                null,
                null,
                null,
                false,
                [],
                {},
            )).to.eql({
                [train.id]: train,
            });
        });

        it('should filter joined vehicles out of NIS vehicles', () => {
            expect(getVisibleVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocationsWithTrips,
                tripUpdates,
                null,
                TRAIN_TYPE_ID,
                null,
                null,
                null,
                true,
                [],
                {},
            )).to.eql({
                [train.id]: train,
                [trainNotInService.id]: trainNotInService,
            });
        });
    });
});
