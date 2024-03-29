import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import { Button } from 'reactstrap';
import { withHooks } from 'jest-react-hooks-shallow';

import { NewTripDetails } from './NewTripDetails';
import { SERVICE_DATE_FORMAT } from '../../../../../../utils/control/routes';
import StopSelectionFooter from '../../../bulkSelection/StopSelectionFooter';
import Stops from '../../../../Common/Stops/Stops';

describe('NewTripDetails (Legacy)', () => {
    let mockTripInstance;
    let mockServiceDate;
    let mockAddTrips;
    let mockToggleAddTripModals;
    let mockUpdateIsNewTripDetailsFormEmpty;
    let mockIsNewTripModalOpen;
    let mockAction;
    let mockSelectedStopsByTripKey;
    let mockUseAddTripStopUpdate;
    let mockDeselectAllStopsByTrip;
    let wrapper;

    beforeEach(() => {
        mockTripInstance = {
            tripId: 'id',
            serviceDate: '20231001',
            routeType: 2,
            startTime: '10:00:00',
            endTime: '11:00:00',
            stops: [{
                stopCode: 'Stop1',
                stopHeadsign: 'Britomart',
                scheduledArrivalTime: '12:00:00',
                scheduledDepartureTime: '12:02:00',
            },
            {
                stopCode: 'Stop2',
                stopHeadsign: 'Britomart',
                scheduledArrivalTime: '12:10:00',
                scheduledDepartureTime: '12:12:00',
            }],
            agencyId: '',
            depotId: '',
            directionId: '',
            routeId: '',
            routeLongName: '',
            routeShortName: '',
            routeVariantId: '',
            shapeId: '',
            tripHeadsign: '',
        };
        mockServiceDate = '2023-07-04';
        mockAddTrips = jest.fn();
        mockToggleAddTripModals = jest.fn();
        mockUpdateIsNewTripDetailsFormEmpty = jest.fn();
        mockIsNewTripModalOpen = false;
        mockAction = {};
        mockSelectedStopsByTripKey = jest.fn();
        mockUseAddTripStopUpdate = false;
        mockDeselectAllStopsByTrip = jest.fn();

        wrapper = shallow(
            <NewTripDetails
                tripInstance={ mockTripInstance }
                serviceDate={ mockServiceDate }
                addTrips={ mockAddTrips }
                toggleAddTripModals={ mockToggleAddTripModals }
                updateIsNewTripDetailsFormEmpty={
                    mockUpdateIsNewTripDetailsFormEmpty
                }
                isNewTripModalOpen={ mockIsNewTripModalOpen }
                action={ mockAction }
                selectedStopsByTripKey={ mockSelectedStopsByTripKey }
                useAddTripStopUpdate={ mockUseAddTripStopUpdate }
                deselectAllStopsByTrip={ mockDeselectAllStopsByTrip }
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

            const refIdInput = wrapper.find(
                '#add-trip-new-trip-details__reference-id',
            );

            startTimeInput.simulate('change', { target: { value: '23:59' } });
            refIdInput.simulate('change', { target: { value: 'ref-id-abc' } });
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

        expect(mockAddTrips).toHaveBeenCalledTimes(1);
        expect(mockAddTrips).toHaveBeenCalledWith([{
            ...mockTripInstance,
            serviceDate: moment(mockServiceDate).format(SERVICE_DATE_FORMAT),
            startTime: '',
            endTime: '',
            stops: [{
                stopCode: 'Stop1',
                stopHeadsign: 'Britomart',
                scheduledArrivalTime: '12:00:00',
                scheduledDepartureTime: '12:02:00',
            },
            {
                stopCode: 'Stop2',
                stopHeadsign: 'Britomart',
                scheduledArrivalTime: '12:10:00',
                scheduledDepartureTime: '12:12:00',
            }],
            referenceId: '',
            agencyId: '',
            depotId: '',
            directionId: '',
            routeId: '',
            routeLongName: '',
            routeShortName: '',
            routeVariantId: '',
            shapeId: '',
            tripHeadsign: '',
        }]);

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

    it('renders the stop selection footer component when stop(s) are selected', () => {
        wrapper.setProps({ useAddTripStopUpdate: true });
        wrapper.setProps({ selectedStopsByTripKey: jest.fn(() => ({ mockStopKey: { status: true } })) });
        const stopSelectionFooter = wrapper.find(StopSelectionFooter);
        expect(stopSelectionFooter.exists()).toBe(true);
        const addButton = wrapper.find(Button);
        expect(addButton.exists()).toBe(false);
    });

    it('handle headsign update when the footer invokes onStopUpdated', () => {
        wrapper.setProps({ useAddTripStopUpdate: true });
        // Select some stop
        wrapper.setProps({ selectedStopsByTripKey: jest.fn(() => ({ mockStopKey: { status: true } })) });
        const stopSelectionFooter = wrapper.find(StopSelectionFooter);

        // Update headsign
        stopSelectionFooter.invoke('onStopUpdated')({
            stopCodes: ['Stop1', 'Stop3'],
            action: 'update-headsign',
            headsign: 'Henderson',
        });

        // Unselect stops
        wrapper.setProps({ selectedStopsByTripKey: jest.fn(() => ({})) });

        // Click add
        const addButton = wrapper.find(Button);
        addButton.simulate('click');

        expect(mockAddTrips).toHaveBeenCalledTimes(1);
        expect(mockAddTrips).toHaveBeenCalledWith([{
            ...mockTripInstance,
            serviceDate: moment(mockServiceDate).format(SERVICE_DATE_FORMAT),
            startTime: '',
            endTime: '',
            stops: [{
                stopCode: 'Stop1',
                stopHeadsign: 'Henderson',
                scheduledArrivalTime: '12:00:00',
                scheduledDepartureTime: '12:02:00',
            },
            {
                stopCode: 'Stop2',
                stopHeadsign: 'Britomart',
                scheduledArrivalTime: '12:10:00',
                scheduledDepartureTime: '12:12:00',
            }],
            referenceId: '',
            agencyId: '',
            depotId: '',
            directionId: '',
            routeId: '',
            routeLongName: '',
            routeShortName: '',
            routeVariantId: '',
            shapeId: '',
            tripHeadsign: '',
        }]);
    });

    it('should not render the stop selection footer component when no stops are selected', () => {
        wrapper.setProps({ useAddTripStopUpdate: true });
        wrapper.setProps({ selectedStopsByTripKey: jest.fn(() => {}) });
        const stopSelectionFooter = wrapper.find(StopSelectionFooter);
        expect(stopSelectionFooter.exists()).toBe(false);
        const addButton = wrapper.find(Button);
        expect(addButton.exists()).toBe(true);
    });

    it('should not render the stop selection footer component when feature flag is off', () => {
        wrapper.setProps({ useAddTripStopUpdate: false });
        const stopSelectionFooter = wrapper.find(StopSelectionFooter);
        expect(stopSelectionFooter.exists()).toBe(false);
        const addButton = wrapper.find(Button);
        expect(addButton.exists()).toBe(true);
    });

    it('handle platform change when the stops component invokes onStopUpdated', () => {
        wrapper.setProps({ useAddTripStopUpdate: true });
        // Select some stop
        const stops = wrapper.find(Stops);

        // change platform
        stops.invoke('onStopUpdated')({
            stopCodes: ['Stop1'],
            action: 'change-platform',
            newPlatform: {
                platform_code: '2',
                stop_code: '9321',
                stop_id: '9321-50b6fd55',
                stop_lat: -36.89687,
                stop_lon: 174.63186,
                stop_name: 'Sunnyvale Train Station 2',
            },
        });

        // Click add
        const addButton = wrapper.find(Button);
        addButton.simulate('click');

        expect(mockAddTrips).toHaveBeenCalledTimes(1);
        expect(mockAddTrips).toHaveBeenCalledWith([{
            ...mockTripInstance,
            serviceDate: moment(mockServiceDate).format(SERVICE_DATE_FORMAT),
            startTime: '',
            endTime: '',
            stops: [{
                platformCode: '2',
                stopHeadsign: 'Britomart',
                scheduledArrivalTime: '12:00:00',
                scheduledDepartureTime: '12:02:00',
                stopCode: '9321',
                stopId: '9321-50b6fd55',
                stopLat: -36.89687,
                stopLon: 174.63186,
                stopName: 'Sunnyvale Train Station 2',
            },
            {
                stopCode: 'Stop2',
                stopHeadsign: 'Britomart',
                scheduledArrivalTime: '12:10:00',
                scheduledDepartureTime: '12:12:00',
            }],
            referenceId: '',
            agencyId: '',
            depotId: '',
            directionId: '',
            routeId: '',
            routeLongName: '',
            routeShortName: '',
            routeVariantId: '',
            shapeId: '',
            tripHeadsign: '',
        }]);
    });

    it('handle set-non-stopping update when the footer invokes onStopUpdated', () => {
        wrapper.setProps({ useAddTripStopUpdate: true });
        // Select some stop
        wrapper.setProps({ selectedStopsByTripKey: jest.fn(() => ({ mockStopKey: { status: true } })) });
        const stopSelectionFooter = wrapper.find(StopSelectionFooter);

        // Update headsign
        stopSelectionFooter.invoke('onStopUpdated')({
            stopCodes: ['Stop1'],
            action: 'set-non-stopping',
        });

        // Unselect stops
        wrapper.setProps({ selectedStopsByTripKey: jest.fn(() => ({})) });

        // Click add
        const addButton = wrapper.find(Button);
        addButton.simulate('click');

        expect(mockAddTrips).toHaveBeenCalledTimes(1);
        expect(mockAddTrips).toHaveBeenCalledWith([{
            ...mockTripInstance,
            serviceDate: moment(mockServiceDate).format(SERVICE_DATE_FORMAT),
            startTime: '',
            endTime: '',
            stops: [{
                stopCode: 'Stop1',
                stopHeadsign: 'Britomart',
                scheduledArrivalTime: '12:00:00',
                scheduledDepartureTime: '12:02:00',
                status: 'NON_STOPPING',
            },
            {
                stopCode: 'Stop2',
                stopHeadsign: 'Britomart',
                scheduledArrivalTime: '12:10:00',
                scheduledDepartureTime: '12:12:00',
            }],
            referenceId: '',
            agencyId: '',
            depotId: '',
            directionId: '',
            routeId: '',
            routeLongName: '',
            routeShortName: '',
            routeVariantId: '',
            shapeId: '',
            tripHeadsign: '',
        }]);
    });
});
