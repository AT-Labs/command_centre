import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import SortButton from './SortButton';

let wrapper;
let sandbox;

const mockProps = {
    className: 'main-class',
    active: 'asc',
    onClick: () => {}
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<SortButton { ...props } />);
};

describe('<SortButton />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have the ButtonGroup with the class.', () => {
            expect(wrapper.find('ButtonGroup')).to.have.lengthOf(1);
            expect(wrapper.find('.main-class')).to.have.lengthOf(1);
        });

        it('Should have the one Button', () => {
            expect(wrapper.find('Button')).to.have.lengthOf(1);
        });

        it('Check class if active is asc', () => {
            expect(wrapper.find('div').at(0).props().className).to.equal('sort-btn__inner-btn d-flex active');
            expect(wrapper.find('div').at(1).props().className).to.equal('sort-btn__inner-btn d-flex ');
        });

        it('Check class if active is desc', () => {
            wrapper = setup({ active: 'desc' });
            expect(wrapper.find('div').at(0).props().className).to.equal('sort-btn__inner-btn d-flex ');
            expect(wrapper.find('div').at(1).props().className).to.equal('sort-btn__inner-btn d-flex active');
        });

    });

    context('Check Button Behavior.', () => {
        it('Should have the button function triggered.', () => {
            const spyOnClick = sinon.spy();
            wrapper = setup({ onClick: spyOnClick });
            wrapper.find('Button').first().simulate('click');
            expect(spyOnClick.calledOnce).to.equal(true);
        });
    });
});