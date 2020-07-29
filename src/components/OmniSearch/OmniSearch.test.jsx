import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { OmniSearch, getFormattedSearchResults } from './OmniSearch';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';

let wrapper;
let sandbox;
const componentPropsMock = {
    searchResults: {
        [SEARCH_RESULT_TYPE.ADDRESS.type]: [],
        [SEARCH_RESULT_TYPE.ROUTE.type]: [],
        [SEARCH_RESULT_TYPE.STOP.type]: [],
        [SEARCH_RESULT_TYPE.BUS.type]: [],
        [SEARCH_RESULT_TYPE.TRAIN.type]: [],
        [SEARCH_RESULT_TYPE.FERRY.type]: [],
    },
    searchInCategory: [
        SEARCH_RESULT_TYPE.ADDRESS.type,
        SEARCH_RESULT_TYPE.ROUTE.type,
        SEARCH_RESULT_TYPE.BUS.type,
        SEARCH_RESULT_TYPE.TRAIN.type,
        SEARCH_RESULT_TYPE.FERRY.type,
        SEARCH_RESULT_TYPE.STOP.type,
    ],
    selectionHandlers: {
        address: () => {},
        stop: () => {},
        route: () => {},
        bus: () => {},
        train: () => {},
        ferry: () => {},
    },
    clearHandlers: {
        address: () => { },
        stop: () => { },
        route: () => { },
        bus: () => {},
        train: () => {},
        ferry: () => {},
    },
    isSearchLoading: true,
    updateSearchLoading: () => {},
    search: () => {},
    clearSearchResults: () => {},
};
const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    wrapper = shallow(<OmniSearch { ...props } />);
    return wrapper;
};

