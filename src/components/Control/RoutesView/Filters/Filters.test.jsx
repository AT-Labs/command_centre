import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import ACTION_TYPE from '../../../../redux/action-types';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import Filters from './Filters';
import { INIT_STATE } from '../../../../redux/reducers/control/routes/filters';

let wrapper;
let sandbox;

const mockStore = configureMockStore([thunk]);
let store;

const setup = (customState) => {
    const state = {};
    Object.assign(state, INIT_STATE, customState);
    store = mockStore({
        'control.routes.filters': state,
        'control.agencies': { all: [{ agencyId: 'agencyId', agencyName: 'agencyName' }] },
        search: { isLoading: false, results: {} },
    });
    
    wrapper = shallow(<Filters store={store} />).childAt(0).dive();
};

describe('<Filters />', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => {
        sandbox.restore();
    });

    context('Status impact on sorting', () => {
        const expectedAction = JSON.stringify({ type: ACTION_TYPE.RESET_CONTROL_ROUTES_SORTING });
        const getActionsString = actions => actions.map(action => JSON.stringify(action));

        it('Change status will not reset sorting when not sort by delay', () => {
            setup();
            const statusFilter = wrapper.find('#control-filters-status').at(0);
            statusFilter.props().onSelection({ value: TRIP_STATUS_TYPES.inProgress });
            expect(getActionsString(store.getActions())).not.to.contains(expectedAction);
        });

        it('Will not reset sorting when sort by delay and change status between inProgress and completed', () => {
            setup({
                sorting: { sortBy: 'delay', order: 'asc' },
                tripStatus: TRIP_STATUS_TYPES.inProgress,
            });
            const statusFilter = wrapper.find('#control-filters-status').at(0);
            statusFilter.props().onSelection({ value: TRIP_STATUS_TYPES.completed });
            expect(getActionsString(store.getActions())).not.to.contains(expectedAction);
        });

        it('Will reset sorting when sort by delay and change status from inProgress to other status', () => {
            setup({
                sorting: { sortBy: 'delay', order: 'asc' },
                tripStatus: TRIP_STATUS_TYPES.inProgress,
            });
            const statusFilter = wrapper.find('#control-filters-status').at(0);
            statusFilter.props().onSelection({ value: TRIP_STATUS_TYPES.cancelled });
            expect(getActionsString(store.getActions())).to.contains(expectedAction);
        });

        it('Will reset sorting when sort by delay and change status from completed to other status', () => {
            setup({
                sorting: { sortBy: 'delay', order: 'asc' },
                tripStatus: TRIP_STATUS_TYPES.inProgress,
            });
            const statusFilter = wrapper.find('#control-filters-status').at(0);
            statusFilter.props().onSelection({ value: TRIP_STATUS_TYPES.notStarted });
            expect(getActionsString(store.getActions())).to.contains(expectedAction);
        });
    });

    context('Status change impact on Delay Range Filter', () => {
        const getFiltersString = action => JSON.stringify(action.payload.filters);

        it('Will reset delay filter when status is cleared', () => {
            setup({
                delayRange: { min: -20, max: 20 },
                tripStatus: TRIP_STATUS_TYPES.inProgress,
            });
            const statusFilter = wrapper.find('#control-filters-status').at(0);
            statusFilter.props().onSelection({ value: null });

            const action = store.getActions().find(a => a.type === ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS);

            expect(action != null).to.true;
            expect(getFiltersString(action)).to.contain('"delayRange":{}');
        });

        it('Will reset delay filter when status is set to MISSED state', () => {
            setup({
                delayRange: { min: -20, max: 20 },
                tripStatus: TRIP_STATUS_TYPES.inProgress,
            });
            const statusFilter = wrapper.find('#control-filters-status').at(0);
            statusFilter.props().onSelection({ value: TRIP_STATUS_TYPES.missed });

            const action = store.getActions().find(a => a.type === ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS);

            expect(action != null).to.true;
            expect(getFiltersString(action)).to.contain('"delayRange":{}');
        });

        it('Will reset delay filter when status is set to CANCELLED', () => {
            setup({
                delayRange: { min: -20, max: 20 },
                tripStatus: TRIP_STATUS_TYPES.inProgress,
            });
            const statusFilter = wrapper.find('#control-filters-status').at(0);
            statusFilter.props().onSelection({ value: TRIP_STATUS_TYPES.cancelled });

            const action = store.getActions().find(a => a.type === ACTION_TYPE.MERGE_CONTROL_ROUTES_FILTERS);

            expect(action != null).to.true;
            expect(getFiltersString(action)).to.contain('"delayRange":{}');
        });
    });
});
