import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import CustomButton from './CustomButton';

let wrapper;
let sandbox;

const mockProps = {
    className: 'button-class',
    ariaLabel: 'button',
    color: 'primary',
    size: 'sm',
    isDisabled: false,
    active: false,
    id: '',
    children: 'text',
    onClick: () => {}
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<CustomButton { ...props } />);
};

describe('<CustomButton />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have button element', () => {
            expect(wrapper.find('Button')).to.have.lengthOf(1);
        });

        it('Should have the proper classname', () => {
            expect(wrapper.find('.button-class')).to.have.lengthOf(1);
        });

        it('Button must not be disabled.', () => {
            expect(wrapper.find('Button').props().disabled).to.equal(false);
        });

        it('Button must be disabled.', () => {
            wrapper = setup({isDisabled: true});
            expect(wrapper.find('Button').props().disabled).to.equal(true);
        });

        it('Button must not be active.', () => {
            expect(wrapper.find('Button').props().active).to.equal(false);
        });

        it('Button must be active.', () => {
            wrapper = setup({ active: true });
            expect(wrapper.find('Button').props().active).to.equal(true);
        });
    });

    context('Check Click behavior', () => {
        it('onClick function must be called.', () => {
            const spyCallBack = sinon.spy()
            wrapper = setup({ onClick: spyCallBack });
            wrapper.find('Button').first().simulate('click');
            expect(spyCallBack.calledOnce).to.equal(true);
        });
    });
});