describe('<OmniSearch />', () => {
    beforeEach(() => { wrapper = setup(); });

    it('should render', () => expect(wrapper.exists()).to.equal(true));

    describe('Testing getFormattedSearchResults method', () => {
        beforeEach(() => { sandbox = sinon.createSandbox(); });
        afterEach(() => {
            componentPropsMock.searchResults = {
                [SEARCH_RESULT_TYPE.ADDRESS.type]: [],
                [SEARCH_RESULT_TYPE.ROUTE.type]: [],
                [SEARCH_RESULT_TYPE.STOP.type]: [],
                [SEARCH_RESULT_TYPE.BUS.type]: [],
                [SEARCH_RESULT_TYPE.TRAIN.type]: [],
                [SEARCH_RESULT_TYPE.FERRY.type]: [],
            };
            sandbox.restore();
        });

        context('When searchResults.routes is defined', () => {
            it('should return an array with route properties', () => {
                componentPropsMock.searchResults.route = 'route_content';
                const getFormattedSearchResultsExpectedResponse = [{ category: SEARCH_RESULT_TYPE.ROUTE, items: 'rout' }];
                const getFormattedSearchResultsMethod = getFormattedSearchResults(componentPropsMock.searchResults, ['route']);
                expect(getFormattedSearchResultsMethod).to.eql(getFormattedSearchResultsExpectedResponse);
            });
        });

        context('When searchResults.stops is defined', () => {
            it('should return an array with stops properties', () => {
                componentPropsMock.searchResults.stop = 'stop_content';
                const getFormattedSearchResultsExpectedResponse = [{ category: SEARCH_RESULT_TYPE.STOP, items: 'stop' }];
                const getFormattedSearchResultsMethod = getFormattedSearchResults(componentPropsMock.searchResults, ['stop']);
                expect(getFormattedSearchResultsMethod).to.eql(getFormattedSearchResultsExpectedResponse);
            });
        });

        context('When searchResults.addresses is defined', () => {
            it('should return an array with addresses properties', () => {
                componentPropsMock.searchResults.address = 'addresses_content';
                const getFormattedSearchResultsExpectedResponse = [{ category: SEARCH_RESULT_TYPE.ADDRESS, items: 'addr' }];
                const getFormattedSearchResultsMethod = getFormattedSearchResults(componentPropsMock.searchResults, ['address']);
                expect(getFormattedSearchResultsMethod).to.eql(getFormattedSearchResultsExpectedResponse);
            });
        });

        context('When searchResults.vehicles is defined', () => {
            it('should return an array with addresses properties', () => {
                componentPropsMock.searchResults.vehicle = 'vehicles_content';
                const getFormattedSearchResultsExpectedResponse = [{ category: SEARCH_RESULT_TYPE.VEHICLE, items: 'vehi' }];
                const getFormattedSearchResultsMethod = getFormattedSearchResults(componentPropsMock.searchResults, ['vehicle']);
                expect(getFormattedSearchResultsMethod).to.eql(getFormattedSearchResultsExpectedResponse);
            });
        });

        context('When searchResults is empty', () => {
            it('should return an empty array', () => {
                const getFormattedSearchResultsMethod = getFormattedSearchResults(componentPropsMock.searchResults, []);
                expect(getFormattedSearchResultsMethod).to.eql([]);
            });
        });
    });

    describe('Testing handleClear method', () => {
        beforeEach(() => { sandbox = sinon.createSandbox(); });
        afterEach(() => { sandbox.restore(); });

        context('When selectedItem is of type address', () => {
            it('should trigger two redux actions: clearSearchResults & addressSelected', () => {
                wrapper = setup({
                    clearSearchResults: sandbox.spy(),
                    clearHandlers: { address: sandbox.spy() },
                });
                const clearSearchResultsAction = wrapper.instance().props.clearSearchResults;
                const addressClearedAction = wrapper.instance().props.clearHandlers.address;
                const selectedItem = {
                    category: {
                        type: 'address',
                    },
                };

                wrapper.instance().handleClear(selectedItem);
                sandbox.assert.calledOnce(clearSearchResultsAction);
                sandbox.assert.calledOnce(addressClearedAction);
                sandbox.assert.calledWith(addressClearedAction, selectedItem);
            });
        });
    });

    describe('Testing handleSelect method', () => {
        beforeEach(() => { sandbox = sinon.createSandbox(); });
        afterEach(() => { sandbox.restore(); });

        context('When selectedItem is of type address', () => {
            it('should trigger two redux actions: updateSearchLoading & addressSelected', (done) => {
                wrapper = setup({
                    updateSearchLoading: sandbox.spy(),
                    selectionHandlers: { address: sandbox.spy() },
                });
                const updateSearchLoadingAction = wrapper.instance().props.updateSearchLoading;
                const addressSelectedAction = wrapper.instance().props.selectionHandlers.address;
                const selectedItem = {
                    text: 'Britomart Place, Auckland Central',
                    data: {
                        address: 'Britomart Place, Auckland Central\nAuckland 1010',
                        lat: -36.845219722,
                        lng: 174.770531338,
                        category: '',
                    },
                    category: {
                        type: SEARCH_RESULT_TYPE.ADDRESS.type,
                        icon: SEARCH_RESULT_TYPE.ADDRESS.icon,
                        label: SEARCH_RESULT_TYPE.ADDRESS.label,
                    },
                    icon: 'pin',
                };

                wrapper.instance().handleSelect(selectedItem);
                setTimeout(() => {
                    sandbox.assert.calledOnce(updateSearchLoadingAction);
                    sandbox.assert.calledOnce(addressSelectedAction);
                    sandbox.assert.calledWith(addressSelectedAction, selectedItem);
                    done();
                });
            });
        });

        context('When selectedItem is of type route', () => {
            it('should trigger two redux actions: updateSearchLoading & routeSelected', (done) => {
                wrapper = setup({
                    updateSearchLoading: sandbox.spy(),
                    selectionHandlers: { route: sandbox.spy() },
                });
                const updateSearchLoadingAction = wrapper.instance().props.updateSearchLoading;
                const routeSelectedAction = wrapper.instance().props.selectionHandlers.route;
                const selectedItem = {
                    text: 'NEX',
                    data: {
                        route_id: '10001-20180815114333_v70.9',
                        route_type: 3,
                        route_short_name: 'NEX',
                        route_long_name: 'Albany Station To Britomart',
                        agency_name: 'Ritchies Transport',
                        tokens: [
                            'nex',
                        ],
                    },
                    category: {
                        type: SEARCH_RESULT_TYPE.ROUTE.type,
                        icon: SEARCH_RESULT_TYPE.ROUTE.icon,
                        label: SEARCH_RESULT_TYPE.ROUTE.label,
                    },
                    icon: 'bus',
                };

                wrapper.instance().handleSelect(selectedItem);
                setTimeout(() => {
                    sandbox.assert.calledOnce(updateSearchLoadingAction);
                    sandbox.assert.calledOnce(routeSelectedAction);
                    sandbox.assert.calledWith(routeSelectedAction, selectedItem);
                    done();
                });
            });
        });

        context('When selectedItem is of type stop', () => {
            it('should trigger two redux actions: updateSearchLoading & stopSelected', (done) => {
                wrapper = setup({
                    updateSearchLoading: sandbox.spy(),
                    selectionHandlers: { stop: sandbox.spy() },
                    updateVisibleStops: sandbox.spy(),
                });
                const updateSearchLoadingAction = wrapper.instance().props.updateSearchLoading;
                const stopSelectedAction = wrapper.instance().props.selectionHandlers.stop;
                const selectedItem = {
                    text: '133 - Britomart Train Station',
                    data: {
                        stop_id: '0133-20180815114333_v70.9',
                        stop_name: 'Britomart Train Station',
                        stop_code: '133',
                        location_type: 0,
                        stop_lat: -36.84429,
                        stop_lon: 174.76848,
                        tokens: [
                            'britomart',
                            'train',
                            'station',
                            '133',
                        ],
                    },
                    category: {
                        type: SEARCH_RESULT_TYPE.STOP.type,
                        icon: SEARCH_RESULT_TYPE.STOP.icon,
                        label: SEARCH_RESULT_TYPE.STOP.label,
                    },
                    icon: 'stop',
                };

                wrapper.instance().handleSelect(selectedItem);
                setTimeout(() => {
                    sandbox.assert.calledOnce(updateSearchLoadingAction);
                    sandbox.assert.calledOnce(stopSelectedAction);
                    sandbox.assert.calledWith(stopSelectedAction, selectedItem);
                    done();
                });
            });
        });

        context('When selectedItem is one of type bus', () => {
            it('should trigger two redux actions: updateSearchLoading & vehicleSelected', (done) => {
                wrapper = setup({
                    updateSearchLoading: sandbox.spy(),
                    selectionHandlers: { bus: sandbox.spy() },
                });
                const updateSearchLoadingAction = wrapper.instance().props.updateSearchLoading;
                const vehicleSelectedAction = wrapper.instance().props.selectionHandlers.bus;
                const selectedItem = {
                    text: 'NB0305 - LFT275',
                    data: {
                        id: '10305',
                        label: 'NB0305',
                        registration: 'LFT275',
                        agency: {
                            agencyId: 'NB',
                            agencyName: 'NEW ZEALAND BUS',
                            depot: {
                                name: 'CITY',
                            },
                        },
                        attributes: {
                            loweringFloor: true,
                            wheelchair: true,
                        },
                        capacity: {
                            seating: 36,
                            standing: 19,
                            total: 55,
                        },
                        type: {
                            type: 'Bus',
                            subtype: 'LB-E',
                            makeModel: 'ADL-E200 ELEC',
                        },
                        tokens: [
                            'nb0305',
                            'lft275',
                        ],
                    },
                    category: {
                        type: 'bus',
                        icon: '',
                        label: 'Buses',
                    },
                    icon: 'bus',
                };

                wrapper.instance().handleSelect(selectedItem);
                setTimeout(() => {
                    sandbox.assert.calledOnce(updateSearchLoadingAction);
                    sandbox.assert.calledOnce(vehicleSelectedAction);
                    sandbox.assert.calledWith(vehicleSelectedAction, selectedItem);
                    done();
                });
            });
        });
    });
});
