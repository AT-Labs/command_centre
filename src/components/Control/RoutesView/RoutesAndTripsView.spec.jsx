import { shallow } from 'enzyme';
import { withHooks } from 'jest-react-hooks-shallow';
import React from 'react';
import VIEW_TYPE from '../../../types/view-types';
import { RoutesAndTripsView } from './RoutesAndTripsView';
import TableTitle from '../Common/ControlTable/TableTitle';
import Filters from './Filters/Filters';
import { PageInfo, Pagination } from '../../Common/Pagination/Pagination';
import GroupByRouteView from './GroupByRouteView';
import GroupByRouteVariantView from './GroupByRouteVariantView';
import TripsDataGrid from './TripsDataGrid';
import SelectionToolsFooter from './bulkSelection/TripsSelectionFooter';

const componentPropsMock = {
    viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS,
    isRoutesLoading: false,
    routesTotal: 0,
    isRouteVariantsLoading: false,
    routeVariantsTotal: 0,
    selectedTrips: [],
    filterTripInstances: jest.fn(),
    fetchRoutes: jest.fn(),
    retrieveAgencies: jest.fn(),
    serivceDate: '2023-01-01',
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    return shallow(<RoutesAndTripsView { ...props } />);
};

describe('<RoutesAndTripsView />', () => {
    test('should render and display TableTitle, Filters', () => {
        withHooks(() => {
            const wrapper = setup();
            expect(wrapper).toMatchSnapshot();
            expect(wrapper.find(TableTitle).length).toEqual(1);
            expect(wrapper.find(Filters).length).toEqual(1);
        });
    });

    test('should display GroupByRouteView when viewType is ROUTES_TRIPS', () => {
        const wrapper = setup({
            viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS,
        });
        expect(wrapper.find(GroupByRouteView).length).toEqual(1);
        expect(wrapper.find(GroupByRouteVariantView).length).toEqual(0);
        expect(wrapper.find(TripsDataGrid).length).toEqual(0);
        expect(wrapper.find(PageInfo).length).toEqual(1);
        expect(wrapper.find(Pagination).length).toEqual(1);
    });

    test('should display GroupByRouteVariantView when viewType is ROUTE_VARIANTS_TRIPS', () => {
        const wrapper = setup({
            viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTE_VARIANTS_TRIPS,
        });
        expect(wrapper.find(GroupByRouteView).length).toEqual(0);
        expect(wrapper.find(GroupByRouteVariantView).length).toEqual(1);
        expect(wrapper.find(TripsDataGrid).length).toEqual(0);
        expect(wrapper.find(PageInfo).length).toEqual(1);
        expect(wrapper.find(Pagination).length).toEqual(1);
    });

    test('should display TripsDataGrid when viewType is TRIPS', () => {
        const wrapper = setup({
            viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS,
        });
        expect(wrapper.find(GroupByRouteView).length).toEqual(0);
        expect(wrapper.find(GroupByRouteVariantView).length).toEqual(0);
        expect(wrapper.find(TripsDataGrid).length).toEqual(1);
        expect(wrapper.find(PageInfo).length).toEqual(0);
        expect(wrapper.find(Pagination).length).toEqual(0);
    });

    test('should display SelectionToolsFooter when selectedTrips is not empty', () => {
        const wrapper = setup({
            selectedTrips: [1],
        });
        expect(wrapper.find(SelectionToolsFooter).length).toEqual(1);
    });

    test('should fetch essential resources after rendered', () => {
        withHooks(() => {
            expect(componentPropsMock.filterTripInstances).toHaveBeenCalled();
            expect(componentPropsMock.fetchRoutes).toHaveBeenCalled();
            expect(componentPropsMock.retrieveAgencies).toHaveBeenCalled();
        });
    });

    test('should reset currentPage when any change serviceDate or filters', () => {
        withHooks(() => {
            const wrapper = setup({ viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS });
            wrapper.find(Pagination).invoke('onPageClick')(2);
            expect(wrapper.find(PageInfo).prop('currentPage')).toEqual(2);
            wrapper.setProps({ filters: { agencyId: '1' } });
            expect(wrapper.find(PageInfo).prop('currentPage')).toEqual(1);

            wrapper.find(Pagination).invoke('onPageClick')(2);
            expect(wrapper.find(PageInfo).prop('currentPage')).toEqual(2);
            wrapper.setProps({ serviceDate: '2023-01-02' });
            expect(wrapper.find(PageInfo).prop('currentPage')).toEqual(1);
        });
    });
});
