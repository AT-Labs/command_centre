/** @jest-environment jsdom */
import { expect, assert } from 'chai';
import React from 'react';
import moment from 'moment';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import sinon from 'sinon';
import RecurrentTripCancellation from './RecurrentTripCancellation';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import { DATE_FORMAT_DDMMYYYY } from '../../../../../utils/dateUtils';

let sandbox;
let wrapper;
let lastChange;
const componentPropsMock = {
    onChange: (setting) => {
        lastChange = setting;
    },
};

const setup = (customProps) => {
    let props = componentPropsMock;
    props = Object.assign(props, customProps);

    return mount(<RecurrentTripCancellation { ...props } />);
};

describe('<RecurrentTripCancellation />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => sandbox.restore());

    it('Should render start date, end date and weekday picker', () => {
        wrapper = setup(
            {
                setting: {
                    startDate: '01/03/2022',
                    endDate: '',
                    selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
                },
                options: {
                    startDatePickerMinimumDate: '01/03/2022',
                    endDatePickerMinimumDate: '01/03/2022',
                },
            },
        );

        const startDateInput = wrapper.find('#recurrent-trip-cancellation__start-date');
        expect(startDateInput.at(0).prop('value')).to.equal('01/03/2022');
        const endDateInput = wrapper.find('#recurrent-trip-cancellation__end-date');
        expect(endDateInput.at(0).prop('value')).to.equal('');
        const weekdayPicker = wrapper.find(WeekdayPicker);
        assert.deepEqual(weekdayPicker.at(0).prop('selectedWeekdays'), [0, 1, 2, 3, 4, 5, 6]);

        expect(wrapper.find('span').at(2).text()).to.equal('Cancel selected trips everyday from Mar 01, 2022 ');
    });

    it('Should fire onChange if start date, end date or weekday picker updated', () => {
        wrapper = setup(
            {
                setting: {
                    startDate: '01/03/2022',
                    endDate: '',
                    selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
                },
            },
        );

        const startDateInput = wrapper.find('#recurrent-trip-cancellation__start-date');
        act(() => {
            startDateInput.at(0).props().onChange([]);
        });

        expect(lastChange.startDate).to.equal('');
        act(() => {
            startDateInput.at(0).props().onChange([moment('02/03/2022', DATE_FORMAT_DDMMYYYY).toDate()]);
        });

        expect(lastChange.startDate).to.equal('02/03/2022');

        const endDateInput = wrapper.find('#recurrent-trip-cancellation__end-date');
        act(() => {
            endDateInput.at(0).props().onChange([]);
        });

        expect(lastChange.endDate).to.equal('');
        act(() => {
            endDateInput.at(0).props().onChange([moment('03/03/2022', DATE_FORMAT_DDMMYYYY).toDate()]);
        });
        expect(lastChange.endDate).to.equal('03/03/2022');

        const weekdayPicker = wrapper.find(WeekdayPicker);
        act(() => {
            weekdayPicker.at(0).props().onUpdate([0]);
        });
        assert.deepEqual(lastChange.selectedWeekdays, [0]);
    });

    it('Should reset endDate to blank if startDate is after endDate', () => {
        wrapper = setup(
            {
                setting: {
                    startDate: '02/03/2022',
                    endDate: '01/03/2022',
                    selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
                },
                options: {
                    startDatePickerMinimumDate: '01/03/2022',
                    endDatePickerMinimumDate: '01/03/2022',
                },
            },
        );

        expect(lastChange.endDate).to.equal('');
    });
});
