import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import TokenMultiSelect from './TokenMultiSelect';
import SelectBody from './SelectBody';
import SelectHead from './SelectHead';
import SelectedItemToken from './SelectedItemToken';
import SelectItem from './SelectItem';


let wrapper;

const mockOptions = [
    { value: '1', label: 'AT Metro East' },
    { value: '2', label: 'AT Metro West' },
    { value: '3', label: 'AT Metro Onehunga' },
    { value: '4', label: 'AT Metro South' },
    { value: '5', label: 'AT Metro North' },
];

const mockDefaultProps = {
    id: 'testTokenMultiSelect',
    options: mockOptions,
    selectedValues: [],
    disabled: false,
};

const render = (customProps) => {
    const props = mockDefaultProps;
    Object.assign(props, customProps);

    document.body.innerHTML = '<div id="testContainer"></div>';
    const options = {
        attachTo: document.querySelector('#testContainer'),
    };
    wrapper = mount(<TokenMultiSelect { ...props } />, options);
    return wrapper;
};

const mockResize = (width) => {
    const headNode = wrapper.find(SelectHead).childAt(0).getDOMNode();
    Object.defineProperty(headNode, 'clientWidth', { value: width });
};

const select = (index, value, checked = true) => {
    const selectItems = wrapper.find(SelectBody).find(SelectItem);
    selectItems.at(index).find('input').simulate('change', {
        target: { value, checked },
    });
};


describe('testTokenMultiSelect', () => {
    beforeEach(() => {
        render();
    });

    afterEach(() => {
        wrapper.detach();
    });

    context('Render', () => {
        it('Should render without body by default', () => {
            expect(wrapper.exists()).to.equal(true);
            expect(wrapper.find(SelectHead).length).to.equal(1);
            expect(wrapper.find(SelectBody).length).to.equal(0);
        });

        it('Should display seleted item when set selected values', () => {
            wrapper.setProps({ selectedValues: [mockOptions[0].value] });
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(1);
        });
    });

    context('Collapse and expand', () => {
        it('Should disabled and can not focus on when set to disabled', () => {
            wrapper.setProps({ disabled: true });
            expect(wrapper.find(SelectHead).hasClass('disabled'));
            wrapper.simulate('focus');
            expect(wrapper.find(SelectBody).length).to.equal(0);
        });

        it('Should expand on focus', () => {
            wrapper.simulate('focus');
            expect(wrapper.find(SelectBody).length).to.equal(1);
        });

        it('Should collapse on blur', () => {
            wrapper.simulate('focus');
            expect(wrapper.find(SelectBody).length).to.equal(1);

            wrapper.simulate('blur');
            expect(wrapper.find(SelectBody).length).to.equal(0);
        });
    });

    context('Select head operations', () => {
        it('Should display filtered options when type characters in input field', () => {
            const filterInput = wrapper.find(SelectHead).find('input');
            filterInput.simulate('focus');
            filterInput.simulate('input', { target: { value: 'west' } });
            expect(wrapper.find(SelectBody).find(SelectItem).length).to.equal(2);

            filterInput.simulate('input', { target: { value: 'west1' } });
            expect(wrapper.find(SelectBody).find(SelectItem).length).to.equal(1);

            filterInput.simulate('input', { target: { value: 'west' } });
            expect(wrapper.find(SelectBody).find(SelectItem).length).to.equal(2);
        });

        it('Should remove label from head and deselect option when press Backspace and there is no character in the input field', () => {
            wrapper.simulate('focus');
            select(1, '1');
            expect(wrapper.state('selectedValues').length).to.equal(1);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(1);
            expect(wrapper.find(SelectBody).find('input[checked=true]').length).to.equal(1);

            const filterInput = wrapper.find(SelectHead).find('input');
            filterInput.simulate('focus');
            filterInput.simulate('keydown', { which: 0x8 });

            expect(wrapper.state('selectedValues').length).to.equal(0);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(0);
            expect(wrapper.find(SelectBody).find('input[checked=true]').length).to.equal(0);
        });

        it('Should remove label from head and deselect option when click x button of the label', () => {
            wrapper.simulate('focus');
            select(1, '1');
            expect(wrapper.state('selectedValues').length).to.equal(1);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(1);
            expect(wrapper.find(SelectBody).find('input[checked=true]').length).to.equal(1);

            const filterInput = wrapper.find(SelectedItemToken).find('button');
            filterInput.simulate('click', { value: '1' });

            expect(wrapper.state('selectedValues').length).to.equal(0);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(0);
            expect(wrapper.find(SelectBody).find('input[checked=true]').length).to.equal(0);
        });

        it('Should remove all labels from head and clear input field and deselect all options when click clear icon', () => {
            wrapper.simulate('focus');
            mockResize(400);
            select(1, '1');
            select(2, '2');

            wrapper.find(SelectHead).instance().setState({ inputValue: 'AT' });
            expect(wrapper.state('selectedValues').length).to.equal(2);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(2);
            expect(wrapper.find(SelectBody).find('input[checked=true]').length).to.equal(2);

            const clearButton = wrapper.find(SelectHead).childAt(2);
            clearButton.simulate('click');

            expect(wrapper.state('selectedValues').length).to.equal(0);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(0);
            expect(wrapper.find(SelectHead).find('input').text()).to.equal('');
            expect(wrapper.find(SelectBody).find('input[checked=true]').length).to.equal(0);
        });
    });

    context('Select body operations', () => {
        it('Should select and display on head when click 1 option', () => {
            wrapper.simulate('focus');
            select(1, '1');

            expect(wrapper.state('selectedValues').length).to.equal(1);
            expect(wrapper.find(SelectBody).find(SelectItem).at(1).prop('checked')).to.equal(true);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(1);
        });

        it('Should display multiple labels on head when click multiple options', () => {
            mockResize(400);
            wrapper.simulate('focus');
            select(1, '1');
            select(2, '2');

            expect(wrapper.state('selectedValues').length).to.equal(2);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(2);
        });

        it('Should truncate text when click multiple options and too big to fit', () => {
            mockResize(200);
            wrapper.simulate('focus');
            select(1, '1');
            select(2, '2');

            expect(wrapper.state('selectedValues').length).to.equal(2);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(2);
            expect(wrapper.find(SelectHead).text()).to.contains('...');
        });

        it('Should display the count of truncated selected options when click multiple options and too big to fit', () => {
            mockResize(200);
            wrapper.simulate('focus');
            select(1, '1');
            select(2, '2');
            select(3, '3');

            expect(wrapper.state('selectedValues').length).to.equal(3);
            expect(wrapper.find(SelectHead).find(SelectedItemToken).length).to.equal(2);
            expect(wrapper.find(SelectHead).text()).to.contains('+2');
        });

        it('Should select all options in body and indicate all options are selected in head when click Select all', () => {
            wrapper.simulate('focus');
            select(0, '_all');

            expect(wrapper.state('selectedValues').length).to.equal(mockOptions.length);
            expect(wrapper.find(SelectBody).find('input[checked=true]').length).to.equal(6);
            expect(wrapper.find(SelectHead).html()).to.contains('All items are Selected');
        });

        it('Should set to unchecked and display default when deselect selected option', () => {
            wrapper.simulate('focus');
            select(1, '1');
            select(1, '1', false);

            expect(wrapper.state('selectedValues').length).to.equal(0);
            expect(wrapper.find(SelectBody).find(SelectItem).at(1).prop('checked')).to.equal(false);
            expect(wrapper.find(SelectHead).html()).to.contains('Please Select');
        });
    });
});
