import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import Expandable from './Expandable';

let wrapper;
let sandbox;

const mockProps = {
    id: '3a56baf4-c757-44fd-bd93-ecc66320c8c8',
    level: 2,
    isActive: true,
    onToggle: () => {},
    className: 'main',
    children: [<p>Text</p>],
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<Expandable { ...props } />);
};

describe('<Expandable />', () => {
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

        it('Should have expandable expandable--level-${level} class', () => {
            expect(wrapper.find(`.expandable--level-${mockProps.level}`)).to.have.lengthOf(1);
        });

        it('Should have expandable--is-active class', () => {
            expect(wrapper.find('.expandable--is-active')).to.have.lengthOf(1);
        });

        it('Should not have expandable--is-active class', () => {
            wrapper = setup({ isActive: false });
            expect(wrapper.find('.expandable--is-active')).to.have.lengthOf(0);
        });
    });

    context('Check the onToggle function', () => {
        it('Check that onToggle has been called.', () => {
            const spyOnToggle = sinon.spy();
            wrapper = setup({ onToggle: spyOnToggle });
            expect(wrapper.find('.main')).to.have.lengthOf(1);
        });
    });
});