import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import Footer from './Footer';

let wrapper;
let sandbox;

const mockProps = {
    children: ['one', 'two'],
    className: 'main-class',
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<Footer { ...props } />);
};

describe('<Footer />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have the main-class to the className.', () => {
            expect(wrapper.find('.main-class')).to.have.lengthOf(1);
        });
        it('Should have 1 footer element', () => {
            expect(wrapper.find('footer')).to.have.lengthOf(1);
        });

        it('Should have container-fluid', () => {
            expect(wrapper.find('.container-fluid')).to.have.lengthOf(1);
        });
        it('Should have one row', () => {
            expect(wrapper.find('.row')).to.have.lengthOf(1);
        });
    });
});