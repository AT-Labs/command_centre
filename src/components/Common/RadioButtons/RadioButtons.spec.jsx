import React from 'react';
import { mount } from 'enzyme';

import RadioButtons from './RadioButtons';

let wrapper;

const mockProps = {
    onChange: jest.fn(),
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return mount(<RadioButtons { ...props } />);
};

describe('<RadioButtons />', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Check rendered elements - disabled', () => {
        beforeEach(() => {
            wrapper = setup({
                title: 'Test Title',
                checkedKey: '0',
                keyValues: [{ key: '0', value: 'first option' }, { key: '1', value: 'second option' }],
                disabled: true,
            });
        });

        it('Should render', () => expect(wrapper.exists()).toBeTruthy());

        it('Should have title set element', () => {
            expect(wrapper.find('label').at(0).text()).toEqual(mockProps.title);
        });

        it('Should have 2 option elements with correct labels and 2 inputs', () => {
            expect(wrapper.find('label span').length).toEqual(3);
            expect(wrapper.find('input[type="radio"]').length).toEqual(2);
            expect(wrapper.find('label span').at(1).text()).toEqual(mockProps.keyValues[0].value);
            expect(wrapper.find('label span').at(2).text()).toEqual(mockProps.keyValues[1].value);
        });

        it('Should have the correct option checked', () => {
            expect(wrapper.find('input[type="radio"]').at(0).props().checked).toBeTruthy();
            expect(wrapper.find('input[type="radio"]').at(1).props().checked).toBeFalsy();
        });

        it('Should be disabled', () => {
            expect(wrapper.find('input[type="radio"]').at(0).props().disabled).toBeTruthy();
            expect(wrapper.find('input[type="radio"]').at(1).props().disabled).toBeTruthy();
        });
    });

    describe('Check function of enabled elements', () => {
        beforeEach(() => {
            wrapper = setup({
                title: 'Test Title',
                checkedKey: '0',
                keyValues: [{ key: '0', value: 'first option' }, { key: '1', value: 'second option' }],
                disabled: false,
            });
        });

        it('Should be enabled', () => {
            expect(wrapper.find('input[type="radio"]').at(0).props().disabled).toBeFalsy();
            expect(wrapper.find('input[type="radio"]').at(1).props().disabled).toBeFalsy();
        });

        it('Should fire onChange event with selected key', () => {
            wrapper.find('input[type="radio"]').at(1).simulate('change', { target: { checked: true } });

            wrapper.update();

            expect(mockProps.onChange).toHaveBeenCalledTimes(1);
            expect(mockProps.onChange).toHaveBeenCalledWith('1');
        });
    });
});
