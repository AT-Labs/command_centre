import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import { Button } from 'reactstrap';
import { withHooks } from 'jest-react-hooks-shallow';

import { NewTripDetails } from './NewTripDetails';
import { SERVICE_DATE_FORMAT } from '../../../../../utils/control/routes';

describe('NewTripDetails', () => {
    let mockTripInstance;
    let mockServiceDate;
    let mockAddTrip;
    let mockToggleAddTripModals;
    let mockUpdateIsNewTripDetailsFormEmpty;
    let mockIsNewTripModalOpen;
    let mockAction;
    let wrapper;

    beforeEach(() => {
        mockTripInstance = {
            routeType: 2,
            startTime: '10:00:00',
            endTime: '11:00:00',
            stops: [],
        };
        mockServiceDate = '2023-07-04';
        mockAddTrip = jest.fn();
        mockToggleAddTripModals = jest.fn();
        mockUpdateIsNewTripDetailsFormEmpty = jest.fn();
        mockIsNewTripModalOpen = false;
        mockAction = {};

        wrapper = shallow(
            <NewTripDetails
                tripInstance={ mockTripInstance }
                serviceDate={ mockServiceDate }
                addTrip={ mockAddTrip }
                toggleAddTripModals={ mockToggleAddTripModals }
                updateIsNewTripDetailsFormEmpty={
                    mockUpdateIsNewTripDetailsFormEmpty
                }
                isNewTripModalOpen={ mockIsNewTripModalOpen }
                action={ mockAction }
            />,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        expect(wrapper).toHaveLength(1);
    });

    it('updates isNewTripDetailsFormEmpty to false on startTime change', () => {
        withHooks(() => {
            const startTimeInput = wrapper.find(
                '#add-trip-new-trip-details__start-time',
            );

            startTimeInput.simulate('change', { target: { value: '09:00' } });
            expect(mockUpdateIsNewTripDetailsFormEmpty).toHaveBeenCalledWith(
                false,
            );
        });
    });

    it('updates isNewTripDetailsFormEmpty to true when startTime is empty', () => {
        withHooks(() => {
            const startTimeInput = wrapper.find(
                '#add-trip-new-trip-details__start-time',
            );

            startTimeInput.simulate('change', { target: { value: '' } });
            expect(mockUpdateIsNewTripDetailsFormEmpty).toHaveBeenCalledWith(
                true,
            );
        });
    });

    it('disables the Add Trip button when isActionDisabled is true', () => {
        wrapper.setProps({ action: { isActionDisabled: true } });

        const addButton = wrapper.find(Button);

        expect(addButton.prop('disabled')).toEqual(true);
    });

    it('calls addTrip and toggleAddTripModals on Add Trip button click', () => {
        const addButton = wrapper.find(Button);

        addButton.simulate('click');

        expect(mockAddTrip).toHaveBeenCalledTimes(1);
        expect(mockAddTrip).toHaveBeenCalledWith({
            ...mockTripInstance,
            serviceDate: moment(mockServiceDate).format(SERVICE_DATE_FORMAT),
            startTime: '',
            endTime: '',
            stops: [],
            referenceId: '',
        });

        expect(mockToggleAddTripModals).toHaveBeenCalledTimes(1);
        expect(mockToggleAddTripModals).toHaveBeenCalledWith(
            'isNewTripModalOpen',
            true,
        );
    });

    it('renders the CustomModal component when isNewTripModalOpen is true', () => {
        wrapper.setProps({ isNewTripModalOpen: true });

        const customModal = wrapper.find('CustomModal');

        expect(customModal).toHaveLength(1);
        expect(customModal.prop('isModalOpen')).toEqual(true);
    });
});
