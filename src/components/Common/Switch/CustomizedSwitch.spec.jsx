import React from 'react';
import { shallow } from 'enzyme';
import { FormControlLabel } from '@mui/material';
import CustomizedSwitch from './CustomizedSwitch';

describe('CustomizedSwitch Component', () => {
    let wrapper;
    const mockOnChange = jest.fn();
    const props = {
        title: 'Test Switch',
        checked: true,
        onColor: '#00ff00',
        offColor: '#ff0000',
        onChange: mockOnChange,
    };

    beforeEach(() => {
        wrapper = shallow(<CustomizedSwitch { ...props } />);
    });

    it('should render without errors', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('should render the title correctly', () => {
        expect(wrapper.find(FormControlLabel).prop('label')).toBe(props.title);
    });
});
