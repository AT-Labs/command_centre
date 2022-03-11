import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import IconMarker from './IconMarker';

let wrapper;
let sandbox;

const mockProps = {
    location: [],
    imageName: 'ferry',
    size: 12,
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<IconMarker { ...props } />);
};

describe('<IconMarker />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));
});