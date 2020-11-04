import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';

import * as search from './search';
import ACTION_TYPE from '../action-types';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import VEHICLE_TYPE from '../../types/vehicle-types';
import * as publicApi from '../../utils/transmitters/public-api';
import * as selectorSearch from '../selectors/search';
import * as stops from '../selectors/static/stops';
import * as routes from '../selectors/static/routes';
import * as fleet from '../selectors/static/fleet';
import * as activity from './activity';

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

const mockFleetVehicles = {
    [SEARCH_RESULT_TYPE.BUS.type]: [{
        id: '11401',
        label: 'NB1401',
        registration: 'GEK98',
        agency: {
            agencyId: 'NB',
            agencyName: 'NEW ZEALAND BUS',
            depot: {
                name: 'ONEH',
            },
        },
        attributes: {
            loweringFloor: true,
            wheelchair: true,
        },
        capacity: {
            seating: 48,
            standing: 24,
            total: 72,
        },
        type: {
            type: 'Bus',
            subtype: 'LB-D',
            makeModel: 'MAN-17/223',
        },
        tokens: [
            'nb1401',
            'gek98',
        ],
    }],
    [SEARCH_RESULT_TYPE.FERRY.type]: [{
        id: '512000742',
        label: 'Clipper 2',
        registration: 'ZMS7101',
        agency: {
            agencyName: 'Pine Harbour',
            depot: {},
        },
        attributes: {},
        capacity: {},
        type: {
            type: 'Ferry',
        },
        tokens: [
            'clipper 2',
            '512000742',
        ],
    }],
    [SEARCH_RESULT_TYPE.TRAIN.type]: [{
        id: '59661',
        label: 'AMP        661',
        agency: {
            agencyId: 'VT',
            agencyName: 'AT Metro',
            depot: {
                name: '21',
            },
        },
        attributes: {
            loweringFloor: true,
        },
        capacity: {},
        type: {
            type: 'Train',
        },
        tokens: ['amp', '661'],
    }, {
        id: '80596',
        label: 'AMP        596',
        agency: {
            agencyId: 'VT',
            agencyName: 'AT Metro',
            depot: {
                name: '21',
            },
        },
        attributes: {
            loweringFloor: true,
        },
        capacity: {},
        type: {
            type: 'Train',
        },
        tokens: ['amp', '596'],
    }],
};

const vehiclesExpectedActions = {
    [SEARCH_RESULT_TYPE.TRAIN.type]: {
        type: ACTION_TYPE.UPDATE_VEHICLE_SEARCH_RESULTS,
        payload: {
            train: [
                {
                    text: 'AMP        661',
                    data: {
                        id: '59661',
                        label: 'AMP        661',
                        agency: {
                            agencyId: 'VT',
                            agencyName: 'AT Metro',
                            depot: {
                                name: '21',
                            },
                        },
                        attributes: {
                            loweringFloor: true,
                        },
                        capacity: {},
                        type: {
                            type: 'Train',
                        },
                        tokens: ['amp', '661'],
                    },
                    category: {
                        type: 'train',
                        icon: '',
                        label: 'Trains',
                    },
                    icon: 'train',
                },
            ],
        },
    },
    [SEARCH_RESULT_TYPE.BUS.type]: {
        type: ACTION_TYPE.UPDATE_VEHICLE_SEARCH_RESULTS,
        payload: {
            bus: [{
                text: 'NB1401 - GEK98',
                data: {
                    id: '11401',
                    label: 'NB1401',
                    registration: 'GEK98',
                    agency: {
                        agencyId: 'NB',
                        agencyName: 'NEW ZEALAND BUS',
                        depot: {
                            name: 'ONEH',
                        },
                    },
                    attributes: {
                        loweringFloor: true,
                        wheelchair: true,
                    },
                    capacity: {
                        seating: 48,
                        standing: 24,
                        total: 72,
                    },
                    type: {
                        type: 'Bus',
                        subtype: 'LB-D',
                        makeModel: 'MAN-17/223',
                    },
                    tokens: [
                        'nb1401',
                        'gek98',
                    ],
                },
                category: {
                    type: 'bus',
                    icon: '',
                    label: 'Buses',
                },
                icon: 'bus',
            }],
        },
    },
    [SEARCH_RESULT_TYPE.FERRY.type]: {
        type: ACTION_TYPE.UPDATE_VEHICLE_SEARCH_RESULTS,
        payload: {
            ferry: [{
                text: 'Clipper 2 - 512000742',
                data: {
                    id: '512000742',
                    label: 'Clipper 2',
                    registration: 'ZMS7101',
                    agency: {
                        agencyName: 'Pine Harbour',
                        depot: {},
                    },
                    attributes: {},
                    capacity: {},
                    type: {
                        type: 'Ferry',
                    },
                    tokens: [
                        'clipper 2',
                        '512000742',
                    ],
                },
                category: {
                    type: 'ferry',
                    icon: '',
                    label: 'Ferries',
                },
                icon: 'ferry',
            }],
        },
    },
};

