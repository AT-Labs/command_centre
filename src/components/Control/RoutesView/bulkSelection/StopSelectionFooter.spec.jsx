import React from 'react';
import { shallow } from 'enzyme';
import MockDate from 'mockdate';
import moment from 'moment';
import { StopSelectionFooter } from './StopSelectionFooter';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';

let wrapper;
const componentPropsMock = {
    tripInstance: {
        stops: [
            { stopCode: '1' },
            { stopCode: '2' },
        ],
    },
    selectedStopsByTripKey: () => {},
    deselectAllStopsByTrip: () => {},
    useHeadsignUpdate: true,
    useHideSkippedStop: true,
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    return shallow(<StopSelectionFooter { ...props } />);
};

describe('StopSelectionFooter', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('should render', () => {
        expect(wrapper.exists()).toEqual(true);
    });

    describe('update destination', () => {
        const testCases = [
            {
                description: 'yesterday trip before midnight',
                serviceDate: '20230819',
                endTime: '23:43:00',
                expectedDisabled: true,
            },
            {
                description: 'yesterday trip after midnight',
                serviceDate: '20230819',
                endTime: '24:43:00',
                expectedDisabled: false,
            },
            {
                description: 'today trip before midnight',
                serviceDate: '20230820',
                endTime: '23:43:00',
                expectedDisabled: false,
            },
            {
                description: 'today trip after midnight',
                serviceDate: '20230820',
                endTime: '23:43:00',
                expectedDisabled: false,
            },
            {
                description: 'tomorrow trip',
                serviceDate: '20230821',
                endTime: '12:43:00',
                expectedDisabled: true,
            },
        ];

        beforeAll(() => {
            MockDate.set(moment('2023-08-20').toDate());
        });

        afterAll(() => {
            MockDate.reset();
        });

        testCases.forEach(({ description, serviceDate, endTime, expectedDisabled }) => {
            it(`renders ${expectedDisabled ? 'disabled' : 'enabled'} "Update destination" button for ${description}`, () => {
                wrapper.setProps({
                    tripInstance: {
                        status: TRIP_STATUS_TYPES.notStarted,
                        serviceDate,
                        endTime,
                        stops: [
                            { stopCode: '1' },
                            { stopCode: '2' },
                        ],
                    },
                });
                const updateDestinationButton = wrapper.find('.selection-tools-footer__btn-update-destination');
                expect(updateDestinationButton.prop('disabled')).toEqual(expectedDisabled);
            });
        });
    });

    it('render non-stopping button when showNonStoppingButton is true', () => {
        wrapper = setup({ showNonStoppingButton: true });
        const button = wrapper.find('.selection-tools-footer__btn-non-stopping');
        expect(button.exists()).toEqual(true);
        button.simulate('click');
    });

    it('render hide skipped stops button when showHideSkippedStopButton is true', () => {
        wrapper = setup({ showHideSkippedStopButton: true });
        const button = wrapper.find('.selection-tools-footer__btn-hide');
        expect(button.exists()).toEqual(true);
        button.simulate('click');
    });

    it('shoud not render hide skipped stops button when showHideSkippedStopButton is false', () => {
        wrapper = setup({ showHideSkippedStopButton: false });
        const button = wrapper.find('.selection-tools-footer__btn-hide');
        expect(button.exists()).toEqual(false);
    });
});
