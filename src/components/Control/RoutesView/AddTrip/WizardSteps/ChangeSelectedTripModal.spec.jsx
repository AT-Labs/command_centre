import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Button } from 'reactstrap';

import ChangeSelectedTripModal from './ChangeSelectedTripModal';

const componentPropsMock = {
    onConfirmation: () => {},
    onCancel: () => {},
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    return shallow(
        <ChangeSelectedTripModal { ...props } />,
    );
};

describe('<ChangeSelectedTripModal />', () => {
    it('should render the component without errors', () => {
        const wrapper = setup();
        expect(wrapper.exists()).to.equal(true);
    });

    it('should call onConfirmation when "Select another trip" button is clicked', () => {
        let confirmationCalled = false;
        const onConfirmation = () => {
            confirmationCalled = true;
        };
        const wrapper = setup({ onConfirmation });
        wrapper.find(Button).at(1).simulate('click');
        expect(confirmationCalled).to.equal(true);
    });

    it('should call onCancel when "Cancel" button is clicked', () => {
        let cancelCalled = false;
        const onCancel = () => {
            cancelCalled = true;
        };
        const wrapper = setup({ onCancel });
        wrapper.find(Button).at(0).simulate('click');
        expect(cancelCalled).to.equal(true);
    });
});
