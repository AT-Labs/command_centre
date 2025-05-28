/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import moment from 'moment';
import thunk from 'redux-thunk';
import Readonly from './Readonly';

const mockStore = configureStore([thunk]);

jest.mock('../../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: () => [{ value: 'cause-1', label: 'Cause One' }],
    useAlertEffects: () => [{ value: 'impact-1', label: 'Impact One' }],
}));

const disruption = {
    affectedEntities: [
        { stopCode: '123', routeId: '1' },
        { routeId: '2' },
    ],
    recurrent: false,
    mode: 'Bus',
    cause: 'cause-1',
    impact: 'impact-1',
    startTime: moment().toISOString(),
    endTime: moment().add(1, 'hour').toISOString(),
    status: 'Planned',
    url: 'https://example.com',
    severity: 'Moderate',
    header: 'Service Change',
    duration: '1',
    createdBy: 'Alice',
    createdTime: moment().subtract(2, 'days').toISOString(),
    lastUpdatedBy: 'Bob',
    lastUpdatedTime: moment().subtract(1, 'days').toISOString(),
    notes: [{ text: 'Initial note' }],
    activePeriods: [],
};

const initialState = {
    control: {
        disruptions: {
            shapes: [],
            isLoading: false,
            boundsToFit: [[0, 0], [1, 1]],
            routeColors: [],
            cachedShapes: { R1: 'WKT1' },
            allRoutes: {
                R1: { route_color: '#111' },
                R2: { route_color: '#222' },
            },
            affectedEntities: {
                affectedStops: [
                    {
                        stopId: '111-fd1c9e8c',
                        stopName: 'Test Stop 1',
                        stopCode: '111',
                        locationType: 0,
                        stopLat: -36.94659,
                        stopLon: 174.83358,
                        parentStation: null,
                        platformCode: null,
                        routeType: null,
                        text: '111 - Test Stop 1',
                        category: {
                            type: 'stop',
                            icon: 'stop',
                            label: 'Stops',
                        },
                        icon: 'stop',
                        valueKey: 'stopId',
                        labelKey: 'stopCode',
                        type: 'stop',
                    }, {
                        stopId: '222-fd1c9e8c',
                        stopName: 'Test Stop 2',
                        stopCode: '222',
                        locationType: 0,
                        stopLat: -36.94659,
                        stopLon: 174.83358,
                        parentStation: null,
                        platformCode: null,
                        routeType: null,
                        text: '222 - Test Stop 2',
                        category: {
                            type: 'stop',
                            icon: 'stop',
                            label: 'Stops',
                        },
                        icon: 'stop',
                        valueKey: 'stopId',
                        labelKey: 'stopCode',
                        type: 'stop',
                    }],
                affectedRoutes: [{
                    routeId: 'R1',
                    routeShortName: 'INN',
                    routeType: 3,
                    type: 'route',
                }, {
                    routeId: 'OUT-202',
                    routeShortName: 'OUT',
                    routeType: 3,
                    type: 'route',
                }],
            },
        },
    },
    appSettings: {
        usePassengerImpact: true,
    },
};

const defaultProps = {
    disruption,
    getRoutesByShortName: jest.fn().mockImplementation(() => () => {}),
    updateAffectedRoutesState: jest.fn(),
    updateAffectedStopsState: jest.fn(),
    usePassengerImpact: true,
};

beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }));
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Readonly component', () => {
    it('renders disruption details correctly', () => {
        const store = mockStore(initialState);

        render(
            <Provider store={ store }>
                <Readonly { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Cause One')).toBeInTheDocument();
        expect(screen.getByText('Impact One')).toBeInTheDocument();
        expect(screen.getByText('Planned')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Service Change')).toBeInTheDocument();
    });
});
