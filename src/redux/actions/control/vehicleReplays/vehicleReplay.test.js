import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';
import ACTION_TYPE from '../../../action-types';
import { clusterVehiclePositionGroup, getVehicleReplayStatusAndPosition } from './vehicleReplay';
import * as vehicleReplayApi from '../../../../utils/transmitters/vehicle-replay-api';
import * as routes from '../../../selectors/static/routes';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Vehicle replay actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    const mockVehiclePosition = {
        data: [
            {
                id: '12114',
                type: 'vehiclePosition',
                timestamp: 1668103503,
                routeId: '',
                vehicle: {
                    id: '12114',
                    label: 'NB2114',
                    licensePlate: 'EGR138',
                },
                position: {
                    speed: 0,
                    bearing: 299,
                    latitude: -36.914028,
                    longitude: 174.6883315,
                },
                actual: {
                    start: '07:47:07',
                    end: '10:30:26',
                },
                scheduled: {
                    start: '07:48:00',
                    end: '08:43:00',
                },
            },
            {
                id: '12114',
                type: 'vehiclePosition',
                routeId: '',
                timestamp: 1668103508,
                vehicle: {
                    id: '12114',
                    label: 'NB2114',
                    licensePlate: 'EGR138',
                },
                position: {
                    speed: 0,
                    bearing: 299,
                    latitude: -36.9140285,
                    longitude: 174.6883322,
                },
                actual: {
                    start: '07:47:07',
                    end: '10:30:26',
                },
                scheduled: {
                    start: '07:48:00',
                    end: '08:43:00',
                },
            },
        ],
        count: 2,
    };

    const mockVehicleEventData = [...mockVehiclePosition.data,
        {
            id: '12114',
            type: 'signOff',
            timestamp: 1668104503,
            routeId: '',
            vehicle: {
                id: '12114',
                label: 'NB2114',
                licensePlate: 'EGR138',
            },
            position: {
                speed: 0,
                bearing: 299,
                latitude: -36.9140285,
                longitude: 174.6883322,
            },
            actual: {
                start: '07:47:07',
                end: '10:30:26',
            },
            scheduled: {
                start: '07:48:00',
                end: '08:43:00',
            },
        },
    ];

    const mockVehicleEventClusterResult = [
        [
            {
                id: '12114',
                type: 'vehiclePosition',
                timestamp: 1668103503,
                routeId: '',
                vehicle: {
                    id: '12114',
                    label: 'NB2114',
                    licensePlate: 'EGR138',
                },
                position: {
                    speed: 0,
                    bearing: 299,
                    latitude: -36.914028,
                    longitude: 174.6883315,
                },
                actual: {
                    start: '07:47:07',
                    end: '10:30:26',
                },
                scheduled: {
                    start: '07:48:00',
                    end: '08:43:00',
                },
            },
            {
                id: '12114',
                type: 'vehiclePosition',
                routeId: '',
                timestamp: 1668103508,
                vehicle: {
                    id: '12114',
                    label: 'NB2114',
                    licensePlate: 'EGR138',
                },
                position: {
                    speed: 0,
                    bearing: 299,
                    latitude: -36.9140285,
                    longitude: 174.6883322,
                },
                actual: {
                    start: '07:47:07',
                    end: '10:30:26',
                },
                scheduled: {
                    start: '07:48:00',
                    end: '08:43:00',
                },
            },
        ],
        [
            {
                id: '12114',
                type: 'signOff',
                timestamp: 1668104503,
                routeId: '',
                vehicle: {
                    id: '12114',
                    label: 'NB2114',
                    licensePlate: 'EGR138',
                },
                position: {
                    speed: 0,
                    bearing: 299,
                    latitude: -36.9140285,
                    longitude: 174.6883322,
                },
                actual: {
                    start: '07:47:07',
                    end: '10:30:26',
                },
                scheduled: {
                    start: '07:48:00',
                    end: '08:43:00',
                },
            },
        ],
    ];

    const mockVehicleReplayData = [
        {
            trip: [
                {
                    id: '1141278317-20220628155619_v102.3',
                    routeId: '16101-20180921103729_v70.37',
                    direction: 0,
                    event: [
                        {
                            id: 'bc4f4661-75c7-48f2-973a-0bcac903266e',
                            type: 'keyOn',
                            timestamp: 1656615510,
                            startDate: '20220701',
                            startTime: '05:45:00',
                            position: {
                                latitude: null,
                                longitude: null,
                                bearing: null,
                                speed: null,
                            },
                        },
                        {
                            id: '30d16319-a915-4ddc-a5fd-f46c3cff5fb2',
                            type: 'keyOff',
                            timestamp: 1656614337,
                            startDate: '20220701',
                            startTime: '05:45:00',
                            position: {
                                latitude: null,
                                longitude: null,
                                bearing: null,
                                speed: null,
                            },
                        },
                    ],
                },
            ],
            vehicle: {
                id: '24516',
                label: 'HE0516',
                registration: 'MHY986',
            },
        },
    ];

    const dispatchedData = [
        {
            id: '30d16319-a915-4ddc-a5fd-f46c3cff5fb2',
            type: 'keyOff',
            timestamp: 1656614337,
            startDate: '20220701',
            startTime: '05:45:00',
            position: { latitude: null, longitude: null, bearing: null, speed: null },
            tripId: '1141278317-20220628155619_v102.3',
            routeShortName: '161',
        },
        {
            id: 'bc4f4661-75c7-48f2-973a-0bcac903266e',
            type: 'keyOn',
            timestamp: 1656615510,
            startDate: '20220701',
            startTime: '05:45:00',
            position: { latitude: null, longitude: null, bearing: null, speed: null },
            tripId: '1141278317-20220628155619_v102.3',
            routeShortName: '161',
        },
        {
            id: '12114-1668103503',
            routeId: '',
            routeShortName: '',
            tripId: '',
            timestamp: 1668103503,
            vehicle: { id: '12114', label: 'NB2114', licensePlate: 'EGR138' },
            position: {
                speed: 0,
                bearing: 299,
                latitude: -36.914028,
                longitude: 174.6883315,
            },
            type: 'vehiclePosition',
            actual: {
                start: '07:47:07',
                end: '10:30:26',
            },
            scheduled: {
                start: '07:48:00',
                end: '08:43:00',
            },
            startOfRangeTime: 1668103503,
            endOfRangeTime: 1668103508,
            child: [
                {
                    id: '12114-1668103503',
                    timestamp: 1668103503,
                    routeId: '',
                    tripId: '',
                    routeShortName: '',
                    vehicle: { id: '12114', label: 'NB2114', licensePlate: 'EGR138' },
                    position: {
                        speed: 0,
                        bearing: 299,
                        latitude: -36.914028,
                        longitude: 174.6883315,
                    },
                    actual: {
                        start: '07:47:07',
                        end: '10:30:26',
                    },
                    scheduled: {
                        start: '07:48:00',
                        end: '08:43:00',
                    },
                    type: 'vehiclePosition',
                },
                {
                    id: '12114-1668103508',
                    timestamp: 1668103508,
                    routeId: '',
                    tripId: '',
                    routeShortName: '',
                    vehicle: { id: '12114', label: 'NB2114', licensePlate: 'EGR138' },
                    position: {
                        speed: 0,
                        bearing: 299,
                        latitude: -36.9140285,
                        longitude: 174.6883322,
                    },
                    actual: {
                        start: '07:47:07',
                        end: '10:30:26',
                    },
                    scheduled: {
                        start: '07:48:00',
                        end: '08:43:00',
                    },
                    type: 'vehiclePosition',
                },
            ],
        },
    ];

    const splitVehicleEvents = [
        {
            id: '30d16319-a915-4ddc-a5fd-f46c3cff5fb2',
            type: 'keyOff',
            timestamp: 1656614337,
            startDate: '20220701',
            startTime: '05:45:00',
            position: { latitude: null, longitude: null, bearing: null, speed: null },
            tripId: '1141278317-20220628155619_v102.3',
            routeShortName: '161',
        },
        {
            id: 'bc4f4661-75c7-48f2-973a-0bcac903266e',
            type: 'keyOn',
            timestamp: 1656615510,
            startDate: '20220701',
            startTime: '05:45:00',
            position: { latitude: null, longitude: null, bearing: null, speed: null },
            tripId: '1141278317-20220628155619_v102.3',
            routeShortName: '161',
        },
    ];

    const splitVehiclePosition = [
        {
            id: '12114-1668103503',
            routeId: '',
            routeShortName: '',
            tripId: '',
            position: {
                bearing: 299,
                latitude: -36.914028,
                longitude: 174.6883315,
                speed: 0,
            },
            timestamp: 1668103503,
            type: 'vehiclePosition',
            vehicle: {
                id: '12114',
                label: 'NB2114',
                licensePlate: 'EGR138',
            },
            actual: {
                start: '07:47:07',
                end: '10:30:26',
            },
            scheduled: {
                start: '07:48:00',
                end: '08:43:00',
            },
        },
        {
            id: '12114-1668103508',
            routeId: '',
            routeShortName: '',
            tripId: '',
            position: {
                bearing: 299,
                latitude: -36.9140285,
                longitude: 174.6883322,
                speed: 0,
            },
            timestamp: 1668103508,
            type: 'vehiclePosition',
            vehicle: {
                id: '12114',
                label: 'NB2114',
                licensePlate: 'EGR138',
            },
            actual: {
                start: '07:47:07',
                end: '10:30:26',
            },
            scheduled: {
                start: '07:48:00',
                end: '08:43:00',
            },
        },
    ];

    const firstVehiclePositionEvent = {
        id: '12114-1668103503',
        routeId: '',
        tripId: '',
        routeShortName: '',
        position: {
            bearing: 299,
            latitude: -36.914028,
            longitude: 174.6883315,
            speed: 0,
        },
        timestamp: 1668103503,
        type: 'vehiclePosition',
        vehicle: {
            id: '12114',
            label: 'NB2114',
            licensePlate: 'EGR138',
        },
        actual: {
            start: '07:47:07',
            end: '10:30:26',
        },
        scheduled: {
            start: '07:48:00',
            end: '08:43:00',
        },
    };

    const mockRoute = {
        agency_name: 'Ritchies Transport',
        route_id: '16101-20180921103729_v70.37',
        route_long_name: 'Brains Park to New Lynn',
        route_short_name: '161',
        route_type: 3,
        tokens: ['161'],
    };

    it('Should dispatch vehicle replay action', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS,
                payload: {
                    vehicleEventsAndPositions: dispatchedData,
                    totalEvents: 4,
                    totalDisplayedEvents: 4,
                    hasMoreVehicleStatusAndPositions: false,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_SPLIT_CONTROL_VEHICLE_REPLAYS_EVENTS,
                payload: {
                    vehicleEvents: splitVehicleEvents,
                    vehiclePositions: splitVehiclePosition,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_VEHICLE_FIRST_REPLAY_EVENT,
                payload: {
                    firstEvent: firstVehiclePositionEvent,
                },
            },
        ];
        sandbox.stub(routes, 'getAllRoutes').returns({ '16101-20180921103729_v70.37': mockRoute });
        sandbox.stub(vehicleReplayApi, 'getVehicleReplay').resolves(mockVehicleReplayData);
        sandbox.stub(vehicleReplayApi, 'getVehiclePosition').resolves(mockVehiclePosition);

        await store.dispatch(getVehicleReplayStatusAndPosition());
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('Should dispatch vehicle replay action with empty object', async () => {
        const mockEmptyVehicleReplayData = [];
        const mockEmptyVehiclePosition = {
            data: [],
            count: 0,
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS,
                payload: {
                    vehicleEventsAndPositions: [],
                    totalEvents: 0,
                    totalDisplayedEvents: 0,
                    hasMoreVehicleStatusAndPositions: false,
                },
            },
        ];

        sandbox.stub(vehicleReplayApi, 'getVehicleReplay').resolves(mockEmptyVehicleReplayData);
        sandbox.stub(vehicleReplayApi, 'getVehiclePosition').resolves(mockEmptyVehiclePosition);

        await store.dispatch(getVehicleReplayStatusAndPosition());
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('cluster Vehicle Position Correctly ', async () => {
        const output = clusterVehiclePositionGroup(mockVehicleEventData);
        expect(output).to.eql(mockVehicleEventClusterResult);
    });
});
