import React from 'react';
import _ from 'lodash-es';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { withHooks } from 'jest-react-hooks-shallow';
import Footer from './Footer';
import { SelectDisruptionEntities } from './SelectDisruptionEntities';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';

let wrapper;
let sandbox;

const defaultState = {
    affectedStops: [],
    affectedRoutes: [],
    isLoading: false,
    findRoutesByStop: {},
    findStopsByRoute: {},
    isEditMode: true,
    disruptionToEdit: null,
    searchResults: {},
    stops: {},
    stopGroups: {},
    data: { disruptionType: 'Routes' },
    onSubmitUpdate: jest.fn(),
    getRoutesByShortName: jest.fn(),
    search: jest.fn(),
    toggleDisruptionModals: jest.fn(),
    updateAffectedRoutesState: jest.fn(),
    updateAffectedStopsState: jest.fn(),
    onDataUpdate: jest.fn(),
    onStepUpdate: jest.fn(),
    deleteAffectedEntities: jest.fn(),
    updateCurrentStep: jest.fn(),
    getRoutesByStop: jest.fn(),
    getStopsByRoute: jest.fn(),
};

const stopGroups = _.keyBy([{
    id: 1,
    title: 'Stop Group 1',
    stops: [{
        stopId: '1381',
        value: 'test',
    }],
}], group => group.id);

const stops = [
    {
        stopId: '111-fd1c9e8c',
        stopName: 'Test Stop 1',
        stopCode: '111',
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: '111 - Test Stop 1',
        category: {
            type: 'stop',
            icon: 'stop',
            label: 'Stops',
        },
        icon: 'stop',
        valueKey: 'stopId',
        labelKey: 'stopCode',
        type: 'stop',
    }, {
        stopId: '222-fd1c9e8c',
        stopName: 'Test Stop 2',
        stopCode: '222',
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: '222 - Test Stop 2',
        category: {
            type: 'stop',
            icon: 'stop',
            label: 'Stops',
        },
        icon: 'stop',
        valueKey: 'stopId',
        labelKey: 'stopCode',
        type: 'stop',
    }];

const stopsFromStopGroup = [
    {
        stopId: '333-fd1c9e8c',
        stopName: 'Test Stop 3',
        stopCode: '333',
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: '333 - Test Stop 3',
        icon: 'stop',
        valueKey: 'stopId',
        labelKey: 'stopCode',
        type: 'stop',
        groupId: 1,
    }, {
        stopId: '444-fd1c9e8c',
        stopName: 'Test Stop 4',
        stopCode: '444',
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: '444 - Test Stop 4',
        icon: 'stop',
        valueKey: 'stopId',
        labelKey: 'stopCode',
        type: 'stop',
        groupId: 1,
    }];

const routes = [{
    routeId: 'INN-202',
    routeShortName: 'INN',
    routeType: 3,
    type: 'route',
}, {
    routeId: 'OUT-202',
    routeShortName: 'OUT',
    routeType: 3,
    type: 'route',
}];

function setup(customProps) {
    const props = { ...defaultState };

    Object.assign(props, customProps);

    wrapper = shallow(<SelectDisruptionEntities { ...props } />);
}

const findSelectionItems = () => wrapper.find('.selection-container .selection-item');
const findItemHeaderText = selectedItem => selectedItem.find('.selection-item .picklist__list-btn').text();
const getStopByRoute = stop => _.pick(stop, ['stopId', 'stopCode', 'stopName', 'stopLat', 'stopLon']);

