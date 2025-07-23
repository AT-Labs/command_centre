import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'reactstrap';
import { IncidentsView } from './index';
import { PAGE_SIZE } from './types';
import IncidentsDataGrid from './IncidentsDataGrid';

jest.mock('./IncidentCreation/CreateIncident/index', () => () => <div />);

jest.useFakeTimers();

describe('IncidentsView', () => {
    const defaultProps = {
        filteredDisruptions: [],
        filteredIncidents: Array(25).fill({ id: 1, description: 'Test Incident' }),
        getDisruptionsAndIncidents: jest.fn(),
        isCreateAllowed: true,
        isCreateOpen: false,
        openCreateIncident: jest.fn(),
        updateEditMode: jest.fn(),
        updateAffectedRoutesState: jest.fn(),
        updateAffectedStopsState: jest.fn(),
        getStopGroups: jest.fn(),
    };

    let wrapper;
    beforeEach(() => {
        wrapper = shallow(<IncidentsView { ...defaultProps } />);
    });

    it('should call getDisruptionsAndIncidents and getStopGroups on mount', () => {
        expect(defaultProps.getDisruptionsAndIncidents).toHaveBeenCalledTimes(1);
        expect(defaultProps.getStopGroups).toHaveBeenCalledTimes(1);
    });

    it('should set a polling timer in state', () => {
        const spy = jest.spyOn(global, 'setTimeout');
        // Re-mount component to trigger constructor + componentDidMount again
        wrapper.unmount();
        wrapper = shallow(<IncidentsView { ...defaultProps } />);

        expect(spy).toHaveBeenCalled();
        expect(wrapper.state('timer')).toBeDefined();
        spy.mockRestore();
    });

    it('should clear the polling timer on unmount', () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
        const timer = wrapper.state('timer');
        wrapper.unmount();
        expect(clearTimeoutSpy).toHaveBeenCalledWith(timer);
    });

    it('should render the create incident button when isCreateAllowed is true', () => {
        expect(wrapper.find(Button).exists()).toBe(true);
    });

    it('should change page on handlePageChange', () => {
        wrapper.instance().handlePageChange(3);
        expect(wrapper.state('currentPage')).toBe(3);
    });

    it('should call incident creation methods on button click', () => {
        wrapper.find(Button).simulate('click');
        expect(defaultProps.openCreateIncident).toHaveBeenCalledWith(true);
        expect(defaultProps.updateEditMode).toHaveBeenCalled();
        expect(defaultProps.updateAffectedRoutesState).toHaveBeenCalledWith([]);
        expect(defaultProps.updateAffectedStopsState).toHaveBeenCalledWith([]);
    });

    it('should update when relevant props/state change', () => {
        const nextProps = {
            ...defaultProps,
            isCreateOpen: true,
        };
        expect(wrapper.instance().shouldComponentUpdate(nextProps, wrapper.state())).toBe(true);
    });
});
