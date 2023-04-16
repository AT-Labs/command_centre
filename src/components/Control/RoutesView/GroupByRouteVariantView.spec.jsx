import { shallow } from 'enzyme';
import React from 'react';
import VIEW_TYPE from '../../../types/view-types';
import { GroupByRouteVariantView } from './GroupByRouteVariantView';
import ControlTable from '../Common/ControlTable/ControlTable';

const componentPropsMock = {
    routes: [],
    activeRoute: undefined,
    activeRouteVariant: undefined,
    isLoading: false,
    viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS,
    clearActiveTripInstanceId: jest.fn(),
    clearActiveRouteVariant: jest.fn(),
    updateActiveRouteVariant: jest.fn(),
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    return shallow(<GroupByRouteVariantView { ...props } />);
};

describe('<GroupByRouteVariantView />', () => {
    test('should render and display ControlTable', () => {
        const wrapper = setup();
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(ControlTable).length).toEqual(1);
    });

    test('should clear activeRoute after clicking the active route', () => {
        const routeVariantClicked = { routeVariantId: 1, routeShortName: '1', routeLongName: 'Route 1' };
        const wrapper = setup({
            routeVariants: [routeVariantClicked],
            activeRouteVariant: routeVariantClicked,
        });
        const onClickEvent = wrapper.find(ControlTable).props().rowOnClick;
        onClickEvent(routeVariantClicked);
        expect(componentPropsMock.clearActiveRouteVariant).toHaveBeenCalled();
    });

    test('should update activeRoute after clicking a different route', () => {
        const routeVariantClicked = { routeVariantId: 1, routeShortName: '1', routeLongName: 'Route 1' };
        const wrapper = setup({
            routeVariants: [routeVariantClicked],
            activeRouteVariant: undefined,
        });
        const onClickEvent = wrapper.find(ControlTable).props().rowOnClick;
        onClickEvent(routeVariantClicked);
        expect(componentPropsMock.updateActiveRouteVariant).toHaveBeenCalledWith(1);
    });
});
