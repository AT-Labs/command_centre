/** @jest-environment jsdom */
import React from 'react';
import { mount } from 'enzyme';
import AdditionalRouteVariantSelector from './AdditionalRouteVariantSelector';

const routeVariantsList = [
    { routeVariantId: 'rv1', routeLongName: 'Route 1', color: 'red', visible: true },
    { routeVariantId: 'rv2', routeLongName: 'Route 2', color: 'blue', visible: false },
];

const selectedRouteVariants = [
    { routeVariantId: 'rv1', routeLongName: 'Route 1', color: 'red', visible: true },
];

describe('<AdditionalRouteVariantSelector />', () => {
    let wrapper;
    let onSelectVariant;
    let onVisibilityChange;
    let onRouteVariantRemoved;

    beforeEach(() => {
        onSelectVariant = jest.fn();
        onVisibilityChange = jest.fn();
        onRouteVariantRemoved = jest.fn();

        wrapper = mount(
            <AdditionalRouteVariantSelector
                routeVariantsList={ routeVariantsList }
                selectedRouteVariants={ selectedRouteVariants }
                onSelectVariant={ onSelectVariant }
                onVisibilityChange={ onVisibilityChange }
                onRouteVariantRemoved={ onRouteVariantRemoved }
            />,
        );
    });

    it('renders the select and selected variants', () => {
        expect(wrapper.text()).toContain('Select the other route variant');
        expect(wrapper.text()).toContain('Route 1');
        expect(wrapper.text()).toContain('View');
        expect(wrapper.text()).toContain('Remove');
    });

    it('calls onVisibilityChange when the checkbox is clicked', () => {
        const checkbox = wrapper.find('input[type="checkbox"]').at(0);
        checkbox.simulate('change');
        expect(onVisibilityChange).toHaveBeenCalledWith('rv1');
    });

    it('calls onRouteVariantRemoved when Remove is clicked', () => {
        const removeButton = wrapper.find('button').at(0);
        removeButton.simulate('click');
        expect(onRouteVariantRemoved).toHaveBeenCalledWith('rv1');
    });
});
