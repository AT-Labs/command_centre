import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';
import ACTION_TYPE from '../../../action-types';
import { getAllVehicleReplayEvents } from './currentVehicleReplay';
import * as vehicleReplayApi from '../../../../utils/transmitters/vehicle-replay-api';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Current vehicle replay actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('Should dispatch vehicle events action', async () => {
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
                                tripId: "1141278317-20220628155619_v102.3",
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
                                tripId: "1141278317-20220628155619_v102.3",
                                startDate: "20220701",
                                startTime: "05:45:00",
                                position: {
                                    latitude: -36.8405668,
                                    longitude: 174.755684,
                                    bearing: 109,
                                    speed: 7
                                }
                            }
                        ]
                    },
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
                type: ACTION_TYPE.UPDATE_CONTROL_VEHICLE_REPLAYS_EVENTS,
                payload: {
                    events: mockVehicleReplayData[0].trip[0].event,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_VEHICLE_FIRST_REPLAY_EVENT,
                payload: {
                    firstEvent: mockVehicleReplayData[0].trip[0].event[1],
                },
            },
        ];
        const getvehicleReplay = sandbox.stub(vehicleReplayApi, 'getVehicleReplay').resolves(mockVehicleReplayData);
        await store.dispatch(getAllVehicleReplayEvents());
        sandbox.assert.calledOnce(getvehicleReplay);
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('Should not dispatch any vehicle status events', async () => {
        const mockVehicleReplayData = []

        const getvehicleReplay = sandbox.stub(vehicleReplayApi, 'getVehicleReplay').resolves(mockVehicleReplayData);
        await store.dispatch(getAllVehicleReplayEvents());
        sandbox.assert.calledOnce(getvehicleReplay);
        expect(store.getActions()).to.eql([]);
    });

});
