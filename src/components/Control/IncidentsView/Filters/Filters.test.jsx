import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import SearchFilter from '../../Common/Filters/SearchFilter/SearchFilter';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Filters from './Filters';
import FilterByDate from './FilterByDate';
import { updateIncidentFilters } from '../../../../redux/actions/control/incidents';
import { INIT_STATE } from '../../../../redux/reducers/control/disruptions';

let wrapper;

const mockStore = configureMockStore([thunk]);
let store;

const setup = (customState) => {
    const state = {};
    Object.assign(state, INIT_STATE, customState);
    store = mockStore({
        'control.disruptions': state,
    });
 
    wrapper = shallow(<Filters store={store} />).childAt(0).dive();
    return wrapper;
};

describe('<Filters />', () => {
    beforeEach(() => { wrapper = setup(); });

    it('should render without crashing', () => {
        expect(wrapper.exists()).to.equal(true);
    });

    it('renders SearchFilter and two FilterByDate components', () => {
        expect(wrapper.find(SearchFilter)).to.have.lengthOf(1);
        expect(wrapper.find(FilterByDate)).to.have.lengthOf(2);
    });

    it('passes correct props to start date FilterByDate', () => {
        const startDateFilter = wrapper.find(FilterByDate).at(0);
        expect(startDateFilter.prop('selectedDate')).to.equal(null);
        expect(startDateFilter.prop('maxDate')).to.equal(null);
    });

    it('passes correct props to end date FilterByDate', () => {
        const endDateFilter = wrapper.find(FilterByDate).at(1);
        expect(endDateFilter.prop('selectedDate')).to.equal(null);
        expect(endDateFilter.prop('minDate')).to.equal(null);
    });

    it('dispatches updateIncidentFilters with new start date', () => {
        const startDateFilter = wrapper.find(FilterByDate).at(0);
        const fakeDate = [new Date('2025-01-01')];
        startDateFilter.prop('onChange')(fakeDate);

        const actions = store.getActions();
        expect(actions).to.deep.include(updateIncidentFilters({ selectedStartDate: fakeDate[0] }));
    });

    it('dispatches updateIncidentFilters with end date (normalized to end of day)', () => {
        const endDateFilter = wrapper.find(FilterByDate).at(1);
        const fakeDate = [new Date('2025-01-01T00:00:00Z')];
        endDateFilter.prop('onChange')(fakeDate);

        const dispatchedAction = store.getActions()[0];
        expect(dispatchedAction).to.have.property('type');
        expect(dispatchedAction).to.deep.equal(updateIncidentFilters({
            selectedEndDate: new Date(fakeDate[0].setHours(23, 59, 59, 999)),
        }));
    });

    it('dispatches reset entity on SearchFilter clear', () => {
        const searchFilter = wrapper.find(SearchFilter);
        searchFilter.prop('onClearCallBack')();

        const action = store.getActions()[0];
        expect(action).to.deep.equal(updateIncidentFilters({ selectedEntity: {} }));
    });

    it('dispatches entity change from SearchFilter selectionHandlers', () => {
        const searchFilter = wrapper.find(SearchFilter);
        const selectionHandlers = searchFilter.prop('selectionHandlers');
        selectionHandlers['route']({ text: 'Route 42' });

        const action = store.getActions()[0];
        expect(action).to.deep.equal(updateIncidentFilters({ selectedEntity: { text: 'Route 42' } }));
    });
});
