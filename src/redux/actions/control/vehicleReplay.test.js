import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';


import ACTION_TYPE from '../../action-types';
import { searchVehicleReplay } from './vehicleReplay';
import * as vehicleReplayApi from '../../../utils/transmitters/vehicle-replay-api';

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

    it('Should dispatch vehicle replay action', async () => {
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
                    },
                    {
                        id: null,
                        routeId: null,
                        direction: null,
                        event: [
                            {
                                id: "c28eaa21-8f86-4e11-b32f-9eb983efa7c6",
                                type: "keyOn",
                                timestamp: 1656610341,
                                startDate: null,
                                startTime: null,
                                position: {
                                    latitude: null,
                                    longitude: null,
                                    bearing: null,
                                    speed: null
                                }
                            },
                        ]
                    },
                    {
                        id: "1141278921-20220620114222_v101.37",
                        routeId: "07005-20220620114222_v101.37",
                        direction: 0,
                        event: [
                            {
                                id: "ff96146d-aebb-4b74-88f5-a64de3f07a23",
                                type: "keyOn",
                                timestamp: 1656553519,
                                startDate: "20220630",
                                startTime: "12:20:00",
                                positio: {
                                    latitude: null,
                                    longitude: null,
                                    bearing: null,
                                    speed: null
                                }
                            },
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
        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS,
                payload: {
                    trips: mockVehicleReplayData[0],
                    totalStatus: 4,
                },
            },
        ];
        const getvehicleReplay = sandbox.stub(vehicleReplayApi, 'getVehicleReplay').resolves(mockVehicleReplayData);
        await store.dispatch(searchVehicleReplay());
        sandbox.assert.calledOnce(getvehicleReplay);
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('Should dispatch vehicle replay action with empty object', async () => {
        const mockVehicleReplayData = [];
        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_CONTROL_VEHICLE_REPLAYS,
                payload: {
                    trips: {},
                    totalStatus: 0,
                },
            },
        ];
        const getvehicleReplay = sandbox.stub(vehicleReplayApi, 'getVehicleReplay').resolves(mockVehicleReplayData);
        await store.dispatch(searchVehicleReplay());
        sandbox.assert.calledOnce(getvehicleReplay);
        expect(store.getActions()).to.eql(expectedActions);
    });
});
