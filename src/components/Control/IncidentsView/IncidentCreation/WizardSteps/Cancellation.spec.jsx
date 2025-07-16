/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Cancellation from './Cancellation';
import {
    toggleIncidentModals,
    openCreateIncident,
    deleteAffectedEntities } from '../../../../../redux/actions/control/incidents';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

jest.mock('../../../../../redux/actions/control/incidents', () => ({
    toggleIncidentModals: jest.fn(),
    openCreateIncident: jest.fn(),
    deleteAffectedEntities: jest.fn(),
}));

jest.mock('../../../../../redux/actions/control/link', () => ({
    goToNotificationsView: jest.fn(),
}));

describe('Confirmation Component', () => {
    let store;

    const defaultProps = {
        toggleIncidentModals: jest.fn(),
        openCreateIncident: jest.fn(),
        deleteAffectedEntities: jest.fn(),
    };

    beforeEach(() => {
        openCreateIncident.mockImplementation(isCreateEnabled => (dispatch) => {
            dispatch({ type: 'MOCK_OPEN_INCIDENT', payload: isCreateEnabled });
        });
        deleteAffectedEntities.mockImplementation(() => (dispatch) => {
            dispatch({ type: 'MOCK_DELETE_AFFECTED_ENTITIES',
                payload: {
                    activeStep: 2,
                    showSelectedRoutes: false,
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [],
                    },
                    stopsByRoute: {},
                    routesByStop: {},
                } });
        });
        toggleIncidentModals.mockImplementation((type, isOpen) => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_INCIDENT_MODALS', payload: { type, isOpen } });
        });
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
            appSettings: {
                useDisruptionsNotificationsDirectLink: 'true',
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Renders without crashing and displays modal cancel window', () => {
        render(
            <Provider store={ store }>
                <Cancellation { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Are you sure you want to close?')).toBeInTheDocument();
        expect(screen.getByText('Any information entered will not be saved.')).toBeInTheDocument();
    });

    it('Close modal on click on Keep editing', () => {
        render(
            <Provider store={ store }>
                <Cancellation { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /keep editing/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(toggleIncidentModals).toHaveBeenCalledWith('isCancellationOpen', false);
    });

    it('Close modal on click on Discard changes button and return to disruption tab', () => {
        render(
            <Provider store={ store }>
                <Cancellation { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /discard changes/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);
        expect(openCreateIncident).toHaveBeenCalledWith(false);
        expect(deleteAffectedEntities).toHaveBeenCalled();
        expect(toggleIncidentModals).toHaveBeenCalledWith('isCancellationOpen', false);
    });
});
