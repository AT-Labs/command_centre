import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import CustomButtonGroup from './CustomButtonGroup';

let wrapper;
let sandbox;

const mockProps = {
    buttons: ['one', 'two', 'three'],
    onSelection: () => {},
    selectedOptions: ['one'],
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<CustomButtonGroup { ...props } />);
};

describe('<CustomButtonGroup />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have 1 ButtonGroup element', () => {
            expect(wrapper.find('ButtonGroup')).to.have.lengthOf(1);
        });

        it('Should have button 3 element', () => {
            expect(wrapper.find('Button')).to.have.lengthOf(3);
        });
    });

    context('Check the behavior of onSelection function', () => {
        it('onSelection clicked.', () => {
            const spyOnSelection = sinon.spy()
            wrapper = setup({ onSelection: spyOnSelection });
            wrapper.find('Button').first().simulate('click');
            expect(spyOnSelection.calledOnce).to.equal(true);
        });
    });
});