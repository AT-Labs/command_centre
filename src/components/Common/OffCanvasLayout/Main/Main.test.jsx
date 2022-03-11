import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import Main from './Main';

let wrapper;
let sandbox;

const mockProps = {
    className: 'container',
    children: ['one', 'two', 'three'],
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<Main { ...props } />);
};

describe('<Main />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });
    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have a container class', () => {
            expect(wrapper.find('.container')).to.have.lengthOf(1);
        });
        it('Should have array in contain of the main', () => {
            expect(wrapper.find('.main').text()).to.equals(mockProps.children.join(''));
        });
    });
});