import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import ExpandableContent from './ExpandableContent';

let wrapper;
let sandbox;

const mockProps = {
    expandableRegionId: '3a56baf4-c757-44fd-bd93-ecc66320c8c8',
    expandableButtonId: '0ffb89d3-47b3-48a6-a4ce-7037cc5d68e7',
    isActive: true,
    onToggle: () => {},
    extendClassName: 'main',
    children: ['one', 'two', 'three'],
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<ExpandableContent { ...props } />);
};

describe('<ExpandableContent />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have main class', () => {
            expect(wrapper.find('.main')).to.have.lengthOf(1);
        });

        it('Should the proper children render.', () => {
            expect(wrapper.find('div').text()).to.have.string(mockProps.children.join(''));
        });

        it('Should not be defined', () => {
            wrapper = setup({isActive: false});
            expect(wrapper.type()).to.equal(null);
        });
    });
});