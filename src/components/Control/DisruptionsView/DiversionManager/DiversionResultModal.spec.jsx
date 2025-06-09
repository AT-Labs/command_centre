import React from 'react';
import { mount } from 'enzyme';
import DiversionResultModal, { ACTION_TYPE } from './DiversionResultModal';

describe('<DiversionResultModal />', () => {
    let onAction;

    beforeEach(() => {
        onAction = jest.fn();
    });

    it('renders result and no error, shows disruption and new diversion buttons', () => {
        const wrapper = mount(
            <DiversionResultModal
                result="Diversion #123 has been added."
                error=""
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        expect(wrapper.text()).toContain('Diversion #123 has been added.');
        expect(wrapper.text()).toContain('Go back to disruption page');
        expect(wrapper.text()).toContain('Add new diversion');
    });

    it('renders error and shows only Return button', () => {
        const wrapper = mount(
            <DiversionResultModal
                result=""
                error="Something went wrong"
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        expect(wrapper.text()).toContain('Something went wrong');
        expect(wrapper.text()).toContain('Return');
        expect(wrapper.text()).not.toContain('Go back to disruption page');
        expect(wrapper.text()).not.toContain('Add new diversion');
    });

    it('calls onAction with RETURN_TO_DISRUPTION when Go back button is clicked', () => {
        const wrapper = mount(
            <DiversionResultModal
                result="Done"
                error=""
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        const goBackBtn = wrapper.find('button[aria-label="Go back to disruption page"]').at(0);
        goBackBtn.simulate('click');
        expect(onAction).toHaveBeenCalledWith(ACTION_TYPE.RETURN_TO_DISRUPTION);
    });

    it('calls onAction with NEW_DIVERSION when Add new diversion is clicked', () => {
        const wrapper = mount(
            <DiversionResultModal
                result="Done"
                error=""
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        const addBtn = wrapper.find('button[aria-label="Add new diversion"]').at(0);
        addBtn.simulate('click');
        expect(onAction).toHaveBeenCalledWith(ACTION_TYPE.NEW_DIVERSION);
    });

    it('calls onAction with RETURN_TO_DIVERSION when Return is clicked (error case)', () => {
        const wrapper = mount(
            <DiversionResultModal
                result=""
                error="Error!"
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        const returnBtn = wrapper.find('button[aria-label="Return"]').at(0);
        returnBtn.simulate('click');
        expect(onAction).toHaveBeenCalledWith(ACTION_TYPE.RETURN_TO_DIVERSION);
    });

    it('does not show Add new diversion button if showNewDiversionButton is false', () => {
        const wrapper = mount(
            <DiversionResultModal
                result="Done"
                error=""
                showNewDiversionButton={ false }
                onAction={ onAction }
            />,
        );
        expect(wrapper.text()).not.toContain('Add new diversion');
    });
});
