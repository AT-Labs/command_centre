import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import WeekdayPicker from './WeekdayPicker';

let sandbox;
let wrapper;

const componentPropsMock = {
    selectedWeekdays: [],
    onUpdate: selectedWeekdays => wrapper.setProps({ selectedWeekdays }),
};

const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    return mount(<WeekdayPicker { ...props } />);
};

describe('<WeekdayPicker />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        wrapper = setup();
    });

    afterEach(() => sandbox.restore());

    it('should render', () => {
        expect(wrapper.exists()).to.equal(true);
    });

    it('should toggle on and off each weekday on button click', () => {
        expect(wrapper.find('button').children()).to.have.lengthOf(7);
        for (let i = 0; i < 7; i++) {
            wrapper.find('button').at(i).simulate('click');
            expect(wrapper.prop('selectedWeekdays')).to.deep.equal([i]);
            wrapper.find('button').at(i).simulate('click');
            expect(wrapper.prop('selectedWeekdays')).to.deep.equal([]);
        }
    });

    it('should toggle on each weekday on button click', () => {
        expect(wrapper.find('button').children()).to.have.lengthOf(7);
        const selectedWeekdays = [];
        for (let i = 0; i < 7; i++) {
            wrapper.find('button').at(i).simulate('click');
            selectedWeekdays.push(i);
            expect(wrapper.prop('selectedWeekdays')).to.deep.equal(selectedWeekdays);
        }
    });

    it('should toggle off each weekday on button click', () => {
        const selectedWeekdays = [0,1,2,3,4,5,6];
        wrapper = setup({ selectedWeekdays });
        expect(wrapper.find('button').children()).to.have.lengthOf(7);
        for (let i = 0; i < 7; i++) {
            wrapper.find('button').at(i).simulate('click');
            selectedWeekdays.shift();
            expect(wrapper.prop('selectedWeekdays')).to.deep.equal(selectedWeekdays);
        }
    });
});