describe('Search actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    context('updateSearchTerms()', () => {
        it('Should dispatch update search terms actions', () => {
            const expectedActions = [{
                type: ACTION_TYPE.UPDATE_SEARCH_TERMS,
                payload: {
                    searchTerms: 'Something to search',
                },
            }];

            store.dispatch(search.updateSearchTerms('Something to search'));
            expect(store.getActions()).to.eql(expectedActions);
        });

        it('Should dispatch update search terms actions', () => {
            const expectedActions = [search.updateSearchLoading(false)];

            store.dispatch(search.updateSearchLoading(false));
            expect(store.getActions()).to.eql(expectedActions);
        });
    });

    context('searchAddresses()', () => {
        const serachTerm = {
            type: ACTION_TYPE.UPDATE_SEARCH_TERMS,
            payload: {
                searchTerms: '48 Va',
            },
        };
        it('Should dispatch 4 actions', async () => {
            const addresses = [{
                address: '48 Valley Road, Mount Eden Auckland 1024',
                category: '',
                lat: -36.878854,
                lng: 174.756821,
            }];
            const expectedActions = [
                search.updateSearchLoading(true),
                serachTerm,
                search.updateSearchLoading(false),
                {
                    type: ACTION_TYPE.UPDATE_ADDRESS_SEARCH_RESULTS,
                    payload: {
                        address: [
                            {
                                text: '48 Valley Road, Mount Eden Auckland 1024',
                                data: {
                                    address: '48 Valley Road, Mount Eden Auckland 1024',
                                    category: '',
                                    lat: -36.878854,
                                    lng: 174.756821,
                                },
                                category: SEARCH_RESULT_TYPE.ADDRESS,
                                icon: SEARCH_RESULT_TYPE.ADDRESS.icon,
                            },
                        ],
                    },
                },
            ];
            const fakeAddresses = Promise.resolve(addresses);
            const searchAddresses = sandbox.stub(publicApi, 'searchAddresses').resolves(fakeAddresses);

            sandbox.stub(selectorSearch, 'getSearchTerms').returns('48 Va');

            store.dispatch(await search.searchAddresses('48 Va'));
            sandbox.assert.calledOnce(searchAddresses);

            fakeAddresses.then(() => expect(store.getActions()).to.eql(expectedActions));
        });

        it('Should dispatch error actions', async () => {
            const expectedActions = [
                search.updateSearchLoading(true),
                serachTerm,
                search.updateSearchLoading(true),
                search.updateSearchLoading(true),
                {
                    type: ACTION_TYPE.DATA_ERROR,
                    payload: {
                        error: 'error',
                    },
                },
            ];
            const fakeAddresses = Promise.resolve('response');
            const searchAddresses = sandbox.stub(publicApi, 'searchAddresses').resolves(fakeAddresses);

            const getSearchTerms = sandbox.stub(selectorSearch, 'getSearchTerms').returns('48 Va');
            const reportError = sandbox.stub(activity, 'reportError').returns(expectedActions[4]);

            store.dispatch(await search.searchAddresses('48 Va'));
            sandbox.assert.calledOnce(searchAddresses);

            fakeAddresses.catch(() => {
                sandbox.assert.calledOnce(getSearchTerms);
                sandbox.assert.calledOnce(reportError);
                expect(store.getActions()).to.eql(expectedActions);
            });
        });
    });

    context('Search Stops', () => {
        const results = {
            location_type: 0,
            stop_code: '123',
            stop_id: '0123-20180921103729_v70.37',
            stop_lat: -36.91067,
            stop_lon: 174.66707,
            stop_name: 'Fruitvale Rd Train Station',
            tokens: ['fruitvale', 'rd', 'train', 'station', '123'],
        };

        const expectedData = [{
            text: '123 - Fruitvale Rd Train Station',
            data: results,
            category: SEARCH_RESULT_TYPE.STOP,
            icon: SEARCH_RESULT_TYPE.STOP.icon,
        }];

        it('searchStops() - Should dispatch update stop search results actions', async () => {
            const expectedActions = [{
                type: ACTION_TYPE.UPDATE_STOP_SEARCH_RESULTS,
                payload: {
                    stop: expectedData,
                },
            }];

            const getAllStops = sandbox.stub(stops, 'getAllStops').returns({ 123: results });

            await store.dispatch(search.searchStops('123'));

            sandbox.assert.calledOnce(getAllStops);
            expect(store.getActions()).to.eql(expectedActions);
        });

        it('formatStopSearchResults() - Should return a formatted object', () => {
            const formatStopSearchResults = search.formatStopSearchResults([results]);
            expect(formatStopSearchResults).to.eql(expectedData);
        });
    });

    context('Search Routes', () => {
        const results = {
            agency_name: 'Ritchies Transport',
            route_id: '16101-20180921103729_v70.37',
            route_long_name: 'Brains Park to New Lynn',
            route_short_name: '161',
            route_type: 3,
            tokens: ['161'],
        };
        const expectedData = [
            {
                text: `${results.route_short_name}`,
                data: results,
                category: SEARCH_RESULT_TYPE.ROUTE,
                icon: VEHICLE_TYPE[results.route_type].type,
            },
        ];

        it('searchRoutes() - Should dispatch update routes search results actions', async () => {
            const expectedActions = [
                {
                    type: ACTION_TYPE.UPDATE_ROUTE_SEARCH_RESULTS,
                    payload: {
                        route: expectedData,
                    },
                },
            ];
            const getAllRoutes = sandbox.stub(routes, 'getAllRoutes').returns({ '16101-20180921103729_v70.37': results });

            await store.dispatch(search.searchRoutes('16'));
            sandbox.assert.calledOnce(getAllRoutes);
            expect(store.getActions()).to.eql(expectedActions);
        });

        it('formatRouteSearchResults() Should return formatted routes', () => {
            const formatRouteSearchResults = search.formatRouteSearchResults([results]);
            expect(formatRouteSearchResults).to.eql(expectedData);
        });
    });

    context('Search Vehicles', () => {
        const checkBusesResponse = async (searchTerm) => {
            const getAllFleet = sandbox.stub(fleet, 'getAllFleetBuses').returns(mockFleetVehicles[SEARCH_RESULT_TYPE.BUS.type]);
            await store.dispatch(search.searchVehicles(searchTerm, getAllFleet, SEARCH_RESULT_TYPE.BUS));

            expect(store.getActions()).to.eql([vehiclesExpectedActions.bus]);
        };

        const checkFerriesResponse = async (searchTerm) => {
            const getAllFleet = sandbox.stub(fleet, 'getAllFleetFerries').returns(mockFleetVehicles[SEARCH_RESULT_TYPE.FERRY.type]);
            await store.dispatch(search.searchVehicles(searchTerm, getAllFleet, SEARCH_RESULT_TYPE.FERRY));

            expect(store.getActions()).to.eql([vehiclesExpectedActions.ferry]);
        };

        const checkTrainsResponse = async (searchTerm) => {
            const getAllFleet = sandbox.stub(fleet, 'getAllFleetTrains').returns(mockFleetVehicles[SEARCH_RESULT_TYPE.TRAIN.type]);
            await store.dispatch(search.searchVehicles(searchTerm, getAllFleet, SEARCH_RESULT_TYPE.TRAIN));

            expect(store.getActions()).to.eql([vehiclesExpectedActions.train]);
        };

        it('should return a train and handle spaces spaces', async () => checkTrainsResponse('AMP    661'));
        it('should return a ferry if the value is a ferry id', async () => checkFerriesResponse('CLIPPER'));
        it('should return a bus if the value is a license plate', async () => checkBusesResponse('NB1401'));
        it('should not search trains by id', async () => {
            const searchTerm = '596';
            const getAllFleet = sandbox.stub(fleet, 'getAllFleetTrains').returns(mockFleetVehicles[SEARCH_RESULT_TYPE.TRAIN.type]);
            await store.dispatch(search.searchVehicles(searchTerm, getAllFleet, SEARCH_RESULT_TYPE.TRAIN));

            expect(store.getActions().payload).not.to.eql([vehiclesExpectedActions.train]);
        });
    });

    context('performTokenSearch()', () => {
        it('Should return token', async () => {
            const searchTerms = '123';
            const entries = {
                location_type: 0,
                stop_code: '123',
                stop_id: '0123-20180921103729_v70.37',
                stop_lat: -36.91067,
                stop_lon: 174.66707,
                stop_name: 'Fruitvale Rd Train Station',
                tokens: ['fruitvale', 'rd', 'train', 'station', '123'],
            };

            const response = await search.performTokenSearch(searchTerms, { 123: entries }, 'stop_code');
            expect(response).to.eql([entries]);
        });
    });
});
