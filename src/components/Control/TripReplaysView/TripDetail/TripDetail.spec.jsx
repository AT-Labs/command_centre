import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moment from 'moment';
import TripDetail from './TripDetail';
import ACTION_TYPE from '../../../../redux/action-types';
import { useParentChildIncident } from '../../../../redux/selectors/appSettings';

const mockStore = configureStore([thunk]);

jest.mock('../../../../redux/selectors/appSettings', () => ({
    useParentChildIncident: jest.fn(),
}));

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}));

const mockedDateTime = 1700000000;
const startDate = moment.unix(mockedDateTime).startOf('day').toDate();
const endDate = moment.unix(mockedDateTime).endOf('day').toDate();

const stopEvents = [
    {
        status: 'SCHEDULED',
        stopId: '9001-a01efce1',
        arrival: { scheduledTime: mockedDateTime },
        stopLat: -36.84429,
        stopLon: 174.76847,
        stopCode: '9001',
        stopName: 'Waitemata Train Station 1',
        departure: { time: mockedDateTime + 1000, delay: 244, scheduledTime: mockedDateTime },
        timepoint: 0,
        innerRadius: 30,
        exitDistance: 30,
        platformCode: '1',
        stopSequence: 1,
        entryDistance: 30,
        hasEndTime: true,
    },
];

const tripSummary = {
    routeShortName: '123',
    tripHeadsign: 'Downtown',
    tripSignOn: '2023-11-14T08:00:00Z',
    tripStart: '2023-11-14T08:00:00Z',
    stopEvents,
    hasDisruption: true,
};

const searchResults = { route: [{ id: 'route-1', name: 'Route 123' }] };

const expectedFilters = {
    selectedStartDate: startDate,
    selectedEndDate: endDate,
    selectedEntity: { id: 'route-1', name: 'Route 123' },
    selectedStatus: null,
    selectedImpact: null,
};

const defaultProps = {
    handleMouseEnter: () => {},
    handleMouseLeave: () => {},
    handleMouseClick: () => {},
    updateView: () => {},
    navigate: () => {},
    updateFilters: () => {},
    updateIncidentFilters: () => {},
    navigateToVehicleReplayTab: () => {},
};

describe('<TripDetail /> connected', () => {
    let store;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(mockedDateTime * 1000));

        store = mockStore({
            control: {
                tripReplays: {
                    currentTrip: {
                        ...tripSummary,
                        stops: [],
                        vehiclePositions: [],
                        operationalEvents: [],
                        status: 'ON_TIME',
                        hasDisruption: true,
                    },
                },
            },
            search: { results: searchResults },
        });

        useState.mockImplementation(jest.requireActual('react').useState);
    });

    afterEach(() => {
        store.clearActions();
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    test('dispatches updateIncidentFilters on searchResults change', () => {
        useState.mockImplementation((initialValue) => {
            if (initialValue === false) {
                return [true, jest.fn()];
            }
            return [initialValue, jest.fn()];
        });
        useParentChildIncident.mockReturnValue(true);
        render(
            <Provider store={ store }>
                <TripDetail { ...defaultProps } />
            </Provider>,
        );

        const incidentAction = store.getActions().find(a => a.type === ACTION_TYPE.UPDATE_INCIDENT_FILTERS);
        expect(incidentAction).toEqual({
            type: ACTION_TYPE.UPDATE_INCIDENT_FILTERS,
            payload: { filters: expectedFilters },
        });
    });

    test('dispatches updateFilters on searchResults change', () => {
        useState.mockImplementation((initialValue) => {
            if (initialValue === false) {
                return [true, jest.fn()];
            }
            return [initialValue, jest.fn()];
        });

        useParentChildIncident.mockReturnValue(false);

        render(
            <Provider store={ store }>
                <TripDetail { ...defaultProps } />
            </Provider>,
        );

        const incidentAction = store.getActions().find(a => a.type === ACTION_TYPE.UPDATE_DISRUPTION_FILTERS);
        expect(incidentAction).toEqual({
            type: ACTION_TYPE.UPDATE_DISRUPTION_FILTERS,
            payload: { filters: expectedFilters },
        });
    });
});
