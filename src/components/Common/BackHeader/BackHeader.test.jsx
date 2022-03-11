import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import BackHeader from './BackHeader';

let wrapper;
let sandbox;

const mockProps = {
    text: 'default text',
    classProps: {
        container: 'container-class',
        button: 'button-class',
        icon: 'icon-class',
        title: 'title-class',
    },
    onClick: () => {},
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<BackHeader { ...props } />);
};

describe('<BackHeader />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));
    context('Check View', () => {
        it('Should have a different class', () => {
            expect(wrapper.find('.container-class')).to.have.lengthOf(1);
            expect(wrapper.find('.button-class')).to.have.lengthOf(1);
            expect(wrapper.find('.icon-class')).to.have.lengthOf(1);
            expect(wrapper.find('.title-class')).to.have.lengthOf(1);
        });

        it('Should content default text', () => {
            expect(wrapper.text()).to.equal('<Icon />default text');
        });

        it('Should have the Icon render.', () => {
            expect(wrapper.find('Icon')).to.have.lengthOf(1);
        });

        it('Should have a Button element.', () => {
            expect(wrapper.find('button')).to.have.lengthOf(1);
        });

        it('Check if button has been clicked', () => {
            const spyCallBack = sinon.spy()
            wrapper = setup({ onClick: spyCallBack })
            wrapper.find('button').first().simulate('click');
            expect(spyCallBack.calledOnce).to.equal(true);
        });
    });
});