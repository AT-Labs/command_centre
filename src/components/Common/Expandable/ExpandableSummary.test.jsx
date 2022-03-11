import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import ExpandableSummary from './ExpandableSummary';

let wrapper;
let sandbox;

const mockProps = {
    expandableRegionId: '3a56baf4-c757-44fd-bd93-ecc66320c8c8',
    expandableButtonId: '0ffb89d3-47b3-48a6-a4ce-7037cc5d68e7',
    isActive: true,
    onToggle: () => {},
    className: 'main',
    children: ['one', 'two', 'three'],
    displayToggleButton: true,
    expandClassName: 'subclass',
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<ExpandableSummary { ...props } />);
};

describe('<ExpandableSummary />', () => {
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

        it('Should have subclass class', () => {
            expect(wrapper.find('.subclass')).to.have.lengthOf(1);
        });

        it('Should the toggle button displayed.', () => {
            expect(wrapper.find('.expandable__header__expand-button')).to.have.lengthOf(1);
            expect(wrapper.find('button')).to.have.lengthOf(1);
        });

        it('Should the  IoIosArrowUp icon show.', () => {
            expect(wrapper.find('IoIosArrowUp')).to.have.lengthOf(1);
        });

        it('Should the IoIosArrowDown icon show.', () => {
            wrapper = setup({ isActive: false });
            expect(wrapper.find('IoIosArrowDown')).to.have.lengthOf(1);
        });
    });

    context('Check Button Behavior', () => {
        it('Should have main class', () => {
            const spyOnToggle = sinon.spy();
            wrapper = setup({ onToggle: spyOnToggle });
            wrapper.find('button').first().simulate('click');
            expect(spyOnToggle.calledOnce).to.equal(true);
        });
    });
});