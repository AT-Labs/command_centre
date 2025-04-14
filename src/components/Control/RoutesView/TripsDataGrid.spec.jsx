import React from 'react';
import { shallow } from 'enzyme';
import { TripsDataGrid } from './TripsDataGrid';

import TRIP_STATUS_TYPES from '../../../types/trip-status-types';

let wrapper;

const componentPropsMock = {
    datagridConfig: {},
    tripInstances: [],
    activeRoute: undefined,
    activeRouteVariant: undefined,
    selectedTrips: [],
    serviceDate: '2023-08-21T12:13:21+12:00',
    filters: {},
    agencies: [],
    rowCount: 0,
    allStops: {},
    vehicleAllocations: {},
    useRoutesTripsFilterCollapse: true,
    updateTripsDatagridConfig: () => {},
    selectSingleTrip: () => {},
    selectTrips: () => {},
    selectAllTrips: () => {},
    filterTripInstances: () => {},
    updateActiveTripInstances: () => {},
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    return shallow(<TripsDataGrid { ...props } />);
};

describe('TripsDataGrid', () => {
    it('Should render', () => {
        wrapper = setup();
        expect(wrapper.exists()).toEqual(true);
    });

    describe('getRowClassName', () => {
        const tripStatusTestCases = [
            { status: TRIP_STATUS_TYPES.completed, expectedClassName: 'text-muted trips-data-grid__row--completed' },
            { status: TRIP_STATUS_TYPES.notStarted, expectedClassName: 'text-muted trips-data-grid__row--not-started' },
            { status: TRIP_STATUS_TYPES.cancelled, expectedClassName: 'trips-data-grid__row--cancelled' },
            { status: TRIP_STATUS_TYPES.missed, expectedClassName: 'trips-data-grid__row--missed' },
            { status: TRIP_STATUS_TYPES.inProgress, expectedClassName: 'trips-data-grid__row--in-progress' },
            { status: 'unknownStatus', expectedClassName: '' },
        ];

        beforeEach(() => {
            wrapper = setup();
        });

        tripStatusTestCases.forEach(({ status, expectedClassName }) => {
            it(`returns the correct class for ${status} trips`, () => {
                const row = { tripInstance: { status } };
                const result = wrapper.find('CustomDataGrid').prop('getRowClassName')({ row });
                expect(result).toBe(expectedClassName);
            });
        });
    });
});
