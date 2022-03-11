import { expect } from 'chai';
import { BUS_TYPE_ID, FERRY_TYPE_ID, TRAIN_TYPE_ID, TRIP_DIRECTION_INBOUND } from '../../../types/vehicle-types';
import { getFilteredVehicles, getVisibleVehicles } from './vehicles';


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
        tag: '',
    },
    14000: {
        agency: {
            agencyId: 'ATM',
        },
        type: {
            type: 'Train',
        },
        tag: '',
    },
    14100: {
        agency: {
            agencyId: 'ATM',
        },
        type: {
            type: 'Train',
        },
        tag: '',
    },
    14200: {
        agency: {
            agencyId: 'ATM',
        },
        type: {
            type: 'Train',
        },
        tag: '',
    },
    13000: {
        agency: {
            agencyId: 'NZB',
        },
        type: {
            type: 'Bus',
        },
        tag: 'Smartrak',
    },
    13100: {
        agency: {
            agencyId: 'RIT',
        },
        type: {
            type: 'Bus',
        },
        tag: 'Torutek',
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
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                null,
                true,
                true,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
                [busRitchiesTransport.id]: busRitchiesTransport,
                [train.id]: train,
                [ferry.id]: ferry,
            });
        });

        it('should select vehicle of a particular route type only when filtered by routeType', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                BUS_TYPE_ID,
                null,
                true,
                true,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
                [busRitchiesTransport.id]: busRitchiesTransport,
            });
        });

        it('should filter by operator/agency', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                BUS_TYPE_ID,
                ['RIT'],
                true,
                true,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            );
            expect(visibleVehicles).to.eql({
                [busRitchiesTransport.id]: busRitchiesTransport,
            });
        });

        it('should filter by multiple operators/agencies', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                BUS_TYPE_ID,
                ['RIT', 'NZB'],
                true,
                true,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            );
            expect(visibleVehicles).to.eql({
                [busRitchiesTransport.id]: busRitchiesTransport,
                [busNewZealandBus.id]: busNewZealandBus,
            });
        });

        it('should only filter by operator/agency when filtered by any of the route types', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                ['RIT'],
                true,
                true,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
                [busRitchiesTransport.id]: busRitchiesTransport,
                [train.id]: train,
                [ferry.id]: ferry,
            });
        });

        it('should filter by trip direction', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                BUS_TYPE_ID,
                null,
                false,
                true,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            );
            expect(visibleVehicles).to.eql({
                [busRitchiesTransport.id]: busRitchiesTransport,
            });
        });

        it('should only filter by trip direction when filtered by any of the route types', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                null,
                false,
                true,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
                [busRitchiesTransport.id]: busRitchiesTransport,
                [train.id]: train,
                [ferry.id]: ferry,
            });
        });

        it('should filter by predicate defined as a function', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                null,
                null,
                null,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                v => v.vehicle.vehicle.id === busNewZealandBus.id,
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
            });
        });

        it('should filter by predicate defined as an object', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                null,
                null,
                null,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                { vehicle: { vehicle: { id: busNewZealandBus.id } } },
            );
            expect(visibleVehicles).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
            });
        });

        it('should filter by both predicate and route type at the same time', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                TRAIN_TYPE_ID,
                null,
                null,
                null,
                null,
                [],
                {},
                [],
            );
            const visibleVehicles = getVisibleVehicles.resultFunc(
                filteredVehicles,
                { vehicle: { vehicle: { id: busNewZealandBus.id } } },
            );
            expect(visibleVehicles).to.eql({});
        });

        it('should filter by vehicle service status', () => {
            let filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                TRAIN_TYPE_ID,
                null,
                null,
                null,
                true,
                [],
                {},
                [],
            );
            expect(getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            )).to.eql({
                [train.id]: train,
                [trainNotInService.id]: trainNotInService,
                [trainJoined.id]: trainJoined,
            });
            filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                TRAIN_TYPE_ID,
                null,
                null,
                null,
                false,
                [],
                {},
                [],
            );
            expect(getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            )).to.eql({
                [train.id]: train,
            });
        });

        it('should filter joined vehicles out of NIS vehicles', () => {
            const filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocationsWithTrips,
                tripUpdates,
                TRAIN_TYPE_ID,
                null,
                null,
                null,
                true,
                [],
                {},
                [],
            );
            expect(getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            )).to.eql({
                [train.id]: train,
                [trainNotInService.id]: trainNotInService,
            });
        });

        it('should filter by vehicle tag', () => {
            let filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                null,
                true,
                true,
                null,
                [],
                {},
                ['Smartrak'],
            );
            expect(getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            )).to.eql({
                [busNewZealandBus.id]: busNewZealandBus,
            });
            filteredVehicles = getFilteredVehicles.resultFunc(
                allVehicles,
                allFleet,
                allocations,
                tripUpdates,
                null,
                null,
                true,
                true,
                null,
                [],
                {},
                ['Torutek'],
            );
            expect(getVisibleVehicles.resultFunc(
                filteredVehicles,
                null,
            )).to.eql({
                [busRitchiesTransport.id]: busRitchiesTransport,
            });
        });
    });
});
