/** @jest-environment jsdom */
import { assert } from 'chai';
import React, { useEffect } from 'react';
import moment from 'moment';
import { act } from 'react-dom/test-utils';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import sinon from 'sinon';
import { withHooks } from 'jest-react-hooks-shallow';
import RecurrentTripCancellation from './RecurrentTripCancellation';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import { DATE_FORMAT_DDMMYYYY } from '../../../../../utils/dateUtils';

const mockStore = configureMockStore([thunk]);
const cache = createCache({ key: 'blah' });

let sandbox;
let wrapper;

const defaultStates = {
    appSettings: {
        useHideTrip: 'true',
    },
};

const componentPropsMock = {
    onChange: jest.fn(),
};

const setup = (customProps, customStates) => {
    const props = { ...componentPropsMock, ...customProps };
    const store = mockStore(customStates || defaultStates);
    return mount(<CacheProvider value={ cache }><Provider store={ store }><RecurrentTripCancellation { ...props } /></Provider></CacheProvider>);
};

describe('<RecurrentTripCancellation />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        jest.resetAllMocks();
    });

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
        expect(startDateInput.at(0).prop('value')).toEqual('01/03/2022');
        const endDateInput = wrapper.find('#recurrent-trip-cancellation__end-date');
        expect(endDateInput.at(0).prop('value')).toEqual('');
        const weekdayPicker = wrapper.find(WeekdayPicker);
        assert.deepEqual(weekdayPicker.at(0).prop('selectedWeekdays'), [0, 1, 2, 3, 4, 5, 6]);

        expect(wrapper.find('span').at(2).text()).toEqual('Cancel selected trips everyday from Mar 01, 2022 ');
    });

    it('Should fire onChange if start date, end date or weekday picker updated', () => {
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
        act(() => {
            startDateInput.at(0).props().onChange([]);
        });

        expect(componentPropsMock.onChange).toHaveBeenCalledWith({ startDate: '' });

        act(() => {
            startDateInput.at(0).props().onChange([moment('02/03/2022', DATE_FORMAT_DDMMYYYY).toDate()]);
        });

        expect(componentPropsMock.onChange).toHaveBeenCalledWith({ startDate: '02/03/2022' });

        const endDateInput = wrapper.find('#recurrent-trip-cancellation__end-date');
        act(() => {
            endDateInput.at(0).props().onChange([]);
        });

        expect(componentPropsMock.onChange).toHaveBeenCalledWith({ endDate: '' });

        act(() => {
            endDateInput.at(0).props().onChange([moment('03/03/2022', DATE_FORMAT_DDMMYYYY).toDate()]);
        });

        expect(componentPropsMock.onChange).toHaveBeenCalledWith({ endDate: '03/03/2022' });

        const weekdayPicker = wrapper.find(WeekdayPicker);
        act(() => {
            weekdayPicker.at(0).props().onUpdate([0]);
        });
        expect(componentPropsMock.onChange).toHaveBeenCalledWith({ selectedWeekdays: [0] });
    });

    it('Should reset endDate to blank if startDate is after endDate', () => {
        withHooks(() => {
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
            expect(useEffect).toHaveBeenCalledWith(expect.anything(), ['02/03/2022', '01/03/2022']);
            expect(componentPropsMock.onChange).toHaveBeenCalledWith({ endDate: '' });
        });
    });
});
