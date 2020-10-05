import React from 'react';
import moment from 'moment';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';

import VIEW_TYPE from '../../../types/view-types';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';
import { SERVICE_DATE_FORMAT } from '../../../utils/control/routes';
import { TripsView } from './TripsView';
import SortButton from '../Common/SortButton/SortButton';
import { INIT_STATE } from '../../../redux/reducers/control/routes/filters';

const tripInstances = [{
    tripId: 'test1',
    routeVariantId: 'test1',
    routeShortName: 'test1',
    routeLongName: 'test1',
    routeType: 3,
    agencyId: 'NZB',
    referenceId: 'test1',
    serviceId: 'test11',
    status: TRIP_STATUS_TYPES.notStarted,
    serviceDate: moment().format(SERVICE_DATE_FORMAT),
}, {
    tripId: 'test2',
    routeVariantId: 'test2',
    routeShortName: 'test2',
    routeLongName: 'test2',
    routeType: 3,
    agencyId: 'NZB',
    referenceId: 'test2',
    serviceId: 'test2',
    status: TRIP_STATUS_TYPES.notStarted,
    serviceDate: moment().format(SERVICE_DATE_FORMAT),
}];

let wrapper;
let sandbox;
let mergedFilter;
const componentPropsMock = {
    tripInstances,
    isLoading: false,
    isUpdating: false,
    viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS,
    filters: {},
    fetchTripInstances: () => { },
    updateActiveTripInstanceId: () => { },
    serviceDate: moment().format(SERVICE_DATE_FORMAT),
    selectSingleTrip: () => { },
    selectedTrips: [],
    notCompletedTrips: {},
    selectAllTrips: () => { },
    mergeRouteFilters: (filter) => {
        mergedFilter = filter;
    },
};

const setup = (customProps) => {
    const props = {};
    Object.assign(props, componentPropsMock, customProps);
    document.body.innerHTML = '<div id="testContainer"></div>';
    const options = {
        attachTo: document.querySelector('#testContainer'),
    };
    wrapper = mount(<TripsView { ...props } />, options);
};

describe('<TripsView />', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => {
        sandbox.restore();
        wrapper.detach();
    });

    context('Sorting', () => {
        it('Will disable sorting when it\'s not trips only view', () => {
            setup({ filters: INIT_STATE, viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS });
            const sortControlButtons = wrapper.find(SortButton);
            expect(sortControlButtons.length).to.eql(0);
        });

        it('Will enable sorting when it\'s trips only view', () => {
            setup({ filters: INIT_STATE, viewType: VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS });
            const sortControlButtons = wrapper.find(SortButton);
            expect(sortControlButtons.length).to.eql(1);
        });
    });

    context('Sort by startTime', () => {
        it('Should sort by startTime ASC by default', () => {
            setup({ filters: INIT_STATE });
            const sortControlButtons = wrapper.find(SortButton);
            expect(sortControlButtons.parents().at(0).text()).to.contain('start');
            expect(sortControlButtons.find('button').find('div').at(0).html()).to.contain('active');
        });

        it('Should update filter to startTime DESC when sort button clicked', () => {
            setup({ filters: INIT_STATE });
            const sortControlButtons = wrapper.find(SortButton).at(0).find('button');
            sortControlButtons.at(0).simulate('click');
            expect(mergedFilter.sorting.sortBy).to.equal('startTime');
            expect(mergedFilter.sorting.order).to.equal('desc');
        });
    });

    context('Sort by delay', () => {
        const getStatusColumn = () => {
            const columns = wrapper.instance().getRowColumnsConfig();
            const statusColumn = columns.find(column => column.key === 'status');
            return statusColumn;
        };

        it('Should not visible by default', () => {
            setup({ filters: INIT_STATE });
            expect(getStatusColumn().label).to.equal('status');
        });

        it('Should not visible when filter status is cancelled', () => {
            const filters = { tripStatus: TRIP_STATUS_TYPES.cancelled };
            setup({ filters });
            expect(getStatusColumn().label).to.equal('status');
        });

        it('Should visible when filter status is in-progress', () => {
            const filters = { tripStatus: TRIP_STATUS_TYPES.inProgress };
            setup({ filters });
            expect(getStatusColumn().label.toString()).to.contain('Sortable');
        });

        it('Should visible when filter status is completed', () => {
            const filters = { tripStatus: TRIP_STATUS_TYPES.completed };
            setup({ filters });
            expect(getStatusColumn().label.toString()).to.contain('Sortable');
        });

        it('Should not set active when sortBy is not delay', () => {
            const filters = {
                tripStatus: TRIP_STATUS_TYPES.inProgress,
                sorting: { sortBy: 'other field' },
            };
            setup({ filters });
            expect(wrapper.find(SortButton).find('.active').length).to.equal(0);
        });

        it('Should set active when sortBy is delay and set order', () => {
            const filters = {
                tripStatus: TRIP_STATUS_TYPES.inProgress,
                sorting: { sortBy: 'delay', order: 'asc' },
            };
            setup({ filters });
            const sortControlButtons = wrapper.find(SortButton).at(1).find('button').find('div');
            expect(sortControlButtons.at(0).html()).to.contain('active');
            expect(sortControlButtons.at(1).html()).not.to.contain('active');
        });

        it('Should update filter when sort button clicked', () => {
            const filters = { tripStatus: TRIP_STATUS_TYPES.inProgress };
            setup({ filters });
            const sortControlButtons = wrapper.find(SortButton).at(1).find('button');
            sortControlButtons.at(0).simulate('click');
            expect(mergedFilter.sorting.sortBy).to.equal('delay');
            expect(mergedFilter.sorting.order).to.equal('asc');
        });
    });
});
