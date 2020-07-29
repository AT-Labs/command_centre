import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import ACTION_TYPE from '../../../action-types';
import * as stops from '../../../selectors/static/stops';
import * as vehicles from '../../../selectors/realtime/vehicles';
import * as route from './route';


const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Route detail actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    const routeTrips = [
        {
            trip_headsign: 'Head Sign A',
            shape_wkt: 'shape_wkt',
            trip_id: '1086147568-20180921103729_v70.37',
        },
        {
            trip_headsign: 'Head Sign B',
            shape_wkt: 'shape_wkt',
            trip_id: '1086096251-20180921103729_v70.37',
        },
    ];

    const allStopsFake = {
        1599: {
            location_type: 0,
            stop_code: '1599',
            stop_id: '1599-20180921103729_v70.37',
            stop_lat: -36.82248,
            stop_lon: 174.61089,
            stop_name: 'Westgate Stop B',
            tokens: ['westgate', 'stop', 'b', '1599'],
        },
    };
    const fakeVehicle = {
        id: '14213',
        vehicle: {
            trip: {
                tripId: '1086147568-20180921103729_v70.37',
                startTime: '11:05:00',
                startDate: '20181005',
                scheduleRelationship: 'SCHEDULED',
                routeId: '12203-20180921103729_v70.37',
            },
        },
    };
    const vehiclesVisibleFake = {
        '1086147568-20180921103729_v70.37': fakeVehicle,
    };
    const tripsFake = {
        route: {
            trips: [
                {
                    trip_id: '1086096251-20180921103729_v70.37',
                },
            ],
        },
        shape_wkt: 'shape_wkt',
        stopTimes: [
            {
                stop: {
                    stop_code: '1599',
                    stop_id: '1599-20180921103729_v70.37',
                    stop_lat: -36.76114,
                    stop_lon: 174.53473,
                    stop_name: '14 Parlane Dr',
                },
            },
        ],
        trip_id: '1086098588-20180921103729_v70.37',
    };

    it('Should display routes details actions and return visible vehicles - displayRoutesDetails()', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_ROUTE_TRIPS,
                payload: {
                    routes: [
                        {
                            routeVariantName: 'Head Sign A',
                            shape_wkt: 'shape_wkt',
                            vehicles: [fakeVehicle],
                        },
                        {
                            routeVariantName: 'Head Sign B',
                            shape_wkt: 'shape_wkt',
                            vehicles: [],
                        },
                    ],
                },
            },
        ];
        const getVisibleVehicles = sandbox.stub(vehicles, 'getVisibleVehicles').returns(vehiclesVisibleFake);

        store.dispatch(route.displayRoutesDetails(routeTrips));
        sandbox.assert.calledOnce(getVisibleVehicles);
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('Should get stops by route - getStopsByRoute()', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_VISIBLE_STOPS,
                payload: {
                    visible: [
                        {
                            location_type: 0,
                            stop_code: '1599',
                            stop_id: '1599-20180921103729_v70.37',
                            stop_lat: -36.82248,
                            stop_lon: 174.61089,
                            stop_name: 'Westgate Stop B',
                            tokens: ['westgate', 'stop', 'b', '1599'],
                        },
                    ],
                },
            },
        ];

        const fakeTrips = sandbox.fake.resolves(tripsFake);
        const getTrip = await sandbox.stub(ccStatic, 'getTripById').callsFake(fakeTrips);

        const getAllStops = sandbox.stub(stops, 'getChildStops').returns(allStopsFake);

        await store.dispatch(route.updateVisibleStopsByRoute(routeTrips));
        sandbox.assert.calledTwice(getTrip);
        sandbox.assert.calledOnce(getAllStops);
        expect(store.getActions()).to.eql(expectedActions);
    });
});
