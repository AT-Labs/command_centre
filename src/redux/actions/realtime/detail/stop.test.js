import { assert, expect } from 'chai';
import moment from 'moment';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import VIEW_TYPE from '../../../../types/view-types';
import * as ccRealtime from '../../../../utils/transmitters/cc-realtime';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import * as disruptionApi from '../../../../utils/transmitters/disruption-mgt-api';
import * as appSettings from '../../../selectors/appSettings';
import ACTION_TYPE from '../../../action-types';
import * as stopDetailActions from './stop';
import { utcDateFormatWithoutTZ } from '../../../../utils/dateUtils';
import {getDisruptionsByStop} from "./stop";

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Stop detail actions', () => {
    beforeEach(() => {
        store = mockStore({
            control: {
                blocks: {
                    allocations: {},
                },
            },
        });
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    context('getRoutesByStop()', () => {
        it('Should get routes by stop', () => {
            const currentVersion = {
                enddate: '2018-09-29T00:00:00.000Z',
                startdate: '2018-08-26T00:00:00.000Z',
                version: '20180910114240_v70.21',
                version_name: 'current',
            };
            const versionedRoutes = [
                {
                    route_id: '10601-20180910114240_v70.21',
                    shape_wkt: 'shape_wkt',
                },
                {
                    route_id: '10601-20180921103729_v70.37',
                    shape_wkt: 'shape_wkt',
                },
            ];

            const expectedActions = [
                {
                    type: ACTION_TYPE.DATA_LOADING,
                    payload: {
                        isLoading: true,
                    },
                },
                {
                    type: ACTION_TYPE.FETCH_STOP_ROUTES,
                    payload: {
                        entityKey: undefined,
                        routes: [{
                            route_id: '10601-20180910114240_v70.21',
                            shape_wkt: 'shape_wkt',
                        },
                        {
                            route_id: '10601-20180921103729_v70.37',
                            shape_wkt: 'shape_wkt',
                        }],
                    },
                },
                {
                    type: ACTION_TYPE.UPDATE_STOP_VEHICLE_PREDICATE,
                    payload: () => { },
                },
                {
                    type: ACTION_TYPE.DATA_LOADING,
                    payload: {
                        isLoading: false,
                    },
                },
            ];

            const stopCode = '1349';
            const promiseVersion = Promise.resolve(currentVersion);

            const promiseRoutes = Promise.resolve(versionedRoutes);
            const getRoutesByStop = sandbox.stub(ccStatic, 'getRoutesByStop').resolves(promiseRoutes);
            store.dispatch(stopDetailActions.getRoutesByStop(stopCode));

            promiseVersion.then(() => {
                promiseRoutes.then(() => {
                    const actions = store.getActions();
                    expect(actions.length).to.equal(expectedActions.length);
                    for (let i = 0; i < actions.length; i++) {
                        if (i !== 2) {
                            expect(actions[i]).to.eql(expectedActions[i]);
                        } else {
                            assert.isFunction(actions[2].payload.vehiclePredicate);
                        }
                    }
                    sandbox.assert.calledOnce(getRoutesByStop);
                });
            });
        });
    });

    context('fetchUpcomingVehicles()', () => {
        const withinNextHalfHourMockTime = `${moment().utc().add(10, 'minutes').format(utcDateFormatWithoutTZ)}.000Z`;
        const tenMinutesInFutureUnix = `${moment().utc().add(10, 'minutes').unix()}`;
        const upcomingMovements = [
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
                    stopName: 'Mayoral Dr On Myers Park Overbridge',
                    stopCode: '1078',
                    stopDesc: null,
                    parentStation: '11718-20190304085219_v76.27',
                    stopId: '1078-20190304085219_v76.27',
                    stopSequence: 10,
                    timeType: 'SCHEDULED',
                    scheduleRelationship: 'SCHEDULED',
                },
                vehicle: {
                    id: '14004',
                    label: 'NB4004',
                    licensePlate: 'FZG242',
                },
                trip: {
                    tripId: '14797128244-20190304085219_v76.27',
                    routeId: '79702-20190304085219_v76.27',
                    headsign: 'Sample Head Sign',
                },
            },
        ];
        const upcomingVehicles = [
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
                    stopName: 'Mayoral Dr On Myers Park Overbridge',
                    stopCode: '1078',
                    stopDesc: null,
                    parentStation: '11718-20190304085219_v76.27',
                    stopId: '1078-20190304085219_v76.27',
                    stopSequence: 10,
                    timeType: 'SCHEDULED',
                    scheduleRelationship: 'SCHEDULED',
                },
                vehicle: {
                    id: '14004',
                    label: 'NB4004',
                    licensePlate: 'FZG242',
                },
                route: undefined,
                scheduleRelationship: 'SCHEDULED',
                trip: {
                    tripId: '14797128244-20190304085219_v76.27',
                    routeId: '79702-20190304085219_v76.27',
                    headsign: 'Sample Head Sign',
                },
                scheduledTime: withinNextHalfHourMockTime,
                actualTime: withinNextHalfHourMockTime,
                allocation: undefined,
            },
        ];
        const expectedActions = [
            {
                type: ACTION_TYPE.DATA_LOADING,
                payload: { isLoading: true },
            },
            {
                type: ACTION_TYPE.FETCH_STOP_UPCOMING_VEHICLES,
                payload: { upcomingVehicles },
            },
            {
                type: ACTION_TYPE.DATA_LOADING,
                payload: { isLoading: false },
            },
        ];

        it('Should make an API call and dispatch 3 actions', async () => {
            const fakeGetUpcomingByStopId = sandbox.fake.resolves(upcomingMovements);
            const getUpcomingByStopId = sandbox.stub(ccRealtime, 'getUpcomingByStopId').callsFake(fakeGetUpcomingByStopId);

            await store.dispatch(stopDetailActions.fetchUpcomingVehicles('stopId'));
            sandbox.assert.calledOnce(getUpcomingByStopId);
            sandbox.assert.calledWith(getUpcomingByStopId, 'stopId');
            expect(store.getActions()).to.eql(expectedActions);
        });
    });

    context('fetchPastVehicles()', () => {
        const withinPastHalfHourMockTime = `${moment().utc().subtract(10, 'minutes').format(utcDateFormatWithoutTZ)}.000Z`;
        const tenMinutesInPastUnix = `${moment().utc().subtract(10, 'minutes').unix()}`;

        const pastVehicles = [
            {
                stop: {
                    stopSequence: 1,
                    departure: {
                        delay: 0,
                        time: tenMinutesInPastUnix,
                    },
                    stopId: '9001',
                    scheduleRelationship: 'SCHEDULED',
                    stopCode: '9001',
                    stopName: 'Britomart Train Station Platform 1',
                    stopDesc: null,
                    passed: true,
                },
                vehicle:
                {
                    id: '59580',
                    label: 'AMP        580',
                    licensePlate: 'AMP        580',
                },
                route: undefined,
                scheduledTime: withinPastHalfHourMockTime,
                trip: {
                    tripId: '23100144296-20180921103729_v70.37',
                    routeId: '820002-20180921103729_v70.37',
                    headsign: 'Sample Head Sign',
                },
                actualTime: withinPastHalfHourMockTime,
                allocation: undefined,
            },
        ];
        const history = [
            {
                stop: {
                    stopSequence: 1,
                    departure: {
                        delay: 0,
                        time: tenMinutesInPastUnix,
                    },
                    stopId: '9001',
                    scheduleRelationship: 'SCHEDULED',
                    stopCode: '9001',
                    stopName: 'Britomart Train Station Platform 1',
                    stopDesc: null,
                    passed: true,
                },
                vehicle: {
                    id: '59580',
                    label: 'AMP        580',
                    licensePlate: 'AMP        580',
                },
                trip: {
                    tripId: '23100144296-20180921103729_v70.37',
                    headsign: 'Sample Head Sign',
                    routeId: '820002-20180921103729_v70.37',
                },
            },
        ];
        const expectedActions = [
            {
                type: ACTION_TYPE.DATA_LOADING,
                payload: { isLoading: true },
            },
            {
                type: ACTION_TYPE.FETCH_STOP_PAST_VEHICLES,
                payload: { pastVehicles },
            },
            {
                type: ACTION_TYPE.DATA_LOADING,
                payload: { isLoading: false },
            },
        ];

        it('Should make an API call and dispatch 3 actions', async () => {
            const fakeGetHistoryByStopId = sandbox.fake.resolves(history);
            const getHistoryByStopId = sandbox.stub(ccRealtime, 'getHistoryByStopId').callsFake(fakeGetHistoryByStopId);

            await store.dispatch(stopDetailActions.fetchPastVehicles('stopId'));
            sandbox.assert.calledOnce(getHistoryByStopId);
            sandbox.assert.calledWith(getHistoryByStopId, 'stopId');
            expect(store.getActions()).to.eql(expectedActions);
        });
    });

    context('fetchPidInformation', () => {
        const departures = {
            response: {
                extensions: [
                    {
                        priority: 'normal',
                        text: 'test message',
                    },
                ],
                movements: [
                    {
                        route_short_name: '120',
                        destinationDisplay: 'britomart',
                        arrivalPlatformName: '1',
                        scheduledDepartureTime: '2020-09-08T08:22:00.000Z',
                        expectedDepartureTime: '2020-09-08T08:25:40.000Z',
                        trip_id: 'tripId',
                    },
                ],
            },
        };

        const pidInformation = [{
            route: '120',
            destinationDisplay: 'britomart',
            platform: '1',
            scheduledTime: '2020-09-08T08:22:00.000Z',
            dueTime: '2020-09-08T08:25:40.000Z',
            tripId: 'tripId',
            arrivalStatus: undefined,
            numberOfCars: 6,
            occupancyStatus: null,
        }];
        const expectedActions = [
            {
                type: ACTION_TYPE.DATA_LOADING,
                payload: { isLoading: true },
            },
            {
                type: ACTION_TYPE.FETCH_STOP_PID_MESSAGES,
                payload: { pidMessages: departures.response.extensions },
            },
            {
                type: ACTION_TYPE.FETCH_STOP_PID_INFORMATION,
                payload: { pidInformation },
            },
            {
                type: ACTION_TYPE.DATA_LOADING,
                payload: { isLoading: false },
            },
        ];

        const vehicles = {
            response: ['AMP        471', 'AMP        823'],
        };

        it('Should make an API call and dispatch 4 actions', async () => {
            const fakeGetDeparturesByStopCode = sandbox.fake.resolves(departures);
            const getDeparturesByStopCode = sandbox.stub(ccRealtime, 'getDeparturesByStopCode').callsFake(fakeGetDeparturesByStopCode);

            const fakeGetVehiclesByTripId = sandbox.fake.resolves(vehicles);
            const getVehiclesByTripId = sandbox.stub(ccRealtime, 'getVehiclesByTripId').callsFake(fakeGetVehiclesByTripId);

            await store.dispatch(stopDetailActions.fetchPidInformation('stopCode', true));
            sandbox.assert.calledOnce(getDeparturesByStopCode);
            sandbox.assert.calledWith(getDeparturesByStopCode, 'stopCode');
            sandbox.assert.calledOnce(getVehiclesByTripId);
            sandbox.assert.calledWith(getVehiclesByTripId, departures.response.movements[0].trip_id);
            expect(store.getActions()).to.eql(expectedActions);
        });
    });

    context('stopSelected()', () => {
        it('Should dispatch 6 of actions', () => {
            const stop = {
                location_type: 0,
                stop_code: '1349',
                stop_id: '1349-20180921103729_v70.37',
                stop_lat: -36.85019,
                stop_lon: 174.7506,
                stop_name: 'Opp 78 Franklin Rd',
                tokens: ['opp', '78', 'franklin', 'rd', '1349'],
                key: 'stop-1349-20180921103729_v70.37',
                searchResultType: 'stop',
            };

            store.dispatch(stopDetailActions.stopSelected(stop));

            const expectedActions = [
                {
                    type: ACTION_TYPE.CLEAR_DETAIL,
                    payload: {
                        isReplace: true,
                    },
                },
                {
                    type: ACTION_TYPE.DATA_LOADING,
                    payload: { isLoading: true },
                },
                {
                    type: ACTION_TYPE.TOGGLE_RT_SIDE_PANEL,
                },
                {
                    type: ACTION_TYPE.DISPLAY_REAL_TIME_DETAIL,
                    payload: {
                        activeRealTimeDetailView: VIEW_TYPE.REAL_TIME_DETAIL.STOP,
                    },
                },
                {
                    type: ACTION_TYPE.UPDATE_VIEW_DETAIL_KEY,
                    payload: {
                        viewDetailKey: stop.key,
                    },
                },
                {
                    type: ACTION_TYPE.UPDATE_SELECTED_STOP,
                    payload: {
                        stop,
                    },
                },
            ];

            expect(store.getActions()).to.eql(expectedActions);
        });
    });

    context('getDisruptionsByStop', () => {
        const stop = {key: 'stop-key', stop_code: '1234'};

        it('dispatches actions on successful API call', async () => {
            sandbox.stub(appSettings, 'useStopBasedDisruptionsSearch').returns(true);
            const disruptions = [{ id: 1, affectedEntities:[{stopCode: "1234", type: "stop" }] }];
            sandbox.stub(disruptionApi, 'getDisruptionsByFilters').resolves({ disruptions });

            await store.dispatch(getDisruptionsByStop(stop));

            const actions = store.getActions();
            expect(actions[0]).to.eql({ type: ACTION_TYPE.DATA_LOADING, payload: { isLoading: true } });
            expect(actions[1]).to.eql({
                type: ACTION_TYPE.FETCH_STOP_DISRUPTIONS,
                payload: { entityKey: stop.key, disruptions },
            });
            expect(actions[2]).to.eql({ type: ACTION_TYPE.DATA_LOADING, payload: { isLoading: false } });
        });

        it('dispatches error action on API failure', async () => {
            sandbox.stub(appSettings, 'useStopBasedDisruptionsSearch').returns(true);
            const error = new Error('fail');
            sandbox.stub(disruptionApi, 'getDisruptionsByFilters').rejects(error);

            await store.dispatch(getDisruptionsByStop(stop));

            const actions = store.getActions();
            expect(actions[0]).to.eql({ type: ACTION_TYPE.DATA_LOADING, payload: { isLoading: true } });
            expect(actions[1]).to.eql({
                type: 'data-error',
                payload: { error: { error: { disruptionsByStop: error } } },
            });
            expect(actions[2]).to.eql({ type: ACTION_TYPE.DATA_LOADING, payload: { isLoading: false } });
        });

        it('returns nothing if useDisruptionSearch is false', async () => {
            sandbox.stub(appSettings, 'useStopBasedDisruptionsSearch').returns(false);
            const getDisruptionsByFilters = sandbox.stub(disruptionApi, 'getDisruptionsByFilters');

            await store.dispatch(getDisruptionsByStop(stop));

            expect(getDisruptionsByFilters.notCalled).to.be.true;
            expect(store.getActions()).to.eql([]);
        });
    });

    context('stopChecked', () => {
        const stop = { key: 'stop-key', stop_code: '1234' };
        const disruptions= [{id: 1}];

        const versionedRoutes = [
            {
                route_id: '10601-20180910114240_v70.21',
                shape_wkt: 'shape_wkt',
            },
            {
                route_id: '10601-20180921103729_v70.37',
                shape_wkt: 'shape_wkt',
            },
        ];

        it('should dispatch actions to get routes and disruptions for a stop', async () => {
            sandbox.stub(appSettings, 'useStopBasedDisruptionsSearch').returns(true);
            const getRoutesByStopStub = sandbox.stub(ccStatic, 'getRoutesByStop').resolves(versionedRoutes);
            const getDisruptionsByFiltersStub = sandbox.stub(disruptionApi, 'getDisruptionsByFilters').resolves({ disruptions });

            await store.dispatch(stopDetailActions.stopChecked(stop));

            sinon.assert.calledOnce(getRoutesByStopStub);
            sinon.assert.calledWith(getRoutesByStopStub, stop.stop_code);
            sinon.assert.calledOnce(getDisruptionsByFiltersStub);
            sinon.assert.calledWith(getDisruptionsByFiltersStub, sinon.match.has('stopCode', stop.stop_code));
        });

        it('should dispatch actions to get only routes for a stop', async () => {
            sandbox.stub(appSettings, 'useStopBasedDisruptionsSearch').returns(false);
            const getRoutesByStopStub = sandbox.stub(ccStatic, 'getRoutesByStop').resolves(versionedRoutes);
            const getDisruptionsByFiltersStub = sandbox.stub(disruptionApi, 'getDisruptionsByFilters').resolves({ disruptions });

            await store.dispatch(stopDetailActions.stopChecked(stop));

            sinon.assert.calledOnce(getRoutesByStopStub);
            sinon.assert.calledWith(getRoutesByStopStub, stop.stop_code);
            sinon.assert.notCalled(getDisruptionsByFiltersStub);
        });
    });
});
