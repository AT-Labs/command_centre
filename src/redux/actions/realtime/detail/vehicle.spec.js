/* eslint-disable no-unused-expressions */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import {
    fetchUpcomingStops,
    fetchPastStops,
} from './vehicle';
import ACTION_TYPE from '../../../action-types';
import * as ccRealtime from '../../../../utils/transmitters/cc-realtime';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

const mockVehicleId = 'TEST-123';
const mockTripId = 'TRIP-456';
const mockReplacementTripId = 'TRIP-789';

const createMockState = (options = {}) => ({
    // Store uses tripDescriptor which may include replacementTripId
    realtime: {
        vehicles: {
            all: {
                [mockVehicleId]: {
                    id: mockVehicleId,
                    vehicle: {
                        vehicle: {
                            id: mockVehicleId,
                            label: 'TEST-LABEL',
                        },
                        trip: {
                            tripId: mockTripId,
                            routeId: 'ROUTE-1',
                            startTime: '16:44:00',
                            startDate: '20251107',
                            directionId: 0,
                            '.replacementTripId': options.replacementTripId,
                        },
                        position: {
                            bearing: 337,
                            latitude: -37.0534849,
                            longitude: 174.9662276,
                        },
                    },
                },
            },
        },
        detail: {
            viewDetailKey: options.viewDetailKey || mockVehicleId,
            vehicle: {
                key: mockVehicleId,
                id: mockVehicleId,
                trip: {
                    tripId: mockTripId,
                    '.replacementTripId': options.replacementTripId,
                    ...options.trip,
                },
            },
        },
    },
    control: {
        blocks: {
            allocations: options.allocations || [],
        },
    },
    appSettings: {
        useNewMonitoring: options.useNewMonitoring !== undefined ? String(options.useNewMonitoring) : 'false',
        useDiversion: options.useDiversion !== undefined ? String(options.useDiversion) : 'false',
    },
});

const createMockStop = (overrides = {}) => {
    // Use fake timer base time (2023-11-07T12:00:00.000Z = 1699358400 seconds)
    const baseTime = overrides.baseTime !== undefined ? overrides.baseTime : 1699358400 + 600; // Default: 10 minutes in future
    const scheduledTimestamp = typeof baseTime === 'number' ? baseTime : baseTime;

    return {
        stop: {
            stopCode: 'STOP-001',
            stopName: 'Test Stop',
            scheduleRelationship: 'SCHEDULED',
            arrival: {
                time: scheduledTimestamp,
                delay: 0,
                type: 'SCHEDULED',
            },
            departure: {
                time: scheduledTimestamp,
                delay: 0,
                type: 'SCHEDULED',
            },
            ...overrides.stop,
        },
        trip: {
            tripId: mockTripId,
            ...overrides.trip,
        },
    };
};

