import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../../action-types';
import * as stops from '../../../selectors/static/stops';
import * as route from './route';


const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Route detail actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    const routeTrips = [
        {
            trip_headsign: 'Head Sign A',
            shape_wkt: 'shape_wkt',
            trip_id: '1086147568-20180921103729_v70.37',
        },
        {
            trip_headsign: 'Head Sign B',
            shape_wkt: 'shape_wkt',
            trip_id: '1086096251-20180921103729_v70.37',
        },
    ];

    const allStopsFake = {
        1599: {
            location_type: 0,
            stop_code: '1599',
            stop_id: '1599-20180921103729_v70.37',
            stop_lat: -36.82248,
            stop_lon: 174.61089,
            stop_name: 'Westgate Stop B',
            tokens: ['westgate', 'stop', 'b', '1599'],
        },
    };
    const fakeVehicle = {
        id: '14213',
        vehicle: {
            trip: {
                tripId: '1086147568-20180921103729_v70.37',
                startTime: '11:05:00',
                startDate: '20181005',
                scheduleRelationship: 'SCHEDULED',
                routeId: '12203-20180921103729_v70.37',
            },
        },
    };
    const vehiclesInAllRoutesFake = {
        '1086147568-20180921103729_v70.37': fakeVehicle,
    };
    const tripsFake = {
        route: {
            trips: [
                {
                    trip_id: '1086096251-20180921103729_v70.37',
                },
            ],
        },
        shape_wkt: 'shape_wkt',
        stopTimes: [
            {
                stop: {
                    stop_code: '1599',
                    stop_id: '1599-20180921103729_v70.37',
                    stop_lat: -36.76114,
                    stop_lon: 174.53473,
                    stop_name: '14 Parlane Dr',
                },
            },
        ],
        trip_id: '1086098588-20180921103729_v70.37',
    };

    const baseTrip = {
        trip_headsign: 'Head Sign A',
        shape_wkt: 'shape_wkt',
        trip_id: '1086147568-20180921103729_v70.37',
    };
    const tripsWithOneVariant = [baseTrip];

    it('Should display routes details actions and return visible vehicles - mergeRoutesDetails()', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_ROUTE_TRIPS,
                payload: {
                    entityKey: undefined,
                    routes: [
                        {
                            routeVariantName: 'Head Sign A',
                            shape_wkt: 'shape_wkt',
                            vehicles: [fakeVehicle],
                        },
                        {
                            routeVariantName: 'Head Sign B',
                            shape_wkt: 'shape_wkt',
                            vehicles: [],
                        },
                    ],
                },
            },
        ];

        store.dispatch(route.mergeRoutesDetails(undefined, routeTrips, vehiclesInAllRoutesFake));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('should map a vehicle that has no replacementTripId to its original tripId', () => {
        const vehicleNoReplacement = {
            id: '14213',
            vehicle: {
                trip: {
                    tripId: '1086147568-20180921103729_v70.37',
                    startTime: '11:05:00',
                    startDate: '20251110',
                    scheduleRelationship: 'SCHEDULED',
                    routeId: '12203-20180921103729_v70.37',
                },
            },
        };
        const vehicleInFakeRoute = { [vehicleNoReplacement.vehicle.trip.tripId]: vehicleNoReplacement };

        const expectedPayload = {
            entityKey: undefined,
            routes: [
                {
                    routeVariantName: 'Head Sign A',
                    shape_wkt: 'shape_wkt',
                    vehicles: [vehicleNoReplacement],
                },
            ],
        };

        store.dispatch(route.mergeRoutesDetails(undefined, tripsWithOneVariant, vehicleInFakeRoute));
        const actions = store.getActions();
        expect(actions).to.have.lengthOf(1);
        expect(actions[0]).to.eql({
            type: ACTION_TYPE.FETCH_ROUTE_TRIPS,
            payload: expectedPayload,
        });
    });

    it('should map vehicles with and without replacementTripIds correctly', () => {
        const originalTripId = '1086147568-20180921103729_v70.37';
        const replacementTripId = '9999999999-REPLACED';
        const anotherTripId = '1086096251-20180921103729_v70.37';

        const vehicleNoReplacement = {
            id: '14213',
            vehicle: {
                trip: {
                    tripId: anotherTripId,
                    startTime: '11:05:00',
                    startDate: '20251110',
                    scheduleRelationship: 'SCHEDULED',
                    routeId: '12203-20180921103729_v70.37',
                },
            },
        };

        const vehicleWithReplacement = {
            id: '14214',
            vehicle: {
                trip: {
                    tripId: originalTripId,
                    startTime: '11:10:00',
                    startDate: '20251110',
                    scheduleRelationship: 'SCHEDULED',
                    routeId: '12203-20180921103729_v70.37',
                    '.replacementTripId': replacementTripId,
                },
            },
        };

        const vehiclesInAllRoutesFake = {
            [anotherTripId]: vehicleNoReplacement,
            [originalTripId]: vehicleWithReplacement,
        };
        const trips = [
            { ...baseTrip, trip_id: originalTripId, trip_headsign: 'Head Sign A' },
            { ...baseTrip, trip_id: replacementTripId, trip_headsign: 'Head Sign A' },
            { ...baseTrip, trip_id: anotherTripId, trip_headsign: 'Head Sign B' },
        ];

        const expectedPayload = {
            entityKey: undefined,
            routes: [
                {
                    routeVariantName: 'Head Sign A',
                    shape_wkt: 'shape_wkt',
                    vehicles: [vehicleWithReplacement, vehicleWithReplacement],
                },
                {
                    routeVariantName: 'Head Sign B',
                    shape_wkt: 'shape_wkt',
                    vehicles: [vehicleNoReplacement],
                },
            ],
        };

        store.dispatch(route.mergeRoutesDetails(undefined, trips, vehiclesInAllRoutesFake));

        const actions = store.getActions();
        expect(actions).to.have.lengthOf(1);
        expect(actions[0]).to.eql({
            type: ACTION_TYPE.FETCH_ROUTE_TRIPS,
            payload: expectedPayload,
        });
    });

    it('should not duplicate when replacementTripId equals the original tripId', () => {
        const sameId = '1086147568-20180921103729_v70.37';
        const vehicleSameReplacement = {
            id: '14213',
            vehicle: {
                trip: {
                    tripId: sameId,
                    startTime: '11:05:00',
                    startDate: '20251110',
                    scheduleRelationship: 'SCHEDULED',
                    routeId: '12203-20180921103729_v70.37',
                    '.replacementTripId': sameId,
                },
            },
        };
        const vehiclesInAllRoutesFake = { [sameId]: vehicleSameReplacement };

        const expectedPayload = {
            entityKey: undefined,
            routes: [
                {
                    routeVariantName: 'Head Sign A',
                    shape_wkt: 'shape_wkt',
                    vehicles: [vehicleSameReplacement],
                },
            ],
        };

        store.dispatch(route.mergeRoutesDetails(undefined, tripsWithOneVariant, vehiclesInAllRoutesFake));
        const actions = store.getActions();
        expect(actions).to.have.lengthOf(1);
        expect(actions[0]).to.eql({
            type: ACTION_TYPE.FETCH_ROUTE_TRIPS,
            payload: expectedPayload,
        });
    });

    it('Should get stops by route - getStopsByRoute()', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_ROUTE_STOPS,
                payload: {
                    entityKey: undefined,
                    stops: [
                        {
                            location_type: 0,
                            stop_code: '1599',
                            stop_id: '1599-20180921103729_v70.37',
                            stop_lat: -36.82248,
                            stop_lon: 174.61089,
                            stop_name: 'Westgate Stop B',
                            tokens: ['westgate', 'stop', 'b', '1599'],
                        },
                    ],
                },
            },
        ];

        const fakeTrips = sandbox.fake.resolves(tripsFake);
        const getTrip = await sandbox.stub(ccStatic, 'getTripById').callsFake(fakeTrips);

        const getAllStops = sandbox.stub(stops, 'getChildStops').returns(allStopsFake);

        await store.dispatch(route.getStopsByRoute(undefined, routeTrips));
        sandbox.assert.calledTwice(getTrip);
        sandbox.assert.calledOnce(getAllStops);
        expect(store.getActions()).to.eql(expectedActions);
    });
});
