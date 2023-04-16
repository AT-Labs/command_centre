import { shallow } from 'enzyme';
import React from 'react';
import VIEW_TYPE from '../../../types/view-types';
import { GroupByRouteView } from './GroupByRouteView';
import ControlTable from '../Common/ControlTable/ControlTable';
import { GroupByRouteVariantView } from './GroupByRouteVariantView';
import { TripsDataGrid } from './TripsDataGrid';

const componentPropsMock = {
    routes: [],
    activeRoute: undefined,
    isLoading: false,
    viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS,
    updateActiveRoute: jest.fn(),
    clearActiveRoute: jest.fn(),
    clearActiveTripInstanceId: jest.fn(),
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    return shallow(<GroupByRouteView { ...props } />);
};

describe('<GroupByRouteView />', () => {
    test('should render and display ControlTable', () => {
        const wrapper = setup();
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(ControlTable).length).toEqual(1);
    });

    test('should display GroupByRouteVariantView for rowBody when viewType is ROUTE_VARIANTS_TRIPS', () => {
        const wrapper = setup();
        const rowBody = wrapper.find(ControlTable).props().rowBody();
        expect(rowBody.type.WrappedComponent).toEqual(GroupByRouteVariantView);
    });

    test('should display TripsDataGrid for rowBody when viewType is ROUTES_TRIPS', () => {
        const wrapper = setup({
            viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS,
        });
        const rowBody = wrapper.find(ControlTable).props().rowBody();
        expect(rowBody.props.children.type.WrappedComponent).toEqual(TripsDataGrid);
    });

    test('should clear activeRoute after clicking the active route', () => {
        const routeClicked = { id: 1, routeShortName: '1', routeLongName: 'Route 1' };
        const wrapper = setup({
            routes: [routeClicked],
            activeRoute: routeClicked,
        });
        const onClickEvent = wrapper.find(ControlTable).props().rowOnClick;
        onClickEvent(routeClicked);
        expect(componentPropsMock.clearActiveRoute).toHaveBeenCalled();
    });

    test('should update activeRoute after clicking a different route', () => {
        const routeClicked = { id: 1, routeShortName: '1', routeLongName: 'Route 1' };
        const wrapper = setup({
            routes: [routeClicked],
            activeRoute: undefined,
        });
        const onClickEvent = wrapper.find(ControlTable).props().rowOnClick;
        onClickEvent(routeClicked);
        expect(componentPropsMock.updateActiveRoute).toHaveBeenCalledWith('1');
    });
});
