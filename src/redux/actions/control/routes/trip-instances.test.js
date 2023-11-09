import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import MockDate from 'mockdate';

import {
    fetchTripInstances, clearActiveTripInstanceId, updateActiveTripInstanceId, collectTripsDataAndUpdateTripsStatus,
    updateTripInstanceStatus, updateTripInstanceStopStatus, updateTripInstanceStopPlatform, updateTripInstanceDelay, filterTripInstances, updateDestination,
    updateEnabledAddTripModal, updateCurrentStepHandler, updateAddTripDatagridConfig, updateSelectedAddTrip, resetAddTripStep
} from './trip-instances';
import * as tripMgtApi from '../../../../utils/transmitters/trip-mgt-api';
import * as blockMgtApi from '../../../../utils/transmitters/block-mgt-api';
import ACTION_TYPE from '../../../action-types';
import { CONFIRMATION_MESSAGE_TYPE, ERROR_MESSAGE_TYPE, MESSAGE_ACTION_TYPES } from '../../../../types/message-types';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import { getTripInstanceId } from '../../../../utils/helpers';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

const mockTrips = {
    totalCount: 2,
    tripInstances: [{
        tripId: '1',
        serviceDate: '20190608',
        startTime: '10:00:00',
        routeShortName: '10',
        routeType: 3,
        status: 'COMPLETED',
    }, {
        tripId: '2',
        serviceDate: '20190608',
        startTime: '10:00:00',
        routeShortName: '20',
        routeType: 3,
        status: 'NOT_STARTED',
    }],
    _links: {
        permissions: [
            {
                _rel: "cancel"
            },
            {
                _rel: "copy"
            },
            {
                _rel: "delay"
            },
            {
                _rel: "view"
            },
            {
                _rel: "advancer"
            },
            {
                _rel: "recurrent_cancel"
            },
            {
                _rel: "new"
            }
        ]
    }
};

const mockStoreTrips = {
    '1-20190608-10:00:00': {
        tripId: '1',
        serviceDate: '20190608',
        startTime: '10:00:00',
        routeShortName: '10',
        routeType: 3,
        status: 'COMPLETED',
    },
    '2-20190608-10:00:00': {
        tripId: '2',
        serviceDate: '20190608',
        startTime: '10:00:00',
        routeShortName: '20',
        routeType: 3,
        status: 'NOT_STARTED',
    },
};

const mockTrip = {
    tripId: '1',
    serviceDate: '20190608',
    startTime: '10:00:00',
    routeShortName: '10',
    routeType: 3,
    status: 'COMPLETED',
};

const mockBlocks = [
    {
        operationalBlockId: '101',
        operationalTrips: [
            {
                tripId: '1',
            },
        ],
    },
];

