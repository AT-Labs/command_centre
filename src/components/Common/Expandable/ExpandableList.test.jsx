import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import ExpandableList from './ExpandableList';
import Expandable from './Expandable';
import ExpandableSummary from './ExpandableSummary';
import ExpandableContent from './ExpandableContent';

let wrapper;
let sandbox;

const mockProps = {
    id: '3a56baf4-c757-44fd-bd93-ecc66320c8c8',
    isActive: true,
    onToggle: () => {},
    label: 'Label',
    children: [],
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(
        <ExpandableList { ...props } >
            {props.children}
        </ExpandableList>
    );
};

describe('<ExpandableList />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => {
        expect(wrapper.exists()).to.equal(true);
        expect(wrapper.find(Expandable).exists()).to.equal(true);
        expect(wrapper.find(ExpandableSummary).exists()).to.equal(true);
        expect(wrapper.find(ExpandableContent).exists()).to.equal(true);
    });

    it('Should display children when it is active', () => {
        wrapper = setup({
            isActive: true,
            children: [
                <li key="1">child1</li>,
                <li key="2">child2</li>,
                <li key="3">child3</li>,
            ],
        });

        expect(wrapper.find('ExpandableContent>ul>li').length === 3).to.equal(true);
    });

    it('Should not display children when it is not active', () => {
        wrapper = setup({
            isActive: false,
            children: [
                <li key="1">child1</li>,
                <li key="2">child2</li>,
                <li key="3">child3</li>,
            ],
        });

        expect(wrapper.find('ExpandableContent>ul>li').exists()).to.equal(false);
    });

    it('Should display remove button when remove action is specified', () => {
        const spyOnRemove = sinon.spy();
        wrapper = setup({
            removeAction: spyOnRemove,
        });

        const buttons = wrapper.find('ExpandableSummary>div>Button');
        expect(buttons.length === 2).to.equal(true);
        expect(buttons.at(1).contains('Remove')).to.equal(true);

        buttons.at(1).simulate('click');
        expect(spyOnRemove.calledOnce).to.equal(true);
    });

    it('Should not display remove button when no remove action is specified', () => {
        wrapper = setup({
            removeAction: null,
        });

        const buttons = wrapper.find('ExpandableSummary>div>Button');
        expect(buttons.length === 1).to.equal(true);
    });
});
