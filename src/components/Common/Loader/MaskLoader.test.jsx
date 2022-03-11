import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';

import MaskLoader from './MaskLoader';

let wrapper;
let sandbox;

const mockProps = {
    error: ''
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return mount(<MaskLoader { ...props } />);
};

describe('<MaskLoader />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have mask-loader class container', () => {
            expect(wrapper.find('.mask-loader')).to.have.lengthOf(1);
        });
        it('Should have mask-loader__loader-container class', () => {
            expect(wrapper.find('.mask-loader__loader-container')).to.have.lengthOf(1);
        });
    });

    context('Check View With error', () => {
        const error = 'Something went wrong';
        it('Should have FaExclamationTriangle component tag', () => {
            wrapper = setup({ error });
            expect(wrapper.find('FaExclamationTriangle')).to.have.lengthOf(1);
        });

        it('Should have an error message', () => {
            wrapper = setup({ error });
            expect(wrapper.find('.mask-loader').text()).to.have.string(error);
        });
    });
});