describe('<SelectDisruptionEntities />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
        wrapper = null;
        jest.resetAllMocks();
    });

    describe('initial load', () => {
        it('Should render', () => {
            setup();
            expect(wrapper.exists()).toEqual(true);
        });

        it('should not display anything in the footer', () => {
            setup();
            expect(wrapper.find('footer>*').exists()).toEqual(false);
        });
    });

    describe('When entities are selected the page should render...', () => {
        it('should re-render if props are updated', () => {
            withHooks(() => {
                setup({ affectedRoutes: routes });
                expect(wrapper.find(Footer).exists()).toEqual(true);
                expect(wrapper.find(Footer).prop('nextButtonValue')).toEqual('Save');

                wrapper.setProps({ isEditMode: false });
                expect(wrapper.find(Footer).prop('nextButtonValue')).toEqual('Continue');

                wrapper.setProps({ affectedRoutes: [] });
                expect(wrapper.find(Footer).exists()).toEqual(false);
                expect(wrapper.find('footer').exists()).toEqual(true);
            });
        });

        it('should display a selected route', () => {
            withHooks(() => {
                setup({ affectedRoutes: routes });

                const selectedItems = findSelectionItems();

                expect(selectedItems.length).toEqual(2);
                expect(findItemHeaderText(selectedItems.at(0))).toContain('Route INN');
                expect(findItemHeaderText(selectedItems.at(1))).toContain('Route OUT');
            });
        });

        it('should display a selected stop', () => {
            withHooks(() => {
                setup({ affectedStops: stops });

                const selectedItems = findSelectionItems();

                expect(selectedItems.length).toEqual(2);
                expect(findItemHeaderText(selectedItems.at(0))).toContain('Stop 111 - Test Stop 1');
                expect(findItemHeaderText(selectedItems.at(1))).toContain('Stop 222 - Test Stop 2');
            });
        });

        it('should display a selected stop group', () => {
            withHooks(() => {
                setup({
                    affectedStops: stopsFromStopGroup,
                    stopGroups,
                });

                const selectedItems = findSelectionItems();
                expect(selectedItems.length).toEqual(1);
                expect(findItemHeaderText(selectedItems.at(0))).toContain('Stop Group - Stop Group 1');
            });
        });

        it('should display all stops when stop group is expanded', () => {
            withHooks(() => {
                setup({
                    affectedStops: stopsFromStopGroup,
                    stopGroups,
                });

                const selectedItems = findSelectionItems();
                selectedItems.at(0).find('ExpandableSummary>div>Button').at(0).simulate('click');

                wrapper.update();

                const groupStopEntityCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
                expect(groupStopEntityCheckbox.length).toEqual(2);
                expect(groupStopEntityCheckbox.at(0).prop('label')).toEqual('Stop 333 - Test Stop 3');
                expect(groupStopEntityCheckbox.at(1).prop('label')).toEqual('Stop 444 - Test Stop 4');
            });
        });

        it('should display or hide routes when stop is toggled', () => {
            withHooks(() => {
                setup({
                    affectedStops: stops,
                    findRoutesByStop: { [stops[0].stopCode]: [routes[0]] },
                });

                findSelectionItems().at(0).find('ExpandableSummary>div>Button').at(0)
                    .simulate('click');
                wrapper.update();

                let routesCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
                expect(routesCheckbox.length).toEqual(1);
                expect(routesCheckbox.at(0).prop('label')).toEqual('Route INN');

                findSelectionItems().at(0).find('ExpandableSummary>div>Button').at(0)
                    .simulate('click');
                wrapper.update();

                routesCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
                expect(routesCheckbox.length).toEqual(0);
            });
        });

        it('should display Select All when stop is expanded and there are more than 1 routes', () => {
            withHooks(() => {
                setup({
                    affectedStops: stops,
                    findRoutesByStop: {
                        [stops[0].stopCode]: [
                            { routeId: 'route-1', routeShortName: 'route-1', routeType: 3 },
                            { routeId: 'route-2', routeShortName: 'route-2', routeType: 3 },
                        ],
                    },
                });

                const selectedItems = findSelectionItems();
                selectedItems.at(0).find('ExpandableSummary>div>Button').at(0).simulate('click');
                wrapper.update();

                const routesCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
                expect(routesCheckbox.length).toEqual(3);
                expect(routesCheckbox.at(0).prop('label')).toEqual('Select All');
            });
        });

        it('should display Loader if it is loading routes by stop', async () => {
            withHooks(() => {
                setup({
                    affectedStops: stops,
                    findRoutesByStop: {},
                });
                const selectedItems = findSelectionItems();
                selectedItems.at(0).find('ExpandableSummary>div>Button').at(0).simulate('click');
                wrapper.update();

                const loader = findSelectionItems().at(0).find('.loader-disruptions-list');
                expect(loader.length).toEqual(1);
            });
        });

        it.each([
            ['Direction: Inbound/Anticlockwise', 0, '111 - Test Stop 1'],
            ['Direction: Outbound/Clockwise', 1, '222 - Test Stop 2'],
        ])('should display or hide stops when route and %s is toggled', (directionText, directionIndex, stopText) => {
            withHooks(() => {
                setup({
                    affectedRoutes: routes,
                    findStopsByRoute: {
                        [routes[0].routeId]: [
                            { ...stops[0], directionId: 0 },
                            { ...stops[1], directionId: 1 },
                        ],
                    },
                });

                findSelectionItems().at(0).find('ExpandableSummary>div>Button').at(0)
                    .simulate('click');
                wrapper.update();
                const selectedDirection = findSelectionItems().at(0).find('ExpandableContent>ul>Expandable>ExpandableSummary').at(directionIndex);
                expect(selectedDirection.find('div.picklist__list-btn').text()).toContain(directionText);
                selectedDirection.find('div>Button').simulate('click');
                wrapper.update();

                let routesCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
                expect(routesCheckbox.length).toEqual(1);
                expect(routesCheckbox.at(0).prop('label')).toEqual(stopText);

                selectedDirection.find('div>Button').simulate('click');
                wrapper.update();
                findSelectionItems().at(0).find('ExpandableSummary>div>Button').at(0)
                    .simulate('click');
                wrapper.update();

                routesCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
                expect(routesCheckbox.length).toEqual(0);
            });
        });

        it('should display Select All when route and direction is expanded and there are more than 1 stops', () => {
            withHooks(() => {
                setup({
                    affectedRoutes: routes,
                    findStopsByRoute: {
                        [routes[0].routeId]: [
                            { ...stops[0], directionId: 0 },
                            { ...stops[1], directionId: 0 },
                        ],
                    },
                });

                const selectedItems = findSelectionItems();
                selectedItems.at(0).find('ExpandableSummary>div>Button').at(0).simulate('click');
                wrapper.update();
                const selectedDirection = findSelectionItems().at(0).find('ExpandableContent>ul>Expandable>ExpandableSummary').at(0);
                selectedDirection.find('div>Button').simulate('click');
                wrapper.update();

                const stopsCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
                expect(stopsCheckbox.length).toEqual(3);
                expect(stopsCheckbox.at(0).prop('label')).toEqual('Select All');
            });
        });

        it('should display Loader if it is loading stops by route', async () => {
            withHooks(() => {
                setup({
                    affectedRoutes: routes,
                    findStopsByRoute: {},
                });
                const selectedItems = findSelectionItems();
                selectedItems.at(0).find('ExpandableSummary>div>Button').at(0).simulate('click');
                wrapper.update();

                const loader = findSelectionItems().at(0).find('.loader-disruptions-list');
                expect(loader.length).toEqual(1);
            });
        });
    });

    describe('After page rendered', () => {
        describe('Remove "X" is clicked', () => {
            const cases = [
                {
                    caseDescription: 'useWorkarounds off: should fire remove stop group from list when Remove is clicked',
                    useWorkarounds: false,
                    entityType: SEARCH_RESULT_TYPE.STOP_GROUP,
                    props: {
                        affectedStops: stops,
                        findRoutesByStop: { [stops[0].stopCode]: routes },
                    },
                    expectedResult: [stops[1]],
                },
                {
                    caseDescription: 'useWorkarounds off: should fire remove stop from list when Remove is clicked',
                    useWorkarounds: false,
                    entityType: SEARCH_RESULT_TYPE.STOP,
                    props: {
                        affectedStops: stopsFromStopGroup,
                        stopGroups,
                    },
                    expectedResult: [],
                },
                {
                    caseDescription: 'useWorkarounds off: should fire remove route from list when Remove is clicked',
                    useWorkarounds: false,
                    entityType: SEARCH_RESULT_TYPE.ROUTE,
                    props: {
                        affectedRoutes: routes,
                    },
                    expectedResult: [routes[1]],
                },
                {
                    caseDescription: 'useWorkarounds on: should should popup and then fire remove stop group from list when Remove is clicked',
                    useWorkarounds: true,
                    entityType: SEARCH_RESULT_TYPE.STOP_GROUP,
                    props: {
                        affectedStops: stops,
                        findRoutesByStop: { [stops[0].stopCode]: routes },
                    },
                    expectedResult: [stops[1]],
                },
                {
                    caseDescription: 'useWorkarounds on: should should popup and then fire remove stop from list when Remove is clicked',
                    useWorkarounds: true,
                    entityType: SEARCH_RESULT_TYPE.STOP,
                    props: {
                        affectedStops: stopsFromStopGroup,
                        stopGroups,
                    },
                    expectedResult: [],
                },
                {
                    caseDescription: 'useWorkarounds on: should should popup and then fire remove route from list when Remove is clicked',
                    useWorkarounds: true,
                    entityType: SEARCH_RESULT_TYPE.ROUTE,
                    props: {
                        affectedRoutes: routes,
                    },
                    expectedResult: [routes[1]],
                },
            ];
            it.each(cases)('$caseDescription', ({ useWorkarounds, entityType, props, expectedResult }) => {
                withHooks(() => {
                    setup({ ...props, useWorkarounds });

                    const selectedItems = findSelectionItems();
                    selectedItems.at(0).find('ExpandableSummary>div>Button').at(1).simulate('click');
                    wrapper.update();

                    if (useWorkarounds && props.workarounds && props.workarounds.length > 0) {
                        const removeEntityPopupSelector = '[title="Remove selected entity"]';
                        expect(wrapper.find(removeEntityPopupSelector).prop('isOpen')).toEqual(true);
                        wrapper.find(removeEntityPopupSelector).renderProp('onAction')();
                    }
                    const functionExpectToBeCalled = entityType === SEARCH_RESULT_TYPE.ROUTE ? defaultState.updateAffectedRoutesState : defaultState.updateAffectedStopsState;
                    expect(functionExpectToBeCalled).toHaveBeenCalledWith(expectedResult);
                });
            });
        });

        it('with useWorkarounds off: should fire reset the list when Reset is clicked', () => {
            withHooks(() => {
                setup({
                    affectedStops: stops,
                    findRoutesByStop: { [stops[0].stopCode]: routes },
                });

                wrapper.find('ResetButton').renderProp('onClick')();
                wrapper.update();

                expect(defaultState.deleteAffectedEntities).toHaveBeenCalled();
            });
        });

        it('with useWorkarounds on: should popup reset alert when Reset is clicked', () => {
            withHooks(() => {
                setup({
                    affectedStops: stops,
                    findRoutesByStop: { [stops[0].stopCode]: routes },
                    useWorkarounds: true,
                });

                wrapper.find('ResetButton').renderProp('onClick')();
                wrapper.update();

                const resetEntityPopupSelector = '[title="Reset all selected entities"]';
                expect(wrapper.find(resetEntityPopupSelector).prop('isOpen')).toEqual(true);

                wrapper.find(resetEntityPopupSelector).renderProp('onAction')();
                expect(defaultState.deleteAffectedEntities).toHaveBeenCalled();
            });
        });

        it('should trigger onSubmitUpdate when onContinue fired in edit mode', () => {
            withHooks(() => {
                setup({ affectedRoutes: routes });
                wrapper.find(Footer).renderProp('onContinue')();
                wrapper.update();

                expect(defaultState.onSubmitUpdate).toHaveBeenCalledWith();
            });
        });

        it('should trigger updateCurrentStep when onContinue fired in non-edit mode', () => {
            withHooks(() => {
                setup({ affectedRoutes: routes, isEditMode: false });
                wrapper.find(Footer).renderProp('onContinue')();
                wrapper.update();

                expect(defaultState.updateCurrentStep).toHaveBeenCalledWith(2);
            });
        });

        it('should popup alert when onContinue fired and totalEntities greater than maximum', () => {
            withHooks(() => {
                const affectedRoutes = [];
                for (let i = 0; i <= 200; i++) {
                    affectedRoutes.push({
                        routeId: `routeId${i}`,
                        routeShortName: `routeShortName${i}`,
                        routeType: 3,
                    });
                }
                setup({ affectedRoutes });
                wrapper.find(Footer).renderProp('onContinue')();
                wrapper.update();

                expect(wrapper.find('CustomModal>p').text()).toEqual('201 routes have been selected. Please reduce the selection to less than the maximum allowed of 200');
                wrapper.find('CustomModal').renderProp('onClose')();
                expect(wrapper.find('CustomModal').prop('isModalOpen')).toEqual(false);
            });
        });

        it('should popup alert when want to change type and already have selectedEntities', () => {
            withHooks(() => {
                setup({ affectedRoutes: routes });
                wrapper.find('RadioButtons').renderProp('onChange')();
                wrapper.update();

                const changeDisruptionTypePopupSelector = '[title="Change Disruption Type"]';
                expect(wrapper.find(changeDisruptionTypePopupSelector).prop('isOpen')).toEqual(true);
                wrapper.find(changeDisruptionTypePopupSelector).renderProp('onClose')();
                expect(wrapper.find(changeDisruptionTypePopupSelector)).toHaveLength(0);
            });
        });

        it('should clear selectedEntities if continue change disruption type', () => {
            withHooks(() => {
                setup({ affectedRoutes: routes });
                wrapper.find('RadioButtons').renderProp('onChange')();
                wrapper.update();

                wrapper.find('[title="Change Disruption Type"]').renderProp('onAction')();
                wrapper.update();
                expect(defaultState.onDataUpdate).toHaveBeenCalledWith('disruptionType', 'Stops');
                expect(defaultState.deleteAffectedEntities).toHaveBeenCalledWith();
            });
        });

        it('should toggle disruption type when change type', () => {
            withHooks(() => {
                setup();
                wrapper.find('RadioButtons').renderProp('onChange')();
                wrapper.update();
                expect(defaultState.onDataUpdate).toHaveBeenCalledWith('disruptionType', 'Stops');
            });
        });

        it('should update selected stop with or without route when stop is expanded and check/uncheck single route', () => {
            withHooks(() => {
                setup({
                    affectedStops: stops,
                    findRoutesByStop: { [stops[0].stopCode]: [routes[0]] },
                });

                findSelectionItems().at(0).find('ExpandableSummary>div>Button').at(0)
                    .simulate('click');
                wrapper.update();

                let routeCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
                routeCheckbox.renderProp('onChange')({ target: { checked: true } });
                wrapper.update();
                expect(defaultState.updateAffectedStopsState).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining(routes[0])]));

                routeCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
                routeCheckbox.renderProp('onChange')({ target: { checked: false } });
                wrapper.update();
                expect(defaultState.updateAffectedStopsState).toHaveBeenLastCalledWith(expect.not.arrayContaining([expect.objectContaining(routes[0])]));
            });
        });

        it('should update selected stop list with all routes when stop is expanded and check/uncheck Select All', () => {
            withHooks(() => {
                const testRoute1 = { routeId: 'route-1', routeShortName: 'route-1', routeType: 3 };
                const testRoute2 = { routeId: 'route-2', routeShortName: 'route-2', routeType: 3 };
                setup({
                    affectedStops: stops,
                    findRoutesByStop: { [stops[0].stopCode]: [testRoute1, testRoute2] },
                });

                findSelectionItems().at(0).find('ExpandableSummary>div>Button').at(0)
                    .simulate('click');
                wrapper.update();

                let routeCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox').at(0);
                routeCheckbox.renderProp('onChange')({ target: { checked: true } });
                wrapper.update();
                expect(defaultState.updateAffectedStopsState).toHaveBeenLastCalledWith(expect.arrayContaining([
                    expect.objectContaining(testRoute1),
                    expect.objectContaining(testRoute2),
                ]));

                routeCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox').at(0);
                routeCheckbox.renderProp('onChange')({ target: { checked: false } });
                wrapper.update();
                expect(defaultState.updateAffectedStopsState).toHaveBeenLastCalledWith(expect.not.arrayContaining([
                    expect.objectContaining(testRoute1),
                    expect.objectContaining(testRoute2),
                ]));
            });
        });

        it.each([
            [
                routes,
                1,
                true,
                [
                    { ...getStopByRoute(stops[0]), directionId: 0, ...routes[0] },
                    routes[1],
                ],
            ],
            [
                [{ ...getStopByRoute(stops[0]), directionId: 0, ...routes[0] }, routes[1]],
                1,
                false,
                routes,
            ],
            [
                [{ ...getStopByRoute(stops[0]), directionId: 0, ...routes[0] }, routes[1]],
                2,
                true,
                [
                    { ...getStopByRoute(stops[0]), directionId: 0, ...routes[0] },
                    { ...getStopByRoute(stops[1]), directionId: 0, ...routes[0] },
                    routes[1],
                ],
            ],
            [
                [
                    { ...getStopByRoute(stops[0]), directionId: 0, ...routes[0] },
                    { ...getStopByRoute(stops[1]), directionId: 0, ...routes[0] },
                    routes[1],
                ],
                2,
                false,
                [{ ...getStopByRoute(stops[0]), directionId: 0, ...routes[0] }, routes[1]],
            ],
            [
                routes,
                0,
                true,
                [
                    { ...getStopByRoute(stops[0]), directionId: 0, ...routes[0] },
                    { ...getStopByRoute(stops[1]), directionId: 0, ...routes[0] },
                    routes[1],
                ],
            ],
            [
                [
                    { ...getStopByRoute(stops[0]), directionId: 0, ...routes[0] },
                    { ...getStopByRoute(stops[1]), directionId: 0, ...routes[0] },
                    routes[1],
                ],
                0,
                false,
                routes,
            ],
        ])('should update selected route with/without stop '
        + 'when route and direction is expanded and a stop is checked/unchecked', (affectedRoutes, checkedStopIndex, checked, expectedAffectedRoutes) => {
            withHooks(() => {
                const stopsByRoute = stops.map(stop => getStopByRoute(stop));
                setup({
                    affectedRoutes,
                    findStopsByRoute: {
                        [routes[0].routeId]: [
                            { ...stopsByRoute[0], directionId: 0 },
                            { ...stopsByRoute[1], directionId: 0 },
                        ],
                    },
                });

                findSelectionItems().at(0).find('ExpandableSummary>div>Button').at(0)
                    .simulate('click');
                wrapper.update();
                const selectedDirection = findSelectionItems().at(0).find('ExpandableContent>ul>Expandable>ExpandableSummary').at(0);
                selectedDirection.find('div>Button').simulate('click');
                wrapper.update();

                const stopCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox').at(checkedStopIndex);
                stopCheckbox.renderProp('onChange')({ target: { checked } });
                wrapper.update();
                expect(defaultState.updateAffectedRoutesState).toHaveBeenLastCalledWith(
                    expect.arrayContaining(expectedAffectedRoutes),
                );
            });
        });
    });
});
