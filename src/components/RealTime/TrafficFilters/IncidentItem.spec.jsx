import React from 'react';
import { shallow } from 'enzyme';
import { Input } from 'reactstrap';

import IncidentItem from './IncidentItem';

describe('IncidentItem Component', () => {
    let wrapper;
    let mockOnChange;
    const title = 'Accidents';
    const checked = true;

    beforeEach(() => {
        mockOnChange = jest.fn();
        wrapper = shallow(<IncidentItem title={ title } onChange={ mockOnChange } checked={ checked } />);
    });

    it('should render without errors', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('should render the title correctly', () => {
        expect(wrapper.find('span').text()).toBe(title);
    });

    it('should pass the checked prop to the input', () => {
        expect(wrapper.find(Input).prop('checked')).toBe(checked);
    });

    it('should call onChange when the checkbox is clicked', () => {
        wrapper.find(Input).simulate('change');
        expect(mockOnChange).toHaveBeenCalled();
    });

    it('should apply the new-colors class when useNewColors is true', () => {
        wrapper.setProps({ useNewColors: true });
        expect(wrapper.find('.icon-container').hasClass('new-colors')).toBe(true);
    });

    it('should not apply the new-colors class when useNewColors is false', () => {
        wrapper.setProps({ useNewColors: false });
        expect(wrapper.find('.icon-container').hasClass('new-colors')).toBe(false);
    });
});
