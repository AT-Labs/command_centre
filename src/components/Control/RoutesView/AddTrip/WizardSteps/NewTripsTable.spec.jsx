import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import { NewTripsTable } from './NewTripsTable';

const componentPropsMock = {
    tripInstance: {
        tripId: 'id',
        serviceDate: '20231001',
        serviceId: 'id',
        routeType: 2,
        startTime: '10:00:00',
        endTime: '11:00:00',
        stops: [{
            stopId: 'id1',
            stopCode: 'Stop1',
            stopHeadsign: 'Britomart',
            scheduledArrivalTime: '12:00:00',
            scheduledDepartureTime: '12:02:00',
        },
        {
            stopId: 'id2',
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
    },
    trips: [],
    useNextDayTrips: false,
    todayTripChecked: false,
    tomorrowTripChecked: false,
    onAddedTripsChange: jest.fn(),
    onStopsPreview: jest.fn(),
};

const setup = (customProps) => {
    const props = { ...componentPropsMock, ...customProps };
    return shallow(<NewTripsTable { ...props } />);
};

describe('<NewTripsTable />', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call onAddedTripsChange with a new trip when click add button', () => {
        const wrapper = setup({
            trips: [{
                id: 'id1',
                startTime: '',
                endTime: '',
                referenceId: '',
            }],
        });
        const addButton = wrapper.find('.add-trips-table-container__add-button');
        addButton.simulate('click');

        expect(componentPropsMock.onAddedTripsChange).toHaveBeenCalledWith([
            {
                id: 'id1',
                startTime: '',
                endTime: '',
                referenceId: '',
            },
            {
                id: expect.anything(),
                startTime: '',
                endTime: '',
                referenceId: '',
            },
        ]);
    });

    it('should call onAddedTripsChange with remaining trips when click remove button', () => {
        const wrapper = setup({
            trips: [{
                id: 'id1',
                startTime: '',
                endTime: '',
                referenceId: '',
            },
            {
                id: 'id2',
                startTime: '',
                endTime: '',
                referenceId: '',
            }],
        });
        const addButton = wrapper.find('.add-trips-table__remove-button').at(0);
        addButton.simulate('click');

        expect(componentPropsMock.onAddedTripsChange).toHaveBeenCalledWith([
            {
                id: 'id2',
                startTime: '',
                endTime: '',
                referenceId: '',
            },
        ]);
    });

    it('should call onAddedTripsChange with updated trips when typing in start time input', () => {
        const wrapper = setup({
            trips: [{
                id: 'id1',
                startTime: '',
                endTime: '',
                referenceId: '',
            }],
        });

        const startTimeInput = wrapper.find('.add-trips-table__start-time').at(0);
        startTimeInput.simulate('change', { target: { value: '23:00' } });

        expect(componentPropsMock.onAddedTripsChange).toHaveBeenCalledWith([
            {
                id: 'id1',
                startTime: '23:00',
                endTime: '24:00:00',
                referenceId: '',
            },
        ]);
    });

    it('should call onAddedTripsChange with updated trips when typing in ref id input', () => {
        const wrapper = setup({
            trips: [{
                id: 'id1',
                startTime: '',
                endTime: '',
                referenceId: '',
            }],
        });

        const refIdInput = wrapper.find('.add-trips-table__reference-id').at(0);
        refIdInput.simulate('change', { target: { value: 'Ref1' } });

        expect(componentPropsMock.onAddedTripsChange).toHaveBeenCalledWith([
            {
                id: 'id1',
                startTime: '',
                endTime: '',
                referenceId: 'Ref1',
            },
        ]);
    });

    it('should call onStopsPreview with correct trip when click stops preview button', () => {
        const wrapper = setup({
            trips: [{
                id: 'id1',
                startTime: '',
                endTime: '',
                referenceId: '',
            },
            {
                id: 'id2',
                startTime: '',
                endTime: '',
                referenceId: '',
            }],
        });
        const addButton = wrapper.find('.add-trips-table__preview-button').at(1);
        addButton.simulate('click');

        expect(componentPropsMock.onStopsPreview).toHaveBeenCalledWith(
            {
                id: 'id2',
                startTime: '',
                endTime: '',
                referenceId: '',
            },
        );
    });

    it('should show add button when the number of trips is less than 30', () => {
        const trips = [];
        for (let i = 1; i <= 29; i++) {
            trips.push(
                {
                    id: i,
                    startTime: '',
                    endTime: '',
                    referenceId: '',
                },
            );
        }
        const wrapper = setup({ trips });
        const addButton = wrapper.find('.add-trips-table-container__add-button');

        expect(addButton.exists()).toBe(true);
    });

    it('should hide add button when the number of trips reaches 30', () => {
        const trips = [];
        for (let i = 1; i <= 30; i++) {
            trips.push(
                {
                    id: i,
                    startTime: '',
                    endTime: '',
                    referenceId: '',
                },
            );
        }
        const wrapper = setup({ trips });
        const addButton = wrapper.find('.add-trips-table-container__add-button');

        expect(addButton.exists()).toBe(false);
    });

    it('should show Date column for the next day trips and be equal Today if today trip selected', () => {
        const wrapper = setup({
            trips: [{
                id: 'id1',
                startTime: moment().add(20, 'minute').format('HH:mm'),
                endTime: '',
                referenceId: '',
            }],
            useNextDayTrips: true,
            todayTripChecked: true,
            tomorrowTripChecked: false,
        });

        const columnDate = wrapper.find('.add-trips-table__date').at(0);
        expect(columnDate.exists()).toBe(true);
        expect(columnDate.props().value).toBe('Today');
    });

    it('should show Date column for the next day trips and be equal Tomorrow if tomorrow trip selected', () => {
        const wrapper = setup({
            trips: [{
                id: 'id1',
                startTime: moment().add(20, 'minute').format('HH:mm'),
                endTime: '',
                referenceId: '',
            }],
            useNextDayTrips: true,
            todayTripChecked: false,
            tomorrowTripChecked: true,
        });

        const columnDate = wrapper.find('.add-trips-table__date').at(0);
        expect(columnDate.exists()).toBe(true);
        expect(columnDate.props().value).toBe('Tomorrow');
    });

    it('should show Date column for the next day trips and be equal Today and Tomorrow if today and tomorrow trip selected', () => {
        const wrapper = setup({
            trips: [{
                id: 'id1',
                startTime: moment().add(20, 'minute').format('HH:mm'),
                endTime: '',
                referenceId: '',
            }],
            useNextDayTrips: true,
            todayTripChecked: true,
            tomorrowTripChecked: true,
        });

        const columnDate = wrapper.find('.add-trips-table__date').at(0);
        expect(columnDate.exists()).toBe(true);
        expect(columnDate.props().value).toBe('Today, Tomorrow');
    });

    it('should show Date column for the next day trips and be equal Tomorrow if today and tomorrow trip selected and startTime is less then now', () => {
        const wrapper = setup({
            trips: [{
                id: 'id1',
                startTime: moment().add(-2, 'minute').format('HH:mm'),
                endTime: '',
                referenceId: '',
            }],
            useNextDayTrips: true,
            todayTripChecked: true,
            tomorrowTripChecked: true,
        });

        const columnDate = wrapper.find('.add-trips-table__date').at(0);
        expect(columnDate.exists()).toBe(true);
        expect(columnDate.props().value).toBe('Tomorrow');
    });
});