describe('Vehicle actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-11-07T12:00:00.000Z'));
        store = mockStore(createMockState());
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
        jest.useRealTimers();
    });

    describe('fetchUpcomingStops', () => {
        it('should include stops when useDiversion is off', async () => {
            store = mockStore(createMockState({ useDiversion: false }));

            // This is from monitoring, it uses replacement Trip Id in tripId field, unlinke store which stores the trip descriptor
            const mockUpcomingStops = [
                createMockStop({ trip: { tripId: mockTripId } }), // include
                createMockStop({ trip: { tripId: mockReplacementTripId } }), // exclude - this shouldn't be hapenning when useDiversion is false. But just in case, we test it
                createMockStop({ trip: { tripId: 'OTHER-TRIP' } }), // exclude
            ];

            sandbox.stub(ccRealtime, 'getUpcomingByVehicleId').resolves(mockUpcomingStops);

            await store.dispatch(fetchUpcomingStops(mockVehicleId));

            const actions = store.getActions();
            const fetchAction = actions.find(a => a.type === ACTION_TYPE.FETCH_VEHICLE_UPCOMING_STOPS);

            expect(fetchAction.payload.upcomingStops).to.have.lengthOf(1);
            expect(fetchAction.payload.upcomingStops[0].trip.tripId).to.equal(mockTripId);
        });

        it('should include stops from both main trip and replacement trip when useDiversion is true', async () => {
            store = mockStore(createMockState({
                useDiversion: true,
                replacementTripId: mockReplacementTripId,
            }));

            // Base time: 2023-11-07T12:00:00.000Z = 1699358400 seconds
            const baseTime = 1699358400;
            const mockUpcomingStops = [
                createMockStop({
                    baseTime: baseTime + 300, // 5 minutes in future
                    stop: { stopCode: 'STOP-001' },
                    trip: { tripId: mockTripId },
                }),
                createMockStop({
                    baseTime: baseTime + 600, // 10 minutes in future
                    stop: { stopCode: 'STOP-002' },
                    trip: { tripId: mockReplacementTripId },
                }),
                createMockStop({
                    baseTime: baseTime + 900, // 15 minutes in future
                    stop: { stopCode: 'STOP-003' },
                    trip: { tripId: 'OTHER-TRIP' },
                }),
            ];

            sandbox.stub(ccRealtime, 'getUpcomingByVehicleId').resolves(mockUpcomingStops);

            await store.dispatch(fetchUpcomingStops(mockVehicleId));

            const actions = store.getActions();
            const fetchAction = actions.find(a => a.type === ACTION_TYPE.FETCH_VEHICLE_UPCOMING_STOPS);
            expect(fetchAction.payload.upcomingStops).to.have.lengthOf(2);
            expect(fetchAction.payload.upcomingStops[0].trip.tripId).to.equal(mockTripId);
            expect(fetchAction.payload.upcomingStops[1].trip.tripId).to.equal(mockReplacementTripId);
        });
    });

    describe('fetchPastStops', () => {
        it('should include stops when useDiversion is off', async () => {
            store = mockStore(createMockState({ useDiversion: false }));

            // This is from monitoring, it uses replacement Trip Id in tripId field, unlinke store which stores the trip descriptor
            // Base time: 2023-11-07T12:00:00.000Z = 1699358400 seconds
            const baseTime = 1699358400;
            const mockPastStops = [
                createMockStop({
                    baseTime: baseTime - 600, // 10 minutes ago
                    stop: {
                        stopSequence: 1,
                        passed: true,
                    },
                    trip: { tripId: mockTripId },
                }), // include
                createMockStop({
                    baseTime: baseTime - 300, // 5 minutes ago
                    stop: {
                        stopSequence: 2,
                        passed: true,
                    },
                    trip: { tripId: mockReplacementTripId },
                }), // exclude - this shouldn't be hapenning when useDiversion is false. But just in case, we test it
                createMockStop({
                    baseTime: baseTime - 180, // 3 minutes ago
                    stop: {
                        stopSequence: 3,
                        passed: true,
                    },
                    trip: { tripId: 'OTHER-TRIP' },
                }), // exclude
            ];

            sandbox.stub(ccRealtime, 'getHistoryByVehicleId').resolves(mockPastStops);

            await store.dispatch(fetchPastStops(mockVehicleId));

            const actions = store.getActions();
            const fetchAction = actions.find(a => a.type === ACTION_TYPE.FETCH_VEHICLE_PAST_STOPS);

            expect(fetchAction.payload.pastStops).to.have.lengthOf(1);
            expect(fetchAction.payload.pastStops[0].trip.tripId).to.equal(mockTripId);
        });

        it('should include stops from both main trip and replacement trip when useDiversion is true', async () => {
            store = mockStore(createMockState({
                useDiversion: true,
                replacementTripId: mockReplacementTripId,
            }));

            // Base time: 2023-11-07T12:00:00.000Z = 1699358400 seconds
            const baseTime = 1699358400;
            const mockPastStops = [
                createMockStop({
                    baseTime: baseTime - 600, // 10 minutes ago
                    stop: {
                        stopSequence: 1,
                        stopCode: 'STOP-001',
                        passed: true,
                    },
                    trip: { tripId: mockTripId },
                }),
                createMockStop({
                    baseTime: baseTime - 300, // 5 minutes ago
                    stop: {
                        stopSequence: 2,
                        stopCode: 'STOP-002',
                        passed: true,
                    },
                    trip: { tripId: mockReplacementTripId },
                }),
                createMockStop({
                    baseTime: baseTime - 180, // 3 minutes ago
                    stop: {
                        stopSequence: 3,
                        stopCode: 'STOP-003',
                        passed: true,
                    },
                    trip: { tripId: 'OTHER-TRIP' },
                }),
            ];

            sandbox.stub(ccRealtime, 'getHistoryByVehicleId').resolves(mockPastStops);

            await store.dispatch(fetchPastStops(mockVehicleId));

            const actions = store.getActions();
            const fetchAction = actions.find(a => a.type === ACTION_TYPE.FETCH_VEHICLE_PAST_STOPS);
            expect(fetchAction.payload.pastStops).to.have.lengthOf(2);
            expect(fetchAction.payload.pastStops[0].trip.tripId).to.equal(mockTripId);
            expect(fetchAction.payload.pastStops[1].trip.tripId).to.equal(mockReplacementTripId);
        });
    });
});
