import React from 'react';
import { shallow } from 'enzyme';
import { FaCalendarPlus } from 'react-icons/fa';
import { UncontrolledTooltip } from 'reactstrap';

import { TripDetailIcon } from './TripDetailIcon';
import { TRIP_DETAIL_ICON_TYPE } from '../../../constants/tripReplays';

describe('TripDetailIcon', () => {
    it('Should render without errors', () => {
        const wrapper = shallow(<TripDetailIcon type={ TRIP_DETAIL_ICON_TYPE.ADDED } />);
        expect(wrapper.exists()).toEqual(true);
    });

    it('Should render the "Added" icon correctly', () => {
        const wrapper = shallow(<TripDetailIcon type={ TRIP_DETAIL_ICON_TYPE.ADDED } />);
        const addedIcon = wrapper.find(FaCalendarPlus);
        const tooltip = wrapper.find(UncontrolledTooltip);

        expect(addedIcon.exists()).toEqual(true);
        expect(addedIcon.prop('size')).toEqual(null);
        expect(tooltip.exists()).toEqual(true);
        expect(tooltip.prop('target')).toEqual('trip-manually-added');
        expect(tooltip.children().text()).toEqual('Trip manually added');
    });

    it('Should render the "Disruption" icon correctly', () => {
        const wrapper = shallow(<TripDetailIcon type={ TRIP_DETAIL_ICON_TYPE.DISRUPTION } />);
        const disruptionIcon = wrapper.find('Icon.alert-icon');

        expect(disruptionIcon.exists()).toEqual(true);
    });

    it('Should render no icon when type is not recognized', () => {
        const wrapper = shallow(<TripDetailIcon type="UNKNOWN_TYPE" />);
        const addedIcon = wrapper.find(FaCalendarPlus);
        const disruptionIcon = wrapper.find('Icon.alert-icon');

        expect(addedIcon.exists()).toEqual(false);
        expect(disruptionIcon.exists()).toEqual(false);
    });

    it('Should apply custom className', () => {
        const wrapper = shallow(<TripDetailIcon type={ TRIP_DETAIL_ICON_TYPE.ADDED } className="custom-class" />);
        expect(wrapper.hasClass('custom-class')).toEqual(true);
    });
});
