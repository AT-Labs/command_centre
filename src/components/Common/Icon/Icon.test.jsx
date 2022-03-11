import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import Icon from './Icon';

let wrapper;
let sandbox;

const mockProps = {
    icon: 'ferry'
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<Icon { ...props } />);
};

describe('<Icon />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });
    it('Should render', () => expect(wrapper.exists()).to.equal(true));
});