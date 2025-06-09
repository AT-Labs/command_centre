import React from 'react';
import { mount } from 'enzyme';
import AffectedStops from './AffectedStops';

describe('<AffectedStops />', () => {
    it('renders affected stops when list is not empty', () => {
        const affectedStops = [
            { stopCode: '105', stopName: 'Main St', routeShortName: 'NX1' },
            { stopCode: '106', stopName: 'Second St', routeShortName: 'NX2' },
        ];
        const wrapper = mount(<AffectedStops affectedStops={ affectedStops } />);
        expect(wrapper.text()).toContain('Stops affected');
        expect(wrapper.text()).toContain('105 - Main St (NX1)');
        expect(wrapper.text()).toContain('106 - Second St (NX2)');
        expect(wrapper.text()).not.toContain('No stops affected');
    });

    it('renders "No stops affected" when list is empty', () => {
        const wrapper = mount(<AffectedStops affectedStops={ [] } />);
        expect(wrapper.text()).toContain('Stops affected');
        expect(wrapper.text()).toContain('No stops affected');
    });
});
