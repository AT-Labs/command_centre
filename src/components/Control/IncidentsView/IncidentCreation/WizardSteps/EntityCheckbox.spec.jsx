import { shallow } from 'enzyme';
import React from 'react';
import { EntityCheckbox } from './EntityCheckbox';

let wrapper;

const componentPropsMock = {
    id: '8c7cf0d6-cd67-4e5b-bd36-4d75b4b7008c',
    checked: true,
    onChange: () => {},
    label: 'Label',
    disabled: false,
    size: 'small',
};

const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    return shallow(<EntityCheckbox { ...props } />);
};

describe('<EntityCheckbox />', () => {
    beforeEach(() => {
        wrapper = setup({});
    });

    it('should render', () => {
        expect(wrapper.exists()).toEqual(true);
    });
});
