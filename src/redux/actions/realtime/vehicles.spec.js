import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import ACTION_TYPE from '../../action-types';
import { handleRealTimeUpdate } from './vehicles';
import VIEW_TYPE from '../../../types/view-types';

chai.use(sinonChai);

jest.mock('../../../types/error-types', () => ({ fetchNotificationsEnabled: false, fetchNotifications: 'error' }));

const mockStore = configureMockStore([thunk]);
let store;

const unscheduledVehicleMock = {
    id: '36186',
    vehicle: {
        vehicle: {
            id: '36186',
            label: 'GB 6274',
        },
        trip: {
            tripId: null,
        },
        timestamp: '1536018906',
        position: {
            bearing: 110,
            latitude: -36.61226333333333,
            longitude: 174.677955,
        },
        tags: ['UNSCHEDULED'],
    },
};

const defaultVehicleStore = {
    all: {},
    filters: {
        predicate: null,
        routeType: null,
        agencyIds: null,
        isShowingDirectionInbound: true,
        isShowingDirectionOutbound: true,
        isShowingSchoolBus: false,
        isShowingNIS: false,
        isShowingUnscheduled: false,
        showingDelay: {},
        showingOccupancyLevels: [],
        showingTags: [],
    },
};

describe('Vehicles actions', () => {
    beforeEach(() => {
        store = mockStore({
            appSettings: {
                useDiversion: 'false',
            },
            realtime: {
                vehicles: defaultVehicleStore,
            },
            navigation: { activeMainView: VIEW_TYPE.MAIN.REAL_TIME },
            static: {
                fleet: {
                    26186: {},
                    36186: {},
                },
            },
        });
    });

    afterEach(() => {
        store.clearActions();
    });

    describe('vehicles', () => {
        it('should update vehicles in store with dummy route if vehicle tag is UNSCHEDULED', async () => {
            const resultVehicle = {
                ...unscheduledVehicleMock,
            };
            resultVehicle.vehicle.route = {
                route_id: 'UNSCHEDULED',
                route_type: 3,
                extended_route_type: 3,
                route_short_name: 'UNSCHEDULED',
                agency_name: '',
                agency_id: '',
                route_color: null,
                route_text_color: null,
                tokens: [
                ],
            };
            const expectedActions = [
                {
                    type: ACTION_TYPE.FETCH_VEHICLES_REALTIME,
                    payload: {
                        shouldUseDiversion: false,
                        vehicles: {
                            [unscheduledVehicleMock.vehicle.vehicle.id]: resultVehicle,
                        },
                    },
                },
            ];

            await store.dispatch(handleRealTimeUpdate(unscheduledVehicleMock));
            expect(store.getActions()).to.eql(expectedActions);
        });
    });
});
