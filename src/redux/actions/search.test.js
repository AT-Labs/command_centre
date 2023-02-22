import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';

import * as search from './search';
import ACTION_TYPE from '../action-types';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import VEHICLE_TYPE from '../../types/vehicle-types';
import * as mapbox from '../../utils/transmitters/mapbox';
import * as selectorSearch from '../selectors/search';
import * as stops from '../selectors/static/stops';
import * as routes from '../selectors/static/routes';
import * as fleet from '../selectors/static/fleet';
import * as activity from './activity';
import * as blocks from '../selectors/control/blocks';
import * as routesSelector from '../selectors/control/routes/routes';
import * as routeVariantsSelector  from '../selectors/control/routes/routeVariants';
import * as alerts from '../selectors/control/alerts';
import * as stopMessaging from '../selectors/control/stopMessaging/stopMessages';
import * as stopGroups from '../selectors/control/dataManagement/stopGroups';

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
            const searchAddresses = sandbox.stub(mapbox, 'searchAddresses').resolves(fakeAddresses);

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
            const searchAddresses = sandbox.stub(mapbox, 'searchAddresses').resolves(fakeAddresses);

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

    context('formatStopDisruptionSearchResults()', () => {
        const results = []

        const expectedData = [{
            text: '123 - Fruitvale Rd Train Station',
            data: results,
            category: SEARCH_RESULT_TYPE.STOP,
            icon: SEARCH_RESULT_TYPE.STOP.icon,
        }];

        it('searchStopDisruptions() Should return an array of incidentNo', async () => {
            const incidentNos = ['DISR00701', 'DISR00702', 'DISR00703'];

            const expectedData = incidentNos.map(element => ({
                text: `${element}`,
                data: element,
                category: SEARCH_RESULT_TYPE.STOP_DISRUPTION,
                icon: '',
            }));
            expect(search.formatStopDisruptionSearchResults(incidentNos)).to.eql(expectedData);
        });
    });

    context('Search blocks', () => {
        const mockAllBlocks = [{
            operationalBlockId: '12345',
        }, {
            operationalBlockId: '23456',
        }];
        it('should search blocks by operationalBlockId', async () => {
            const searchTerm = '123';
            sandbox.stub(blocks, 'getAllBlocks').returns(mockAllBlocks);
            await store.dispatch(search.searchBlocks(searchTerm));

            expect(store.getActions()[0].payload).to.eql({
                [SEARCH_RESULT_TYPE.BLOCK.type]: [{
                    text: '12345',
                    data: {
                        operationalBlockId: '12345',
                    },
                    category: SEARCH_RESULT_TYPE.BLOCK,
                    icon: '',
                }]
            });
        });
    });

    context('Search routes', () => {
        const mockRoutes = [{
            routeShortName: 'NX1',
        }, {
            routeShortName: 'WEST',
        }];
        it('should search routes by shortName', async () => {
            const searchTerm = 'NX';
            sandbox.stub(routesSelector, 'getRoutesForSearch').returns(mockRoutes);
            await store.dispatch(search.searchControlRoutes(searchTerm));
            expect(store.getActions()[0].payload).to.eql({
                [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: [{
                    text: 'NX1',
                    data: {
                        routeShortName: 'NX1',
                    },
                    category: SEARCH_RESULT_TYPE.CONTROL_ROUTE,
                    icon: '',
                }]
            });
        });
    });

    context('Search route variants', () => {
        const mockRouteVariants = [{
            routeVariantId: '1234',
        }, {
            routeVariantId: '2345',
        }];
        it('should search routes by shortName', async () => {
            const searchTerm = '123';
            sandbox.stub(routeVariantsSelector, 'getRouteVariantsForSearch').returns(mockRouteVariants);
            await store.dispatch(search.searchControlRouteVariants(searchTerm));
            expect(store.getActions()[0].payload).to.eql({
                [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: [{
                    text: '1234',
                    data: {
                        routeVariantId: '1234',
                    },
                    category: SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT,
                    icon: '',
                }]
            });
        });
    });

    context('Search alert routes', () => {
        const mockStaticRoutes = [{
            route_short_name: 'NX1',
            route_id: 'NX1'
        }, {
            route_short_name: 'WEST',
            route_id: 'WEST'
        }, {
            route_short_name: 'EAST',
            route_id: 'EAST'
        }];
        const mockAlerts = [{
            routeShortName: 'NX1',
        }, {
            routeShortName: 'WEST',
        }, {
            routeShortName: 'NX2',
        }];
        it('should search alert routes by shortName', async () => {
            const searchTerm = 'WES';
            sandbox.stub(routes, 'getAllRoutes').returns(mockStaticRoutes);
            sandbox.stub(alerts, 'getAllAlerts').returns(mockAlerts);
            await store.dispatch(search.searchControlAlertsRoutes(searchTerm));
            expect(store.getActions()[0].payload).to.eql({
                [SEARCH_RESULT_TYPE.CONTROL_ALERTS_ROUTES.type]: [{
                    text: 'WEST',
                    data: {
                        route_id: "WEST",
                        route_short_name: 'WEST',
                    },
                    category: SEARCH_RESULT_TYPE.CONTROL_ALERTS_ROUTES,
                    icon: '',
                }]
            });
        });
    });

    context('Search stop messaging', () => {
        const mockMessages = [{
            message: 'abcd1234',
            incidentNo: 'DISR001',
        }, {
            message: '1234abcd',
            incidentNo: 'DISR002',
        }];

        it('should search stop messaging by message', async () => {
            const searchTerm = '34ab';
            sandbox.stub(stopMessaging, 'getAllStopMessages').returns(mockMessages);
            await store.dispatch(search.searchStopMessages(searchTerm));
            expect(store.getActions()[0].payload).to.eql({
                [SEARCH_RESULT_TYPE.STOP_MESSAGE.type]: [{
                    text: '1234abcd',
                    data: {
                        message: '1234abcd',
                        incidentNo: 'DISR002',
                    },
                    category: SEARCH_RESULT_TYPE.STOP_MESSAGE,
                    icon: '',
                }]
            });
        });

        it('should search disruptions from stop messaging by incidentNo', async () => {
            const searchTerm = '002';
            sandbox.stub(stopMessaging, 'getAllStopMessages').returns(mockMessages);
            await store.dispatch(search.searchStopDisruptions(searchTerm));
            expect(store.getActions()[0].payload).to.eql({
                [SEARCH_RESULT_TYPE.STOP_DISRUPTION.type]: [{
                    text: 'DISR002',
                    data: 'DISR002',
                    category: SEARCH_RESULT_TYPE.STOP_DISRUPTION,
                    icon: '',
                }]
            });
        });
    });


    context('Search stop in groups', () => {
        const mockStopInGroups = [
            {
                stops: [{
                    label: 'stop1',
                    value: 'stop1',
                }, {
                    label: 'stop2',
                    value: 'stop2',
                }],
            },
            {
                stops: [{
                    label: 'stop2',
                    value: 'stop2',
                }, {
                    label: 'stop3',
                    value: 'stop3',
                }],
            }
        ];
        it('should search stop in groups by stop label', async () => {
            const searchTerm = 'stop2';
            sandbox.stub(stopGroups, 'allStopGroupsWithTokens').returns(mockStopInGroups);
            await store.dispatch(search.searchStopInGroups(searchTerm));
            expect(store.getActions()[0].payload).to.eql({
                [SEARCH_RESULT_TYPE.STOP_IN_GROUP.type]: [{
                    text: 'stop2',
                    data: {
                        label: 'stop2',
                        tokens: [ "stop2" ],
                        value: 'stop2',
                    },
                    category: SEARCH_RESULT_TYPE.STOP_IN_GROUP,
                    icon: 'stop',
                }]
            });
        });
    });

});