describe('Trip instances actions', () => {
    beforeEach(() => {
        MockDate.set(new Date(Date.UTC(2023, 2, 20, 0, 0, 0)));
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
        MockDate.reset();
    });

    it('gets all trips, keys by tripId and clears trips prior updating, when it is not an update request', async () => {
        const fakeGetTrips = sandbox.fake.resolves(mockTrips);
        sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);
        const fakeGetBlocks = sandbox.fake.resolves(mockBlocks);
        sandbox.stub(blockMgtApi, 'getOperationalBlockRuns').callsFake(fakeGetBlocks);

        const variables = {
            routeType: 3,
            serviceDate: '20190322',
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LOADING,
                payload: {
                    isLoading: true,
                },
            },
            {
                type: ACTION_TYPE.CLEAR_CONTROL_TRIP_INSTANCES,
                payload: {
                    timestamp: '',
                },
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES,
                payload: {
                    tripInstances: mockStoreTrips,
                    timestamp: '',
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_TOTAL_COUNT,
                payload: {
                    totalTripInstancesCount: 2,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_PERMISSIONS,
                payload: {
                    permissions: [
                        {
                            _rel: "cancel"
                        },
                        {
                            _rel: "copy"
                        },
                        {
                            _rel: "delay"
                        },
                        {
                            _rel: "view"
                        },
                        {
                            _rel: "advancer"
                        },
                        {
                            _rel: "recurrent_cancel"
                        },
                        {
                            _rel: "new"
                        }
                    ]
                },
            },
        ];

        const storeWithFilter = mockStore({
            control: {
                routes: {
                    filters: {
                        routeType: 3,
                    },
                },
            },
        });

        await storeWithFilter.dispatch(fetchTripInstances(variables, { isUpdate: false }));
        const actualActions = storeWithFilter.getActions();
        expect(actualActions.length).to.eql(expectedActions.length);
        expect(actualActions[0]).to.eql(expectedActions[0]);
        expect(actualActions[1].type).to.equal(expectedActions[1].type);
        expect(actualActions[2].type).to.equal(expectedActions[2].type);
        expect(actualActions[2].payload.tripInstances).to.eql(expectedActions[2].payload.tripInstances);
        expect(actualActions[3].payload.totalTripInstancesCount).to.eql(expectedActions[3].payload.totalTripInstancesCount);
    });

    it('gets all trips, keys by tripId and doesnt clear trips prior updating, when it is an update request', async () => {
        const fakeGetTrips = sandbox.fake.resolves(mockTrips);
        sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);

        const variables = {
            routeType: 3,
            serviceDate: '20190322',
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_UPDATING,
                payload: {
                    isUpdating: true,
                },
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES,
                payload: {
                    tripInstances: mockStoreTrips,
                    timestamp: '',
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_TOTAL_COUNT,
                payload: {
                    totalTripInstancesCount: 2,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_PERMISSIONS,
                payload: {
                    permissions: [
                        {
                            _rel: "cancel"
                        },
                        {
                            _rel: "copy"
                        },
                        {
                            _rel: "delay"
                        },
                        {
                            _rel: "view"
                        },
                        {
                            _rel: "advancer"
                        },
                        {
                            _rel: "recurrent_cancel"
                        },
                        {
                            _rel: "new"
                        }
                    ]
                },
            },
        ];

        const storeWithFilter = mockStore({
            control: {
                routes: {
                    filters: {
                        routeType: 3,
                    },
                },
            },
        });

        await storeWithFilter.dispatch(fetchTripInstances(variables, { isUpdate: true }));
        const actualActions = storeWithFilter.getActions();
        expect(actualActions.length).to.eql(expectedActions.length);
        expect(actualActions[0]).to.eql(expectedActions[0]);
        expect(actualActions[1].type).to.equal(expectedActions[1].type);
        expect(actualActions[1].payload.tripInstances).to.eql(expectedActions[1].payload.tripInstances);
        expect(actualActions[2].payload.totalTripInstancesCount).to.eql(expectedActions[2].payload.totalTripInstancesCount);
    });

    it('gets all trips and also sets an active trip when link is available', async () => {
        const fakeGetTrips = sandbox.fake.resolves(mockTrips);
        sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);

        const variables = {
            routeType: 3,
            serviceDate: '20190322',
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LOADING,
                payload: {
                    isLoading: true,
                },
            },
            {
                type: ACTION_TYPE.CLEAR_CONTROL_TRIP_INSTANCES,
                payload: {
                    timestamp: '',
                },
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES,
                payload: {
                    tripInstances: mockStoreTrips,
                    timestamp: '',
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_TOTAL_COUNT,
                payload: {
                    totalTripInstancesCount: 2,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_PERMISSIONS,
                payload: {
                    permissions: [
                        {
                            _rel: "cancel"
                        },
                        {
                            _rel: "copy"
                        },
                        {
                            _rel: "delay"
                        },
                        {
                            _rel: "view"
                        },
                        {
                            _rel: "advancer"
                        },
                        {
                            _rel: "recurrent_cancel"
                        },
                        {
                            _rel: "new"
                        }
                    ]
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE,
                payload: {
                    activeTripInstanceId: '123',
                },
            },
        ];

        const storeWithLink = mockStore({
            control: {
                link: {
                    routeVariantId: '00001',
                    routeType: 3,
                    startTime: '10:00:00',
                    routeShortName: '1',
                },
                routes: {
                    filters: {
                        routeType: 3,
                    },
                },
            },
        });

        await storeWithLink.dispatch(fetchTripInstances(variables, { isUpdate: false }));
        const actualActions = storeWithLink.getActions();
        expect(actualActions.length).to.eql(expectedActions.length);
        expect(actualActions[0]).to.eql(expectedActions[0]);
        expect(actualActions[1].type).to.equal(expectedActions[1].type);
        expect(actualActions[2].type).to.equal(expectedActions[2].type);
        expect(actualActions[2].payload.tripInstances).to.eql(expectedActions[2].payload.tripInstances);
        expect(actualActions[3].payload.totalTripInstancesCount).to.eql(expectedActions[3].payload.totalTripInstancesCount);
    });

    it('clears active trip instance', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE,
                payload: {
                    activeTripInstanceId: null,
                },
            },
        ];

        await store.dispatch(clearActiveTripInstanceId());
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('updates active trip instance', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_ACTIVE_TRIP_INSTANCE,
                payload: {
                    activeTripInstanceId: '1',
                },
            },
        ];

        await store.dispatch(updateActiveTripInstanceId('1'));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('updates trip status', async () => {
        const fakeUpdateTripStatus = sandbox.fake.resolves(mockTrip);
        sandbox.stub(tripMgtApi, 'recurringUpdateTripStatus').callsFake(fakeUpdateTripStatus);

        const options = {
            tripId: mockTrip.tripId,
            serviceDate: '20190608',
            startTime: '10:00:00',
            tripStatus: mockTrip.status,
            routeType: mockTrip.routeType,
        };
        const successMessage = 'success';
        const tripInstanceId = getTripInstanceId(mockTrip);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING,
                payload: { tripId: tripInstanceId, isLoading: true },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCE_ENTRY,
                payload: { tripInstance: mockTrip },
            },
            {
                type: ACTION_TYPE.SET_TRIP_INSTANCE_ACTION_RESULT,
                payload: {
                    actionType: MESSAGE_ACTION_TYPES.updateStatus,
                    id: 'actionResult1',
                    body: successMessage,
                    type: CONFIRMATION_MESSAGE_TYPE,
                    tripId: tripInstanceId,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING,
                payload: { tripId: tripInstanceId, isLoading: false },
            },
        ];

        await store.dispatch(updateTripInstanceStatus(options, successMessage, MESSAGE_ACTION_TYPES.updateStatus));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('collect trips data and update trips status', async () => {
        const fakeUpdateTripStatus = sandbox.fake.resolves(mockTrip);
        sandbox.stub(tripMgtApi, 'recurringUpdateTripStatus').callsFake(fakeUpdateTripStatus);
        const fakeGetTrips = sandbox.fake.resolves(mockTrips);
        sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);
        const operateTrips = {
            [mockTrip.tripId]:{
            tripId: mockTrip.tripId,
            serviceDate: '20190608',
            startTime: '10:00:00',
            tripStatus: mockTrip.status,
            routeType: mockTrip.routeType,
        }};
        const selectedTrips = operateTrips;
        const recurrenceSetting = {
            startDate: '08/06/2019',
            selectedWeekdays: [1],
            isRecurringOperation: true,
        };
        const successMessage = 'success';
        const errorMessage = 'error';
        const tripInstanceId = getTripInstanceId(mockTrip);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING,
                payload: { tripId: tripInstanceId, isLoading: true },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCE_ENTRY,
                payload: { tripInstance: mockTrip },
            },
            {
                type: ACTION_TYPE.SET_TRIP_INSTANCE_ACTION_RESULT,
                payload: {
                    actionType: MESSAGE_ACTION_TYPES.bulkStatusUpdate,
                    id: 'actionResult2',
                    body: successMessage,
                    type: CONFIRMATION_MESSAGE_TYPE,
                    tripId: tripInstanceId,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING,
                payload: { tripId: tripInstanceId, isLoading: false },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_SELECTED_TRIPS,
                payload: { selectedTripsUpdate: [mockTrip]},
            },
        ];

        await store.dispatch(collectTripsDataAndUpdateTripsStatus(operateTrips, TRIP_STATUS_TYPES.cancelled, successMessage, errorMessage, recurrenceSetting, selectedTrips));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('updates stop status', async () => {
        const fakeUpdateStopStatus = sandbox.fake.resolves(mockTrip);
        sandbox.stub(tripMgtApi, 'updateStopStatus').callsFake(fakeUpdateStopStatus);

        const options = {
            tripId: mockTrip.tripId,
            serviceDate: '20190608',
            startTime: '10:00:00',
        };
        const successMessage = 'success';
        const tripInstanceId = getTripInstanceId(mockTrip);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING,
                payload: { tripId: tripInstanceId, isLoading: true },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCE_ENTRY,
                payload: { tripInstance: mockTrip },
            },
            {
                type: ACTION_TYPE.SET_TRIP_INSTANCE_ACTION_RESULT,
                payload: {
                    actionType: MESSAGE_ACTION_TYPES.bulkStopStatusUpdate,
                    id: 'actionResult3',
                    body: successMessage,
                    type: CONFIRMATION_MESSAGE_TYPE,
                    tripId: tripInstanceId,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING,
                payload: { tripId: tripInstanceId, isLoading: false },
            },
        ];

        await store.dispatch(updateTripInstanceStopStatus(options, successMessage, MESSAGE_ACTION_TYPES.bulkStopStatusUpdate, 'errorMessage'));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('updates trip delay', async () => {
        const fakeUpdateTripDelay = sandbox.fake.resolves(mockTrip);
        sandbox.stub(tripMgtApi, 'updateTripDelay').callsFake(fakeUpdateTripDelay);

        const options = {
            tripId: mockTrip.tripId,
            serviceDate: '20190608',
            startTime: '10:00:00',
        };
        const successMessage = 'success';
        const tripInstanceId = getTripInstanceId(mockTrip);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING,
                payload: { tripId: tripInstanceId, isLoading: true },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCE_ENTRY,
                payload: { tripInstance: mockTrip },
            },
            {
                type: ACTION_TYPE.SET_TRIP_INSTANCE_ACTION_RESULT,
                payload: {
                    actionType: MESSAGE_ACTION_TYPES.tripDelayUpdate,
                    id: 'actionResult4',
                    body: successMessage,
                    type: CONFIRMATION_MESSAGE_TYPE,
                    tripId: tripInstanceId,
                },
            },
        ];

        await store.dispatch(updateTripInstanceDelay(options, successMessage));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('updates stop platform', async () => {
        const fakeUpdateStopId = sandbox.fake.resolves(mockTrip);
        sandbox.stub(tripMgtApi, 'updateStopId').callsFake(fakeUpdateStopId);

        const options = {
            tripId: mockTrip.tripId,
            serviceDate: '20190608',
            startTime: '10:00:00',
            stopId: '9102-40006383'
        };
        const successMessage = 'success';
        const tripInstanceId = getTripInstanceId(mockTrip);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_TRIP_INSTANCE_ACTION_LOADING,
                payload: { tripId: tripInstanceId, isLoading: true },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCE_ENTRY,
                payload: { tripInstance: mockTrip },
            },
            {
                type: ACTION_TYPE.SET_TRIP_INSTANCE_ACTION_RESULT,
                payload: {
                    actionType: MESSAGE_ACTION_TYPES.stopPlatformUpdate,
                    id: 'actionResult5',
                    body: successMessage,
                    type: CONFIRMATION_MESSAGE_TYPE,
                    tripId: tripInstanceId,
                },
            },
        ];

        await store.dispatch(updateTripInstanceStopPlatform(options, successMessage));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('Fail to update stop platform when stopId is null', async () => {
        const fakeUpdateStopId = sandbox.fake.resolves(mockTrip);
        sandbox.stub(tripMgtApi, 'updateStopId').callsFake(fakeUpdateStopId);

        const options = {
            tripId: mockTrip.tripId,
            serviceDate: '20190608',
            startTime: '10:00:00',
        };
        const errorMessage = 'Failed to update the stop platform.';
        const tripInstanceId = getTripInstanceId(mockTrip);

        const expectedActions = [
            {
                type: ACTION_TYPE.SET_TRIP_INSTANCE_ACTION_RESULT,
                payload: {
                    actionType: MESSAGE_ACTION_TYPES.stopPlatformUpdate,
                    id: 'actionResult6',
                    body: errorMessage,
                    type: ERROR_MESSAGE_TYPE,
                    tripId: tripInstanceId,
                },
            },
        ];

        await store.dispatch(updateTripInstanceStopPlatform(options, ''));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('gets all trips filtered for the datagrid', async () => {
        const fakeGetTrips = sandbox.fake.resolves(mockTrips);
        sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_UPDATING,
                payload: {
                    isUpdating: true,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LAST_FILTER,
                payload: {
                    lastFilterRequest: {
                        routeType: 3,
                        delayRange: undefined,
                        agencyId: undefined,
                        depotIds: undefined,
                        tripStatus: undefined,
                        serviceDate: '20230320',
                        startTimeFrom: "21:00",
                        startTimeTo: "23:00",
                        endTime: "24:00",
                        endTimeFrom: "22:00",
                        endTimeTo: "24:00",
                        vehicleLabel: ["Label_Test"],
                        vehicleLabels: ["Label_Test"],
                        referenceId: ["9111"],
                        referenceIds: ["9111"],
                        trackingStatus: ["STOPPED"],
                        trackingStatuses: ["STOPPED"],
                        tripId: ["1327-86502-75600-2-96e917d1"],
                        tripIds: ["1327-86502-75600-2-96e917d1"],
                        source: "manual",
                        page: 1,
                        limit: 15,
                        sorting: {
                          sortBy: 'startTime',
                          order: 'asc',
                        },
                    },
                },
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES,
                payload: {
                    tripInstances: mockStoreTrips,
                    timestamp: 1679270400000,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_TOTAL_COUNT,
                payload: {
                    totalTripInstancesCount: 2,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_PERMISSIONS,
                payload: {
                    permissions: [
                        {
                            _rel: "cancel"
                        },
                        {
                            _rel: "copy"
                        },
                        {
                            _rel: "delay"
                        },
                        {
                            _rel: "view"
                        },
                        {
                            _rel: "advancer"
                        },
                        {
                            _rel: "recurrent_cancel"
                        },
                        {
                            _rel: "new"
                        }
                    ]
                },
            },
        ];

        const storeWithFilter = mockStore({
            control: {
                routes: {
                    filters: {
                        routeType: 3,
                        startTimeFrom: "21:00",
                        startTimeTo: "23:00",
                    },
                    tripInstances: {
                        datagridConfig: {
                            columns: [],
                            page: 0,
                            pageSize: 15,
                            sortModel: [{
                                field: 'startTime',
                                sort: 'asc',
                            }],
                            density: 'standard',
                            routeSelection: '',
                            filterModel: { items: [{
                                columnField: "endTime",
                                operatorValue: "onOrAfter",
                                id: 14456,
                                value: "22:00"
                            },{
                                columnField: "endTime",
                                operatorValue: "onOrBefore",
                                id: 24456,
                                value: "24:00"
                            },{
                                columnField: "vehicleLabel",
                                operatorValue: "isAnyOf",
                                id: 55123,
                                value: ["Label_Test"]
                            },{
                                columnField: "referenceId",
                                operatorValue: "isAnyOf",
                                id: 44512,
                                value: ["9111"]
                            },{
                                columnField: "tripId",
                                operatorValue: "isAnyOf",
                                id: 41345,
                                value: ["1327-86502-75600-2-96e917d1"]
                            },{
                                columnField: "trackingStatus",
                                operatorValue: "isAnyOf",
                                id: 37471,
                                value: ["STOPPED"]
                            },{
                                columnField: "source",
                                operatorValue: "is",
                                id: 54423,
                                value: "manual"
                            }],
                            linkOperator: 'and' },
                            pinnedColumns: { right: ['__detail_panel_toggle__'] },
                        },
                    },
                },
            },
        });

        await storeWithFilter.dispatch(filterTripInstances());
        const actualActions = storeWithFilter.getActions();
        expect(actualActions).to.eql(expectedActions);
    });

    it('gets all trips filtered by routeVariantId for the datagrid', async () => {
        const fakeGetTrips = sandbox.fake.resolves(mockTrips);
        sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_UPDATING,
                payload: {
                    isUpdating: true,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LAST_FILTER,
                payload: {
                    lastFilterRequest: {
                        routeType: 3,
                        delayRange: undefined,
                        agencyId: undefined,
                        depotIds: undefined,
                        tripStatus: undefined,
                        startTimeFrom: undefined,
                        startTimeTo: undefined,
                        serviceDate: '20230320',
                        routeVariantIds: [50101],
                        page: 1,
                        limit: 15,
                        sorting: {
                          sortBy: 'startTime',
                          order: 'asc',
                        },
                    },
                },
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES,
                payload: {
                    tripInstances: mockStoreTrips,
                    timestamp: 1679270400000,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_TOTAL_COUNT,
                payload: {
                    totalTripInstancesCount: 2,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_PERMISSIONS,
                payload: {
                    permissions: [
                        {
                            _rel: "cancel"
                        },
                        {
                            _rel: "copy"
                        },
                        {
                            _rel: "delay"
                        },
                        {
                            _rel: "view"
                        },
                        {
                            _rel: "advancer"
                        },
                        {
                            _rel: "recurrent_cancel"
                        },
                        {
                            _rel: "new"
                        }
                    ]
                },
            },
        ];

        const storeWithFilter = mockStore({
            control: {
                routes: {
                    filters: {
                        routeType: 3,
                        routeVariantId: 50101,
                    },
                    tripInstances: {
                        datagridConfig: {
                            columns: [],
                            page: 0,
                            pageSize: 15,
                            sortModel: [{
                                field: 'startTime',
                                sort: 'asc',
                            }],
                            density: 'standard',
                            routeSelection: '',
                            filterModel: { items: [], linkOperator: 'and' },
                            pinnedColumns: { right: ['__detail_panel_toggle__'] },
                        },
                    },
                },
            },
        });

        await storeWithFilter.dispatch(filterTripInstances());
        const actualActions = storeWithFilter.getActions();
        expect(actualActions).to.eql(expectedActions);
    });

    it('gets all trips filtered by routeShortName for the datagrid', async () => {
        const fakeGetTrips = sandbox.fake.resolves(mockTrips);
        sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_UPDATING,
                payload: {
                    isUpdating: true,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_LAST_FILTER,
                payload: {
                    lastFilterRequest: {
                        routeType: 3,
                        delayRange: undefined,
                        agencyId: undefined,
                        depotIds: undefined,
                        tripStatus: undefined,
                        startTimeFrom: undefined,
                        startTimeTo: undefined,
                        routeVariantIds: ['27001'],
                        serviceDate: '20230320',
                        page: 1,
                        limit: 15,
                        sorting: {
                          sortBy: 'startTime',
                          order: 'asc',
                        },
                    },
                },
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_TRIP_INSTANCES,
                payload: {
                    tripInstances: mockStoreTrips,
                    timestamp: 1679270400000,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_TOTAL_COUNT,
                payload: {
                    totalTripInstancesCount: 2,
                },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_TRIP_INSTANCES_PERMISSIONS,
                payload: {
                    permissions: [
                        {
                            _rel: "cancel"
                        },
                        {
                            _rel: "copy"
                        },
                        {
                            _rel: "delay"
                        },
                        {
                            _rel: "view"
                        },
                        {
                            _rel: "advancer"
                        },
                        {
                            _rel: "recurrent_cancel"
                        },
                        {
                            _rel: "new"
                        }
                    ]
                },
            },
        ];

        const storeWithFilter = mockStore({
            control: {
                routes: {
                    filters: {
                        routeType: 3,
                        routeShortName: 'NX1',
                    },
                    tripInstances: {
                        datagridConfig: {
                            columns: [],
                            page: 0,
                            pageSize: 15,
                            sortModel: [{
                                field: 'startTime',
                                sort: 'asc',
                            }],
                            density: 'standard',
                            routeSelection: '',
                            filterModel: { items: [], linkOperator: 'and' },
                            pinnedColumns: { right: ['__detail_panel_toggle__'] },
                        },
                    },
                    routes: {
                        all: [{
                            routeShortName: 'NX1',
                            agencyAgnostic: true,
                            routeVariants: [
                                { routeVariantId: '27001' },
                            ],
                        }],
                    },
                },
            },
        });

        await storeWithFilter.dispatch(filterTripInstances());
        const actualActions = storeWithFilter.getActions();
        expect(actualActions).to.eql(expectedActions);
    });

    it('updates active trip instance', async () => {
        const trip = {
            tripId: 'trip-id-1',
            serviceDate: '20230101',
            startTime: '10:00:00',
        };

        const expectedActions = [
            {
              type: 'update_trip_instance_action_loading',
              payload: { tripId: 'trip-id-1-20230101-10:00:00', isLoading: true }
            },
            {
              type: 'deselect-control-all-stops-by-trip',
              payload: { tripInstance: trip }
            }
        ]

        const options = { ...trip, headsign: 'new dest', stopCodes: ['9001', '9002'] };

        await store.dispatch(updateDestination(options, "successMessage", trip));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('toggle on add trip model', async () => {
        await store.dispatch(updateEnabledAddTripModal(true));
        expect(store.getActions()).to.eql(
            [
                { type: 'open-add-trip-modal', payload: { isAddTripEnabled: true } }
            ]
        );
    })

    it('toggle off add trip model', async () => {
        await store.dispatch(updateEnabledAddTripModal(false));
        expect(store.getActions()).to.eql(
            [
                { type: 'open-add-trip-modal', payload: { isAddTripEnabled: false } }
            ]
        );
    })

    it('update add trip step', async () => {
        await store.dispatch(updateCurrentStepHandler(1));
        expect(store.getActions()).to.eql(
            [
                { type: 'update-current-step', payload: { activeStep: 1 } }
            ]
        );
    })

    it('update add trip datagrid config', async () => {
        const fakeConfigData =  {
            columns: [],
            page: 0,
            pageSize: 15,
            density: 'standard',
            routeSelection: '',
            pinnedColumns: { right: ['actions'] },
        };

        await store.dispatch(updateAddTripDatagridConfig(fakeConfigData));
        expect(store.getActions()).to.eql(
            [
                { type: 'update-trip-instances-add-trip-datagrid-config', payload: fakeConfigData }
            ]
        );
    })

    it('update selected trip', async () => {
        await store.dispatch(updateSelectedAddTrip(mockTrip));
        expect(store.getActions()).to.eql(
            [
                { type: 'update-trip-instances-selected-add-trip', payload: { selectedTrip: mockTrip } }
            ]
        );
    })

    it('reset add trip step', async () => {
        await store.dispatch(resetAddTripStep());
        expect(store.getActions()).to.eql(
            [
                { type: 'update-trip-instances-reset-add-trip-step' }
            ]
        );
    })
});
