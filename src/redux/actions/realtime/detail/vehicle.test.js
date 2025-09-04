import { expect } from 'chai';
import moment from 'moment';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import * as ccRealtime from '../../../../utils/transmitters/cc-realtime';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../../action-types';
import VEHICLE_OCCUPANCY_STATUS_TYPE from '../../../../types/vehicle-occupancy-status-types';
import * as vehicleDetailActions from './vehicle';
import { utcDateFormatWithoutTZ } from '../../../../utils/dateUtils';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Vehicle detail actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    context('getVehicleTripInfo()', () => {
        const trip = {
            trip_id: '438136127-20180910114240_v70.21',
            shape_wkt: 'shape_wkt',
            route: {
                trips: [
                    { trip_id: '438138408-20180910114240_v70.21' },
                    { trip_id: '438137890-20180910114240_v70.21' },
                ],
            },
            stopTimes: [
                {
                    stop: {
                        stop_id: '8861-20180910114240_v70.21',
                        stop_lat: -36.88165,
                        stop_lon: 174.7327,
                        stop_code: '8861',
                        stop_name: '65 Morningside Dr',
                    },
                },
            ],
        };

        it('Should dispatch the actions', async () => {
            const fakeTrip = sandbox.fake.resolves(trip);
            const entityKey = undefined;
            const expectedActions = [
                {
                    type: ACTION_TYPE.DATA_LOADING,
                    payload: { isLoading: true },
                },
                {
                    type: ACTION_TYPE.FETCH_TRIP,
                    payload: { entityKey, trip },
                },
                {
                    type: ACTION_TYPE.FETCH_VEHICLE_TRIP_STOPS,
                    payload: { entityKey, stops: [trip.stopTimes[0].stop] },
                },
                {
                    type: ACTION_TYPE.DATA_LOADING,
                    payload: { isLoading: false },
                },
            ];

            const getTrip = sandbox.stub(ccStatic, 'getTripById').callsFake(fakeTrip);

            await store.dispatch(vehicleDetailActions.getVehicleTripInfo());

            sandbox.assert.calledOnce(getTrip);
            expect(store.getActions()).to.eql(expectedActions);
        });
    });

    context('updateVehicleSelected()', () => {
        it('Should dispatch update Vehicle action', () => {
            const vehicle = {
                id: '14076',
                vehicle: {
                    occupancyStatus: VEHICLE_OCCUPANCY_STATUS_TYPE.manySeatsAvailable,
                    position: {
                        latitude: -36.85709166666667,
                        longitude: 174.74785,
                        bearing: 302,
                        odometer: 369819470,
                        speed: 0,
                    },
                    route: {
                        agency_name: 'New Zealand Bus',
                        route_id: '10502-20180921103729_v70.37',
                        route_long_name: 'Britomart To Westmere Via Richmond Rd',
                        route_short_name: '105',
                        route_type: 3,
                        tokens: ['105'],
                    },
                    timestamp: '1538366659',
                    trip: {
                        tripId: '444143053-20180921103729_v70.37',
                        startTime: '16:30:00',
                        startDate: '20181001',
                        scheduleRelationship: 'SCHEDULED',
                        routeId: '10502-20180921103729_v70.37',
                    },
                    vehicle: {
                        id: '14076',
                        label: 'NB4076',
                        licensePlate: 'GEH828',
                    },
                },
            };
            const expectedActions = [{
                type: ACTION_TYPE.UPDATE_SELECTED_VEHICLE,
                payload: {
                    vehicle,
                },
            }];
            store.dispatch(vehicleDetailActions.updateSelectedVehicle(vehicle));
            expect(store.getActions()).to.eql(expectedActions);
        });
    });

    context('fetchUpcomingStops()', () => {
        afterEach(() => sandbox.restore());

        const tenMinutesInFuture = `${moment().utc().add(10, 'minutes').format(utcDateFormatWithoutTZ)}.000Z`;
        const tenMinutesInFutureUnix = `${moment().utc().add(10, 'minutes').unix()}`;

        const allStops = [
            {
                stop: {
                    arrival: {
                        delay: 0,
                        time: tenMinutesInFutureUnix,
                    },
                    departure: {
                        delay: 0,
                        time: tenMinutesInFutureUnix,
                        type: 'PREDICTED',
                    },
                    stopName: '385 Queen St',
                    stopCode: '7061',
                    stopDesc: null,
                    parentStation: '11021-20190304085219_v76.27',
                    stopId: '7061-20190304085219_v76.27',
                    stopSequence: 13,
                    timeType: 'SCHEDULED',
                    scheduleRelationship: 'SCHEDULED',
                    passed: false,
                },
                vehicle: {
                    id: '14336',
                    label: 'NB4336',
                    licensePlate: 'HGL562',
                },
                trip: {
                    tripId: '14797128071-20190304085219_v76.27',
                    routeId: '79702-20190304085219_v76.27',
                },
            },
        ];
        const upcomingStops = [
            {
                stop: {
                    scheduleRelationship: 'SCHEDULED',
                    stopCode: '7061',
                    stopName: '385 Queen St',
                    passed: false,
                },
                trip: {
                    routeId: '79702-20190304085219_v76.27',
                    tripId: '14797128071-20190304085219_v76.27',
                },
                scheduledTime: tenMinutesInFuture,
                actualTime: tenMinutesInFuture,
            },
        ];

        const expectedActions = [
            {
                type: ACTION_TYPE.DATA_LOADING,
                payload: { isLoading: true },
            },
            {
                type: ACTION_TYPE.FETCH_VEHICLE_UPCOMING_STOPS,
                payload: { upcomingStops },
            },
            {
                type: ACTION_TYPE.DATA_LOADING,
                payload: { isLoading: false },
            },
        ];

        it('Should return formatted upcoming stops which are within the next half hour', async () => {
            const fakeUpcomingStops = sandbox.fake.resolves(allStops);
            const fakeGetState = sandbox.fake.returns({
                realtime: {
                    detail: { viewDetailKey: 'vehicleId', vehicle: { key: 'vehicleId', trip: { tripId: '14797128071-20190304085219_v76.27' } } },
                    stops: {
                        all: {
                            7235: {},
                        },
                    },
                    vehicles: {
                        all: { vehicleId: { id: 'vehicleId' } },
                    },
                },
            });

            sandbox.stub(ccRealtime, 'getUpcomingByVehicleId')
                .callsFake(fakeUpcomingStops);

            await vehicleDetailActions.fetchUpcomingStops('vehicleId')(store.dispatch, fakeGetState);
            expect(store.getActions()).to.eql(expectedActions);
        });
    });

    context('fetchPastStops()', () => {
        const tenMinutesInPast = `${moment().utc().subtract(10, 'minutes').format(utcDateFormatWithoutTZ)}.000Z`;
        const tenMinutesInPastUnix = `${moment().utc().subtract(10, 'minutes').unix()}`;
        const createHistoryStop = (stopSequence = 7) => ({
            stop: {
                stopSequence,
                departure: {
                    delay: 0,
                    time: tenMinutesInPastUnix,
                },
                stopId: '7219-20180921103729_v70.37',
                scheduleRelationship: 'SCHEDULED',
                stopCode: '7219',
                stopName: '215 Ponsonby Rd',
                stopDesc: null,
                parentStation: '11047-20180921103729_v70.37',
                passed: true,
            },
            vehicle: {
                id: '14040',
                label: 'NB4040',
                licensePlate: 'GBN112',
            },
            trip: {
                tripId: '51437148842-20180921103729_v70.37',
                routeId: '02006-20180921103729_v70.37',
            },
        });

        const createPastStop = (stopSequence = 7) => ({
            stop: {
                scheduleRelationship: 'SCHEDULED',
                stopCode: '7219',
                stopName: '215 Ponsonby Rd',
                stopSequence,
                passed: true,
            },
            trip: {
                tripId: '51437148842-20180921103729_v70.37',
                routeId: '02006-20180921103729_v70.37',
            },
            scheduledTime: tenMinutesInPast,
            actualTime: tenMinutesInPast,
        });

        const assertFetchPastStops = async (historyStops, expectedPastStops) => {
            const expectedActions = [
                {
                    type: ACTION_TYPE.DATA_LOADING,
                    payload: { isLoading: true },
                },
                {
                    type: ACTION_TYPE.FETCH_VEHICLE_PAST_STOPS,
                    payload: { pastStops: expectedPastStops },
                },
                {
                    type: ACTION_TYPE.DATA_LOADING,
                    payload: { isLoading: false },
                },
            ];

            const fakeUpcomingStops = sandbox.fake.resolves(historyStops);

            const getHistoryByVehicleId = sandbox.stub(ccRealtime, 'getHistoryByVehicleId').callsFake(fakeUpcomingStops);

            await vehicleDetailActions.fetchPastStops('vehicleId')(store.dispatch, () => ({
                realtime: {
                    detail: { viewDetailKey: 'vehicleId', vehicle: { key: 'vehicleId', trip: { tripId: '51437148842-20180921103729_v70.37' } } },
                    vehicles: {
                        all: { vehicleId: { id: 'vehicleId' } },
                    },
                },
            }));
            sandbox.assert.calledOnce(getHistoryByVehicleId);
            sandbox.assert.calledWith(getHistoryByVehicleId, 'vehicleId');
            expect(store.getActions()).to.eql(expectedActions);
        };

        it('Should make an API call and dispatch 3 actions', async () => {
            const history = [createHistoryStop()];
            const pastStops = [createPastStop()];
            await assertFetchPastStops(history, pastStops);
        });

        it('should sort past stops ascending by sequence id', async () => {
            const history = [1, 3, 2].map(createHistoryStop);
            const pastStops = [1, 2, 3].map(createPastStop);
            await assertFetchPastStops(history, pastStops);
        });
    });
});
