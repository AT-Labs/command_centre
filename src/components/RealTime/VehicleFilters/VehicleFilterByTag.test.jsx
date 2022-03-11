import React from 'react';
import { Input } from 'reactstrap';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { VehicleFilterByTag, VehicleTag } from './VehicleFilterByTag';

let wrapper;

const mockDefaultProps = {
    mergeVehicleFilters: ({ showingTags }) => wrapper.setProps({ showingTags }),
};

const setup = (customProps) => {
    const props = mockDefaultProps;
    Object.assign(props, customProps);
    document.body.innerHTML = '<div id="testContainer"></div>';
    const options = {
        attachTo: document.querySelector('#testContainer'),
    };
    wrapper = mount(<VehicleFilterByTag { ...props } />, options);
    return wrapper;
};

const check = (index, checked = true) => {
    const checkboxes = wrapper.find(Input);
    checkboxes.at(index).find('input').simulate('change', {
        target: { checked, name: Object.values(VehicleTag)[index] },
    });
};

describe('<VehicleFilterByTag />', () => {
    it('When Smartrak tag filter is selected, checkbox will be enabled', () => {
        wrapper = setup({
            showingTags: [VehicleTag.SMARTRAK],
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(2);
        expect(checkboxes.at(0).prop('checked')).to.equal(true);
        expect(checkboxes.at(1).prop('checked')).to.equal(false);
    });

    it('When Torutek tag filter is selected, checkbox will be enabled', () => {
        wrapper = setup({
            showingTags: [VehicleTag.TORUTEK],
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(2);
        expect(checkboxes.at(0).prop('checked')).to.equal(false);
        expect(checkboxes.at(1).prop('checked')).to.equal(true);
    });

    it('When Smartrak and Torutek tag filters are selected, both checkbox will be enabled', () => {
        wrapper = setup({
            showingTags: [VehicleTag.SMARTRAK, VehicleTag.TORUTEK],
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(2);
        expect(checkboxes.at(0).prop('checked')).to.equal(true);
        expect(checkboxes.at(1).prop('checked')).to.equal(true);
    });

    it('When no filter is selected, both checkbox will be disabled', () => {
        wrapper = setup({
            showingTags: [],
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(2);
        expect(checkboxes.at(0).prop('checked')).to.equal(false);
        expect(checkboxes.at(1).prop('checked')).to.equal(false);
    });

    it('When Smartrak tag filter checked and uncheck it, showingTags will remove Smartrak', () => {
        wrapper = setup({
            showingTags: [VehicleTag.SMARTRAK],
        });
        check(0, false);
        expect(wrapper.prop('showingTags').length).to.equal(0);
    });

    it('When check both of the 2 checkboxes, showingTags will add SMARTRAK and TORUTEK', () => {
        wrapper = setup({
            showingTags: [],
        });
        check(0);
        check(1);
        expect(wrapper.prop('showingTags')).to.eql([VehicleTag.SMARTRAK, VehicleTag.TORUTEK]);
    });

    it('When check both checkbox and then uncheck Smartrak, will add Torutek to showingTags', () => {
        wrapper = setup({
            showingTags: [],
        });
        check(0);
        check(1);
        check(0, false);
        expect(wrapper.prop('showingTags')).to.eql([VehicleTag.TORUTEK]);
    });

    it('When check both checkbox and then uncheck both of them, showingTags will be updated to initial state', () => {
        wrapper = setup({
            showingTags: [],
        });
        check(0);
        check(1);
        check(0, false);
        check(1, false);
        expect(wrapper.prop('showingTags')).lengthOf(0);
    });
});
