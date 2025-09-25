/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import HistoryNotesModal from './HistoryNotesModal';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

const mockDisruption = {
    key: 'DISR123',
    incidentNo: 'DISR123',
    impact: 'BREAKDOWN',
    startTime: '06:00',
    startDate: '09/03/2022',
    endTime: '06:00',
    endDate: '10/03/2022',
    cause: 'CAPACITY_ISSUE',
    mode: '-',
    status: 'not-started',
    header: 'Incident Title',
    url: 'https://at.govt.nz',
    createNotification: false,
    recurrent: true,
    duration: '2',
    recurrencePattern: {
        freq: 2,
        dtstart: new Date('2022-03-09T06:00:00.000Z'),
        until: new Date('2022-03-10T06:00:00.000Z'),
        byweekday: [0],
    },
    severity: 'MINOR',
    affectedEntities: {
        affectedRoutes: [{
            category: { type: 'route', icon: '', label: 'Routes' },
            labelKey: 'routeShortName',
            routeId: 'WEST-201',
            routeShortName: 'WEST',
            routeType: 2,
            text: 'WEST',
            type: 'route',
            valueKey: 'routeId',
        }],
        affectedStops: [{
            category: { type: 'stop', icon: '', label: 'Stops' },
            stopCode: '100',
            text: '100 - test',
            type: 'stop',
            valueKey: 'stopCode',
        }],
    },
    workarounds: [],
    notes: [
        {
            createdTime: '2022-03-09T06:00:00.000Z',
            createdBy: 'username@test.com',
            description: 'test description note 1',
        },
        {
            createdTime: '2022-03-09T07:00:00.000Z',
            createdBy: 'username@test.com',
            description: 'test description note 2',
        },
    ],
};

describe('HistoryNotesModal Component', () => {
    let store;

    const defaultProps = {
        isModalOpen: true,
        disruption: mockDisruption,
        onClose: jest.fn(),
    };

    beforeEach(() => {
        store = mockStore({
            control:
                {
                    incidents: {
                        incidents: {},
                        disruptions: [],
                        isLoading: false,
                        affectedEntities: [],
                        isCreateEnabled: false,
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                    },
                },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Renders without crashing and displays history notes modal', () => {
        render(
            <Provider store={ store }>
                <HistoryNotesModal { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('History notes for Disruption #DISR123')).toBeInTheDocument();
        expect(screen.getByText('test description note 1')).toBeInTheDocument();
        expect(screen.getByText('test description note 2')).toBeInTheDocument();
    });

    it('Close the modal after clicking the close button', () => {
        render(
            <Provider store={ store }>
                <HistoryNotesModal { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText('Close');
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
