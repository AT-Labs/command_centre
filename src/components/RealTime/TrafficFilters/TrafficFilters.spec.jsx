import React from 'react';
import { shallow } from 'enzyme';
import TrafficFilters, { Filters } from './TrafficFilters';
import { Category } from '../../../types/incidents';

// Mocking the lodash map function used in the component
jest.mock('lodash-es', () => ({
    map: jest.requireActual('lodash').map,
}));

describe('TrafficFilters Component', () => {
    let wrapper;
    const defaultProps = {
        selectedCongestionFilters: [Filters.Low],
        selectedIncidentFilters: [Category[0]],
        isExpand: true,
        isExpandHandler: jest.fn(),
        onCongestionFiltersChanged: jest.fn(),
        onIncidentFiltersChanged: jest.fn(),
    };

    beforeEach(() => {
        wrapper = shallow(<TrafficFilters { ...defaultProps } />);
    });

    it('should render without crashing', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('should render the close icon', () => {
        expect(wrapper.find('LuX').exists()).toBe(true);
    });

    it('should call isExpandHandler when close icon is clicked', () => {
        wrapper.find('LuX').simulate('click');
        expect(defaultProps.isExpandHandler).toHaveBeenCalledWith(false);
    });

    it('should toggle the incident filters switch', () => {
        const switchComponent = wrapper.find('CustomizedSwitch').at(0);
        switchComponent.simulate('change', true);
        expect(defaultProps.onIncidentFiltersChanged).toHaveBeenCalledWith(expect.arrayContaining([Category[0]]));
    });

    it('should toggle congestion filters switch', () => {
        const switchComponent = wrapper.find('CustomizedSwitch').at(1);
        switchComponent.simulate('change', true);
        expect(defaultProps.onCongestionFiltersChanged).toHaveBeenCalledTimes(1);
    });

    it('should render incident items when incident filters are selected', () => {
        expect(wrapper.find('IncidentItem').length).toBe(9);
    });

    it('should call onIncidentCheckboxChange when an incident checkbox is clicked', () => {
        const incidentItem = wrapper.find('IncidentItem').at(0);
        incidentItem.simulate('change');
        expect(defaultProps.onIncidentFiltersChanged).toHaveBeenCalledWith(expect.arrayContaining([Category[0]]));
    });

    it('should handle checkbox changes for congestion filters', () => {
        const congestionCheckbox = wrapper.find('Input').at(0);
        congestionCheckbox.simulate('change', { target: { checked: false } });
        expect(defaultProps.onCongestionFiltersChanged).toHaveBeenCalledTimes(2);
    });

    it('should expand incident categories when "Show all" is clicked', () => {
        wrapper.find('.show-all-text').simulate('click');
        expect(wrapper.find('.incident-items').hasClass('contract-incident-items')).toBe(false);
    });
});