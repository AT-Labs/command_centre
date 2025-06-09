import React from 'react';
import { mount } from 'enzyme';
import BaseRouteVariantSelector from './BaseRouteVariantSelector';

const routeVariantsList = [
    { routeVariantId: 'rv1', routeLongName: 'Route 1', color: 'red' },
    { routeVariantId: 'rv2', routeLongName: 'Route 2', color: 'blue' },
];

describe('<BaseRouteVariantSelector />', () => {
    let wrapper;
    let onSelectVariant;
    let onVisibilityChanged;

    beforeEach(() => {
        onSelectVariant = jest.fn();
        onVisibilityChanged = jest.fn();

        wrapper = mount(
            <BaseRouteVariantSelector
                disabled={ false }
                editMode="ADD"
                routeVariantsList={ routeVariantsList }
                selectedRouteVariant={ routeVariantsList[0] }
                onSelectVariant={ onSelectVariant }
                visibility
                onVisibilityChanged={ onVisibilityChanged }
            />,
        );
    });

    it('renders the select and the view checkbox', () => {
        expect(wrapper.text()).toContain('Select the first route variant to define a diversion');
        expect(wrapper.text()).toContain('View');
    });

    it('calls onVisibilityChanged when the checkbox is clicked', () => {
        const checkbox = wrapper.find('input[type="checkbox"]').at(0);
        checkbox.simulate('change');
        expect(onVisibilityChanged).toHaveBeenCalled();
    });
});
