import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';

import ACTION_TYPE from '../../../action-types';
import { updateTrips } from './tripReplayView';
import { selectTrip } from './currentTrip';
import * as fleetSelectors from '../../../selectors/static/fleet';
import * as tripReplayApi from '../../../../utils/transmitters/trip-replay-api';
import * as routesSelectors from '../../../selectors/static/routes';
import * as appSettingsSelectors from '../../../selectors/appSettings';
import * as tripReplayViewSelectors from '../../../selectors/control/tripReplays/tripReplayView';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Trip replay view actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    describe('updateTrips()', () => {
        let getFleetStateStub;

        beforeEach(() => {
            getFleetStateStub = sandbox.stub(fleetSelectors, 'getFleetState');
        });

        it('Should enrich trips with depot names and dispatch fetch action', () => {
            const mockTrips = [
                { vehicleId: 'vehicle1', routeId: 'route1' },
                { vehicleId: 'vehicle2', routeId: 'route2' },
            ];
            const hasMore = true;
            const totalResults = 10;

            const mockFleetState = {
                vehicle1: {
                    agency: {
                        depot: {
                            name: 'Depot A',
                        },
                    },
                },
                vehicle2: {
                    agency: {
                        depot: {
                            name: 'Depot B',
                        },
                    },
                },
            };

            const mockState = {
                static: {
                    fleet: mockFleetState,
                },
            };

            getFleetStateStub.returns(mockFleetState);
            store = mockStore(mockState);

            store.dispatch(updateTrips(mockTrips, hasMore, totalResults));

            const expectedEnrichedTrips = [
                { vehicleId: 'vehicle1', routeId: 'route1', depotName: 'Depot A' },
                { vehicleId: 'vehicle2', routeId: 'route2', depotName: 'Depot B' },
            ];

            const expectedAction = {
                type: ACTION_TYPE.FETCH_CONTROL_TRIP_REPLAYS_TRIPS,
                payload: {
                    trips: expectedEnrichedTrips,
                    hasMore: true,
                    totalResults: 10,
                },
            };

            expect(store.getActions()).to.deep.equal([expectedAction]);
        });

        it('Should handle vehicles with fleet info but no depot', () => {
            const mockTrips = [
                { vehicleId: 'vehicle1', routeId: 'route1' },
            ];
            const hasMore = false;
            const totalResults = 1;

            const mockFleetState = {
                vehicle1: {
                    agency: {
                        agencyName: 'Test Agency',
                    },
                },
            };

            const mockState = {
                static: {
                    fleet: mockFleetState,
                },
            };

            getFleetStateStub.returns(mockFleetState);
            store = mockStore(mockState);

            store.dispatch(updateTrips(mockTrips, hasMore, totalResults));

            const expectedEnrichedTrips = [
                { vehicleId: 'vehicle1', routeId: 'route1', depotName: undefined },
            ];

            const expectedAction = {
                type: ACTION_TYPE.FETCH_CONTROL_TRIP_REPLAYS_TRIPS,
                payload: {
                    trips: expectedEnrichedTrips,
                    hasMore: false,
                    totalResults: 1,
                },
            };

            expect(store.getActions()).to.deep.equal([expectedAction]);
        });
    });

    describe('selectTrip()', () => {
        let getFleetStateStub;
        let getAllRoutesStub;
        let useTripHistoryStub;
        let tripHistoryEnabledFromDateStub;
        let getTripReplayTripsStub;
        let getTripByIdStub;

        beforeEach(() => {
            getFleetStateStub = sandbox.stub(fleetSelectors, 'getFleetState');
            getAllRoutesStub = sandbox.stub(routesSelectors, 'getAllRoutes');
            useTripHistoryStub = sandbox.stub(appSettingsSelectors, 'useTripHistory');
            tripHistoryEnabledFromDateStub = sandbox.stub(appSettingsSelectors, 'tripHistoryEnabledFromDate');
            getTripReplayTripsStub = sandbox.stub(tripReplayViewSelectors, 'getTripReplayTrips');
            getTripByIdStub = sandbox.stub(tripReplayApi, 'getTripById');
        });

        it('Should enrich trip with depot info and dispatch actions when trip history is enabled', () => {
            const mockTrip = {
                id: 'trip1',
                vehicleId: 'vehicle1',
                serviceDate: '2023-01-15',
                routeShortName: 'R1'
            };

            const mockFleetState = {
                vehicle1: {
                    agency: {
                        depot: {
                            name: 'Main Depot',
                        },
                    },
                },
            };

            const mockTripDetail = {
                id: 'trip1',
                vehicleId: 'vehicle1',
                routeShortName: 'R1',
                route: {}
            };

            const mockAllRoutes = [
                { route_short_name: 'R1', route_color: '#FF0000' }
            ];

            const mockState = {
                static: {
                    fleet: mockFleetState,
                    routes: mockAllRoutes
                }
            };

            getFleetStateStub.returns(mockFleetState);
            getAllRoutesStub.returns(mockAllRoutes);
            useTripHistoryStub.returns(true);
            tripHistoryEnabledFromDateStub.returns(null);
            getTripReplayTripsStub.returns([mockTripDetail]);

            store = mockStore(mockState);

            store.dispatch(selectTrip(mockTrip));

            const actions = store.getActions();

            const tripDetailAction = actions.find(action =>
                action.type === ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_CURRENT_TRIP_DETAIL
            );

            expect(tripDetailAction.payload.detail.depotName).to.equal('Main Depot');
            expect(tripDetailAction.payload.detail.vehicleId).to.equal('vehicle1');

            const loadingActions = actions.filter(action =>
                action.type === ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_LOADING
            );
            expect(loadingActions).to.have.length(2);
            expect(loadingActions[0].payload.isLoading).to.be.true;
            expect(loadingActions[1].payload.isLoading).to.be.false;
        });

        it('Should enrich trip detail from API and dispatch actions when trip history is disabled', (done) => {
            const mockTrip = {
                id: 'trip2',
                vehicleId: 'vehicle2',
                serviceDate: '2023-01-15',
                routeShortName: 'R2'
            };

            const mockFleetState = {
                vehicle2: {
                    agency: {
                        depot: {
                            name: 'API Depot',
                        },
                    },
                },
            };

            const mockTripDetailFromApi = {
                id: 'trip2',
                vehicleId: 'vehicle2',
                routeShortName: 'R2',
                route: {},
                fromApi: 'api data'
            };

            const mockAllRoutes = [
                { route_short_name: 'R2', route_color: '#0000FF' }
            ];

            const mockState = {
                static: {
                    fleet: mockFleetState,
                    routes: mockAllRoutes
                }
            };

            getFleetStateStub.returns(mockFleetState);
            getAllRoutesStub.returns(mockAllRoutes);
            useTripHistoryStub.returns(false);
            getTripByIdStub.resolves(mockTripDetailFromApi);

            store = mockStore(mockState);

            store.dispatch(selectTrip(mockTrip));

            setTimeout(() => {
                const actions = store.getActions();

                const tripDetailActions = actions.filter(action =>
                    action.type === ACTION_TYPE.UPDATE_CONTROL_TRIP_REPLAYS_CURRENT_TRIP_DETAIL
                );

                expect(tripDetailActions).to.have.length(2);

                expect(tripDetailActions[0].payload.detail.id).to.equal('trip2');
                expect(tripDetailActions[0].payload.detail.depotName).to.equal('API Depot');

                expect(tripDetailActions[1].payload.detail.id).to.equal('trip2');
                expect(tripDetailActions[1].payload.detail.depotName).to.equal('API Depot');
                expect(tripDetailActions[1].payload.detail.fromApi).to.equal('api data');

                done();
            }, 100);
        });
    });
});
