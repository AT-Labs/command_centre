import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';
import ACTION_TYPE from '../../../action-types';
import { getVehicleReplayStatusAndPosition } from './vehicleReplay';
import * as vehicleReplayApi from '../../../../utils/transmitters/vehicle-replay-api';

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
                id: "12114",
                timestamp: 1668103503,
                vehicle: {
                    id: "12114",
                    label: "NB2114",
                    licensePlate: "EGR138"
                },
                position: {
                    speed: 0,
                    bearing: 299,
                    latitude: -36.914028,
                    longitude: 174.6883315
                }
            },
            {
                id: "12114",
                timestamp: 1668103508,
                vehicle: {
                    id: "12114",
                    label: "NB2114",
                    licensePlate: "EGR138"
                },
                position: {
                    speed: 0,
                    bearing: 299,
                    latitude: -36.9140285,
                    longitude: 174.6883322
                }
            }
        ],
        count: 9
    }
    
    const mockVehicleReplayData = [
        {
            trip: [
                {
                    id: "1141278317-20220628155619_v102.3",
                    routeId: "07005-20220628155619_v102.3",
                    direction: 0,
                    event: [
                        {
                            id: "bc4f4661-75c7-48f2-973a-0bcac903266e",
                            type: "keyOn",
                            timestamp: 1656615510,
                            startDate: "20220701",
                            startTime: "05:45:00",
                            position: {
                                latitude: null,
                                longitude: null,
                                bearing: null,
                                speed: null
                            }
                        },
                        {
                            id: "30d16319-a915-4ddc-a5fd-f46c3cff5fb2",
                            type: "keyOff",
                            timestamp: 1656614337,
                            startDate: "20220701",
                            startTime: "05:45:00",
                            position: {
                                latitude: null,
                                longitude: null,
                                bearing: null,
                                speed: null
                            }
                        }
                    ]
                }
            ],
            vehicle: {
                id: "24516",
                label: "HE0516",
                registration: "MHY986"
            }
        }
    ]
    
    const dispatchedData = [
        {
            id: "30d16319-a915-4ddc-a5fd-f46c3cff5fb2",
            type: "keyOff",
            timestamp: 1656614337,
            startDate: "20220701",
            startTime: "05:45:00",
            position: { latitude: null, longitude: null, bearing: null, speed: null },
            tripId: "1141278317-20220628155619_v102.3",
        },
        {
            id:"bc4f4661-75c7-48f2-973a-0bcac903266e",
            type: "keyOn",
            timestamp: 1656615510,
            startDate: "20220701",
            startTime: "05:45:00",
            position: { latitude: null, longitude: null, bearing: null, speed: null },
            tripId: "1141278317-20220628155619_v102.3",
        },
        {
            id: '12114-1668103503',
            timestamp: 1668103503,
            vehicle: { id: '12114', label: 'NB2114', licensePlate: 'EGR138' },
            position: {
              speed: 0,
              bearing: 299,
              latitude: -36.914028,
              longitude: 174.6883315
            },
            type: 'vehiclePosition',
            startOfRangeTime: 1668103503,
            endOfRangeTime: 1668103508,
            child: [
                {
                    id: '12114-1668103503',
                    timestamp: 1668103503,
                    vehicle: { id: '12114', label: 'NB2114', licensePlate: 'EGR138' },
                    position: {
                    speed: 0,
                    bearing: 299,
                    latitude: -36.914028,
                    longitude: 174.6883315
                    },
                    type: 'vehiclePosition'
                },
                {
                    id: '12114-1668103508',
                    timestamp: 1668103508,
                    vehicle: { id: '12114', label: 'NB2114', licensePlate: 'EGR138' },
                    position: {
                    speed: 0,
                    bearing: 299,
                    latitude: -36.9140285,
                    longitude: 174.6883322
                    },
                    type: 'vehiclePosition'
                }
            ]
        },
    ]

    it('Should dispatch vehicle replay action', async () => {

        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS,
                payload: {
                    vehicleEvents: dispatchedData,
                    totalEvents: 4,
                    totalDisplayedEvents: 4,
                    hasMoreVehicleStausAndPositions: false
                },
            },
        ];

        sandbox.stub(vehicleReplayApi, 'getVehicleReplay').resolves(mockVehicleReplayData);
        sandbox.stub(vehicleReplayApi, 'getVehiclePosition').resolves(mockVehiclePosition);

        await store.dispatch(getVehicleReplayStatusAndPosition());
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('Should dispatch vehicle replay action with empty object', async () => {
        const mockVehicleReplayData = [];
        const mockVehiclePosition = {
            data: [],
            count: 0
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS,
                payload: {
                    vehicleEvents: [],
                    totalEvents: 0,
                    totalDisplayedEvents: 0,
                    hasMoreVehicleStausAndPositions: false
                },
            },
        ];

        sandbox.stub(vehicleReplayApi, 'getVehicleReplay').resolves(mockVehicleReplayData);
        sandbox.stub(vehicleReplayApi, 'getVehiclePosition').resolves(mockVehiclePosition);

        await store.dispatch(getVehicleReplayStatusAndPosition());
        expect(store.getActions()).to.eql(expectedActions);
    });
});
