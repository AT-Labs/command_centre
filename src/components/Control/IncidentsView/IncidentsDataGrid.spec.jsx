/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IncidentDataGrid } from './IncidentsDataGrid';
import EDIT_TYPE from '../../../types/edit-types';

const mockStore = configureStore([]);

const mockIncidents = [
    { incidentId: 1, incidentTitle: 'Incident 1', affectedEntities: [], impact: '' },
    { incidentId: 2, incidentTitle: 'Incident 2', affectedEntities: [], impact: '' },
];

describe('IncidentDataGrid Component', () => {
    let store;

    const defaultProps = {
        page: 1,
        disruptions: mockIncidents,
        incidents: mockIncidents,
        activeIncident: null,
        isLoading: false,
        clearActiveIncident: jest.fn(),
        updateActiveIncident: jest.fn(),
        updateIncidentsSortingParams: jest.fn(),
        useViewDisruptionDetailsPage: true,
        setIncidentToUpdate: jest.fn(),
        updateEditMode: jest.fn(),
    };

    beforeEach(() => {
        store = mockStore({
            control:
                {
                    incidents: {
                        incidents: mockIncidents,
                        disruptions: mockIncidents,
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                        isLoading: false,
                    },
                },
            appSettings: {
                useViewDisruptionDetailsPage: true,
            },
        });

        jest.clearAllMocks();
    });

    it('renders without crashing and displays column headers', () => {
        render(
            <Provider store={ store }>
                <IncidentDataGrid { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('DISRUPTION')).toBeInTheDocument();
        expect(screen.getByText('DISRUPTION TITLE')).toBeInTheDocument();
        expect(screen.getByText('AFFECTED ROUTES')).toBeInTheDocument();
        expect(screen.getByText('AFFECTED STOPS')).toBeInTheDocument();
        expect(screen.getByText('EFFECTS')).toBeInTheDocument();
    });

    it('renders the correct number of rows based on incidents prop', async () => {
        const { container } = render(
            <Provider store={ store }>
                <IncidentDataGrid { ...defaultProps } />
            </Provider>,
        );
        const rows = container.querySelectorAll('.row');
        expect(rows.length - 1).toBe(mockIncidents.length);
    });

    it('displays loading state when isLoading is true', () => {
        const propsWithoutIncidents = {
            ...defaultProps,
            isLoading: true,
            incidents: [],
        };
        const storeWithoutIncidents = mockStore({
            control:
                {
                    incidents: {
                        incidents: [],
                        disruptions: [],
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                        isLoading: true,
                    },
                },
            appSettings: {
                useViewDisruptionDetailsPage: true,
            },
        });
        render(
            <Provider store={ storeWithoutIncidents }>
                <IncidentDataGrid { ...propsWithoutIncidents } />
            </Provider>,
        );
        expect(screen.getByLabelText(/loading data/i)).toBeInTheDocument();
    });

    test('calls clearActiveIncident and updateActiveIncident on row click', async () => {
        const clearActiveIncident = jest.fn();
        const updateActiveIncident = jest.fn();

        const { container } = render(
            <Provider store={ store }>
                <IncidentDataGrid
                    incidents={ [
                        { incidentId: 1, incidentTitle: 'Incident 1', affectedEntities: [], impact: 'test' },
                        { incidentId: 2, incidentTitle: 'Incident 2', affectedEntities: [], impact: 'test 2' },
                    ] }
                    clearActiveIncident={ clearActiveIncident }
                    updateActiveIncident={ updateActiveIncident }
                />
            </Provider>,
        );

        const button = await container.querySelector('#expandable-button-1');
        expect(button).not.toBeNull();

        fireEvent.click(button);

        expect(clearActiveIncident).toHaveBeenCalled();
        expect(updateActiveIncident).toHaveBeenCalledWith(1);
    });

    it('opens the correct URL when "Open & Edit Incident" button is clicked', async () => {
        const setIncidentToUpdate = jest.fn();
        const updateEditMode = jest.fn();
        const propsWithEdit = {
            ...defaultProps,
            useViewDisruptionDetailsPage: true,
            updateEditMode,
            setIncidentToUpdate,
        };
        const storeDetailsPage = mockStore({
            control:
                {
                    incidents: {
                        incidents: mockIncidents,
                        disruptions: mockIncidents,
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                        isLoading: false,
                    },
                },
            appSettings: {
                useViewDisruptionDetailsPage: true,
            },
        });

        render(
            <Provider store={ storeDetailsPage }>
                <IncidentDataGrid { ...propsWithEdit } />
            </Provider>,
        );

        global.open = jest.fn();

        const buttons = screen.getAllByLabelText('open-edit-incident');
        expect(buttons.length).toBeGreaterThan(0);

        const firstButton = buttons[0];

        fireEvent.click(firstButton);
        expect(setIncidentToUpdate).toHaveBeenCalledWith(1);
        expect(updateEditMode).toHaveBeenCalledWith(EDIT_TYPE.EDIT);
    });

    it('renders "ACTIONS" column when useViewDisruptionDetailsPage is true', () => {
        const propsWithEdit = {
            ...defaultProps,
            useViewDisruptionDetailsPage: true,
        };
        const storeDetailsPage = mockStore({
            control:
                {
                    incidents: {
                        incidents: mockIncidents,
                        disruptions: mockIncidents,
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                        isLoading: false,
                    },
                },
            appSettings: {
                useViewDisruptionDetailsPage: true,
            },
        });
        render(
            <Provider store={ storeDetailsPage }>
                <IncidentDataGrid { ...propsWithEdit } />
            </Provider>,
        );
        expect(screen.getByText('ACTIONS', { exact: true, trim: true })).toBeInTheDocument();
    });
});
