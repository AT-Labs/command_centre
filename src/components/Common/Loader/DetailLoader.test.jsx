import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import DetailLoader from './DetailLoader';

let wrapper;
let sandbox;

const mockProps = {
    centered: true
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<DetailLoader { ...props } />);
};

describe('<DetailLoader />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have mx-auto class', () => {
            expect(wrapper.find('.mx-auto')).to.have.lengthOf(1);
        });

        it('Should not have mx-auto class', () => {
            wrapper = setup({ centered: false });
            expect(wrapper.find('.mx-auto')).to.have.lengthOf(0);
        });
    });
});