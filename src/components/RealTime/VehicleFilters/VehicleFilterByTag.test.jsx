import React from 'react';
import { Input } from 'reactstrap';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { VehicleFilterByTag } from './VehicleFilterByTag';

let wrapper;

const VehicleTag = {
    SMARTRAK: 'Smartrak',
    TORUTEK: 'Torutek',
    CAF: 'CAF',
};

const mockDefaultProps = {
    mergeVehicleFilters: ({ showingTags }) => wrapper.setProps({ showingTags }),
    useCAFMapFilter: true,
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
        expect(checkboxes.length).to.equal(3);
        expect(checkboxes.at(0).prop('checked')).to.equal(true);
        expect(checkboxes.at(1).prop('checked')).to.equal(false);
        expect(checkboxes.at(2).prop('checked')).to.equal(false);
    });

    it('When Torutek tag filter is selected, checkbox will be enabled', () => {
        wrapper = setup({
            showingTags: [VehicleTag.TORUTEK],
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(3);
        expect(checkboxes.at(0).prop('checked')).to.equal(false);
        expect(checkboxes.at(1).prop('checked')).to.equal(true);
        expect(checkboxes.at(2).prop('checked')).to.equal(false);
    });

    it('When CAF tag filter is selected, checkbox will be enabled', () => {
        wrapper = setup({
            showingTags: [VehicleTag.CAF],
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(3);
        expect(checkboxes.at(0).prop('checked')).to.equal(false);
        expect(checkboxes.at(1).prop('checked')).to.equal(false);
        expect(checkboxes.at(2).prop('checked')).to.equal(true);
    });

    it('When Smartrak, Torutek, and CAF tag filters are selected, their checkboxes will be enabled', () => {
        wrapper = setup({
            showingTags: [VehicleTag.SMARTRAK, VehicleTag.TORUTEK, VehicleTag.CAF],
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(3);
        expect(checkboxes.at(0).prop('checked')).to.equal(true);
        expect(checkboxes.at(1).prop('checked')).to.equal(true);
        expect(checkboxes.at(2).prop('checked')).to.equal(true);
    });

    it('When no filter is selected, both checkbox will be disabled', () => {
        wrapper = setup({
            showingTags: [],
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(3);
        expect(checkboxes.at(0).prop('checked')).to.equal(false);
        expect(checkboxes.at(1).prop('checked')).to.equal(false);
        expect(checkboxes.at(2).prop('checked')).to.equal(false);
    });

    it('When Smartrak tag filter checked and uncheck it, showingTags will remove Smartrak', () => {
        wrapper = setup({
            showingTags: [VehicleTag.SMARTRAK],
        });
        check(0, false);
        expect(wrapper.prop('showingTags').length).to.equal(0);
    });

    it('When check all 3 checkboxes, showingTags will add SMARTRAK, TORUTEK and CAF', () => {
        wrapper = setup({
            showingTags: [],
        });
        check(0);
        check(1);
        check(2);
        expect(wrapper.prop('showingTags')).to.eql([VehicleTag.SMARTRAK, VehicleTag.TORUTEK, VehicleTag.CAF]);
    });

    it('When check all checkboxes and then uncheck Smartrak, will add Torutek and CAF to showingTags', () => {
        wrapper = setup({
            showingTags: [],
        });
        check(0);
        check(1);
        check(2);
        check(0, false);
        expect(wrapper.prop('showingTags')).to.eql([VehicleTag.TORUTEK, VehicleTag.CAF]);
    });

    it('When check all checkboxes and then uncheck all of them, showingTags will be updated to initial state', () => {
        wrapper = setup({
            showingTags: [],
        });
        check(0);
        check(1);
        check(2);
        check(0, false);
        check(1, false);
        check(2, false);
        expect(wrapper.prop('showingTags')).lengthOf(0);
    });
});
