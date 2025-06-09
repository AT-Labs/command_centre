import React from 'react';
import { mount } from 'enzyme';
import ChangeSelectedRouteVariantModal from './ChangeSelectedRouteVariantModal';

describe('<ChangeSelectedRouteVariantModal />', () => {
    let onConfirmation;
    let onCancel;
    let wrapper;

    beforeEach(() => {
        onConfirmation = jest.fn();
        onCancel = jest.fn();

        wrapper = mount(
            <ChangeSelectedRouteVariantModal
                onConfirmation={ onConfirmation }
                onCancel={ onCancel }
            />,
        );
    });

    it('renders the description and buttons', () => {
        expect(wrapper.text()).toContain('By selecting another route variant as the base shape, this diversion will be reset.');
        expect(wrapper.text()).toContain('Cancel');
        expect(wrapper.text()).toContain('Confirm');
    });

    it('calls onCancel when Cancel button is clicked', () => {
        const cancelButton = wrapper.find('button[aria-label="Cancel"]').at(0);
        cancelButton.simulate('click');
        expect(onCancel).toHaveBeenCalled();
    });

    it('calls onConfirmation when Confirm button is clicked', () => {
        const confirmButton = wrapper.find('button[aria-label="Confirm"]').at(0);
        confirmButton.simulate('click');
        expect(onConfirmation).toHaveBeenCalled();
    });
});
