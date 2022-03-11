import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import Loader from './Loader';

let wrapper;
let sandbox;

const mockProps = {
    ariaLabel: 'label'
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<Loader { ...props } />);
};

describe('<Loader />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have loader class', () => {
            expect(wrapper.find('.loader')).to.have.lengthOf(1);
        });
        it('Should have aria-label property', () => {
            expect(wrapper.find('.loader').props('aria-label')).to.have.property('aria-label');
        });
    });
});