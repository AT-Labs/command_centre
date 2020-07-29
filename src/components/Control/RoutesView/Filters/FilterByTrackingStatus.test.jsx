import React from 'react';
import { Input } from 'reactstrap';
import { mount } from 'enzyme';
import { expect } from 'chai';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import { FilterByTrackingStatus, TrackingStatus } from './FilterByTrackingStatus';


let wrapper;

const mockDefaultProps = {
    mergeRouteFilters: ({ trackingStatuses }) => wrapper.setProps({ trackingStatuses }),
};

const setup = (customProps) => {
    const props = mockDefaultProps;
    Object.assign(props, customProps);
    document.body.innerHTML = '<div id="testContainer"></div>';
    const options = {
        attachTo: document.querySelector('#testContainer'),
    };
    wrapper = mount(<FilterByTrackingStatus { ...props } />, options);
    return wrapper;
};

const check = (index, checked = true) => {
    const checkboxes = wrapper.find(Input);
    checkboxes.at(index).find('input').simulate('change', {
        target: { checked },
    });
};

describe('<FilterByTrackingStatus />', () => {
    it('When trip status is not IN_PROGRESS, checkbox will disabled', () => {
        wrapper = setup({
            trackingStatuses: [],
            tripStatus: TRIP_STATUS_TYPES.notStarted,
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(2);
        expect(checkboxes.at(0).prop('disabled')).to.equal(true);
        expect(checkboxes.at(1).prop('disabled')).to.equal(true);
    });

    it('When statuses from props is not include TRACKING, \'Hide tracked vehicles\' will checked', () => {
        wrapper = setup({
            trackingStatuses: [TrackingStatus.LOST_TRACKING],
            tripStatus: TRIP_STATUS_TYPES.inProgress,
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(2);
        expect(checkboxes.at(0).prop('disabled')).to.equal(false);
        expect(checkboxes.at(0).prop('checked')).to.equal(true);
        expect(checkboxes.at(1).prop('checked')).to.equal(false);
    });

    it('When statuses from props is not include TRACKING or LOST_TRACKING, both 2 of the checkboxs will checked', () => {
        wrapper = setup({
            trackingStatuses: [TrackingStatus.STOPPED],
            tripStatus: TRIP_STATUS_TYPES.inProgress,
        });
        const checkboxes = wrapper.find(Input);
        expect(checkboxes.length).to.equal(2);
        expect(checkboxes.at(0).prop('checked')).to.equal(true);
        expect(checkboxes.at(1).prop('checked')).to.equal(true);
    });

    it('When set \'Hide tracked vehicles\' checked and uncheck it, trackingStatuses will remove TRACKING', () => {
        wrapper = setup({
            trackingStatuses: [TrackingStatus.TRACKING],
            tripStatus: TRIP_STATUS_TYPES.inProgress,
        });
        check(0);
        expect(wrapper.prop('trackingStatuses').length).to.equal(0);
    });

    it('When check both of the 2 checkboxes, trackingStatuses will remove TRACKING and LOST_TRACKING', () => {
        wrapper = setup({
            trackingStatuses: [],
            tripStatus: TRIP_STATUS_TYPES.inProgress,
        });
        check(0);
        check(1);
        expect(wrapper.prop('trackingStatuses')).not.contains(TrackingStatus.TRACKING);
        expect(wrapper.prop('trackingStatuses')).not.contains(TrackingStatus.LOST_TRACKING);
        expect(wrapper.prop('trackingStatuses')).to.eql([TrackingStatus.STOPPED, TrackingStatus.NOT_TRACKING]);
    });

    it('When check both checkbox and then uncheck \'Hide tracked vehicles\', will add TRACKING to trackingStatuses', () => {
        wrapper = setup({
            trackingStatuses: [],
            tripStatus: TRIP_STATUS_TYPES.inProgress,
        });
        check(0);
        check(1);
        check(0, false);
        expect(wrapper.prop('trackingStatuses')).to.eql([TrackingStatus.STOPPED, TrackingStatus.NOT_TRACKING, TrackingStatus.TRACKING]);
    });

    it('When check both checkbox and then uncheck both of them, trackingStatuses will updated to initial state', () => {
        wrapper = setup({
            trackingStatuses: [],
            tripStatus: TRIP_STATUS_TYPES.inProgress,
        });
        check(0);
        check(1);
        check(0, false);
        check(1, false);
        expect(wrapper.prop('trackingStatuses')).lengthOf(0);
    });
});
